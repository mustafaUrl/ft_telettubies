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
    if TOTPDevice.objects.filter(user=user, confirmed=True).exists():
        return JsonResponse({'error': 'Two-factor authentication is already enabled and confirmed'}, status=400)
    
   
    unconfirmed_devices = TOTPDevice.objects.filter(user=user, confirmed=False)
    unconfirmed_devices.delete()

    device = TOTPDevice.objects.create(user=user, name=user.username, confirmed=False)
    if not device:
        return JsonResponse({'error': 'Failed to create TOTP device'}, status=500)
    
    secret_key = device.bin_key
    otp_url = device.config_url
    
    

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
    
    device_qs = TOTPDevice.objects.filter(user=user, name=user.username, confirmed=False)
    if not device_qs.exists():
        return JsonResponse({'error': 'No unconfirmed TOTP device found.'}, status=400)
    
    device = device_qs.first()
    
    if totp(device.bin_key) == int(token):
        device.confirmed = True
        device.save()
        return JsonResponse({'success': 'Two-factor authentication has been verified.'})
    else:
        return JsonResponse({'error': 'Invalid token'}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def disable_twofa(request):
    user = request.user
    token = request.data.get('token')
    
    device = TOTPDevice.objects.filter(user=user, confirmed=True).first()
    if not device:
        return JsonResponse({'error': 'Two-factor authentication is not enabled or already disabled.'}, status=400)
    
    if totp(device.bin_key) == int(token):
        device.delete()
        return JsonResponse({'success': 'Two-factor authentication has been disabled.'})
    else:
        return JsonResponse({'error': 'Invalid token'}, status=400)
