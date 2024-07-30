
class Tournament(models.Model):
    tournament_start_time = models.DateTimeField()
    rounds_played = models.IntegerField(default=0)
    winner = models.CharField(max_length=150, blank=True, null=True)  # Winner username

    def __str__(self):
        return f'Tournament {self.id} - {self.tournament_start_time}'

class Player(models.Model):
    username = models.CharField(max_length=150, unique=True)

    def __str__(self):
        return self.username

class Round(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='rounds')
    round_number = models.IntegerField()
    matches = models.JSONField(default=dict)  # { "match1": match_id, "match2": match_id }

    def __str__(self):
        return f'Tournament {self.tournament.id} - Round {self.round_number}'

class Match(models.Model):
    round = models.ForeignKey(Round, on_delete=models.CASCADE, related_name='matches')
    match_start_time = models.DateTimeField()
    player1 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player1_matches')
    player2 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player2_matches')
    player1_score = models.IntegerField()
    player2_score = models.IntegerField()
    winner = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='won_matches', blank=True, null=True)

    def __str__(self):
        return f'Round {self.round.round_number} - Match {self.id}'

class PongMatch(models.Model):
    MATCH_TYPE_CHOICES = [
        ('normal', 'Normal'),
        ('invite', 'Invite'),
        ('tournament', 'Tournament'),
    ]

    # Ortak değişkenler
    pkey = models.AutoField(primary_key=True)
    match_type = models.CharField(max_length=10, choices=MATCH_TYPE_CHOICES)
    match_start_time = models.DateTimeField()
    player1 = models.CharField(max_length=150)
    player2 = models.CharField(max_length=150)
    player1_score = models.IntegerField()
    player2_score = models.IntegerField()
    win_or_lose = models.BooleanField()  # True for win, False for lose

    # Invite game için ek değişkenler
    invite_code = models.CharField(max_length=50, blank=True, null=True)
    invite_message = models.TextField(blank=True, null=True)

    # Tournament game için ek değişkenler
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='matches', blank=True, null=True)
    round = models.ForeignKey(Round, on_delete=models.CASCADE, related_name='matches', blank=True, null=True)

    def __str__(self):
        return f'{self.pkey} - {self.match_type} - {self.player1} vs {self.player2}'




###second example  
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
    round = models.ForeignKey(Round, related_name='matches', on_delete=models.CASCADE)
    player1_username = models.CharField(max_length=100)
    player2_username = models.CharField(max_length=100)
    player1_score = models.PositiveIntegerField()
    player2_score = models.PositiveIntegerField()
    winner_username = models.CharField(max_length=100, blank=True, null=True)
    match_start_time = models.DateTimeField()
    match_finish_time = models.DateTimeField()

    def __str__(self):
        return f"Match {self.id} of Round {self.round.round_number} in Tournament {self.round.tournament.id}"
