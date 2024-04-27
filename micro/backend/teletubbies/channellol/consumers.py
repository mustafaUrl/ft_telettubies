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
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.close()
            return
       
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
        # Burada 'self.channel_name' kullanılmalı.
        self.user = self.scope['user']
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

        await self.channel_layer.group_send(
            self.roomGroupName,{
                "type": "sendMessage",
                "message": message, 
                "username": username,
            })
    async def sendMessage(self, event):
        message = event["message"]
        username = event["username"]
    
        # Eğer kullanıcı anonimse, bu kısmı atla
        if not self.scope['user'].is_anonymous:
            await self.send(text_data=json.dumps({
                "message": message,
                "username": username
            }))
    async def fetch_notifications(self, user):
        if not self.scope['user'].is_anonymous:
            notifications = Notification.objects.filter(recipient=user, is_read=False)
            for notification in notifications:
            # Send notification to the user
                await self.send(text_data=json.dumps({
                    # 'type': notification.notification_type,
                    'type': "notification",
                    'message': 'You have a new notification!',
                    'from_user': notification.sender.username
                }))
            # Optionally, mark the notification as read
                notification.is_read = True
                notification.save()
    @database_sync_to_async
    def update_user_status(self, user, is_online):
        # OnlineUserStatus nesnesini güncelle veya oluştur
        OnlineUserStatus.objects.update_or_create(user=user, defaults={'is_online': is_online})
