#!/bin/bash

# Wait for PostgreSQL to be available
while ! nc -z db 5432; do
  echo "Waiting for PostgreSQL to be available..."
  sleep 2
done

# Run migrations and create superuser
python ../code/manage.py makemigrations
python ../code/manage.py migrate
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('$POSTGRES_USER', '$SUPERUSER_EMAIL', '$POSTGRES_PASSWORD')" | python ../code/manage.py shell

# Start the Django development server
python ../code/manage.py runserver 0.0.0.0:8000
