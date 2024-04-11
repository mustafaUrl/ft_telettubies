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

