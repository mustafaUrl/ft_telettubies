# Generated by Django 4.2 on 2024-04-17 18:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('channellol', '0002_notification'),
    ]

    operations = [
        migrations.AddField(
            model_name='notification',
            name='message',
            field=models.TextField(blank=True, null=True),
        ),
    ]
