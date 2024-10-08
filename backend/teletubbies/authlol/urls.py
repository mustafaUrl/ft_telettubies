from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from . import ft_views
urlpatterns = [
    
    # path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register_view, name='register'),
    path('verify-2fa/', views.verify_2fa, name='verify'),
    path('ft-auth/', ft_views.ft_auth, name='ft_auth'),
    path('env/', ft_views.env, name='env'),
    # path('get_username/', views.get_username, name='get_username'),

]