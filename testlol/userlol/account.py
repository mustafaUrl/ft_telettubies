from django.contrib.auth.models import User
from django.http import JsonResponse
import json
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import  IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import UserProfile
from django.shortcuts import get_object_or_404


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def update_user(request):
    print(request.user)
    # POST request'ini kontrol et
    if request.method == 'POST':
        # JSON verisini yükle
        data = json.loads(request.body)
        
        # Kullanıcıyı username ile bul
        try:
            user = User.objects.get(username=request.user.username)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Kullanıcı bulunamadı'}, status=404)

        # Verilerde değişiklik varsa güncelle
        if 'email' in data and user.email != data['email']:
            user.email = data['email']
        if 'first_name' in data and user.first_name != data['first_name']:
            user.first_name = data['first_name']
        if 'last_name' in data and user.last_name != data['last_name']:
            user.last_name = data['last_name']
        
        # Kullanıcıyı kaydet
        user.save()
        
        # Başarılı yanıt dön
        return JsonResponse({'success': 'Kullanıcı güncellendi'}, status=200)
    else:
        # Yanlış request tipi
        return JsonResponse({'error': 'Geçersiz istek'}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def get_info(request):
    # Kullanıcı bilgilerini döndür
    user = get_object_or_404(User, username=request.user.username)
    profile = get_object_or_404(UserProfile, user=user)

    return JsonResponse({
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'profile_picture': profile.profile_picture.url if profile.profile_picture else None,
    }, status=200)


from django.core.files.storage import FileSystemStorage

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def update_profile_pic(request):
    if request.method == 'POST' and request.FILES['profile_pic']:
        profile_pic = request.FILES['profile_pic']
        fs = FileSystemStorage()
        filename = fs.save('profile_pictures/' + profile_pic.name, profile_pic)  # Dosya adının önüne 'profile_pictures/' ekleyin
        uploaded_file_url = fs.url(filename)

        # Kullanıcı profilini güncelle
        user_profile = UserProfile.objects.get(user=request.user)
        user_profile.profile_picture = filename  # 'uploaded_file_url' yerine 'filename' kullanın
        user_profile.save()

        return JsonResponse({'new_profile_pic_url': uploaded_file_url}, status=200)
    else:
        return JsonResponse({'error': 'Invalid HTTP method'}, status=405)
