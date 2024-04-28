from django.urls import path, include
from . import views


urlpatterns = [
   path('mark-notification-as-read/<int:notification_id>/', views.mark_notification_as_read, name='mark_notification_as_read'),

]