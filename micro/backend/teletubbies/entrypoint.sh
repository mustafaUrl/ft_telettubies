#!/bin/bash

# ...

# Süper kullanıcı şifresini ayarla
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); user, created = User.objects.get_or_create(username='admin', email='admin@admin.com'); user.set_password('sifre'); user.is_superuser=True; user.is_staff=True; user.save()"
exec "$@"


