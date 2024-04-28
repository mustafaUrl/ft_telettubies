# Nginx resmi imajını kullanarak başlayın
FROM nginx:alpine

# Nginx konfigürasyon dosyasını kopyalayın
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# SSL sertifikalarını kopyalayın
COPY nginx/certs/www.teletubbies.com.crt /etc/ssl/certs/www.teletubbies.com.crt
COPY nginx/certs/www.teletubbies.com.key /etc/ssl/private/www.teletubbies.com.key

# Frontend statik dosyalarını kopyalayın
COPY dist/ /usr/share/nginx/html

# Nginx'i başlatın
CMD ["nginx", "-g", "daemon off;"]
