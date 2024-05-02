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
    active_users = {}
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
            print(player1_username, player2_username,self.game_id)
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
        if command == 'stop':
            await self.pong_game.stop_paddle(paddle)
        if command == 'leave':
            await self.leave_game()
            await self.close()

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

    async def leave_game(self):
        await self.leave()
        await self.channel_layer.group_send(
            self.game_id,
            {
                'type': 'game.leave',
                'player': self.user.username
            }
        )
    
    @database_sync_to_async
    def set_game_winner(self, game_id, winner, player1_score, player2_score):
        game = Game.objects.get(id=game_id)
        game.winner = winner
        game.player1_score = player1_score
        game.player2_score = player2_score
        game.save()

    @database_sync_to_async
    def leave(self):
        # Oyuncuyu oyun odasından çıkar
        game = Game.objects.get(id=self.game_id)
        if self.user == game.player1:
            game.player1_state = 'left'
        elif self.user == game.player2:
            game.player2_state = 'left'
        game.save()
        await self.channel_layer.group_discard(
            self.game_id,
            self.channel_name
        )

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

    