from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken


# Create your views here.

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username_or_email = request.data.get('username_or_email')
    password = request.data.get('password')

    if not (username_or_email and password):
        return Response({'error': 'Username/Email and password are required.'}, status=400)

    # Eğer "@" işareti varsa, bu bir e-posta adresidir
    user = authenticate(username_or_email=username_or_email, password=password)

    if user:
        # Kullanıcı doğrulandıysa, tokenları oluştur ve yanıtı döndür
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    else:
        # Kullanıcı doğrulanamadıysa, hata mesajı döndür
        return Response({'error': 'Invalid Credentials'}, status=400)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    if not (username and password and email):
        return Response({'error': 'Missing fields'}, status=400)
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=400)
    if User.objects.filter(email=email).exists():
       return Response({'error': 'Email already exists'}, status=400)
    user = User.objects.create_user(username=username, email=email, password=password)
    user.save()
    return Response({'success': 'User created successfully'})