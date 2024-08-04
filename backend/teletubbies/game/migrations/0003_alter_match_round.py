# Generated by Django 4.2 on 2024-07-30 08:55

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0002_match_round_tournament_delete_game_round_tournament_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='match',
            name='round',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='match_list', to='game.round'),
        ),
    ]