import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async, async_to_sync
from userlol.models import PrivateChatMessage, FriendList
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from django.contrib.auth.models import User
# from .gameRoom import GameRoom
import asyncio
from .models import Game
from django.db import models
class PongConsumer(AsyncWebsocketConsumer):
    online_users = set()  # Tüm bağlı kullanıcıları tutacak set
    user_rooms = {}
    invites = {}  # Davetlerin tutulacağı sözlük
    ready_status = {} 
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.close()
            return

        await self.accept()
        self.rooms = {}
        PongConsumer.online_users.add(self.user.username)  
        self.room_group_name = "group_chat_gfg"
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

    async def disconnect(self, close_code):
        if self.user.is_anonymous:
            await self.close()
            return

        PongConsumer.online_users.discard(self.user.username)  
        if self.room_group_name:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
    async def receive(self, text_data):
        if self.user.is_anonymous:
            await self.close()
            return
        text_data_json = json.loads(text_data)
        command = text_data_json["command"]

        if command == "online_players":
            await self.list_online_players()
        if command == "continue_game":
            continuing_game = await self.continuing_game()
            if continuing_game:
                await self.send(text_data=json.dumps({
                    'type': 'already_in_game',
                    'game_id': continuing_game
                }))
            else:
                await self.send(text_data=json.dumps({
                    'type': 'not_in_game'
                }))
        elif command == "create_room":
            await self.create_room()
        elif command == "join_room":
            await self.join_room(text_data_json)
        elif command == "leave_room":
            await self.leave_room(text_data_json)
        elif command == "invite_room":
            await self.invite_room(text_data_json)
        elif command == "move":
            pass
        elif command == "ready":
            await self.ready(text_data_json)
        elif command == "get_invite":
            await self.get_invite()
        elif command == "list_rooms":
            await self.list_rooms()

    async def list_online_players(self):
        # Bağlı olan tüm kullanıcıları döndür
        online_players_list = list(PongConsumer.online_users)
        await self.send(text_data=json.dumps({
            'type': 'online_players',
            'players': online_players_list
        }))
    async def create_room(self):
        username = self.user.username

        # Kullanıcı zaten bir maçta ise başka bir maç oluşturamaz
        continuing_game = await self.continuing_game()
        if continuing_game:
            await self.send(text_data=json.dumps({
                'type': 'already_in_game',
                'game_id': continuing_game
            }))
            return
        room_name = self.generate_room_name()
        self.room_group_name = f"group_{room_name}"
        
        # Oda bilgisini user_rooms sözlüğünde sakla
        PongConsumer.user_rooms[username] = {"room_name": room_name, "group_name": self.room_group_name, "player1": username, "player2": None}
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        # Oda oluşturma bilgisini kullanıcılara bildir
        await self.send_room_update()

    async def join_room(self, data):
            room_name = data["room_name"]
            # Kullanıcı zaten bir odadaysa başka bir odaya katılamaz
            if self.user.username in PongConsumer.user_rooms:
                await self.send(text_data=json.dumps({
                    'error': 'You are already in a room.'
                }))
                return

            # Oda varsa ve ikinci oyuncu yoksa, kullanıcıyı odaya kat
            for user, room_info in PongConsumer.user_rooms.items():
                if room_info["room_name"] == room_name and room_info["player2"] is None:
                    room_info["player2"] = self.user.username
                    await self.send_event_message('chat.message', f"{self.user.username} has joined the room.")
                    # await self.channel_layer.group_send(
                    #     room_info["group_name"],
                    #     {
                    #         "type": "chat_message",
                    #         "message": f"{self.user.username} has joined the room."
                    #     }
                    # )
                    await self.send_room_update()
                    break

    async def leave_room(self, data):
        username = self.user.username
        room_name = data["room_name"]
        
        # Kullanıcı odalardan birinde mi diye kontrol et
        for user_room_key, user_room_info in PongConsumer.user_rooms.items():
            if user_room_info["room_name"] == room_name:
                # Kullanıcıyı odadan çıkar
                if username == user_room_info["player1"]:
                    user_room_info["player1"] = None
                    # Oda kurucusu odadan çıkıyorsa ve başka oyuncu varsa
                    if user_room_info["player2"]:
                        # player2'nin oda listesinden odayı sil
                        player2_room_key = f"room_{user_room_info['player2']}"
                        if player2_room_key in PongConsumer.user_rooms:
                            del PongConsumer.user_rooms[player2_room_key]
                    # Odayı tamamen sil
                    del PongConsumer.user_rooms[user_room_key]
                    await self.send_event_message('room.close', f"The room {room_name} has been closed.")
                elif username == user_room_info["player2"]:
                    user_room_info["player2"] = None
                    await self.send_event_message('room.leave', f"{username} has left the room {room_name}.")
                
                # Oda ayrılma bilgisini kullanıcılara bildir
                await self.send_room_update()
                break  # Oda bulundu ve işlem yapıldı, döngüden çık

    async def ready(self, data):
        room_name = data['room_name']
        # Oda bilgilerini al
        print(PongConsumer.user_rooms)
        room_info = None
        # 'user_rooms' içinde 'room_name' ile eşleşen oda bilgilerini ara
        for user_room_key, user_room_info in PongConsumer.user_rooms.items():
            if user_room_info["room_name"] == room_name:
                room_info = user_room_info
                break

        print(room_info)
        if room_info:
            player1_username = room_info['player1']
            player2_username = room_info['player2']
            # Her iki oyuncu da hazırsa oyunu başlat
            PongConsumer.ready_status[self.user.username] = True
            if PongConsumer.ready_status.get(player1_username) and PongConsumer.ready_status.get(player2_username):
                # Oyunu oluştur ve başlat
                game = await self.create_game(player1_username, player2_username)
                if game:
                    # Oyun başarıyla oluşturulduysa, oyunculara oyun ID'sini gönder
                    await self.send_event_message('game_start', {'game_id': game.id})
                else:
                    # Oyun oluşturulamadıysa hata mesajı gönder
                    await self.send(text_data=json.dumps({
                        'error': 'Game could not be created.'
                    }))
            else:
                # Her iki oyuncu da hazır değilse hata mesajı gönder
                await self.send(text_data=json.dumps({
                    'error': 'Both players are not ready.'
                }))
        else:
            # Oda bulunamadıysa hata mesajı gönder
            await self.send(text_data=json.dumps({
                'error': f'Room {room_name} does not exist.'
            }))




  


    async def invite_room(self, data):
        invited_username = data["username"]
        # Kullanıcı veya davet edilen kullanıcı zaten bir odadaysa davet gönderme
        if self.user.username in PongConsumer.user_rooms or invited_username in PongConsumer.user_rooms:
            await self.send(text_data=json.dumps({
                'error': 'One of the users is already in a room.'
            }))
            return

        # Davet oluştur ve davet listesine ekle
        room_name = f"room_{self.user.username}"
        PongConsumer.invites[room_name] = {"player1": self.user.username, "player2": invited_username}
        # Davet edilen kullanıcıya daveti gönder (bu kısım uygulamanıza özel olacaktır)
        await self.send_invite_to_user(invited_username, room_name)

        self.room_name = self.generate_room_name()
        self.room_group_name = f"group_{self.room_name}"
        self.rooms[self.room_name] = {"player1": self.user.username, "player2": invited_username}
        PongConsumer.user_rooms[self.user.username] = self.room_name
        PongConsumer.user_rooms[invited_username] = self.room_name
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        # Oda oluşturma ve davet bilgisini kullanıcılara bildir
        await self.send_room_update()

    async def get_invite(self):
        # Kullanıcının davet edildiği odaları listele
        user_invites = {room: players for room, players in PongConsumer.invites.items() if players["player2"] == self.user.username}
        await self.send(text_data=json.dumps({
            'type': 'get_invite',
            'invites': user_invites
        }))    
    async def list_rooms(self):
        # Odaları ve her odadaki kullanıcıları içeren bir sözlük oluştur
        rooms_info = {
            user: {
                'room_name': room_info['room_name'],
                'players': [room_info['player1'], room_info['player2']] if room_info['player2'] else [room_info['player1']]
            }
            for user, room_info in PongConsumer.user_rooms.items()
        }
        # Oda bilgilerini JSON formatında döndür
        await self.send(text_data=json.dumps({
            'type': 'list_rooms',
            'rooms': rooms_info
        }))


    async def send_invite_to_user(self, username, room_name):
        # Davet edilen kullanıcının WebSocket bağlantısını bul
        if username in PongConsumer.online_users:
            # Davet mesajını oluştur
            invite_message = json.dumps({
                'type': 'invite',
                'room_name': room_name,
                'from_user': self.user.username
            })
            # Davet edilen kullanıcıya daveti gönder
            await self.channel_layer.group_send(
                username,  # Bu, davet edilen kullanıcının grup adı veya kanal adı olmalıdır.
                {
                    "type": "websocket.send",
                    "text": invite_message
                }
            )
        else:
            # Davet edilen kullanıcı çevrimiçi değilse daveti gönderen kullanıcıya bildir
            await self.send(text_data=json.dumps({
                'error': f"User {username} is not online or does not exist."
            }))
           
    
    
    async def send_room_update(self):
        # Tüm odaların durumunu tüm kullanıcılara bildir
        for username, room_info in PongConsumer.user_rooms.items():
            await self.channel_layer.group_send(
                room_info['group_name'],
                {
                    "type": "room_update",
                    "room_name": room_info['room_name'],
                    "player1": room_info['player1'],
                    "player2": room_info['player2'] if room_info['player2'] else 'Waiting for player...'
                }
            )
    async def room_update(self, event):
        # Oda güncelleme bilgisini WebSocket üzerinden kullanıcılara gönder
        await self.send(text_data=json.dumps({
            'type': 'room_update',
            'room_name': event['room_name'],
            'player1': event['player1'],
            'player2': event['player2']
        }))
    async def send_event_message(self, event_type, message):
        # Event tipine göre mesajı WebSocket üzerinden kullanıcılara gönder
        await self.send(text_data=json.dumps({
            'type': event_type,
            'content': message
        }))

    @database_sync_to_async
    def create_game(self, player1_username, player2_username):
        try:
            player1 = User.objects.get(username=player1_username)
            player2 = User.objects.get(username=player2_username)
            game = Game.objects.create(player1=player1, player2=player2)
            return game
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def continuing_game(self):
        self.user = self.scope["user"]
        # Kullanıcının player1 veya player2 olarak yer aldığı ve kazananın henüz belirlenmediği oyunları filtrele
        game_without_winner = Game.objects.filter(
            models.Q(player1=self.user) | models.Q(player2=self.user),
            winner__isnull=True
        ).first()  # İlk eşleşen oyunu al

        # Eğer böyle bir oyun varsa oyunun ID'sini, yoksa 0 döndür
        return game_without_winner.id if game_without_winner else 0
    
            

    async def chat_message(self, event):
        # Oda bilgisini WebSocket üzerinden kullanıcılara gönder
        await self.send(text_data=json.dumps({
            'message': event['message']
        }))
    def generate_room_name(self):
        username = self.user.username
        return f"room_{username}"
        
  
    def update_user_status(self, user, status):
        self.online_users[user.username] = status
    
    
    

