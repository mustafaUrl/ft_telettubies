# urls.py
from django.contrib import admin
from django.urls import path, include

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('authlol.urls')),
   # path('', include('applol.urls')),
    path('',include('uimodule.urls')),
    path('chat/', include('channellol.urls')),
    path('user/', include('userlol.urls')),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



    
