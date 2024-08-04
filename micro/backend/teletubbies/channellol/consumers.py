import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async, async_to_sync
from .models import OnlineUserStatus, Notification, OnlineUserStatusPrivate
from userlol.models import FriendList
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from django.contrib.auth.models import User
import logging
from datetime import datetime, timezone
import random
import math
from game.models import  Match
logging.basicConfig(level=logging.INFO)

class PrivateChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.close()
            return
        self.rooms = {}
        await self.update_room_name()
        await self.accept()

    async def disconnect(self, close_code):
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
            friend_username = text_data_json['friend']
            room_name = self.generate_room_name(self.user.username, friend_username)
            room_group_name = f'chat_{room_name}'
            self.rooms[friend_username] = room_name

            await self.channel_layer.group_add(
                room_group_name,
                self.channel_name
            )

            await self.send(text_data=json.dumps({
                'message': f'{self.user.username} has joined the room {room_name}.',
                'room_name': room_name
            }))

        elif command == 'leave':
            friend_username = text_data_json['friend']
            room_name = self.rooms.pop(friend_username, None)
            if room_name:
                room_group_name = f'chat_{room_name}'

                await self.channel_layer.group_discard(
                    room_group_name,
                    self.channel_name
                )

                await self.send(text_data=json.dumps({
                    'message': f'{self.user.username} has left the room {room_name}.',
                    'room_name': room_name
                }))
        elif command == 'update':
            await self.update_room_name()
        elif command == 'send':
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
                        'username': self.user.username  
                    }
                )
            else :
                self.rooms={}
                await self.update_room_name()
                if friend_username in self.rooms:
                    room_name = self.rooms[friend_username]
                    room_group_name = f'chat_{room_name}'
                    await self.channel_layer.group_send(
                        room_group_name,
                        {
                            'type': 'chat_message',
                            'message': message,
                            'username': self.user.username  
                        }
                    )

    async def update_room_name(self):
        friend_usernames = await self.get_friend_usernames(self.user)
        
        self.rooms = {}
        
        for friend_username in friend_usernames:
            if friend_username not in self.rooms:
                room_name = self.generate_room_name(self.user.username, friend_username)
                self.rooms[friend_username] = room_name
                room_group_name = f'chat_{room_name}'
                await self.channel_layer.group_add(
                    room_group_name,
                    self.channel_name
                )
    async def chat_message(self, event):
        message = event['message']
        username = event['username']  
        await self.send(text_data=json.dumps({
            'message': message,
            'username': username  
        }))

    @database_sync_to_async
    def get_friend_usernames(self, user):
        try:
            friend_list = FriendList.objects.get(user=user).friends.all()
            friend_usernames = [friend.username for friend in friend_list]
            return friend_usernames
        except FriendList.DoesNotExist:
            return []

    def generate_room_name(self, username1, username2):
        return '_'.join(sorted([username1, username2]))
    

