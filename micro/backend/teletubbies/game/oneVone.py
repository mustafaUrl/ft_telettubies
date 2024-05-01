import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async, async_to_sync
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from django.contrib.auth.models import User
from .models import Game


class oneVone(AsyncWebsocketConsumer):
    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.game = await self.get_game(self.game_id)
        
        # Check if the user is one of the players in the game
        if self.scope["user"].is_anonymous or self.scope["user"] not in [self.game.player1, self.game.player2]:
            await self.close()
        else:
            await self.accept()

    async def disconnect(self, close_code):
        # Handle disconnection
        pass

    async def receive(self, text_data):
        # Handle incoming messages
        pass

    @database_sync_to_async
    def get_game(self, game_id):
        return Game.objects.filter(id=game_id).first()
