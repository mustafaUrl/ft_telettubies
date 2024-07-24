
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
