from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from .models import FriendList, FriendRequest
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import  IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.models import User

# Arkadaş ekleme
# @require_http_methods(["POST"])
# def add_friend(request):
#     user = request.user
#     friend_id = request.data.get('friend_id')
#     try:
#         friend = User.objects.get(id=friend_id)
#     except User.DoesNotExist:
#         return JsonResponse({'error': 'Arkadaş bulunamadı.'}, status=404)

#     if user.id == friend.id:
#         return JsonResponse({'error': 'Kullanıcı kendini ekleyemez.'}, status=400)

#     friend_list, created = FriendList.objects.get_or_create(user=user)

#     if friend in friend_list.friends.all():
#         return JsonResponse({'error': 'Bu kullanıcı zaten arkadaş listesinde.'}, status=400)

#     if friend in friend_list.banned.all():
#         return JsonResponse({'error': 'Bu kullanıcı banlanmış.'}, status=400)

#     friend_list.friends.add(friend)
#     return JsonResponse({'success': 'Arkadaş başarıyla eklendi.'})


# def add_friend(request):
#     user = request.user
#     friend_username = request.data.get('friend_username')
#     try:
#         friend = User.objects.get(username=friend_username)
#     except User.DoesNotExist:
#         return JsonResponse({'error': 'Kullanıcı bulunamadı.'}, status=404)

#     if user.username == friend.username:
#         return JsonResponse({'error': 'Kullanıcı kendini ekleyemez.'}, status=400)

#     friend_list, created = FriendList.objects.get_or_create(user=user)

#     if friend in friend_list.friends.all():
#         return JsonResponse({'error': 'Bu kullanıcı zaten arkadaş listesinde.'}, status=400)

#     if friend in friend_list.banned.all():
#         return JsonResponse({'error': 'Bu kullanıcı banlanmış.'}, status=400)

#     friend_list.friends.add(friend)
#     return JsonResponse({'success': 'Arkadaş başarıyla eklendi.'})

# def accept_friend_request(request):
#     user = request.user
#     friend_username = request.data.get('friend_username')

#     try:
#         friend_request = FriendRequest.objects.get(from_user__username=friend_username, to_user=user)
#         friend_request.accept()  # Arkadaşlık isteğini kabul etmek için bir metod varsayıyorum
#         return JsonResponse({'success': 'Arkadaşlık isteği kabul edildi.'})
#     except FriendRequest.DoesNotExist:
#         return JsonResponse({'error': 'Arkadaşlık isteği bulunamadı.'}, status=404)
def send_friend_request(request):
    user = request.user
    friend_username = request.data.get('friend_username')
    try:
        friend = User.objects.get(username=friend_username)
        if friend == user:
            return JsonResponse({'error': 'Kullanıcı kendini ekleyemez.'}, status=400)
        FriendRequest.objects.create(from_user=user, to_user=friend)
        return JsonResponse({'success': 'Arkadaşlık isteği gönderildi.'})
    except User.DoesNotExist:
        return JsonResponse({'error': 'Kullanıcı bulunamadı.'}, status=404)

# Arkadaşlık isteği kabul etme
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
def remove_friend(request):
    user = request.user
    friend_id = request.POST.get('friend_id')

    friend_list = FriendList.objects.get(user=user)
    friend_list.friends.remove(friend_id)
    return JsonResponse({'success': 'Arkadaş başarıyla silindi.'})

# Arkadaş listesini listeleme
def list_friends(request):
    user = request.user
    try:
        friend_list = FriendList.objects.get(user=user)
        friends = friend_list.friends.all()
        friend_data = [{'id': friend.id, 'username': friend.username} for friend in friends]
        return JsonResponse({'friends': friend_data})
    except FriendList.DoesNotExist:
        return JsonResponse({'error': 'Arkadaş listesi bulunamadı.'}, status=404)

# Kullanıcıyı banlama
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
def unban_user(request):
    user = request.user
    target_user_id = request.POST.get('friend_id')

    friend_list = FriendList.objects.get(user=user)
    friend_list.banned.remove(target_user_id)
    return JsonResponse({'success': 'Kullanıcının banı başarıyla kaldırıldı.'})

