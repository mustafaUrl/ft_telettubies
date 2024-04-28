#!/bin/bash
set -e

# # PostgreSQL servisini başlat
# service postgresql start

# # 'myprojectuser' adında bir PostgreSQL kullanıcısı oluştur
# su - postgres -c "psql -c \"CREATE USER myprojectuser WITH PASSWORD 'password';\""

# # 'myproject' adında bir veritabanı oluştur ve kullanıcıya izin ver
# su - postgres -c "psql -c \"CREATE DATABASE myproject OWNER myprojectuser;\""

cd teletubbies

# Django migrations
python manage.py makemigrations
python manage.py migrate

# Django sunucusunu başlat
python manage.py runserver 0.0.0.0:8000
