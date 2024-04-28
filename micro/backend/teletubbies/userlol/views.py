from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from .models import FriendList, FriendRequest, UserProfile
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import  IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.models import User
from channellol.models import OnlineUserStatus


@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def send_friend_request(request):
    user = request.user
    friend_username = request.data.get('friend_username')
    try:
        friend = User.objects.get(username=friend_username)
        if friend == user:
            return JsonResponse({'error': 'Kullanıcı kendini ekleyemez.'}, status=400)
        
        # Zaten aktif bir istek var mı kontrol edin
        if FriendList.objects.filter(user=user, friends=friend).exists():
            return JsonResponse({'error': 'Bu kullanıcı zaten arkadaş listesinde.'}, status=400)

        if FriendRequest.objects.filter(from_user=user, to_user=friend, is_active=True).exists():
            return JsonResponse({'error': 'Zaten aktif bir arkadaşlık isteği var.'}, status=400)
        elif FriendRequest.objects.filter(from_user=friend, to_user=user, is_active=True).exists():
            # Karşı kullanıcıdan gelen isteği kabul edin
            existing_request = FriendRequest.objects.get(from_user=friend, to_user=user, is_active=True)
            existing_request.accept()
            return JsonResponse({'success': 'Karşı kullanıcıdan gelen istek kabul edildi ve arkadaş olarak eklendi.'})
        else:
            # Yeni bir arkadaşlık isteği oluşturun
            FriendRequest.objects.create(from_user=user, to_user=friend)
            return JsonResponse({'success': 'Arkadaşlık isteği gönderildi.'})
    except User.DoesNotExist:
        return JsonResponse({'error': 'Kullanıcı bulunamadı.'}, status=404)

# Arkadaşlık isteği kabul etme
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def accept_friend_request(request):
    user = request.user
    friend_username = request.data.get('friend_username')
    try:
        friend_request = FriendRequest.objects.get(from_user__username=friend_username, to_user=user, is_active=True)
        friend_request.accept()
        return JsonResponse({'success': 'Arkadaşlık isteği kabul edildi.'})
    except FriendRequest.DoesNotExist:
        return JsonResponse({'error': 'Aktif arkadaşlık isteği bulunamadı.'}, status=404)

# Arkadaşlık isteği reddetme
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def reject_friend_request(request):
    user = request.user
    friend_username = request.data.get('friend_username')
    try:
        friend_request = FriendRequest.objects.get(from_user__username=friend_username, to_user=user, is_active=True)
        friend_request.reject()
        return JsonResponse({'success': 'Arkadaşlık isteği reddedildi.'})
    except FriendRequest.DoesNotExist:
        return JsonResponse({'error': 'Aktif arkadaşlık isteği bulunamadı.'}, status=404)

# Arkadaş silme

@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def remove_friend(request):
    user = request.user
    friend_username = request.data.get('friend_username')

    # Kendi arkadaş listesinden çıkar
    friend_list = FriendList.objects.get(user=user)
    friend = User.objects.get(username=friend_username)
    friend_list.friends.remove(friend)

    # Arkadaşın arkadaş listesinden çıkar
    friend_list_other = FriendList.objects.get(user=friend)
    friend_list_other.friends.remove(user)

    return JsonResponse({'success': 'Arkadaş her iki taraftan da başarıyla silindi.'})

# Arkadaş listesini listeleme

@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def list_friends(request):
    user = request.user
    friend_list, created = FriendList.objects.get_or_create(user=user)  # Nesne yoksa oluştur
    friends = friend_list.friends.all()  # friend_list artık doğru nesne
    friend_data = []
    
    for friend in friends:
        online_status = OnlineUserStatus.objects.filter(user=friend).first()
        profile = UserProfile.objects.get(user=friend)
        friend_data.append({
            'id': friend.id, #bunu silicez 
            'username': friend.username,
            'profile_picture': profile.profile_picture.url if profile.profile_picture else None,
            'online':  online_status.is_online if online_status else False,  # Bu metodu User modelinize eklemeniz gerekecek.
            'muted': friend in friend_list.muted.all()
        })
    return JsonResponse({'friends': friend_data})
# def list_friends(request):
#     user = request.user
#     try:
#         print("yyyyy")
#         friend_list = FriendList.objects.get_or_create(user=user)
#         print("xxxx")
#         friends = friend_list.friends.all()
#         print("zzzz")
#         friend_data = []
#         print("ssss")
#         for friend in friends:
#             profile = UserProfile.objects.get(user=friend)
#             friend_data.append({
#                 'id': friend.id,
#                 'username': friend.username,
#                 'profile_picture': profile.profile_picture.url if profile.profile_picture else None,
#                 'online': friend.is_online(),  # Bu metodu User modelinize eklemeniz gerekecek.
#                 'muted': friend in friend_list.muted.all()
#             })
#         return JsonResponse({'friends': friend_data})
#         print("aaaa")
#     except FriendList.DoesNotExist:
#         return JsonResponse({'error': 'Arkadaş listesi bulunamadı.'}, status=404)

