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


