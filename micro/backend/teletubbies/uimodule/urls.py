from django.urls import path
from . import views

urlpatterns = [
    path('content/', views.index, name='index'),
    # path('guest/profile/', views.user_profile, name='user_profile'),
    # path('test/', views.test, name='test'),
    #path('content/<str:content_id>/', views.get_html_content, name='get_html_content'),
]