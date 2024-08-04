#!/bin/bash

# Wait for PostgreSQL to be available
while ! nc -z db 5432; do
  echo "Waiting for PostgreSQL to be available..."
  sleep 2
done

# Run migrations
python ../code/manage.py makemigrations
python ../code/manage.py migrate

# Check if superuser already exists, if not create one
python ../code/manage.py shell -c "
from django.contrib.auth import get_user_model; 
User = get_user_model(); 
if not User.objects.filter(username='$POSTGRES_USER').exists(): 
    User.objects.create_superuser(username='$POSTGRES_USER', email='$SUPERUSER_EMAIL', password='$POSTGRES_PASSWORD')
"

# Start the Django development server
python ../code/manage.py runserver 0.0.0.0:8000
