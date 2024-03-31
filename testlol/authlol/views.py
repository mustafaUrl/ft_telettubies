# from django.contrib.auth.models import User
# from django.contrib.auth import authenticate
# from rest_framework.decorators import api_view, permission_classes, authentication_classes
# from rest_framework.permissions import AllowAny ,IsAuthenticated
# from rest_framework.response import Response
# from rest_framework_simplejwt.tokens import RefreshToken
# from rest_framework_simplejwt.authentication import JWTAuthentication


# # Create your views here.

# @api_view(['POST'])
# @permission_classes([AllowAny])
# def login(request):
#     username_or_email = request.data.get('username_or_email')
#     password = request.data.get('password')

#     if not (username_or_email and password):
#         return Response({'error': 'Username/Email and password are required.'}, status=400)

#     # Eğer "@" işareti varsa, bu bir e-posta adresidir
#     user = authenticate(username_or_email=username_or_email, password=password)

#     if user:
#         # Kullanıcı doğrulandıysa, tokenları oluştur ve yanıtı döndür
#         refresh = RefreshToken.for_user(user)
#         return Response({
#             'refresh': str(refresh),
#             'access': str(refresh.access_token),
#             'username': user.username,
#         })
#     else:
#         # Kullanıcı doğrulanamadıysa, hata mesajı döndür
#         return Response({'error': 'Invalid Credentials'}, status=400)


# @api_view(['POST'])
# @permission_classes([AllowAny])
# def register(request):
#     username = request.data.get('username')
#     password = request.data.get('password')
#     email = request.data.get('email')
#     if not (username and password and email):
#         return Response({'error': 'Missing fields'}, status=400)
#     if User.objects.filter(username=username).exists():
#         return Response({'error': 'Username already exists'}, status=400)
#     if User.objects.filter(email=email).exists():
#        return Response({'error': 'Email already exists'}, status=400)
#     user = User.objects.create_user(username=username, email=email, password=password)
#     user.save()
#     return Response({'success': 'User created successfully'})

from django.contrib.auth import logout, authenticate, get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.signals import user_logged_in
from django.db.models import Q

User = get_user_model()


from django.http import JsonResponse

from django.http import JsonResponse

# views.py




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
    return Response({'success': 'Çıkış yapıldı'}, status=200)




@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username_or_email = request.data.get('username_or_email')
    password = request.data.get('password')

    if not username_or_email or not password:
        return Response({'error': 'Username/Email and password are required.'}, status=400)
        
    user = authenticate(username_or_email=username_or_email, password=password)

    if user and user.is_active:
        # Kullanıcı doğrulandıysa, tokenları oluştur ve yanıtı döndür
        refresh = RefreshToken.for_user(user)
        
        # Kullanıcının son giriş zamanını güncelle
        user_logged_in.send(sender=user.__class__, request=request, user=user)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': user.username,
        })
    else:
        # Kullanıcı doğrulanamadıysa veya aktif değilse, hata mesajı döndür
        return Response({'error': 'Invalid credentials or inactive user.'}, status=400)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')

    if not all([username, password, email]):
        return Response({'error': 'All fields are required.'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists.'}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists.'}, status=400)

    # Kullanıcıyı oluştur ve aktif olarak işaretle
    user = User.objects.create_user(username=username, email=email, password=password, is_active=True)
    user.save()
    return Response({'success': 'User created successfully.'})

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# @authentication_classes([JWTAuthentication])
# def get_username(request):
#     return JsonResponse({'username': request.user.username})




