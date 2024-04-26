from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django_otp.plugins.otp_totp.models import TOTPDevice
from django_otp.oath import totp


User = get_user_model()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def enable_twofa(request):
    user = request.user
    # Kullanıcının zaten onaylanmış bir TOTP cihazı olup olmadığını kontrol edin
    if TOTPDevice.objects.filter(user=user, confirmed=True).exists():
        return JsonResponse({'error': 'Two-factor authentication is already enabled and confirmed'}, status=400)
    
    # Kullanıcı için bir TOTP cihazı oluşturun
    # Kullanıcının onaylanmamış tüm TOTP cihazlarını bul
    unconfirmed_devices = TOTPDevice.objects.filter(user=user, confirmed=False)
    # Bulunan tüm cihazları sil
    unconfirmed_devices.delete()

    device = TOTPDevice.objects.create(user=user, name=user.username, confirmed=False)
    if not device:
        return JsonResponse({'error': 'Failed to create TOTP device'}, status=500)
    
    # Kullanıcıya gösterilecek TOTP anahtarını ve QR kodunu oluşturun
    secret_key = device.bin_key
    otp_url = device.config_url
    
    # Kullanıcıya QR kodunu ve/veya anahtarı gönderin
    # QR kodu oluşturma ve gönderme işlemi burada gerçekleştirilir

    return JsonResponse({
        'message': 'Two-factor authentication is enabled. Scan the QR code with your authenticator app.',
        'otp_url': otp_url,
        'secret_key': secret_key.hex()
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def verify_twofa(request):
    user = request.user
    token = request.data.get('token')
    
    # Kullanıcının onaylanmış bir TOTP cihazı olup olmadığını kontrol edin
    device_qs = TOTPDevice.objects.filter(user=user, name=user.username, confirmed=False)
    if not device_qs.exists():
        return JsonResponse({'error': 'No unconfirmed TOTP device found.'}, status=400)
    
    # QuerySet'ten tek bir cihaz nesnesi alın
    device = device_qs.first()
    
    # Gelen token'ı doğrulayın
    if totp(device.bin_key) == int(token):
        # Token doğruysa, cihazı onaylayın
        device.confirmed = True
        device.save()
        return JsonResponse({'success': 'Two-factor authentication has been verified.'})
    else:
        # Token yanlışsa, hata mesajı gönderin
        return JsonResponse({'error': 'Invalid token'}, status=400)


# def enable_twofa(request):
#     user = request.user
#     # Kullanıcının 2FA durumunu kontrol edin
#     if hasattr(user, 'totpdevice'):
#         return JsonResponse({'error': 'Two-factor authentication is already enabled'}, status=400)
    
#     # Kullanıcı için bir TOTP cihazı oluşturun
#     device = TOTPDevice.objects.create(user=user, name='default', confirmed=False)
    
#     # Kullanıcıya gösterilecek TOTP anahtarını ve QR kodunu oluşturun
#     secret_key = device.bin_key
#     otp_url = device.config_url
    
#     # Kullanıcıya QR kodunu ve/veya anahtarı gönderin (örneğin, bir QR kodu görüntüsü oluşturup gönderebilirsiniz)
#     # Burada QR kodu oluşturma ve gönderme işlemini gerçekleştirecek bir örnek kod bulunmamaktadır.
#     # Bu işlem, genellikle bir frontend işlemidir ve QR kodu oluşturma kütüphaneleri kullanılarak yapılır.

#     return JsonResponse({
#         'message': 'Two-factor authentication is enabled. Scan the QR code with your authenticator app.',
#         'otp_url': otp_url,
#         'secret_key': secret_key.hex()  # Gizli anahtarı hexadecimal olarak gönderin
#     })

# def verify_twofa(request):
#     user = request.user
#     token = request.data.get('token')

#     # Kullanıcının mevcut tüm TOTP cihazlarını alın
#     devices = user.totpdevice_set.all()

#     # Kullanıcının mevcut tüm TOTP cihazlarını silin
#     devices.delete()

#     # Yeni bir TOTP cihazı oluşturun
#     device = user.totpdevice_set.create(name='default', confirmed=False)

#     # Gelen token'ı doğrulayın
#     if totp(device.bin_key) == int(token):
#         # Token doğruysa, cihazı onaylayın
#         device.confirmed = True
#         device.save()
#         return JsonResponse({'success': 'Two-factor authentication has been verified.'})
#     else:
#         # Token yanlışsa, hata mesajı gönderin
#         return JsonResponse({'error': 'Invalid token'}, status=400)
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# @authentication_classes([JWTAuthentication])
# def verify_twofa(request):
#     user = request.user
#     token = request.data.get('token')
#     device = user.totpdevice_set.first()  # Kullanıcının ilk TOTP cihazını alın
    
#     # Gelen token'ı doğrulayın
#     if device and totp(device.bin_key) == int(token):
#         # Token doğruysa, cihazı onaylayın
#         device.confirmed = True
#         device.save()
#         return JsonResponse({'success': 'Two-factor authentication has been verified.'})
#     else:
#         # Token yanlışsa, hata mesajı gönderin
#         return JsonResponse({'error': 'Invalid token'}, status=400)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def disable_twofa(request):
    user = request.user
    token = request.data.get('token')
    
    # Kullanıcının onaylanmış bir TOTP cihazı olup olmadığını kontrol edin
    device = TOTPDevice.objects.filter(user=user, confirmed=True).first()
    if not device:
        return JsonResponse({'error': 'Two-factor authentication is not enabled or already disabled.'}, status=400)
    
    # Gelen token'ı doğrulayın
    if totp(device.bin_key) == int(token):
        # Token doğruysa, cihazı silin ve 2FA'yı devre dışı bırakın
        device.delete()
        return JsonResponse({'success': 'Two-factor authentication has been disabled.'})
    else:
        # Token yanlışsa, hata mesajı gönderin
        return JsonResponse({'error': 'Invalid token'}, status=400)
