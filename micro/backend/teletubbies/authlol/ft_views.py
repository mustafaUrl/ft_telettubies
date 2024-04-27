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

from django.conf import settings

@api_view(['POST'])
@permission_classes([AllowAny])
def ft_auth(request):
    client_id = 'u-s4t2ud-16b6c7462b738938b4c6b763f4d804a957769bb2e68fc5e727f86a1e219347e5'
    client_secret = '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'

    if request.method == 'POST':
        code = request.data.get('code')

    if not code:
        return JsonResponse({
            'code': 400,
            'message': 'Bad request'
        }, status=400)

    try:
        url = "https://api.intra.42.fr/oauth/token"
        payload = {
            'grant_type': 'authorization_code',
            'client_id': client_id,
            'client_secret': client_secret,
            'code': code,
            'redirect_uri': 'https://localhost'
        }
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        response = requests.post(url, headers=headers, data=payload)
        
        ft_access_token = response.json().get('access_token')
        if not ft_access_token:
            return JsonResponse({
                'code': 400,
                'message': 'Bad request'
            }, status=400)
    except Exception as e:
        return JsonResponse({
            'code': 400,
            'message': 'Bad request'
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
    print(imageUrl)
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

    #     UserProfile.objects.create(
    #     user=user,
    #     profile_picture='profile_pictures/pp.jpeg'  # Varsayılan resmin yolu
    
    
    # Resmin URL'si
    

    # Resmi URL'den çekme
        response = requests.get(imageUrl)
        
        if response.status_code == 200:
            # Resmi ContentFile olarak kaydetme
            image_content = ContentFile(response.content)
            
            # FileSystemStorage nesnesi oluşturma
            fs = FileSystemStorage()
            
            # Dosya adını belirleme (örneğin: 'profile_picture.jpg')
            picture_name = username +'.jpg'
            filename = fs.save('profile_pictures/' + picture_name , image_content)
            
            # Kaydedilen dosyanın URL'sini almak
            uploaded_file_url = fs.url(filename)

            # 'MEDIA_URL' değerini kaldır
            if uploaded_file_url.startswith(settings.MEDIA_URL):
                # 'MEDIA_URL' uzunluğu kadar baştan kes
                uploaded_file_url = uploaded_file_url[len(settings.MEDIA_URL):]
            
            # UserProfile modeline kaydedilen dosya yolunu ilişkilendirme
            print(f"Resim başarıyla kaydedildi: {uploaded_file_url}")
            UserProfile.objects.create(
            user=user,
            profile_picture= uploaded_file_url  # Varsayılan resmin yolu
            )
            print(f"Resim başarıyla kaydedild sssi: {uploaded_file_url}")
            
        else:
            UserProfile.objects.create(
            user=user,
            profile_picture='profile_pictures/pp.jpeg'  # Varsayılan resmin yolu
            )

        user.save()
        refresh = RefreshToken.for_user(user)

        return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'username': user.username,
            })
        
    # user = User.objects.create_user(
    #     username=f'42-{nick}', 
    #     email=user_info.get(''), 
    #     password=user_info.get('email'), 
    #     first_name=user_info.get('first_name'), 
    #     last_name=user_info.get('last_name'),
    #     is_active=True
    # )
    # image_url=user_info.get('image')
    # UserProfile.objects.create(
    #     user=user,
    #     profile_picture=image_url  # Varsayılan resmin yolu
    # )
    # user.save()
        # return JsonResponse(user_data, status=200)

    # if request.method == 'POST':
    #     code = request.data.get('code')

    #     if not code:
	# 	    return JsonResponse({
	# 		    'code': 400,
	# 			'message': 'Bad request'
	# 		}, status=400)
	# 	try:
    #         url = "https://api.intra.42.fr/oauth/token"
    #         payload = {
    #             'grant_type': 'authorization_code',
    #             'client_id': client_id,
    #             'client_secret': client_secret,
    #             'code': code,
    #             'redirect_uri': 'https://localhost'
    #         }
    #         headers = {
    #         'Content-Type': 'application/x-www-form-urlencoded'
    #         }
    #         response = requests.post(url, headers=headers, data=payload)
            
    #         ft_access_token = response.json().get('ft_access_token')
    #         if not ft_access_token:
	# 			return JsonResponse({
	# 				'code': 400,
	# 				'message': 'Bad request'
	# 			}, status=400)
    #     except Exception as e:
	# 		return JsonResponse({
	# 				'code': 400,
	# 				'message': 'Bad request'
	# 			}, status=400)
    #     user_info_response = requests.get('https://api.intra.42.fr/v2/me', headers={
    #     'Authorization': f'Bearer {ft_access_token}'
    #     })
    #     user_info = user_info_response.json()
    #     # user_info.get('email')
    #     # return JsonResponse({'email': user_info.get('email')}) 
    #     return JsonResponse(user_info, status='200')            # Eğer yanıt başarılıysa, token verilerini döndürün
    #         if response.ok:
    #             token_data = response.json()
    #             return JsonResponse(token_data)
    #         else:
    #             # Eğer yanıt başarılı değilse, hata mesajı döndürün
    #             return JsonResponse({'error': 'Token alınamadı'}, status=response.status_code)
    #     except Exception as e:
    #         # Eğer bir hata oluşursa, hata mesajı döndürün
    #         return JsonResponse({'error': str(e)}, status=500)
    # # POST dışındaki istekler için 405 Method Not Allowed döndürün
    # else:
    #     return JsonResponse({'error': 'POST method required'}, status=405)



