import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from asgiref.sync import sync_to_async, async_to_sync
from .gameRoom import GameRoom
import asyncio
from django.contrib.auth.models import User


#this should wait for a socket connection from frontend javascript and then accept it and create a gameroom for two users
class PongConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.close()
            return
        await self.accept()
        self.game_room = GameRoom(self.user.username)
        self.game_room.add_player(self.user.username)

    async def disconnect(self, close_code):
        if self.user.is_anonymous:
            await self.close()
            return
        self.game_room.remove_player(self.user.username)
        await self.close()

    async def receive_json(self, content):
        if self.user.is_anonymous:
            await self.close()
            return
        if content["message"] == "start":
            await self.game_room.start_game()
        elif content["message"] == "move":
            await self.game_room.move_player(self.user.username, content["direction"])
        elif content["message"] == "stop":
            await self.game_room.stop_player(self.user.username)
        elif content["message"] == "ball":
            await self.game_room.move_ball(content["direction"])
        elif content["message"] == "score":
            await self.game_room.score(self.user.username)
        elif content["message"] == "end":
            await self.game_room.end_game()
        elif content["message"] == "restart":
            await self.game_room.restart_game()
        elif content["message"] == "leave":
            await self.close()
        else:
            pass

