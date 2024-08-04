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
            return JsonResponse({'error': 'The user cannot add himself.'}, status=400)
        
        if FriendList.objects.filter(user=user, friends=friend).exists():
            return JsonResponse({'error': 'This user is already on the friends list.'}, status=400)

        if FriendRequest.objects.filter(from_user=user, to_user=friend, is_active=True).exists():
            return JsonResponse({'error': 'There is already an active friend request.'}, status=400)
        elif FriendRequest.objects.filter(from_user=friend, to_user=user, is_active=True).exists():
            existing_request = FriendRequest.objects.get(from_user=friend, to_user=user, is_active=True)
            existing_request.accept()
            return JsonResponse({'success': 'The request from the other user was accepted and added as a friend.'})
        else:
            FriendRequest.objects.create(from_user=user, to_user=friend)
            return JsonResponse({'success': 'Friend request sent.'})
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found.'}, status=404)

@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def accept_friend_request(request):
    user = request.user
    friend_username = request.data.get('friend_username')
    try:
        friend_request = FriendRequest.objects.get(from_user__username=friend_username, to_user=user, is_active=True)
        friend_request.accept()
        return JsonResponse({'success': 'Friend request accepted.'})
    except FriendRequest.DoesNotExist:
        return JsonResponse({'error': 'No active friend requests found.'}, status=404)

@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def reject_friend_request(request):
    user = request.user
    friend_username = request.data.get('friend_username')
    try:
        friend_request = FriendRequest.objects.get(from_user__username=friend_username, to_user=user, is_active=True)
        friend_request.reject()
        return JsonResponse({'success': 'Friend request denied.'})
    except FriendRequest.DoesNotExist:
        return JsonResponse({'error': 'No active friend requests found.'}, status=404)



@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def remove_friend(request):
    user = request.user
    friend_username = request.data.get('friend_username')

    
    friend_list = FriendList.objects.get(user=user)
    friend = User.objects.get(username=friend_username)
    friend_list.friends.remove(friend)

    
    friend_list_other = FriendList.objects.get(user=friend)
    friend_list_other.friends.remove(user)

    return JsonResponse({'success': 'The friend was successfully deleted from both sides.'})



@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def list_friends(request):
    user = request.user
    friend_list, created = FriendList.objects.get_or_create(user=user)  
    friends = friend_list.friends.all()  
    friend_data = []
    
    for friend in friends:
        online_status = OnlineUserStatus.objects.filter(user=friend).first()
        profile = UserProfile.objects.get(user=friend)
        friend_data.append({
            'id': friend.id, 
            'username': friend.username,
            'profile_picture': profile.profile_picture.url if profile.profile_picture else None,
            'online':  online_status.is_online if online_status else False,  
            'block': friend in friend_list.block.all()
        })
    return JsonResponse({'friends': friend_data})



@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def block(request):
    user = request.user
    friend_username = request.data.get('friend_username')
    print(friend_username)
    try:
        friend = User.objects.get(username=friend_username)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found.'}, status=404)

    friend_list = FriendList.objects.get(user=user)
    if friend in friend_list.block.all():
        return JsonResponse({'error': 'The user is already block.'}, status=400)

    friend_list.block.add(friend)
    return JsonResponse({'success': 'User successfully block.'})



@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def remove_block(request):
    user = request.user
    friend_username = request.data.get('friend_username')

    try:
        friend = User.objects.get(username=friend_username)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found.'}, status=404)

    friend_list = FriendList.objects.get(user=user)
    if friend not in friend_list.block.all():
        return JsonResponse({'error': 'The user is not block.'}, status=400)

    friend_list.block.remove(friend)
    return JsonResponse({'success': 'The user remove block successfully.'})


@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def get_friend(request):
    user = request.user
    friend_id = request.data.get('friend_id')

    try:
        friend = User.objects.get(id=friend_id)
        return JsonResponse({
            'id': friend.id,
            'username': friend.username,
            'email': friend.email  
        })
    except User.DoesNotExist:
        return JsonResponse({'error': 'No friends found.'}, status=404)


@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def get_banned(request):
    user = request.user
    try:
        friend_list = FriendList.objects.get(user=user)
    except FriendList.DoesNotExist:
        return JsonResponse({'error': 'Friend list does not exist'}, status=404)

    blocked_users = friend_list.block.all()
    blocked_data = [{'username': blocked_user.username} for blocked_user in blocked_users]
    return JsonResponse({'blocked_users': blocked_data})

@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def cancel_friend_request(request):
    user = request.user
    friend_id = request.data.get('friend_id')

    try:
        friend_request = FriendRequest.objects.get(from_user=user.id, to_user=friend_id)
        friend_request.cancel()  
        return JsonResponse({'success': 'Friend request cancelled.'})
    except FriendRequest.DoesNotExist:
        return JsonResponse({'error': 'Friendship request not found.'}, status=404)

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
    'block': block,
    'remove_block': remove_block,
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
    
    action = request.data.get('action')
    
    print(action)
    if action in actions_list:
       action_func = actions_list[action]
       print(action)
       return action_func(request)

    return JsonResponse({'error': 'Invalid action.'}, status=400)