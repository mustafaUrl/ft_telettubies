from django.urls import path
from . import views

urlpatterns = [
    path('content/', views.index, name='index'),
]