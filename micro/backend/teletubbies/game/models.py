from django.db import models

class Match(models.Model):
    game_mode = models.CharField(max_length=100, default='normal')  # Set a default value here
    tournament_name = models.CharField(max_length=100, blank=True, null=True)
    round = models.PositiveIntegerField(blank=True, null=True)  # Correct the typo from rouund to round
    player1_username = models.CharField(max_length=100)
    player2_username = models.CharField(max_length=100)
    player1_score = models.PositiveIntegerField()
    player2_score = models.PositiveIntegerField()
    winner_username = models.CharField(max_length=100, blank=True, null=True)
    match_start_time = models.DateTimeField()
    match_finish_time = models.DateTimeField()

    def __str__(self):
        return f"Match {self.id}"
