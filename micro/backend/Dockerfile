# Dockerfile
FROM python:3.8-slim

# Ortam değişkenlerini ayarla
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1
ENV POSTGRES_USER myuser
ENV POSTGRES_PASSWORD mypassword
ENV POSTGRES_DB mydatabase
# Django superuser environment variables
ENV DJANGO_SUPERUSER_USERNAME admin
ENV DJANGO_SUPERUSER_EMAIL admin@example.com
ENV DJANGO_SUPERUSER_PASSWORD admin

# Create working directory
RUN mkdir /code
WORKDIR /code

# Install dependencies
COPY requirements.txt /code/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Install PostgreSQL
RUN apt-get update && apt-get install -y postgresql

# Copy project files
COPY teletubbies/ /code/

# Initialize the database and create a superuser
RUN service postgresql start && \
    su - postgres -c "psql -c \"CREATE USER $POSTGRES_USER WITH PASSWORD '$POSTGRES_PASSWORD';\"" && \
    su - postgres -c "psql -c \"CREATE DATABASE $POSTGRES_DB OWNER $POSTGRES_USER;\"" && \
    su - postgres -c "psql -d $POSTGRES_DB -c \"CREATE EXTENSION IF NOT EXISTS hstore;\"" && \
    python manage.py makemigrations && \
    python manage.py migrate && \
    python manage.py createsuperuser --noinput && \
    service postgresql stop

# Start the server
CMD service postgresql start && python manage.py runserver 0.0.0.0:8000
