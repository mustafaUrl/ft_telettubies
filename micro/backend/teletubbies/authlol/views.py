from django.contrib.auth import logout, authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.signals import user_logged_in
from userlol.models import UserProfile
from django.contrib.auth.models import User

from django.http import JsonResponse
from django_otp import user_has_device
from django_otp.plugins.otp_totp.models import TOTPDevice
from django_otp.oath import totp

@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    # Kullanıcının refresh token'ını al
    refresh_token = request.data.get('refresh')
    # Token'ı kontrol et
    token = RefreshToken(token=refresh_token)
    # Token'ı blacklist'e ekle
    token.blacklist()

    # Kullanıcıyı çıkış yap
    logout(request)
    return Response({'success': 'The user exit.'}, status=200)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_2fa(request):
    token = request.data.get('token')
    user_username = request.data.get('user_username')
    user = User.objects.filter(username=user_username).first()
    # Kullanıcının onaylanmış bir TOTP cihazı olup olmadığını kontrol edin
    device_qs = TOTPDevice.objects.filter(user=user, name=user.username, confirmed=True)
    if not device_qs.exists():
        return JsonResponse({'error': 'No unconfirmed TOTP device found.'}, status=400)
    
    # QuerySet'ten tek bir cihaz nesnesi alın
    device = device_qs.first()
    
    # Gelen token'ı doğrulayın
    if totp(device.bin_key) == int(token):
        # Token doğruysa, cihazı onaylayın
        refresh = RefreshToken.for_user(user)
        return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'username': user.username,
            })
    else:
        # Token yanlışsa, hata mesajı gönderin
        return JsonResponse({'error': 'Invalid token'}, status=400)

from django_otp.plugins.otp_totp.models import TOTPDevice

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username_or_email = request.data.get('username_or_email')
    password = request.data.get('password')

    if not username_or_email or not password:
        return Response({'error': 'Username/Email and password are required.'}, status=400)
    if username_or_email.startswith('FT-'):
        return Response({'error': 'Username cannot start with "FT-".'}, status=400)  
    user = authenticate(username_or_email=username_or_email, password=password)

    if user is not None and user.is_active:
        # Kullanıcı doğrulandıysa ve aktifse, 2FA kontrolü yap
        if user_has_device(user):
            # Kullanıcının onaylanmış bir TOTP cihazı varsa, 2FA kodu iste
            device = TOTPDevice.objects.filter(user=user, confirmed=True).first()
            if device:
                return Response({
                    'two_factor_required': True,
                    'user_username': user.username,
                })
            else:
                # Onaylanmış bir cihaz yoksa, hata döndür
                return Response({'error': 'Two-factor authentication device not confirmed.'}, status=400)
        else:
            # 2FA etkin değilse, JWT tokenları oluştur
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'username': user.username,
            })
    else:
        # Kullanıcı doğrulanamadıysa veya aktif değilse, hata mesajı döndür
        return Response({'error': 'Invalid credentials or inactive user.'}, status=400)
# def login_view(request):
#     username_or_email = request.data.get('username_or_email')
#     password = request.data.get('password')

#     if not username_or_email or not password:
#         return Response({'error': 'Username/Email and password are required.'}, status=400)
        
#     user = authenticate(username_or_email=username_or_email, password=password)

#     if user and user.is_active:
#         # Kullanıcı doğrulandıysa, tokenları oluştur ve yanıtı döndür
#         refresh = RefreshToken.for_user(user)
        
#         # Kullanıcının son giriş zamanını güncelle
#         user_logged_in.send(sender=user.__class__, request=request, user=user)
        
#         return Response({
#             'refresh': str(refresh),
#             'access': str(refresh.access_token),
#             'username': user.username,
#         })
#     else:
#         # Kullanıcı doğrulanamadıysa veya aktif değilse, hata mesajı döndür
#         return Response({'error': 'Invalid credentials or inactive user.'}, status=400)



@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    first_name = request.data.get('first_name')  # İlk isim için alan eklendi
    last_name = request.data.get('last_name')    # Soyisim için alan eklendi

    if not all([username, password, email, first_name, last_name]):
        return Response({'error': 'All fields are required.'}, status=400)
     # Check if username starts with '42-'
    if username.startswith('FT-'):
        return Response({'error': 'Username cannot start with "FT-".'}, status=400)

    # Check if '42' is in the domain part of the email
    email_domain = email.split('@')[-1]
    if '42' in email_domain:
        return Response({'error': 'Usage of "42" in the email domain is not allowed.'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists.'}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists.'}, status=400)

    # Kullanıcıyı oluştur, ilk ve soyisimleri ayarla ve aktif olarak işaretle
    user = User.objects.create_user(
        username=username, 
        email=email, 
        password=password, 
        first_name=first_name, 
        last_name=last_name,
        is_active=True
    )

    UserProfile.objects.create(
        user=user,
        profile_picture='profile_pictures/pp.jpeg'  # Varsayılan resmin yolu
    )
    user.save()
    return Response({'success': 'User created successfully.'})
