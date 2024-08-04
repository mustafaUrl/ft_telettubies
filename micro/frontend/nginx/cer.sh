#!/bin/bash

DOMAIN=telettubies
KEY="/etc/ssl/private/$DOMAIN.key"
CSR="/etc/ssl/certs/$DOMAIN.csr"
CRT="/etc/ssl/certs/$DOMAIN.crt"


openssl genrsa -out $KEY 2048

openssl req -new -key $KEY -out $CSR -subj "/C=US/ST=State/L=City/O=Organization/OU=Department/CN=$DOMAIN"

openssl x509 -req -days 365 -in $CSR -signkey $KEY -out $CRT

echo "Certificate creation completed. Key: $KEY, CSR: $CSR, CRT: $CRT"
