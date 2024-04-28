# Generated by Django 4.2 on 2024-04-06 13:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('userlol', '0003_friendrequest'),
    ]

    operations = [
        migrations.AddConstraint(
            model_name='friendrequest',
            constraint=models.UniqueConstraint(fields=('from_user', 'to_user'), name='unique_friend_request'),
        ),
    ]
