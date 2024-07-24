from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone



class OnlineUserStatus(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_online = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} is {'online' if self.is_online else 'offline'}"


class OnlineUserStatusPrivate(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_online = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} is {'online' if self.is_online else 'offline'}"

# class OnlineUserStatus(models.Model):
#     user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='online_status')
#     is_online = models.BooleanField(default=False)
#     last_seen = models.DateTimeField(default=timezone.now)

#     def update_status(self, online=True):
#         self.is_online = online
#         self.last_seen = timezone.now()
#         self.save()

from django.db import models
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver
from userlol.models import FriendRequest, UserProfile

User = get_user_model()

class Notification(models.Model):
    # Bildirim türleri
    FRIEND_REQUEST = 'friend_request'
    GAME_INVITE = 'game_invite'
    UNREAD_MESSAGE = 'unread_message'
    
    NOTIFICATION_TYPES = [
        (FRIEND_REQUEST, 'Friend Request'),
        (GAME_INVITE, 'Game Invite'),
        (UNREAD_MESSAGE, 'Unread Message'),
    ]

    # Bildirim alanları
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    message = models.TextField(null=True, blank=True)

    def __str__(self):
        return f'Bildirim({self.sender}, {self.recipient}, {self.notification_type})'

    class Meta:
        ordering = ['-timestamp']


#game
