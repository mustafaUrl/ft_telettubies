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
