from django.db import models
from django.contrib.auth.models import User

# Arkadaş listesi modeli
class FriendList(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='friend_list')
    friends = models.ManyToManyField(User, related_name='friends', blank=True)
    banned = models.ManyToManyField(User, related_name='banned_users', blank=True)
    muted = models.ManyToManyField(User, related_name='muted_users', blank=True)

    def __str__(self):
        return f"{self.user.username}'s friend list"


class FriendRequest(models.Model):
    from_user = models.ForeignKey(User, related_name='sent_requests', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='received_requests', on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.from_user.username} -> {self.to_user.username}"

    def accept(self):
        # İsteği kabul eden kullanıcının arkadaş listesine istek gönderen kullanıcıyı ekleyin
        friend_list, created = FriendList.objects.get_or_create(user=self.to_user)
        friend_list.friends.add(self.from_user)
        # İsteği gönderen kullanıcının arkadaş listesine isteği kabul eden kullanıcıyı ekleyin
        friend_list_from_user, created = FriendList.objects.get_or_create(user=self.from_user)
        friend_list_from_user.friends.add(self.to_user)
        # İsteği pasif hale getirin
        self.is_active = False
        self.save()

    def reject(self):
        # İsteği pasif hale getirin
        self.is_active = False
        self.save()