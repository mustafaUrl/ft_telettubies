import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async, async_to_sync
from .models import OnlineUserStatus, Notification, OnlineUserStatusPrivate
from userlol.models import PrivateChatMessage, FriendList
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from django.contrib.auth.models import User


class UniversalChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if self.user.is_anonymous:
            await self.close()
            return

        # Kullanıcı durumunu güncelle
        await self.update_user_status(self.user, True)

        # Global sohbet grubuna katıl
        self.global_room_name = 'global_chat'
        await self.channel_layer.group_add(
            self.global_room_name,
            self.channel_name
        )

        # Özel sohbet odası adını belirle
        self.other_user = self.scope['url_route']['kwargs'].get('username')
        if self.other_user:
            await self.update_userprivate_status(self.user, True)
            sorted_usernames = sorted([self.user.username, self.other_user])
            self.private_room_name = f"private_chat_{'_'.join(sorted_usernames)}"
            await self.channel_layer.group_add(
                self.private_room_name,
                self.channel_name
            )

        await self.accept()

    async def disconnect(self, close_code):
        # Kullanıcı durumunu güncelle
        self.user = self.scope['user']
        if self.user.is_anonymous:
            await self.close()
            return
        await self.update_user_status(self.user, False)

        # Global sohbet grubundan ayrıl
        await self.channel_layer.group_discard(
            self.global_room_name,
            self.channel_name
        )

        # Özel sohbet odasından ayrıl
        if hasattr(self, 'private_room_name'):
            await self.update_userprivate_status(self.user, False)
            await self.channel_layer.group_discard(
                self.private_room_name,
                self.channel_name
            )
  
    async def receive(self, text_data):
        self.user = self.scope['user']
        if self.user.is_anonymous:
            await self.close()
            return
        text_data_json = json.loads(text_data)
        username = text_data_json["username"]
        message = text_data_json['message']
        room = text_data_json.get('room', 'global')
        notification_user = await self.notification_check(self.user)
        
        # Global sohbete mesaj gönder
        if room == 'global':
            await self.channel_layer.group_send(
                self.global_room_name,
                {
                    'type': 'chat_message',
                    'message': message + " global",
                    'username': username,
                    'room': 'global',
                    'notification' : notification_user
                }
            )
        # Özel sohbete mesaj gönder
        # elif room == 'private' and hasattr(self, 'private_room_name'):
        elif room.startswith('private_chat_'):
            await self.channel_layer.group_send(
                self.private_room_name,
                {
                    'type': 'chat_message',
                    'message': message + " private",
                    'username': username,
                    'room': 'private',
                    'other_user': self.other_user
                    'notification' : notification_user

                }
            )
        # Bildirimi ilgili kullanıcının kanalına gönder
        async_to_sync(channel_layer.group_send)(f"user_{self.recipient.id}", notification_data)
    # Mesajı WebSocket üzerinden gönder
    async def chat_message(self, event):
        message = event['message']
        username = event.get('username', None)
        room = event.get('room')
        other_user = event.get('other_user', None)
        if room == 'private' and await self.is_user_connected(other_user):
            await self.send(text_data=json.dumps({
                'message': message,
                'username': username,
                'room': 'private'
            }))
        elif room == 'global':
            await self.send(text_data=json.dumps({
                'message': message,
                'username': username,
                'room': 'global'
            }))
        else:
            await self.save_message(self.user, other_user, message)
            await self.send(text_data=json.dumps({
                'message': message,
                'username': username,
                'room': 'private'
            }))
    
        # Bildirim verilerini al
    @database_sync_to_async
    def notification_check(self, user);
        

    @database_sync_to_async
    def update_user_status(self, user, is_online):
        if not user.is_anonymous:
            OnlineUserStatus.objects.update_or_create(user=user, defaults={'is_online': is_online})
    @database_sync_to_async
    def update_userprivate_status(self, user, is_online):
        if not user.is_anonymous:
           OnlineUserStatusPrivate.objects.update_or_create(user=user, defaults={'is_online': is_online})
    # Diğer kullanıcı bağlı mı kontrol etme metodu (implemente edilmeli)
    @database_sync_to_async
    def is_user_connected(self, username):
        user = User.objects.get(username=username)
        online_status, created = OnlineUserStatusPrivate.objects.get_or_create(user=user)
        return online_status.is_online

     # Mesajı veritabanında kaydetme metodu (implemente edilmeli)
    @database_sync_to_async
    def save_message(self, sender, recipient_username, message):
        recipient = User.objects.get(username=recipient_username)
        chat_message = PrivateChatMessage.objects.create(sender=sender, recipient=recipient, message=message)
        Notification.objects.create(
            recipient=recipient,
            sender=sender,
            notification_type=Notification.UNREAD_MESSAGE,
            message='You have a new message!'
        )
        messages = PrivateChatMessage.get_most_recent_messages(sender, recipient)
        if messages.count() > 30:
            messages_to_delete = messages[30:]
            for message in messages_to_delete:
                message.delete()



