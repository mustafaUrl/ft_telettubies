from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

User = get_user_model()

class JWTAuthMiddleware(BaseMiddleware):
    """
    Custom middleware to authenticate WebSocket connections using JWT tokens.
    """

    async def __call__(self, scope, receive, send):
        # Query string'i ayrıştır
        query_string = parse_qs(scope['query_string'].decode())
        token = query_string.get('token', [None])[0]

        # Token'ı doğrula ve kullanıcıyı al
        scope['user'] = await self.get_user_from_token(token) if token else AnonymousUser()

        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user_from_token(self, token):
        try:
            # Token'ı doğrula
            access_token = AccessToken(token)
            user = User.objects.get(id=access_token['user_id'])
            return user
        except Exception as e:
            # Token geçersizse veya hata oluşursa
            return AnonymousUser()
