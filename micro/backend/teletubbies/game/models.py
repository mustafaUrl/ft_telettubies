from django.db import models

class Match(models.Model):
    game_mode = models.CharField(max_length=100, default='normal')
    tournament_name = models.CharField(max_length=100, blank=True, null=True)
    round = models.CharField(max_length=50, blank=True, null=True)  # Changed to CharField
    player1_username = models.CharField(max_length=100)
    player2_username = models.CharField(max_length=100)
    player1_score = models.PositiveIntegerField()
    player2_score = models.PositiveIntegerField()
    winner_username = models.CharField(max_length=100, blank=True, null=True)
    match_start_time = models.DateTimeField()
    match_finish_time = models.DateTimeField()

    def __str__(self):
        return f"Match {self.id}"


class Invite(models.Model):
    invited_user = models.CharField(max_length=100)
    invite_code = models.CharField(max_length=100)
    inviting = models.CharField(max_length=100)
    
    def __str__(self):
        return f"Invite {self.id}"