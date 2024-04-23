from django.db import models
from django.contrib.auth.models import User
from channellol.models import OnlineUserStatus
# from django.conf import settings


# User.add_to_class('is_online', lambda self: OnlineUserStatus.objects.get(user=self).is_online)

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    
    # def is_online(self):
    #     try:
    #         return self.user.online_status.is_online
    #     except OnlineUserStatus.DoesNotExist:
    #         return False


from django.db.models.signals import post_save
from django.dispatch import receiver

class PrivateChatMessage(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    message = models.CharField(max_length=500)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f'Message from {self.sender} to {self.recipient} - {self.timestamp.strftime("%Y-%m-%d %H:%M:%S")}'

    @staticmethod
    def get_most_recent_messages(user, other_user):
        # İki kullanıcı arasındaki en son mesajları getir
        return PrivateChatMessage.objects.filter(
            models.Q(sender=user, recipient=other_user) | 
            models.Q(sender=other_user, recipient=user)
        ).order_by('-timestamp')[:30]

@receiver(post_save, sender=PrivateChatMessage)
def limit_private_chat_messages(sender, instance, **kwargs):
    # Mesaj kaydedildikten sonra, her iki kullanıcı için de en eski mesajları sınırla
    messages = PrivateChatMessage.get_most_recent_messages(instance.sender, instance.recipient)
    if messages.count() > 30:
        # En eski mesajları sil
        messages_to_delete = messages[30:]
        for message in messages_to_delete:
            message.delete()

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