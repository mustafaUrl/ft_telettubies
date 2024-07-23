import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async, async_to_sync
from .models import OnlineUserStatus, Notification, OnlineUserStatusPrivate
from userlol.models import PrivateChatMessage, FriendList
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from django.contrib.auth.models import User


class PrivateChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.close()
            return
            # Arkadaş listesini çek
        friend_usernames = await self.get_friend_usernames(self.user)

        if not friend_usernames:
            await self.close()
            return

        # Her arkadaş için oda oluştur
        self.rooms = {}
        for friend_username in friend_usernames:
            room_name = self.generate_room_name(self.user.username, friend_username)
            self.rooms[friend_username] = room_name
            room_group_name = f'chat_{room_name}'
            await self.channel_layer.group_add(
                room_group_name,
                self.channel_name
            )
        await self.accept()

    async def disconnect(self, close_code):
        # Kullanıcının tüm odalarından ayrıl
        if self.user.is_anonymous:
            await self.close()
            return
        friend_usernames = await self.get_friend_usernames(self.user)

        if not friend_usernames:
            await self.close()
            return

        for room_name in self.rooms.values():
            room_group_name = f'chat_{room_name}'
            await self.channel_layer.group_discard(
                room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        if self.user.is_anonymous:
            await self.close()
            return

        text_data_json = json.loads(text_data)
        command = text_data_json.get('command')

        if command == 'join':
            # Kullanıcıyı belirli bir sohbet odasına katıl
            friend_username = text_data_json['friend']
            room_name = self.generate_room_name(self.user.username, friend_username)
            room_group_name = f'chat_{room_name}'
            self.rooms[friend_username] = room_name

            # Oda grubuna katıl
            await self.channel_layer.group_add(
                room_group_name,
                self.channel_name
            )

            # Kullanıcıya başarılı katılım mesajı gönder
            await self.send(text_data=json.dumps({
                'message': f'{self.user.username} has joined the room {room_name}.',
                'room_name': room_name
            }))

        elif command == 'leave':
            # Kullanıcıyı belirli bir sohbet odasından çıkar
            friend_username = text_data_json['friend']
            room_name = self.rooms.pop(friend_username, None)
            if room_name:
                room_group_name = f'chat_{room_name}'

                # Oda grubundan ayrıl
                await self.channel_layer.group_discard(
                    room_group_name,
                    self.channel_name
                )

                # Kullanıcıya başarılı ayrılma mesajı gönder
                await self.send(text_data=json.dumps({
                    'message': f'{self.user.username} has left the room {room_name}.',
                    'room_name': room_name
                }))
        elif command == 'send':
            # 'send' komutu işlemleri burada yer alacak...
            friend_username = text_data_json['friend']
            message = text_data_json['message']

            if friend_username in self.rooms:
                room_name = self.rooms[friend_username]
                room_group_name = f'chat_{room_name}'
                await self.channel_layer.group_send(
                    room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message,
                        'username': self.user.username  # Oda adını da ekleyin
                    }
                )

    async def chat_message(self, event):
        message = event['message']
        username = event['username']  # Oda adını event'ten alın

        # Mesajı ve oda adını WebSocket üzerinden gönder
        await self.send(text_data=json.dumps({
            'message': message,
            'username': username  # Oda adını da gönderin
        }))

    @database_sync_to_async
    def get_friend_usernames(self, user):
        try:
            # Arkadaş listesini çek ve kullanıcı adlarını al
            friend_list = FriendList.objects.get(user=user).friends.all()
            friend_usernames = [friend.username for friend in friend_list]
            return friend_usernames
        except FriendList.DoesNotExist:
            # Eğer FriendList bulunamazsa boş liste döndür
            return []

    def generate_room_name(self, username1, username2):
            # Kullanıcı adlarını sıralayarak oda adı oluştur
        return '_'.join(sorted([username1, username2]))
    

class ChatConsumer(AsyncWebsocketConsumer):
    online_users = set()  # Tüm bağlı kullanıcıları tutacak set
    tournaments = {}

    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.close()
            return

        ChatConsumer.online_users.add(self.user.username)

        await self.update_user_status(self.user, True)
        self.roomGroupName = "group_chat_gfg"
        await self.channel_layer.group_add(
            self.roomGroupName,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        if self.user.is_anonymous:
            await self.close()
            return

        self.user = self.scope['user']
        ChatConsumer.online_users.discard(self.user.username)  
        await self.update_user_status(self.user, False)
        await self.channel_layer.group_discard(
            self.roomGroupName,
            self.channel_name
        )

    async def receive(self, text_data):
        if self.user.is_anonymous:
            await self.close()
            return
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        username = text_data_json["username"]
        command = text_data_json["command"]
        room = text_data_json["room"]

        if command == "online_players":
            await self.list_online_players()
            await self.update_tournaments()
        elif command == "create":
            await self.create_tournament(room, message, username)
        elif command == "join":
            await self.join_tournament(room, username)
        elif command == "leave":
            await self.leave_tournament(room, username)
        else:
            await self.channel_layer.group_send(
                self.roomGroupName, {
                    "type": "sendMessage",
                    "message": message, 
                    "username": username,
                }
            )

    async def create_tournament(self, tournament_name, player_names, host_name):
        if tournament_name not in ChatConsumer.tournaments:
            ChatConsumer.tournaments[tournament_name] = {
                "players": set(player_names.split(', ')),
                "host": host_name
            }
            await self.update_tournaments()
        else:
            # Handle tournament already exists
            pass

    async def leave_tournament(self, tournament_name, player_name):
        if tournament_name in ChatConsumer.tournaments:
            if ChatConsumer.tournaments[tournament_name]["host"] == player_name:
                del ChatConsumer.tournaments[tournament_name]
            else:
                ChatConsumer.tournaments[tournament_name]["players"].discard(player_name)
            await self.update_tournaments()
        else:
            # Handle tournament not found
            pass

    async def join_tournament(self, tournament_name, player_name):
        if tournament_name in ChatConsumer.tournaments:
            ChatConsumer.tournaments[tournament_name]["players"].add(player_name)
            await self.update_tournaments()
        else:
            # Handle tournament not found
            pass

    @staticmethod
    async def update_user_status(user, is_online):
        # Implement your user status update logic here
        pass

    async def sendMessage(self, event):
        message = event["message"]
        username = event["username"]

        if not self.scope['user'].is_anonymous:
            await self.send(text_data=json.dumps({
                "message": message,
                "username": username
            }))

    async def fetch_notifications(self, user):
        if not self.scope['user'].is_anonymous:
            notifications = Notification.objects.filter(recipient=user, is_read=False)
            for notification in notifications:
                await self.send(text_data=json.dumps({
                    'type': "notification",
                    'message': 'You have a new notification!',
                    'from_user': notification.sender.username
                }))
                notification.is_read = True
                notification.save()

    @database_sync_to_async
    def update_user_status(self, user, is_online):
        OnlineUserStatus.objects.update_or_create(user=user, defaults={'is_online': is_online})

    async def list_online_players(self):
        online_players_list = list(ChatConsumer.online_users)
        await self.send(text_data=json.dumps({
            'type': 'online_players',
            'players': online_players_list
        }))

    async def update_tournaments(self):
        tournaments_list = {t: {"players": list(p["players"]), "host": p["host"]} for t, p in ChatConsumer.tournaments.items()}
        await self.send(text_data=json.dumps({
            'type': 'tournaments',
            'tournaments': tournaments_list
        }))
