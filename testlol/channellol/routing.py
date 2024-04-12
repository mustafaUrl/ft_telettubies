# from django.urls import path 
# from .consumers import ChatConsumer

# # Here, "" is routing to the URL ChatConsumer which 
# # will handle the chat functionality.
# websocket_urlpatterns = [
#     path("" , ChatConsumer.as_asgi()) , 
# ] 

from django.urls import path
from .consumers import ChatConsumer, PrivateChatConsumer
from .middleware import JWTAuthMiddleware  # Özelleştirilmiş middleware'inizi burada import edin

websocket_urlpatterns = [
    path("ws/global/", JWTAuthMiddleware(ChatConsumer.as_asgi())),  # Middleware ile ChatConsumer'ı sarmalayın
    path('ws/private_chat/<str:username>/', JWTAuthMiddleware(PrivateChatConsumer.as_asgi())),
]
