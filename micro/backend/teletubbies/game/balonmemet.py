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
            room_name = self.generate_room_name(self.user.username, friend_username)
            self.rooms[friend_username] = room_name
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
         # Oyun odalarını tutacak sözlüğü başlat
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

        if action == 'start_game':
            opponent_username = text_data_json['opponent']
            opponent_username = str(opponent_username)
            room_name = self.generate_room_name(self.user.username, opponent_username)
            game_room = self.game_rooms.get(room_name)

            if not game_room:
                # Eğer oyun odası yoksa yeni bir tane oluştur
                game_room = GameRoom(self.user.username, opponent_username)
                self.game_rooms[room_name] = game_room

            # Oyun döngüsünü başlat
            asyncio.create_task(self.game_loop(game_room))


        if action == 'join_game':
            # Join a specific game room
            opponent_username = str(text_data_json['opponent'])
            room_name = self.generate_room_name(self.user.username, opponent_username)
            room_group_name = f'game_{room_name}'
            self.rooms[opponent_username] = room_name

            # Create a new GameRoom instance for this room
            self.game_rooms[room_name] = GameRoom(self.user.username, opponent_username)

            # Join the room group
            await self.channel_layer.group_add(
                room_group_name,
                self.channel_name
            )

            # Send a successful join message to the user
            await self.send(text_data=json.dumps({
                'message': f'{self.user.username} has joined the game room {room_name}.',
                'room_name': room_name
            }))

        elif action == 'leave_game':
            # Remove the user from a specific game room
            opponent_username = str(text_data_json['opponent'])
            room_name = self.rooms.pop(opponent_username, None)
            if room_name:
                room_group_name = f'game_{room_name}'

                # Discard the GameRoom instance for this room
                del self.game_rooms[room_name]

                # Leave the room group
                await self.channel_layer.group_discard(
                    room_group_name,
                    self.channel_name
                )

                # Send a successful leave message to the user
                await self.send(text_data=json.dumps({
                    'message': f'{self.user.username} has left the game room {room_name}.',
                    'room_name': room_name
                }))

        elif action == 'move':
            # Get the new position from the message
            new_position = text_data_json['position']
            opponent_username = str(text_data_json['opponent'])

            # Generate the room name using both usernames
            room_name = self.generate_room_name(self.user.username, opponent_username)
            game_room = self.game_rooms.get(room_name)

            # Check if the GameRoom instance exists
            if game_room:
                # Update the player's position in the GameRoom
                game_room.update_player_position(self.user.username, new_position)

        
    async def game_loop(self, game_room):
        # Oyun döngüsü burada gerçekleşir
        while True:
            game_room.update_game_state()
            game_state = game_room.get_game_state()
            await self.game_data_message(game_state)
            await asyncio.sleep(0.1)  # Her güncelleme arasında kısa bir bekleme

    async def game_data_message(self, game_state):
        # Oyun verisini WebSocket üzerinden gönder
        await self.send(text_data=json.dumps({
            'type': 'game_data',
            'game_data': game_state
        }))
    #     elif action == 'start_game':
    #         # Oyunu başlatma komutu
    #         opponent_username = str(text_data_json['opponent'])
    #         room_name = self.generate_room_name(self.user.username, opponent_username)
    #         game_room = self.game_rooms.get(room_name)

    #         if game_room:
    #             # Oyun döngüsünü başlat
    #             asyncio.create_task(game_room.start_game())
        
    # # The handler for sending game data messages
    # async def game_data_message(self, event):
    #     # Extract the game data from the event
    #     game_data = event['game_data']

    #     # Send the game data to WebSocket
    #     await self.send(text_data=json.dumps({
    #         'type': 'game_data',
    #         'game_data': game_data
    #     }))
    
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
        return '_'.join(sorted([username1, username2]))
    



# class PongConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.user = self.scope["user"]
#         if self.user.is_anonymous:
#             await self.close()
#             return
       
#         await self.update_user_status(self.user, True)
#         self.roomGroupName = "group_pong_gfg"
#         await self.channel_layer.group_add(
#             self.roomGroupName,
#             self.channel_name
#         )
#         await self.accept()

#     async def disconnect(self, close_code):
#         if self.user.is_anonymous:
#             await self.close()
#             return
#         # Burada 'self.channel_name' kullanılmalı.
#         self.user = self.scope['user']
#         await self.update_user_status(self.user, False)
#         await self.channel_layer.group_discard(
#             self.roomGroupName,
#             self.channel_name
#         )
#     async def receive(self, text_data):
#         if self.user.is_anonymous:
#             await self.close()
#             return
#         text_data_json = json.loads(text_data)
#         message = text_data_json["message"]
#         username = text_data_json["username"]

#         await self.channel_layer.group_send(
#             self.roomGroupName,{
#                 "type": "sendMessage",
#                 "message": message, 
#                 "username": username,
#             })
#     async def sendMessage(self, event):
#         message = event["message"]
#         username = event["username"]
    
#         # Eğer kullanıcı anonimse, bu kısmı atla
#         if not self.scope['user'].is_anonymous:
#             await self.send(text_data=json.dumps({
#                 "message": message,
#                 "username": username
#             }))
#     async def fetch_notifications(self, user):
#         if not self.scope['user'].is_anonymous:
#             notifications = Notification.objects.filter(recipient=user, is_read=False)
#             for notification in notifications:
#             # Send notification to the user
#                 await self.send(text_data=json.dumps({
#                     # 'type': notification.notification_type,
#                     'type': "notification",
#                     'message': 'You have a new notification!',
#                     'from_user': notification.sender.username
#                 }))
#             # Optionally, mark the notification as read
#                 notification.is_read = True
#                 notification.save()
#     @database_sync_to_async
#     def update_user_status(self, user, is_online):
#         # OnlineUserStatus nesnesini güncelle veya oluştur
#         OnlineUserStatus.objects.update_or_create(user=user, defaults={'is_online': is_online})


