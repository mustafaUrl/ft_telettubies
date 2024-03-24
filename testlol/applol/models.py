from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

class EmailBackend(ModelBackend):
    def authenticate(self, request, username_or_email=None, password=None, **kwargs):
        UserModel = get_user_model()
        try:
            # E-posta adresine göre kullanıcıyı bul
            if '@' in username_or_email:
                user = UserModel.objects.get(email=username_or_email)
            else:
                # Kullanıcı adına göre kullanıcıyı bul
                user = UserModel.objects.get(username=username_or_email)
            if user.check_password(password):
                return user
        except UserModel.DoesNotExist:
            # E-posta ile eşleşen kullanıcı yoksa None döndür
            return None

