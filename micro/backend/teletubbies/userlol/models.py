from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)

class FriendList(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='friend_list')
    friends = models.ManyToManyField(User, related_name='friends', blank=True)
    banned = models.ManyToManyField(User, related_name='banned_users', blank=True)
    block = models.ManyToManyField(User, related_name='block_users', blank=True)

    def __str__(self):
        return f"{self.user.username}'s friend list"

    def is_blocked(self, user):
        return self.block.filter(id=user.id).exists()
        
class FriendRequest(models.Model):
    from_user = models.ForeignKey(User, related_name='sent_requests', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='received_requests', on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.from_user.username} -> {self.to_user.username}"

    def accept(self):
        to_user_friends_list, _ = FriendList.objects.get_or_create(user=self.to_user)
        from_user_friends_list, _ = FriendList.objects.get_or_create(user=self.from_user)

        # If the user is not blocked, add them to the friends list
        if not to_user_friends_list.is_blocked(self.from_user):
            to_user_friends_list.friends.add(self.from_user)
        
        if not from_user_friends_list.is_blocked(self.to_user):
            from_user_friends_list.friends.add(self.to_user)

        self.is_active = False
        self.save()

    def reject(self):
        self.is_active = False
        self.save()
