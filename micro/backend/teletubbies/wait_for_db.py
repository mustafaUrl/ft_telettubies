# wait_for_db.py
import time
from django.db import connections
from django.db.utils import OperationalError

def wait_for_db():
    db_conn = None
    while not db_conn:
        try:
            db_conn = connections['default']
        except OperationalError:
            time.sleep(1)

if __name__ == '__main__':
    wait_for_db()
# #!/bin/bash

# # Veritabanı migrasyonlarını uygula
# python manage.py migrate --noinput

# # Süper kullanıcı oluştur
# python manage.py createsuperuser --noinput --username "admin" --email "admin@admin.com"

# # Diğer başlangıç komutlarını buraya ekleyin

# # Uygulamayı başlat
# exec "$@"

