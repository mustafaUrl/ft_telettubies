# Generated by Django 4.2 on 2024-08-01 08:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0005_match_game_mode_match_tournament_name_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='match',
            name='round',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
