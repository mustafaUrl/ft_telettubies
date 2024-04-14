from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class OnlineUserStatus(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='online_status')
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(default=timezone.now)

    def update_status(self, online=True):
        self.is_online = online
        self.last_seen = timezone.now()
        self.save()

from django.db import models
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

User = get_user_model()

class Notification(models.Model):
    # Bildirim türleri
    FRIEND_REQUEST = 'friend_request'
    GAME_INVITE = 'game_invite'
    UNREAD_MESSAGE = 'unread_message'
    
    NOTIFICATION_TYPES = [
        (FRIEND_REQUEST, 'Arkadaşlık İsteği'),
        (GAME_INVITE, 'Oyun Daveti'),
        (UNREAD_MESSAGE, 'Okunmamış Mesaj'),
    ]

    # Bildirim alanları
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Bildirim({self.sender}, {self.recipient}, {self.notification_type})'

    class Meta:
        ordering = ['-timestamp']

# Arkadaşlık isteği kabul edildiğinde bildirim oluştur
@receiver(post_save, sender=FriendRequest)
def create_friend_request_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            recipient=instance.to_user,
            sender=instance.from_user,
            notification_type=Notification.FRIEND_REQUEST
        )

# Kullanıcı profilinde değişiklik olduğunda bildirim oluştur
@receiver(post_save, sender=UserProfile)
def create_profile_update_notification(sender, instance, created, **kwargs):
    if not created:
        Notification.objects.create(
            recipient=instance.user,
            sender=instance.user,
            notification_type='profile_update',
            message='Profil güncellemesi yapıldı.'
        )
