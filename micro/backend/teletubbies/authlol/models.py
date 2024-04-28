# from django.db import models

from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django_otp import user_has_device

class EmailBackend(ModelBackend):
    def authenticate(self, request, username_or_email=None, password=None, **kwargs):
        UserModel = get_user_model()
        if username_or_email is None:
            username_or_email = kwargs.get(UserModel.USERNAME_FIELD, None)
        
        if username_or_email and password:
            try:
                user = UserModel._default_manager.get_by_natural_key(username_or_email)
                
                if user.check_password(password) and self.user_can_authenticate(user):
                    if user_has_device(user):
                        user.two_factor_auth_required = True
                        return user
                    else:
                        return user
            except UserModel.DoesNotExist:
                return None
        return None


# class EmailBackend(ModelBackend):
#     def authenticate(self, request, username_or_email=None, password=None, **kwargs):
#         UserModel = get_user_model()
#         if username_or_email is None:
#             # Eğer username_or_email parametresi None ise, kwargs'dan almayı dene
#             username_or_email = kwargs.get('username', None)
#         if username_or_email and password:
#             try:
#                 # E-posta adresine göre kullanıcıyı bul
#                 if '@' in username_or_email:
#                     user = UserModel.objects.get(email=username_or_email)
#                 else:
#                     # Kullanıcı adına göre kullanıcıyı bul
#                     user = UserModel.objects.get(username=username_or_email)
#                 if user.check_password(password):
#                     return user
#             except UserModel.DoesNotExist:
#                 # E-posta ile eşleşen kullanıcı yoksa None döndür
#                 return None
#         else:
#             return None




# class EmailBackend(ModelBackend):
#     def authenticate(self, request, username_or_email=None, password=None, **kwargs):
#         UserModel = get_user_model()
#         try:
#             # E-posta adresine göre kullanıcıyı bul
#             if '@' in username_or_email:
#                 user = UserModel.objects.get(email=username_or_email)
#             else:
#                 # Kullanıcı adına göre kullanıcıyı bul
#                 user = UserModel.objects.get(username=username_or_email)
#             if user.check_password(password):
#                 return user
#         except UserModel.DoesNotExist:
#             # E-posta ile eşleşen kullanıcı yoksa None döndür
#             return None
