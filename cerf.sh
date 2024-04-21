#!/bin/bash

# Değişkenler
DOMAIN="www.teletubies.com"
KEY="$DOMAIN.key"
CSR="$DOMAIN.csr"
CRT="$DOMAIN.crt"

# Anahtar dosyası oluştur
openssl genrsa -out $KEY 2048

# CSR oluştur
openssl req -new -key $KEY -out $CSR

# Sertifika oluştur
openssl x509 -req -days 365 -in $CSR -signkey $KEY -out $CRT

echo "Certificate creation completed."

#chmod +x script_adi.sh

#./script_adi.sh