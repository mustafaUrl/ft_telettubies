FROM nginx:alpine

# Install openssl and any other dependencies
RUN apk --no-cache add openssl

COPY nginx/nginx.conf /etc/nginx/nginx.conf

COPY dist/ /usr/share/nginx/html

# Copy the certificate generation script
COPY nginx/cer.sh /etc/nginx/cer.sh

# Ensure the script is executable and run it
RUN chmod +x /etc/nginx/cer.sh

RUN sh /etc/nginx/cer.sh
CMD ["nginx", "-g", "daemon off;"]
