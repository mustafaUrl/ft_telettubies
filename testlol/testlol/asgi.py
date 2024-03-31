# """
# ASGI config for testlol project.

# It exposes the ASGI callable as a module-level variable named ``application``.

# For more information on this file, see
# https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
# """

# import os

# from django.core.asgi import get_asgi_application

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'testlol.settings')

# application = get_asgi_application()

# import os
# from django.core.asgi import get_asgi_application

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'testlol.settings')
# django_asgi_app = get_asgi_application()

# from channels.auth import AuthMiddlewareStack
# from channels.routing import ProtocolTypeRouter , URLRouter
# from channellol import routing
# from channellol.middleware import JWTAuthMiddleware
# application = ProtocolTypeRouter(
#     {
#         "http" : get_asgi_application() , 
#         "websocket" : AuthMiddlewareStack(
#             URLRouter(
#                 routing.websocket_urlpatterns
#             )    
#         )
#     }
# )

# Channels routing'ine middleware'i ekle
# application = ProtocolTypeRouter({
#     # ...
#     'http' : get_asgi_application(),
#     'websocket': JWTAuthMiddleware(
#         URLRouter(
#             routing.websocket_urlpatterns
#         )
#     ),
#     # ...
# })
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.auth import AuthMiddlewareStack
# from channels.middleware import BaseMiddleware
# from urllib.parse import parse_qs
# from rest_framework_simplejwt.authentication import JWTAuthentication
# from django.contrib.auth.models import AnonymousUser

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'testlol.settings')
django_asgi_app = get_asgi_application()

from channellol import routing
from channellol.middleware import JWTAuthMiddleware

# class JWTAuthMiddleware(BaseMiddleware):
#     """
#     Custom middleware to authenticate WebSocket connections using JWT tokens.
#     """

#     async def __call__(self, scope, receive, send):
#         # Extract the token from the query string
#         query_string = parse_qs(scope['query_string'].decode())
#         token = query_string.get('token', [None])[0]

#         # Authenticate the user
#         if token:
#             user = await self.get_user_from_token(token)
#             scope['user'] = user or AnonymousUser()
#         else:
#             scope['user'] = AnonymousUser()

#         return await super().__call__(scope, receive, send)

#     @database_sync_to_async
#     def get_user_from_token(self, token):
#         # Use DRF's JWTAuthentication to validate the token
#         jwt_auth = JWTAuthentication()
#         validated_token = jwt_auth.get_validated_token(token)
#         return jwt_auth.get_user(validated_token)

# Apply the JWT authentication middleware
application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddleware(
        URLRouter(
            routing.websocket_urlpatterns
        )
    ),
})
