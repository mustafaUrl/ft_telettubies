from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.http import JsonResponse
import requests
import os




@api_view(['POST'])
@permission_classes([AllowAny])
def ft_auth(request):
    client_id = 'u-s4t2ud-16b6c7462b738938b4c6b763f4d804a957769bb2e68fc5e727f86a1e219347e5'
    client_secret = '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'

    if request.method == 'POST':
        code = request.data.get('code')
        # try:
            # 42 OAuth token endpoint'ine POST isteği yapın
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
        token_data = response.json()
        return JsonResponse(token_data)
            # Eğer yanıt başarılıysa, token verilerini döndürün
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
