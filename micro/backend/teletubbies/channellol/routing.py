# from django.urls import path 
# from .consumers import ChatConsumer

# # Here, "" is routing to the URL ChatConsumer which 
# # will handle the chat functionality.
# websocket_urlpatterns = [
#     path("" , ChatConsumer.as_asgi()) , 
# ] 

from django.urls import path 
# from .consumers import ChatConsumer, PrivateChatConsumer
from .consumers import PrivateChatConsumer , ChatConsumer
# from .pong import PongConsumer
from .middleware import JWTAuthMiddleware  # Özelleştirilmiş middleware'inizi burada import edin
from django.urls import re_path
from game.pongConsumer import PongConsumer

websocket_urlpatterns = [
    re_path(r'^ws/chatPrivate/$', JWTAuthMiddleware(PrivateChatConsumer.as_asgi())),
    re_path(r'^ws/chat/$', JWTAuthMiddleware(ChatConsumer.as_asgi())),
    re_path(r'^ws/pong/$', JWTAuthMiddleware(PongConsumer.as_asgi())),
    # re_path(r'^ws/chat/(?P<username>\w+)/$', UniversalChatConsumer.as_asgi()),
    # re_path(r'^ws/notifications/$', NotificationConsumer.as_asgi()),
]

# websocket_urlpatterns = [
#     path('ws/chat/', JWTAuthMiddleware(UniversalChatConsumer.as_asgi())),
#     # path(ws/global/", JWTAuthMiddleware(ChatConsumer.as_asgi())),  # Middleware ile ChatConsumer'ı sarmalayın
#     # path('ws/private_chat/<str:username>/', JWTAuthMiddleware(PrivateChatConsumer.as_asgi())),
# ]
