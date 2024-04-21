# Python resmi imajını kullanarak başlayın
FROM python:3.12-slim

RUN apt-get update && apt-get install -y \
    gcc \
    libc-dev \
    libffi-dev \
    python3-dev


COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Uygulama kaynak kodunu kopyalayın
COPY teletubbies/ /teletubbies/

# Çalışma dizinini ayarlayın
WORKDIR teletubbies/

# Gerekli Python kütüphanelerini yükleyin



# Uygulamayı çalıştırın
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
