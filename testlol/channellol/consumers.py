import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import OnlineUserStatus


class PrivateChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        self.other_user = self.scope['url_route']['kwargs']['username']
        # Kullanıcı adlarını alfabetik sıraya göre sırala
        sorted_usernames = sorted([self.user.username, self.other_user])
        self.room_name = f"private_chat_{'_'.join(sorted_usernames)}"
        
        await self.channel_layer.group_add(
            self.room_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        if self.user.is_authenticated:
            await self.channel_layer.group_send(
                self.room_name,
                {
                    'type': 'send_private_message',
                    'message': message,
                    'username': self.user.username,
                }
            )

    async def send_private_message(self, event):
        message = event['message']
        username = event['username']

        await self.send(text_data=json.dumps({
            'message': message,
            'username': username,
        }))

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.roomGroupName = "group_chat_gfg"
        await self.channel_layer.group_add(
            self.roomGroupName,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Burada 'self.channel_name' kullanılmalı.
        await self.channel_layer.group_discard(
            self.roomGroupName,
            self.channel_name
        )
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        username = text_data_json["username"]

        # Eğer kullanıcı anonimse, hata mesajı gönder
        if self.scope['user'].is_anonymous:
            await self.send(text_data=json.dumps({
                "error": "UnauthorizedForChat",
                "message": "You must be logged in to send messages."
            }))
        else:
            # Kullanıcı anonim değilse, mesajı gönder
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
    


#     # async def receive(self, text_data):
#     #     text_data_json = json.loads(text_data)
#     #     message = text_data_json["message"]
#     #     username = text_data_json["username"]
#     #     await self.channel_layer.group_send(
#     #         self.roomGroupName,{
#     #             "type" : "sendMessage" ,
#     #             "message" : message , 
#     #             "username" : username ,
#     #         })
#     # async def sendMessage(self , event) : 
#     #     message = event["message"]
#     #     username = event["username"]
#     #     await self.send(text_data = json.dumps({"message":message ,"username":username}))
      