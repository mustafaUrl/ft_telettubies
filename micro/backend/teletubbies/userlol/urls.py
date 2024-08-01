from django.urls import path
from . import views
from . import account

urlpatterns = [
    path('user_actions/', views.user_actions),
    path('update_user/', account.update_user),
    path('get_info/', account.get_info),
    path('update_profile_pic/', account.update_profile_pic),
    path('get_match_history/', account.get_match_history),
    path('invite_user/', account.invite_user),
    path('invite_notifications/', account.invite_notifications),
    path('delete_invite/', account.delete_invite),
] 