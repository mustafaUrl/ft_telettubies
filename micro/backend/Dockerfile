# Dockerfile
FROM python:3.8-slim

# Ortam değişkenlerini ayarla
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

# Çalışma dizinini oluştur
RUN mkdir /code
WORKDIR /code

# Gereksinimleri yükle
COPY requirements.txt /code/
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY teletubbies/ /code/

RUN python manage.py makemigrations

RUN python manage.py migrate

# RUN python create_super_user.py

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]