# def list_friends(request):
#     user = request.user
#     try:
#         friend_list = FriendList.objects.get(user=user)
#         friends = friend_list.friends.all()
#         friend_data = [{'id': friend.id, 'username': friend.username} for friend in friends]
#         return JsonResponse({'friends': friend_data})
#     except FriendList.DoesNotExist:
#         return JsonResponse({'error': 'Arkadaş listesi bulunamadı.'}, status=404)

# Kullanıcıyı banlama
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def ban_user(request):
    user = request.user
    target_user_id = request.POST.get('friend_id')

    try:
        target_user = User.objects.get(id=target_user_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Kullanıcı bulunamadı.'}, status=404)

    friend_list = FriendList.objects.get(user=user)
    if target_user in friend_list.banned.all():
        return JsonResponse({'error': 'Kullanıcı zaten banlanmış.'}, status=400)

    friend_list.banned.add(target_user)
    return JsonResponse({'success': 'Kullanıcı başarıyla banlandı.'})

# Kullanıcıyı banlamayı kaldırma
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def unban_user(request):
    user = request.user
    target_user_id = request.POST.get('friend_id')

    friend_list = FriendList.objects.get(user=user)
    friend_list.banned.remove(target_user_id)
    return JsonResponse({'success': 'Kullanıcının banı başarıyla kaldırıldı.'})

# Kullanıcıyı sessize alma
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def mute(request):
    user = request.user
    friend_username = request.data.get('friend_username')
    print(friend_username)
    try:
        friend = User.objects.get(username=friend_username)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Kullanıcı bulunamadı.'}, status=404)

    friend_list = FriendList.objects.get(user=user)
    if friend in friend_list.muted.all():
        return JsonResponse({'error': 'Kullanıcı zaten sessize alınmış.'}, status=400)

    friend_list.muted.add(friend)
    return JsonResponse({'success': 'Kullanıcı başarıyla sessize alındı.'})



# Kullanıcının sessizliğini kaldırma
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def unmute(request):
    user = request.user
    friend_username = request.data.get('friend_username')

    try:
        friend = User.objects.get(username=friend_username)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Kullanıcı bulunamadı.'}, status=404)

    friend_list = FriendList.objects.get(user=user)
    if friend not in friend_list.muted.all():
        return JsonResponse({'error': 'Kullanıcı sessize alınmamış.'}, status=400)

    friend_list.muted.remove(friend)
    return JsonResponse({'success': 'Kullanıcının sessizliği başarıyla kaldırıldı.'})


# Belirli bir arkadaşı getirme
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def get_friend(request):
    user = request.user
    friend_id = request.data.get('friend_id')

    try:
        friend = User.objects.get(id=friend_id)
        # Arkadaşın bilgilerini döndür
        return JsonResponse({
            'id': friend.id,
            'username': friend.username,
            'email': friend.email  # Varsa diğer bilgileri de ekleyebilirsiniz
        })
    except User.DoesNotExist:
        return JsonResponse({'error': 'Arkadaş bulunamadı.'}, status=404)

# Banlanmış kullanıcıları getirme
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def get_banned(request):
    user = request.user
    friend_list = FriendList.objects.get(user=user)
    banned_users = friend_list.banned.all()
    banned_data = [{'id': user.id, 'username': user.username} for user in banned_users]
    return JsonResponse({'banned_users': banned_data})

# Arkadaşlık isteğini iptal etme
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def cancel_friend_request(request):
    user = request.user
    friend_id = request.data.get('friend_id')

    try:
        friend_request = FriendRequest.objects.get(from_user=user.id, to_user=friend_id)
        friend_request.cancel()  # Arkadaşlık isteğini iptal etmek için bir metod varsayıyorum
        return JsonResponse({'success': 'Arkadaşlık isteği iptal edildi.'})
    except FriendRequest.DoesNotExist:
        return JsonResponse({'error': 'Arkadaşlık isteği bulunamadı.'}, status=404)

@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def list_pending_friend_requests(request):
    user = request.user
    pending_requests = FriendRequest.objects.filter(to_user=user, is_active=True)

    if not pending_requests.exists():
        return JsonResponse({'pending_requests': 'nonerequests'})

    pending_requests_list = [{'from_user': fr.from_user.username, 'to_user': fr.to_user.username} for fr in pending_requests]
    
    return JsonResponse({'pending_requests': pending_requests_list})



actions_list = {
    'add_friend': send_friend_request,
    'remove friend': remove_friend,
    'list_friends': list_friends,
    'block': ban_user,
    'remove block': unban_user,
    'mute': mute,
    'unmute': unmute,
    'get_friend': get_friend,
    'get_banned': get_banned,
    'accept_friend_request': accept_friend_request,
    'reject_friend_request': reject_friend_request,
    'cancel_friend_request': cancel_friend_request,
    'list_pending_friend_requests': list_pending_friend_requests,
}

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def user_actions(request):
    # user_id = request.data.get('friendId')
    action = request.data.get('action')
    # friend_id = request.data.get('friend_id')
    # print(friend_username)
    print(action)
    if action in actions_list:
       action_func = actions_list[action]
       print(action)
       return action_func(request)

    return JsonResponse({'error': 'Invalid action.'}, status=400)