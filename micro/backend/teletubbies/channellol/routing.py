
from django.urls import path 
from .consumers import PrivateChatConsumer , ChatConsumer
from .middleware import JWTAuthMiddleware
from django.urls import re_path

websocket_urlpatterns = [
    re_path(r'^ws/chatPrivate/$', JWTAuthMiddleware(PrivateChatConsumer.as_asgi())),
    re_path(r'^ws/chat/$', JWTAuthMiddleware(ChatConsumer.as_asgi()))
]

