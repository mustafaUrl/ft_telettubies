from django.http import JsonResponse
from django.template.loader import render_to_string
from django.shortcuts import render
from django.template.exceptions import TemplateDoesNotExist
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication


template_list = ['home', 'sign-in', 'sign-up', 'profile', 'matchHistory' ,'account', 'friends',  'game', 'view_profile']
@api_view(['GET'])
@permission_classes([AllowAny])
def index(request):
    html_contents = {}

    for template in template_list:
        try:
            html_contents[template] = render_to_string(f"{template}.html")
        except TemplateDoesNotExist:
            html_contents[template] = 'Template does not exist.'
            return JsonResponse({'error': 'Template does not exist.'}, status=404)


    return JsonResponse(html_contents)


