# Generated by Django 4.2 on 2024-08-02 14:54

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('userlol', '0007_privatechatmessage'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='friendlist',
            name='muted',
        ),
        migrations.AddField(
            model_name='friendlist',
            name='block',
            field=models.ManyToManyField(blank=True, related_name='block_users', to=settings.AUTH_USER_MODEL),
        ),
    ]
