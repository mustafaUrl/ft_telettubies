#!/bin/sh
# wait-for-postgres.sh

set -e

host="$1"
shift
cmd="$@"

export PGPASSWORD=$PGPASSWORD

until PGPASSWORD=$PGPASSWORD psql -h "$host" -U "$POSTGRES_USER" -d "mydatabase" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"
exec $cmd