from django.http import JsonResponse
from django.template.loader import render_to_string
from django.shortcuts import render
from django.template.exceptions import TemplateDoesNotExist
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication


template_list = ['home', 'sign-in', 'sign-up', 'profile', 'account', 'friends']
@api_view(['GET'])
@permission_classes([AllowAny])
def index(request):
    # Create a dictionary to store the HTML content of each page
    html_contents = {}

    # Loop through each template in the list
    for template in template_list:
        # Get the HTML content of the template
        try:
            html_contents[template] = render_to_string(f"{template}.html")
        except TemplateDoesNotExist:
            html_contents[template] = 'Template does not exist.'
            return JsonResponse({'error': 'Template does not exist.'}, status=404)

    # Render the index.html template with the HTML contents
    return render(request, 'index.html', {'pages': html_contents})



@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def user_profile(request):
    # Oturum açmış kullanıcının bilgilerini al
    user_data = {
        'id': request.user.id,
        'username': request.user.username,
        'email': request.user.email,
    }
    return JsonResponse(user_data)

@api_view(['GET'])
def test(request):
    return render(request, 'test.html')

