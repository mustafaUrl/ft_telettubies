# Generated by Django 4.2 on 2024-04-06 13:46

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('userlol', '0004_friendrequest_unique_friend_request'),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='friendrequest',
            name='unique_friend_request',
        ),
    ]
