# urls.py
from django.contrib import admin
from django.urls import path
from applol import views
from django.views.generic import RedirectView
from django.template.exceptions import TemplateDoesNotExist
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.index, name='index'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/login/', views.login, name='login'),
    path('api/register/', views.register, name='register'),
    path('api/profile/', views.user_profile, name='user_profile'),
    path('content/<str:content_id>/', views.get_html_content, name='get_html_content'),
    # Diğer URL tanımları...
]



    
