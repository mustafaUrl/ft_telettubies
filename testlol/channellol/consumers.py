import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import OnlineUserStatus

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.roomGroupName = "group_chat_gfg"
        await self.channel_layer.group_add(
            self.roomGroupName,
            self.channel_name
        )
        await self.set_user_online(self.scope['user'], True)
        await self.accept()

    async def disconnect(self, close_code):
        await self.set_user_online(self.scope['user'], False)
        await self.channel_layer.group_discard(
            self.roomGroupName,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        username = text_data_json["username"]

        if self.scope['user'].is_anonymous:
            await self.send(text_data=json.dumps({
                "error": "UnauthorizedForChat",
                "message": "You must be logged in to send messages."
            }))
        else:
            await self.channel_layer.group_send(
                self.roomGroupName,{
                    "type": "chat_message",
                    "message": message, 
                    "username": username,
                })

    async def chat_message(self, event):
        message = event["message"]
        username = event["username"]

        if not self.scope['user'].is_anonymous:
            await self.send(text_data=json.dumps({
                "message": message,
                "username": username
            }))

    @sync_to_async
    def set_user_online(self, user, online):
        try:
            user_status, created = OnlineUserStatus.objects.get_or_create(user=user)
            user_status.update_status(online)
        except OnlineUserStatus.DoesNotExist:
            pass


# import json
# from channels.generic.websocket import AsyncWebsocketConsumer
# from asgiref.sync import sync_to_async
# from .models import OnlineUserStatus

# class ChatConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.roomGroupName = "group_chat_gfg"
#         await self.channel_layer.group_add(
#             self.roomGroupName,
#             self.channel_name
#         )
#         await self.accept()

#     async def disconnect(self, close_code):
#         # Burada 'self.channel_name' kullanılmalı.
#         await self.channel_layer.group_discard(
#             self.roomGroupName,
#             self.channel_name
#         )
#     async def receive(self, text_data):
#         text_data_json = json.loads(text_data)
#         message = text_data_json["message"]
#         username = text_data_json["username"]

#         # Eğer kullanıcı anonimse, hata mesajı gönder
#         if self.scope['user'].is_anonymous:
#             await self.send(text_data=json.dumps({
#                 "error": "UnauthorizedForChat",
#                 "message": "You must be logged in to send messages."
#             }))
#         else:
#             # Kullanıcı anonim değilse, mesajı gönder
#             await self.channel_layer.group_send(
#                 self.roomGroupName,{
#                     "type": "sendMessage",
#                     "message": message, 
#                     "username": username,
#                 })
#     async def sendMessage(self, event):
#         message = event["message"]
#         username = event["username"]
    
#         # Eğer kullanıcı anonimse, bu kısmı atla
#         if not self.scope['user'].is_anonymous:
#             await self.send(text_data=json.dumps({
#                 "message": message,
#                 "username": username
#             }))
    


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
      