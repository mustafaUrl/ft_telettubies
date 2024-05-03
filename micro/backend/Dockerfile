# Dockerfile
FROM python:3.8-slim

# Argümanları tanımla
ARG POSTGRES_USER
ARG POSTGRES_PASSWORD
ARG POSTGRES_DB
ARG SUPERUSER_EMAIL
# Ortam değişkenlerini ayarla
ENV POSTGRES_USER=$POSTGRES_USER
ENV POSTGRES_PASSWORD=$POSTGRES_PASSWORD
ENV POSTGRES_DB=$POSTGRES_DB
ENV SUPERUSER_EMAIL=$SUPERUSER_EMAIL


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
    su - postgres -c "psql -d $POSTGRES_DB -c 'CREATE EXTENSION IF NOT EXISTS hstore;'" && \
    python manage.py makemigrations && \
    python manage.py migrate && \
    python manage.py createsuperuser --username=$POSTGRES_USER --email=$SUPERUSER_EMAIL && \
    #

    service postgresql stop


# Start the server
CMD service postgresql start && python manage.py runserver 0.0.0.0:8000
