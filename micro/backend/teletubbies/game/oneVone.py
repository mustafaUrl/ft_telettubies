import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async, async_to_sync
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from django.contrib.auth.models import User
from .models import Game
from .game import PongGame
import asyncio
class oneVone(AsyncWebsocketConsumer):
    games = {}

    async def connect(self):
        self.user = self.scope["user"]
        self.game_id = self.scope['url_route']['kwargs']['game_id']

        # Kullanıcı anonimse bağlantıyı kapat
        if self.user.is_anonymous:
            await self.close()
            return

        # Oyun ID'sine göre oyunu al veya oluştur
        if self.game_id not in self.games:
            player1_username, player2_username = await self.get_game_usernames(self.game_id)
            if player1_username is None or player2_username is None:
                print("Oyun bulunamadı")
                await self.close()
                return
            # Yeni bir PongGame nesnesi oluştur ve games sözlüğünde sakla
            self.games[self.game_id] = PongGame(player1_username, player2_username, 800, 600)

        # Oyun ID'sine göre PongGame nesnesini al
        self.pong_game = self.games[self.game_id]

        # Oyun odasına katıl
        await self.channel_layer.group_add(
            self.game_id,
            self.channel_name
        )

        # WebSocket bağlantısını kabul et
        await self.accept()

    async def disconnect(self, close_code):
        if self.user.is_anonymous:
            await self.close()
            return
        if self.game_id in self.games:
            del self.games[self.game_id]
        await self.channel_layer.group_discard(
            self.game_id,
            self.channel_name
        )
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        command = text_data_json['command']

        if command == 'start':
            await self.start_game()
            asyncio.create_task(self.broadcast_game_state())
        if command == 'move':
            # Kullanıcı kimliğini kontrol et
            if self.user.username == self.pong_game.player1_user:
                paddle = 'player1'
            elif self.user.username == self.pong_game.player2_user:
                paddle = 'player2'
            else:
                return  # Eğer kullanıcı oyunculardan biri değilse, işlem yapma
            direction = text_data_json['direction']
            await self.pong_game.move_paddle(paddle, direction)
            
        
    async def start_game(self):
        await self.pong_game.start_game()

    async def broadcast_game_state(self):
        # Oyun ID'sine göre oyun durumunu yayınla
        game = self.games.get(self.game_id)
        if game:
            while True:
                game.update_positions()
                game_state = game.get_game_state()
                # Oyun durumunu her iki oyuncuya da gönder
                await self.channel_layer.group_send(
                    self.game_id,
                    {
                        'type': 'game.state',
                        'game_state': game_state
                    }
                )
                await asyncio.sleep(1/60)
    
    async def game_state(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_state',
            'game_state': event['game_state']
        }))
    # async def broadcast_game_state(self):
        
    #     while True:
    #         self.pong_game.update_positions()
    #         game_state = self.pong_game.get_game_state()
    #         await self.send(text_data=json.dumps({
    #             'type': 'game_state',
    #             'game_state': game_state
    #         }))
    #         await asyncio.sleep(1/60)
            
    
   
    # async def broadcast_game_state(self):
    #     await self.send(text_data=json.dumps({
    #         'type': 'game_state',
    #         'paddle1_position': self.pong_game.paddle1['y'],
    #         'paddle2_position': self.pong_game.paddle2['y'],
    #         'ball_position': {
    #             'x': self.pong_game.ball['x'],
    #             'y': self.pong_game.ball['y']
    #         }
    #     }))
    # async def receive(self, text_data):
    #     text_data_json = json.loads(text_data)
    #     command = text_data_json['command']

    #     if command == 'start':
    #         # Oyunu başlat
    #         await self.start_game()
    #     elif command == 'move':
    #         # Paleti hareket ettir
    #         await self.move_paddle(text_data_json['paddle'], text_data_json['direction'])


    # async def start_game(self):
    #     # PongGame sınıfının bir örneğini oluştur
    #     self.pong_game = PongGame(self.game.player1, self.game.player2, 800, 600, self.broadcast_game_state)
    #     # Oyunu başlat
    #     await self.pong_game.start_game()
    
    # async def move_paddle(self, paddle, direction):
    #     # Paddle'ı hareket ettir
    #     self.pong_game.move_paddle(paddle, direction)
    #     # Oyun durumunu yayınla
    #     await self.broadcast_game_state()

    # async def broadcast_game_state(self):
    #     # Oyun durumunu tüm oyunculara yayınla
    #     await self.send(text_data=json.dumps({
    #         'type': 'game_state',
    #         'paddle1_position': self.pong_game.paddle1['y'],
    #         'paddle2_position': self.pong_game.paddle2['y'],
    #         'ball_position': {
    #             'x': self.pong_game.ball['x'],
    #             'y': self.pong_game.ball['y']
    #         }
    #     }))
    
    @database_sync_to_async
    def get_game(self, game_id):
        try:
            return Game.objects.get(id=game_id)
        except Game.DoesNotExist:
            return None
    @database_sync_to_async
    def get_game_usernames(self, game_id):
        try:
            game = Game.objects.get(id=game_id)
            return game.player1.username, game.player2.username
        except Game.DoesNotExist:
            return None, None

    # async def send_to_player(self, message):
    #     # Diğer oyuncuya mesaj gönder
    #     await self.send(text_data=message)



    # class oneVone(AsyncWebsocketConsumer):
    # games = {}

    # async def connect(self):
    #     self.user = self.scope["user"]
    #     self.game_id = self.scope['url_route']['kwargs']['game_id']

    #     if self.user.is_anonymous:
    #         await self.close()
    #         return

    #     # Oyun ID'sine göre oyunu al veya oluştur
    #     if self.game_id not in self.games:
    #         player1_username, player2_username = await self.get_game_usernames(self.game_id)
    #         if player1_username is None or player2_username is None:
    #             print("Oyun bulunamadı")
    #             await self.close()
    #             return
    #         # Yeni bir PongGame nesnesi oluştur ve games sözlüğünde sakla
    #         self.games[self.game_id] = PongGame(player1_username, player2_username, 800, 600)
        
    #     # Oyun ID'sine göre PongGame nesnesini al
    #     self.pong_game = self.games[self.game_id]
    #     await self.accept()

    # async def disconnect(self, close_code):
    #     if self.user.is_anonymous:
    #         await self.close()
    #         return
    #     if self.game_id in self.games:
    #         del self.games[self.game_id]
    # async def receive(self, text_data):
    #     text_data_json = json.loads(text_data)
    #     command = text_data_json['command']

    #     if command == 'start':
    #         await self.start_game()
    #         asyncio.create_task(self.broadcast_game_state())
    #     elif command == 'move':
    #         paddle = text_data_json['paddle']
    #         direction = text_data_json['direction']
    #     # 'move_paddle' fonksiyonunu çağırarak paleti hareket ettir
    #         await self.pong_game.move_paddle(paddle, direction)
            
        
    # async def start_game(self):
    #     await self.pong_game.start_game()

    # async def broadcast_game_state(self):
    #     # Oyun ID'sine göre oyun durumunu yayınla
    #     game = self.games.get(self.game_id)
    #     if game:
    #         while True:
    #             game.update_positions()
    #             game_state = game.get_game_state()
    #             # Oyun durumunu her iki oyuncuya da gönder
    #             await self.channel_layer.group_send(
    #                 self.game_id,
    #                 {
    #                     'type': 'game.state',
    #                     'game_state': game_state
    #                 }
    #             )
    #             await asyncio.sleep(1/60)
    
    # async def game_state(self, event):
    #     await self.send(text_data=json.dumps({
    #         'type': 'game_state',
    #         'game_state': event['game_state']
    #     }))