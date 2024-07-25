#!/bin/sh

# PostgreSQL veritabanı ve kullanıcı oluşturma işlemleri
if [ -z "$(psql -tAc "SELECT 1 FROM pg_database WHERE datname='$POSTGRES_DB'")" ]; then
    echo "Database does not exist. Creating now..."
    psql -U postgres <<EOF
    CREATE DATABASE $POSTGRES_DB;
EOF
else
    echo "Database already exists."
fi

if [ -z "$(psql -U postgres -d $POSTGRES_DB -tAc "SELECT 1 FROM pg_roles WHERE rolname='$POSTGRES_USER'")" ]; then
    echo "User does not exist. Creating now..."
    psql -U postgres <<EOF
    CREATE USER $POSTGRES_USER WITH ENCRYPTED PASSWORD '$POSTGRES_PASSWORD';
    GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;
EOF
else
    echo "User already exists."
fi

# PostgreSQL'i başlat
exec postgres
