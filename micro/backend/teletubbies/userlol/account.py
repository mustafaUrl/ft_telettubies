from django.contrib.auth.models import User
from django.http import JsonResponse
import json
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import  IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import UserProfile
from django.shortcuts import get_object_or_404
from game.models import Match, Invite
import random
import string
from rest_framework import status
from django.utils.translation import gettext as _
import logging

logger = logging.getLogger(__name__)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def update_user(request):
    # POST request'ini kontrol et
    if request.method == 'POST':
        # JSON verisini yükle
        data = json.loads(request.body)
        
        # Kullanıcıyı username ile bul
        try:
            user = User.objects.get(username=request.user.username)
        except User.DoesNotExist:
            return JsonResponse({'error': 'The user was not found'}, status=404)

        # Verilerde değişiklik varsa güncelle
        if 'first_name' in data and user.first_name != data['first_name']:
            user.first_name = data['first_name']
        if 'last_name' in data and user.last_name != data['last_name']:
            user.last_name = data['last_name']
        
        # Kullanıcıyı kaydet
        user.save()
        
        # Başarılı yanıt dön
        return JsonResponse({'success': 'User updated.'}, status=200)
    else:
        # Yanlış request tipi
        return JsonResponse({'error': 'Invalid request'}, status=400)

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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def get_match_history(request):
    user = request.user
    # Filter matches where the user is either player1 or player2
    matches = Match.objects.filter(
        player1_username=user.username
    ).union(
        Match.objects.filter(player2_username=user.username)
    ).values()

    return JsonResponse(list(matches), safe=False)

def generate_invite_code(length=6):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def invite_user(request):
    invited_user = request.data.get('username')
    inviting = request.user.username  # assuming you get the inviting user's username from the token
    invite_code = generate_invite_code()
    
    if not invited_user:
        return JsonResponse({'error': 'No invited user provided.'}, status=status.HTTP_400_BAD_REQUEST)
    
    invite = Invite.objects.create(
        invited_user=invited_user,
        invite_code=invite_code,
        inviting=inviting
    )
    invite.save()
    
    return JsonResponse({
        'message': f'Invitation sent to {invited_user} with code {invite_code}.',
        'invite_code': invite_code
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def invite_notifications(request):
    invited_user = request.user.username  # get the current user's username
    invites = Invite.objects.filter(invited_user=invited_user).values('invite_code', 'inviting')

    if not invites:
        return JsonResponse({'error': 'No invites found for the user.'}, status=status.HTTP_404_NOT_FOUND)

    return JsonResponse({
        'invites': list(invites)
    }, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def delete_invite(request):
    invite_code = request.data.get('invite_code')
    
    if not invite_code:
        return JsonResponse({'success': False, 'error': 'No invite code provided.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        invite = Invite.objects.get(invite_code=invite_code)
        invite.delete()
        return JsonResponse({'success': True, 'message': 'Invite deleted successfully.'}, status=status.HTTP_200_OK)
    except Invite.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Invite not found.'}, status=status.HTTP_404_NOT_FOUND)



@api_view(['POST'])  # Use POST instead of DELETE for validation
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def validate_invite_code(request):
    invite_code = request.data.get('invite_code')
    logger.info("Validating invite code: %s", invite_code)
    if not invite_code:
        return JsonResponse({'success': False, 'error': _('No invite code provided.')}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        invite = Invite.objects.get(invite_code=invite_code)
        logger.info("Invite found: %s", invite)
        # Check if the requesting user is the one who created the invite
        if invite.inviting != request.user.username:
            return JsonResponse({'success': False, 'error': _('You are not authorized to use this invite code.')}, status=status.HTTP_403_FORBIDDEN)
        logger.info("Invite code validated successfully.")
        return JsonResponse({'success': True, 'inviting_user': invite.invited_user}, status=status.HTTP_200_OK)
    
    except Invite.DoesNotExist:
        return JsonResponse({'success': False, 'error': _('Invite code not found.')}, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        # Log the exception details for debugging
        logger.exception("An unexpected error occurred. %s", str(e))
        return JsonResponse({'success': False, 'error': _('An unexpected error occurred.')}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
