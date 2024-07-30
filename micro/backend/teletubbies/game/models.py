from django.db import models

class Tournament(models.Model):
    start_time = models.DateTimeField()
    round_count = models.PositiveIntegerField()
    winner = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Tournament {self.id}"

class Round(models.Model):
    tournament = models.ForeignKey(Tournament, related_name='rounds', on_delete=models.CASCADE)
    round_number = models.PositiveIntegerField()
    matches = models.JSONField(default=dict)  # { "match1": match_id, "match2": match_id }
    teams = models.JSONField(default=dict)  # { "team01": "a vs b", "team02": "c vs d", "waiting_players": "lol" }

    def __str__(self):
        return f"Round {self.round_number} of Tournament {self.tournament.id}"

class Match(models.Model):
    round = models.ForeignKey(Round, related_name='match_list', on_delete=models.CASCADE, null=True, blank=True)
    player1_username = models.CharField(max_length=100)
    player2_username = models.CharField(max_length=100)
    player1_score = models.PositiveIntegerField()
    player2_score = models.PositiveIntegerField()
    winner_username = models.CharField(max_length=100, blank=True, null=True)
    match_start_time = models.DateTimeField()
    match_finish_time = models.DateTimeField()

    def __str__(self):
        return f"Match {self.id} of Round {self.round.round_number} in Tournament {self.round.tournament.id}"
