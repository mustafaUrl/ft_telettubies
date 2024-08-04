from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.http import JsonResponse
import requests
import os
from rest_framework.response import Response
from django.contrib.auth import  authenticate
from django_otp import user_has_device
from django_otp.plugins.otp_totp.models import TOTPDevice
from django_otp.oath import totp
from userlol.models import UserProfile
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.files.storage import FileSystemStorage
User = get_user_model()
from rest_framework_simplejwt.tokens import RefreshToken
from dotenv import load_dotenv
import logging
load_dotenv()
from decouple import config

from django.conf import settings
logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([AllowAny])
def env(request):
    CLIENT_ID = config('CLIENT_ID')
    REDIRECT_URI = config('REDIRECT_URI')
    api_url = f"https://api.intra.42.fr/oauth/authorize?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&response_type=code"
    return JsonResponse({'api_url': api_url})

    
@api_view(['POST'])
@permission_classes([AllowAny])
def ft_auth(request):
    client_id = os.getenv('CLIENT_ID')
    client_secret = os.getenv('CLIENT_SECRET')
    redirect_uri = os.getenv('REDIRECT_URI')
    if request.method == 'POST':
        code = request.data.get('code')

    if not code:
        return JsonResponse({
            'code': 400,
            'message': 'Bad request 1'
        }, status=400)
    try:
        url = "https://api.intra.42.fr/oauth/token"
        payload = {
            'grant_type': 'authorization_code',
            'client_id': client_id,
            'client_secret': client_secret,
            'code': code,
            'redirect_uri': redirect_uri
        }
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        response = requests.post(url, headers=headers, data=payload)
        
        ft_access_token = response.json().get('access_token')
        if not ft_access_token:
            return JsonResponse({
                'code': 400,
                'message': 'Bad request 2'
            }, status=400)
    except Exception as e:
        return JsonResponse({
            'code': 400,
            'message': 'Bad request 3'
        }, status=400)
    user_info_response = requests.get('https://api.intra.42.fr/v2/me', headers={
        'Authorization': f'Bearer {ft_access_token}'
    })

    user_info = user_info_response.json()
    nick=user_info.get('login')
    username= f'FT-{nick}'
    password=str(user_info.get('id'))
    email = user_info.get('email')
    image = user_info.get('image')
    imageUrl = image["link"]
    if User.objects.filter(username=username).exists():
        user = authenticate(username_or_email=username, password=password)

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
        
        
        
        
        user = User.objects.create_user(
            username=username, 
            email= user_info.get('email'), 
            password=password, 
            first_name=user_info.get('first_name'), 
            last_name= user_info.get('last_name'),
            is_active=True
        )

   
    

        response = requests.get(imageUrl)
        
        if response.status_code == 200:
            image_content = ContentFile(response.content)
            
            fs = FileSystemStorage()
            
            picture_name = username +'.jpg'
            filename = fs.save('profile_pictures/' + picture_name , image_content)
            
            uploaded_file_url = fs.url(filename)

            if uploaded_file_url.startswith(settings.MEDIA_URL):
                uploaded_file_url = uploaded_file_url[len(settings.MEDIA_URL):]
            
            UserProfile.objects.create(
            user=user,
            profile_picture= uploaded_file_url
            )
            
        else:
            UserProfile.objects.create(
            user=user,
            profile_picture='profile_pictures/pp.jpeg'  
            )

        user.save()
        refresh = RefreshToken.for_user(user)

        return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'username': user.username,
            })
        