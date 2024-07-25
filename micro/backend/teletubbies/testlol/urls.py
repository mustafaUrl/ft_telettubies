# urls.py
from django.contrib import admin
from django.urls import path, include

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('api/admin/', admin.site.urls),
    path('api/auth/', include('authlol.urls')),
   # path('', include('applol.urls')),
    path('api/',include('uimodule.urls')),
    path('api/chat/', include('channellol.urls')),
    path('api/user/', include('userlol.urls')),
    path('api/2fa/', include('twofa.urls')),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



    
