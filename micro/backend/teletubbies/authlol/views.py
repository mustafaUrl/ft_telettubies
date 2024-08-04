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
    refresh_token = request.data.get('refresh')
    token = RefreshToken(token=refresh_token)
    token.blacklist()

    logout(request)
    return Response({'success': 'The user exit.'}, status=200)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_2fa(request):
    token = request.data.get('token')
    user_username = request.data.get('user_username')
    user = User.objects.filter(username=user_username).first()
    device_qs = TOTPDevice.objects.filter(user=user, name=user.username, confirmed=True)
    if not device_qs.exists():
        return JsonResponse({'error': 'No unconfirmed TOTP device found.'}, status=400)
    
    device = device_qs.first()
    
    if totp(device.bin_key) == int(token):
        refresh = RefreshToken.for_user(user)
        return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'username': user.username,
            })
    else:
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
        if user_has_device(user):
            device = TOTPDevice.objects.filter(user=user, confirmed=True).first()
            if device:
                return Response({
                    'two_factor_required': True,
                    'user_username': user.username,
                })
            else:
                return Response({'error': 'Two-factor authentication device not confirmed.'}, status=400)
        else:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'username': user.username,
            })
    else:
        return Response({'error': 'Invalid credentials or inactive user.'}, status=400)



@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    first_name = request.data.get('first_name')  
    last_name = request.data.get('last_name')   

    if not all([username, password, email, first_name, last_name]):
        return Response({'error': 'All fields are required.'}, status=400)
    if username.startswith('FT-'):
        return Response({'error': 'Username cannot start with "FT-".'}, status=400)

    email_domain = email.split('@')[-1]
    if '42' in email_domain:
        return Response({'error': 'Usage of "42" in the email domain is not allowed.'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists.'}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists.'}, status=400)

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
        profile_picture='profile_pictures/pp.jpeg'  
    )
    user.save()
    return Response({'success': 'User created successfully.'})
