import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async, async_to_sync
from userlol.models import PrivateChatMessage, FriendList
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from django.contrib.auth.models import User
from .gameRoom import GameRoom
import asyncio

class PongConsumer(AsyncWebsocketConsumer):
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
        self.game_rooms = {}
        for friend_username in friend_usernames:
            room_name = self.generate_room_name(str(self.user.username), str(friend_username))
            self.rooms[friend_username] = room_name  # Bu satırı ekleyin
            self.game_rooms[room_name] = GameRoom(self.user.username, friend_username)
            room_group_name = f'pong_{room_name}'
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
            room_group_name = f'pong_{room_name}'
            await self.channel_layer.group_discard(
                room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        if self.user.is_anonymous:
            await self.close()
            return

       

        text_data_json = json.loads(text_data)
        action = text_data_json.get('action')
        if action == 'move':
            # Oyuncunun hareketini al ve işle
            direction = text_data_json['direction']
            friend_username = text_data_json['opponent']
            friend_username =str(friend_username)
            room_name = self.rooms[friend_username]
            room_group_name = f'pong_{room_name}'

            # Oyun odasındaki ilgili oyuncunun pozisyonunu güncelle
            await self.update_player_position(room_name, self.user.username, direction)

            # Oyun durumunu yayınla
            await self.broadcast_game_state(room_group_name)

        elif action == 'start':
            # Oyunu başlat
            friend_username = text_data_json['opponent']
            friend_username =str(friend_username)
            room_name = self.rooms[friend_username]
            room_group_name = f'pong_{room_name}'
            game_room = self.game_rooms[room_name]
            asyncio.create_task(game_room.start_ball())
            asyncio.create_task(self.start_game(room_group_name))

    async def start_game(self, room_group_name):
        # Oyun döngüsünü asenkron olarak başlat
        while True:
            # ... (oyun mantığını güncelleme kodları)
            await self.broadcast_game_state(room_group_name)
            await asyncio.sleep(0.1)  # Her güncelleme arasında kısa bir   

    async def update_player_position(self, room_name, username, direction):
        # Oyun odasındaki oyuncunun pozisyonunu güncelle
        game_room = self.game_rooms[room_name]
        # asyncio.create_task(game_room.start_game())
        game_room.move_player(username, direction)
        # Oyun durumunu güncelle
        game_room.update_game_state()

    async def broadcast_game_state(self, room_group_name):
        # Oyun durumunu odaya bağlı olan herkese yayınla
        room_name = room_group_name.replace('pong_', '')
        game_room = self.game_rooms[room_name]
        game_state = game_room.get_state()  # Oyun durumunu al
        await self.channel_layer.group_send(
            room_group_name,
            {
                'type': 'game_state_message',
                'game_state': game_state
            }
        )

    async def game_state_message(self, event):
        game_state = event["game_state"]
    
        # Eğer kullanıcı anonimse, bu kısmı atla
        if not self.scope['user'].is_anonymous:
            await self.send(text_data=json.dumps({
                "type": 'game_state',
                "game_state": game_state
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
    