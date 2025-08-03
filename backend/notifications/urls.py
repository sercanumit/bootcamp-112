from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    # Bildirim listesi ve oluşturma
    path('', views.NotificationListView.as_view(), name='notification-list'),
    
    # Bildirim detay, güncelleme ve silme
    path('<int:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    
    # Bildirim işlemleri
    path('<int:notification_id>/mark-read/', views.mark_notification_read, name='mark-notification-read'),
    path('mark-all-read/', views.mark_all_notifications_read, name='mark-all-read'),
    path('<int:notification_id>/delete/', views.delete_notification, name='delete-notification'),
    path('delete-all/', views.delete_all_notifications, name='delete-all'),
    
    # İstatistikler
    path('stats/', views.notification_stats, name='notification-stats'),
    
    # Ayarlar
    path('settings/', views.NotificationSettingsView.as_view(), name='notification-settings'),
    
    # Sistem bildirimi oluşturma (admin)
    path('create-system/', views.create_system_notification, name='create-system-notification'),
] 