from django.http import JsonResponse
from django.template.loader import render_to_string
from django.shortcuts import render
from django.template.exceptions import TemplateDoesNotExist
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication



def index(request):
    return render(request, 'index.html')

def get_html_content(request, content_id):
    # İstenen HTML dosyasını yükle
    template_name = f"{content_id}.html"
    
    # Şablon dosyasını al
    try:
        html_content = render_to_string(template_name)
        return JsonResponse({'html_content': html_content})
    except TemplateDoesNotExist:
        return JsonResponse({'error': 'İstenen içerik bulunamadı.'}, status=404)

# @api_view(['POST'])
# @permission_classes([AllowAny])
# def login(request):
#     username = request.data.get('username')
#     password = request.data.get('password')
#     user = authenticate(username=username, password=password)
#     if user:
#         refresh = RefreshToken.for_user(user)
#         return Response({
#             'refresh': str(refresh),
#             'access': str(refresh.access_token),
#         })
#     else:
#         return Response({'error': 'Invalid Credentials'}, status=400)




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





@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def user_profile(request):
    # Oturum açmış kullanıcının bilgilerini al
    user_data = {
        'id': request.user.id,
        'username': request.user.username,
        'email': request.user.email,
    }
    return JsonResponse(user_data)


#from django.views.decorators.csrf import csrf_exempt

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# @csrf_exempt
# def user_profile(request):
#     # Oturum açmış kullanıcının bilgilerini al
#     print('test')
#     render_to_string('user_profile.html')
#     user_data = {
#         'id': request.user.id,
#         'username': request.user.username,
#         'email': request.user.email,
#         'html_content': render_to_string,
#     }
#     print('User data:', user_data)
#     return Response(user_data)