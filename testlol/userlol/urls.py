from django.urls import path
from . import views
from . import account

urlpatterns = [
    path('user_actions/', views.user_actions),
    path('update_user/', account.update_user),
    path('get_info/', account.get_info),
    path('update_profile_pic/', account.update_profile_pic),
] 