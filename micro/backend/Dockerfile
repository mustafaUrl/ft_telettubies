# Dockerfile
FROM python:3.8-slim

# Ortam değişkenlerini ayarla
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1
ENV PGPASSWORD mypassword
ENV POSTGRES_USER myuser

# Create working directory
RUN mkdir /code
WORKDIR /code

# Install dependencies
COPY requirements.txt /code/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Install postgresql-client
RUN apt-get update && apt-get install -y postgresql-client

COPY teletubbies/ /code/
COPY wait-for-postgres.sh /wait-for-postgres.sh
RUN chmod +x /wait-for-postgres.sh

CMD /wait-for-postgres.sh db python manage.py migrate && python manage.py runserver 0.0.0.0:8000