class ChatConsumer(AsyncWebsocketConsumer):
    online_users = set()
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
        
        await self.list_online_players()
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
        await self.list_online_players()

    async def receive(self, text_data):
        if self.user.is_anonymous:
            await self.close()
            return

       
        
        text_data_json = json.loads(text_data)
        username = text_data_json["username"]
        command = text_data_json["command"]
        room = text_data_json["room"]
        
    

        if command == "online_players":
            await self.list_online_players()
            await self.update_tournaments()
        elif command == "create":
            playerNames = text_data_json["playerNames"]
            startTime = text_data_json["startTime"]
            await self.create_tournament(room, playerNames, username, startTime)
        elif command == "join":
            current_time = text_data_json["currentTime"]
            await self.join_tournament(room, username, current_time)
        elif command == "leave":
            await self.leave_tournament(room, username)
        elif command == "kick":
            target = text_data_json["target"]
            if username == ChatConsumer.tournaments[room]["host"]:
                if target in ChatConsumer.tournaments[room]["players"]:
                    await self.leave_tournament(room, target)
        elif command == "start":
            if username == ChatConsumer.tournaments[room]["host"]:
               await self.start_tournament(room)
        elif command == "update_notification":
            await self.update_notification(self.user)
        else:
            
            message = text_data_json["message"]
            await self.channel_layer.group_send(
                self.roomGroupName, {
                    "type": "sendMessage",
                    "message": message, 
                    "username": username,
                }
            )

   
        
    async def update_notification(self, user):
        await self.channel_layer.group_send(
            self.roomGroupName, {
                'type': 'send_notifications',
            }
        )
    
    async def start_tournament(self, tournament_name):
        if tournament_name in ChatConsumer.tournaments:
            ChatConsumer.tournaments[tournament_name]["status"] = "started"
            teams = list(ChatConsumer.tournaments[tournament_name]["players"])
            round_count = math.ceil(math.log2(len(teams))) 

            if len(teams) % 2 == 1:
                waiting_player = teams.pop()  
                ChatConsumer.tournaments[tournament_name]["waiting_player"] = waiting_player 
            else:
                waiting_player = None
 
           
            message = f"Tournament started!"
            await self.send_tournament_message(tournament_name, message)
            
            await self.update_tournaments()
        else:
            logging.error("Tournament %s not found", tournament_name)

      




    async def create_tournament(self, tournament_name, player_names, host_name, start_time):
        if tournament_name not in ChatConsumer.tournaments:
            logging.info("start time: %s", start_time)
            start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            ChatConsumer.tournaments[tournament_name] = {
                "players": set(player_names.split(', ')),
                "host": host_name,
                "start_time": start_time.isoformat(), 
                "status": "waiting",
                "rounds": {},
                "waiting_player ": "",
                "channels": set() 
            }
            logging.info("Tournament %s created by %s start time %s ", tournament_name, host_name, start_time)
            tournament_group_name = f"tournament_{tournament_name}"
            await self.channel_layer.group_add(
                tournament_group_name,
                self.channel_name
            )
            await self.update_tournaments()
        else:
            logging.warning("Tournament %s already exists", tournament_name)
             

    async def update_tournaments(self):
        tournaments_list = {t: {"players": list(p.get("players", [])), "host": p.get("host", ""), "start_time": p.get("start_time", ""), "status": p.get("status", ""), "rounds": p.get("rounds", {}), "waiting_player": p.get("waiting_player", None )} for t, p in ChatConsumer.tournaments.items()}      
        await self.channel_layer.group_send(
            self.roomGroupName, {
                'type': 'tournaments_send',
                'tournaments_list': tournaments_list,
            }
        )
    async def list_online_players(self):
        online_players_list = list(ChatConsumer.online_users)
        if online_players_list:
            await self.channel_layer.group_send(
                self.roomGroupName, {
                'type': 'list_online_players_send',
                'players': online_players_list
                }
            )
        
    async def leave_tournament(self, tournament_name, player_name):
        if tournament_name in ChatConsumer.tournaments:
            tournament_group_name = f"tournament_{tournament_name}"  # Define tournament_group_name early

            if ChatConsumer.tournaments[tournament_name]["host"] == player_name:
                # The host is leaving, remove the tournament and discard all associated channels
                channels = ChatConsumer.tournaments[tournament_name].get("channels", set())
                for channel in channels:
                    await self.channel_layer.group_discard(
                        tournament_group_name,
                        channel
                    )
                del ChatConsumer.tournaments[tournament_name]
            else:
                # A regular player is leaving
                ChatConsumer.tournaments[tournament_name]["players"].discard(player_name)
                channels = ChatConsumer.tournaments[tournament_name].get("channels", set())
                channels.discard(self.channel_name)
                ChatConsumer.tournaments[tournament_name]["channels"] = channels
                await self.channel_layer.group_discard(
                    tournament_group_name,
                    self.channel_name
                )
            
            await self.update_tournaments()
        else:
            # Handle tournament not found
            logging.warning("Tournament %s not found", tournament_name)





    async def join_tournament(self, tournament_name, player_name, current_time):
        if tournament_name in ChatConsumer.tournaments:
            # Convert the string start time to a datetime object in UTC
            
            tournament_start_time_str = ChatConsumer.tournaments[tournament_name]["start_time"]
            tournament_start_time = datetime.fromisoformat(tournament_start_time_str)
            tournament_start_time = tournament_start_time.replace(tzinfo=timezone.utc)

            # Convert milliseconds to seconds and then to a datetime object in UTC
            current_time = datetime.fromtimestamp(current_time / 1000.0, tz=timezone.utc)
            

            # Compare the times in milliseconds
            if int(tournament_start_time.timestamp() * 1000) > int(current_time.timestamp() * 1000):
                ChatConsumer.tournaments[tournament_name]["players"].add(player_name)
                tournament_group_name = f"tournament_{tournament_name}"
                
                await self.channel_layer.group_add(
                    tournament_group_name,
                    self.channel_name
                )

                ChatConsumer.tournaments[tournament_name]["channels"].add(self.channel_name)
                await self.update_tournaments()
            else:
                # Handle join attempt after start time
                logging.info("Join time is over for tournament %s", tournament_name)
        else:
            # Handle tournament not found
            logging.warning("Tournament %s not found", tournament_name)



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

    

    async def list_online_players_send(self, event):
        online_players_list = event["players"]
        if not self.scope['user'].is_anonymous:
            await self.send(text_data=json.dumps({
                "type": "online_players",
                'players': online_players_list
            }))
    async def send_notifications(self, event):
        if not self.scope['user'].is_anonymous:
            await self.send(text_data=json.dumps({
                "type": "invite_notification",
            }))

    async def send_tournament_message(self, tournament_name, message):
        tournament_group_name = f"tournament_{tournament_name}"
        await self.channel_layer.group_send(
            tournament_group_name, {
                'type': 'chat_message',
                'message': message,
            }
        )
    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'tournament_message',
            'message': message
        }))
    async def tournaments_send(self, event):
        tournaments_list = event["tournaments_list"]
        if not self.scope['user'].is_anonymous:
            await self.send(text_data=json.dumps({
                "type": "tournaments",
                "tournaments":tournaments_list,
            }))