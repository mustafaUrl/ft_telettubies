from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import api_view, permission_classes, authentication_classes

@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def chatPage(request, *args, **kwargs):
    context = {
      'id': request.user.id,
      'username': request.user.username,
    }
    return render(request, "chat.html", context)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def mark_notification_as_read(request, notification_id):
    try:
        # Bildirimi ID'ye göre bul
        notification = Notification.objects.get(id=notification_id, recipient=request.user)
        
        # Bildirimi okundu olarak işaretle
        notification.is_read = True
        notification.save()
        
        # Başarılı yanıt döndür
        return JsonResponse({'status': 'success', 'message': 'Bildirim okundu olarak işaretlendi.'})
    except Notification.DoesNotExist:
        # Bildirim bulunamadıysa hata yanıtı döndür
        return JsonResponse({'status': 'error', 'message': 'Bildirim bulunamadı.'}, status=404)