# def ft_auth(request):

#     try:
#         # if request.method == 'POST':
#         #         code = request.POST.get('code')
#         #         response = requests.get('https://api.intra.42.fr/v2/me', headers={
#         #             'Authorization': f'Bearer {code}'
#         #         })

#         #             # Yanıtı JSON olarak alın
#         #         user_data = response.json()
#         #         return JsonResponse(user_data)
#         if request.method == 'POST':
#             code = request.POST.get('code')

#             # 42 OAuth token endpoint'ine POST isteği yapın
#             response = requests.post('https://api.intra.42.fr/oauth/token', data={
#                 'grant_type': 'authorization_code',
#                 'client_id':client_id,  # 42 uygulama client ID'nizi girin
#                 'client_secret': client_secret,  # 42 uygulama client secret'ınızı girin
#                 'code': code,
#                 'redirect_uri': 'https://localhost/'  # Yönlendirme URI'nizi girin
#             })
#             token_data = response.json()
#         # auth_code = request.data.get('code', None)
#         # if auth_code:
#         #     # OAuth 2.0 token endpoint URL'i
#         #     token_url = 'https://api.intra.42.fr/oauth/token'

#         #     # Client ID ve Secret'ınızı buraya girin
#         #     client_id = 'u-s4t2ud-16b6c7462b738938b4c6b763f4d804a957769bb2e68fc5e727f86a1e219347e5'
#         #     client_secret = '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'

#         #     # Token almak için POST isteği yapın
#         #     data = {
#         #         "access_token":auth_code,
#         #         "token_type":"bearer",
#         #         "expires_in":7200,
#         #         "scope":"public",
#         #         "created_at":1443451918
#         #     }
#         #     response = requests.post(token_url, data=data)
#         #     print(response.status_code)
#         #     if response.status_code == 200:
#         #         token_info = response.json()
#         #         access_token = token_info.get('access_token', None)
#         #         # Access token ile bir şeyler yapın
#         #         # Örneğin, kullanıcı bilgilerini almak için kullanabilirsiniz
#         #         if access_token:
#         #             # Kullanıcı oturum açmışsa, terminalde mesaj yazdırın
#         #             print('Kullanıcı başarıyla oturum açtı.')
#         #         return JsonResponse({'access_token': access_token})
#         #     else:
#         #         # Hata mesajını döndürün
#         #         return JsonResponse({'error': 'Token alınamadı'}, status=response.status_code)
#     except Exception as error:
#         return JsonResponse({'error': str(error)}, status=500)
        
        # return JsonResponse({'error': 'Token alınamadı'}, status=response.status_code)

    # get
# def login_42(request):
#     code = request.GET.get('code')
#     if not code:
#         return redirect_with_message('/#400', 'No code provided.')
#     access_token, token_type = get_access_token(code, request)
#     if not access_token or not token_type:
#         return redirect_with_message('/#400', 'Unable to retrieve access token.')
#     user_data = get_user_data(access_token, token_type)
#     if not user_data:
#         return redirect_with_message('/#400', 'Unable to retrieve user data.')
#     if CustomUser.objects.filter(token=access_token).exists():
#         user = CustomUser.objects.get(token=access_token)
#         return authenticate_user(request, user)
#     data = save_user_data(user_data, access_token)
#     request.session['data'] = data
#     return redirect('/#register-42')
