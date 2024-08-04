FROM nginx:alpine

COPY nginx/nginx.conf /etc/nginx/nginx.conf

COPY nginx/certs/www.teletubbies.com.crt /etc/ssl/certs/www.teletubbies.com.crt
COPY nginx/certs/www.teletubbies.com.key /etc/ssl/private/www.teletubbies.com.key

COPY dist/ /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