# class PrivateChatConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.user = self.scope['user']
#         self.other_user = self.scope['url_route']['kwargs']['username']
#         # Kullanıcı adlarını alfabetik sıraya göre sırala
#         sorted_usernames = sorted([self.user.username, self.other_user])
#         self.room_name = f"private_chat_{'_'.join(sorted_usernames)}"
#         # await self.update_user_status(self.user, True)
#         await self.channel_layer.group_add("online_users", self.channel_name)
#         await self.channel_layer.group_add(
#             self.room_name,
#             self.channel_name
#         )
#         await self.accept()

#     async def disconnect(self, close_code):
#         # await self.update_user_status(self.user, False)
#         await self.channel_layer.group_discard("online_users", self.channel_name)
#         await self.channel_layer.group_discard(
#             self.room_name,
#             self.channel_name
#         )

#     async def receive(self, text_data):
#         text_data_json = json.loads(text_data)
#         message = text_data_json['message']

#         if self.user.is_authenticated:
#             # Eğer diğer kullanıcı da bağlıysa, mesajı WebSocket üzerinden gönder
#             if await self.is_user_connected(self.other_user):
#                 await self.channel_layer.group_send(
#                     self.room_name,
#                     {
#                         'type': 'send_private_message',
#                         'message': message,
#                         'username': self.user.username,
#                     }
#                 )
#             # Eğer diğer kullanıcı bağlı değilse, mesajı veritabanında kaydet
#             else:
#                 await self.save_message(self.user, self.other_user, message)
#     @database_sync_to_async
#     def update_user_status(self, user, is_online):
#         # OnlineUserStatus nesnesini güncelle veya oluştur
#         OnlineUserStatusPrivate.objects.update_or_create(user=user, defaults={'is_online': is_online})
#     @database_sync_to_async
#     def save_message(self, sender, recipient_username, message):
#         # Alıcı kullanıcıyı bul
#         recipient = User.objects.get(username=recipient_username)

#         # Mesajı veritabanında kaydet
#         chat_message = PrivateChatMessage.objects.create(sender=sender, recipient=recipient, message=message)

#         # Eğer alıcı kullanıcı çevrimdışıysa, bir bildirim oluştur

#         Notification.objects.create(
#             recipient=recipient,
#             sender=sender,
#             notification_type=Notification.UNREAD_MESSAGE,
#             message='You have a new message!'
#         )

#         # Her iki kullanıcı için de en eski mesajları sınırla
#         messages = PrivateChatMessage.get_most_recent_messages(sender, recipient)
#         if messages.count() > 30:
#             # En eski mesajları sil
#             messages_to_delete = messages[30:]
#             for message in messages_to_delete:
#                 message.delete()

#     @database_sync_to_async
#     def is_user_connected(self, username):
#         # Kullanıcı modelinden, verilen kullanıcı adına sahip kullanıcıyı al
#         user = User.objects.get(username=username)
#         # OnlineUserStatusPrivate modelini sorgula
#         online_status, created = OnlineUserStatusPrivate.objects.get_or_create(user=user)
#         # Kullanıcının çevrimiçi olup olmadığını döndür
#         return online_status.is_online
#     async def send_private_message(self, event):
#         message = event['message']
#         username = event['username']

#         # Mesajı WebSocket üzerinden gönder
#         await self.send(text_data=json.dumps({
#             'message': message,
#             'username': username,
#         }))







# class ChatConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         if self.scope['user'].is_anonymous:
#             await self.close()
#         self.user = self.scope['user']
#         await self.update_user_status(self.user, True)
#         self.roomGroupName = "group_chat_gfg"
#         await self.channel_layer.group_add(
#             self.roomGroupName,
#             self.channel_name
#         )
#         await self.accept()

#     async def disconnect(self, close_code):
#         # Burada 'self.channel_name' kullanılmalı.
#         self.user = self.scope['user']
#         await self.update_user_status(self.user, False)
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
