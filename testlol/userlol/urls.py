from django.urls import path
from . import views

urlpatterns = [
    path('user_actions/', views.user_actions),
]