# Kullanıcıyı sessize alma
def mute_user(request):
    user = request.user
    target_user_id = request.POST.get('friend_id')

    try:
        target_user = User.objects.get(id=target_user_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Kullanıcı bulunamadı.'}, status=404)

    friend_list = FriendList.objects.get(user=user)
    if target_user in friend_list.muted.all():
        return JsonResponse({'error': 'Kullanıcı zaten sessize alınmış.'}, status=400)

    friend_list.muted.add(target_user)
    return JsonResponse({'success': 'Kullanıcı başarıyla sessize alındı.'})

# Kullanıcının sessizliğini kaldırma
def unmute_user(request):
    user = request.user
    target_user_id = request.POST.get('friend_id')

    friend_list = FriendList.objects.get(user=user)
    friend_list.muted.remove(target_user_id)
    return JsonResponse({'success': 'Kullanıcının sessizliği başarıyla kaldırıldı.'})

# Belirli bir arkadaşı getirme
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
def get_banned(request):
    user = request.user
    friend_list = FriendList.objects.get(user=user)
    banned_users = friend_list.banned.all()
    banned_data = [{'id': user.id, 'username': user.username} for user in banned_users]
    return JsonResponse({'banned_users': banned_data})

# Tüm arkadaşları getirme
def get_friends(request):
    user = request.user
    friend_list = FriendList.objects.get(user=user)
    friends = friend_list.friends.all()
    friend_data = [{'id': friend.id, 'username': friend.username} for friend in friends]
    return JsonResponse({'friends': friend_data})


# # Arkadaşlık isteğini kabul etme
# def acceptFriendRequest(request):
#     user = request.user
#     friend_id = request.data.get('friend_id')

#     # Arkadaşlık isteği modelinizi ve mantığınızı bilmediğim için genel bir örnek veriyorum
#     try:
#         friend_request = FriendRequest.objects.get(from_user=friend_id, to_user=user.id)
#         friend_request.accept()  # Arkadaşlık isteğini kabul etmek için bir metod varsayıyorum
#         return JsonResponse({'success': 'Arkadaşlık isteği kabul edildi.'})
#     except FriendRequest.DoesNotExist:
#         return JsonResponse({'error': 'Arkadaşlık isteği bulunamadı.'}, status=404)

# Arkadaşlık isteğini reddetme
# def rejectFriendRequest(request):
#     user = request.user
#     friend_id = request.data.get('friend_id')

#     try:
#         friend_request = FriendRequest.objects.get(from_user=friend_id, to_user=user.id)
#         friend_request.reject()  # Arkadaşlık isteğini reddetmek için bir metod varsayıyorum
#         return JsonResponse({'success': 'Arkadaşlık isteği reddedildi.'})
#     except FriendRequest.DoesNotExist:
#         return JsonResponse({'error': 'Arkadaşlık isteği bulunamadı.'}, status=404)

# Arkadaşlık isteğini iptal etme
def cancel_friend_request(request):
    user = request.user
    friend_id = request.data.get('friend_id')

    try:
        friend_request = FriendRequest.objects.get(from_user=user.id, to_user=friend_id)
        friend_request.cancel()  # Arkadaşlık isteğini iptal etmek için bir metod varsayıyorum
        return JsonResponse({'success': 'Arkadaşlık isteği iptal edildi.'})
    except FriendRequest.DoesNotExist:
        return JsonResponse({'error': 'Arkadaşlık isteği bulunamadı.'}, status=404)


def list_pending_friend_requests(request):
    user = request.user
    pending_requests = FriendRequest.objects.filter(to_user=user, is_active=True)

    if not pending_requests.exists():
        return JsonResponse({'message': 'Bekleyen arkadaşlık isteği yok.'})

    pending_requests_list = [{'from_user': fr.from_user.username, 'to_user': fr.to_user.username} for fr in pending_requests]
    
    return JsonResponse({'pending_requests': pending_requests_list})



actions_list = {
    'add_friend': send_friend_request,
    'remove_friend': remove_friend,
    'list_friends': list_friends,
    'ban_user': ban_user,
    'unban_user': unban_user,
    'mute_user': mute_user,
    'unmute_user': unmute_user,
    'get_friend': get_friend,
    'get_banned': get_banned,
    'get_friends': get_friends,
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

    if action in actions_list:
       action_func = actions_list[action]
       return action_func(request)

    return JsonResponse({'success': 'İşlem başarılı.'})
