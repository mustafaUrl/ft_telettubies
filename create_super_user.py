from django.contrib.auth.models import User

# Süper kullanıcı bilgileri
username = 'admin'
password = 'sifreniz'
email = 'admin@example.com'

# Süper kullanıcıyı oluştur veya güncelle
User.objects.update_or_create(username=username, defaults={'email': email})
user = User.objects.get(username=username)
user.set_password(password)
user.is_superuser = True
user.is_staff = True
user.save()
