from django.urls import path
from . import views

urlpatterns = [
    path('enable/', views.enable_twofa),
    path('disable/', views.disable_twofa),
    path('verify/', views.verify_twofa),
]