from rest_framework import status, generics, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count
from django.utils import timezone
from datetime import datetime, timedelta

from .models import Notification, NotificationSettings
from .serializers import (
    NotificationSerializer, NotificationSettingsSerializer,
    NotificationCreateSerializer, NotificationStatsSerializer
)
from yon_backend.authentication import FirebaseAuthentication


class NotificationListView(generics.ListCreateAPIView):
    """Bildirim listesi ve oluşturma"""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [FirebaseAuthentication]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'message']
    ordering_fields = ['created_at', 'priority', 'is_read']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        queryset = Notification.objects.filter(
            firebase_uid=user.firebase_uid
        ).order_by('-created_at')
        return queryset
    
    def create(self, request, *args, **kwargs):
        """Yeni bildirim oluştur"""
        serializer = NotificationCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Firebase UID'yi request'ten al
            serializer.validated_data['firebase_uid'] = request.user.firebase_uid
            notification = serializer.save()
            
            # Response için tam serializer kullan
            response_serializer = NotificationSerializer(notification)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Bildirim detay, güncelleme ve silme"""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [FirebaseAuthentication]
    
    def get_queryset(self):
        """Kullanıcının bildirimlerini getir"""
        return Notification.objects.filter(
            firebase_uid=self.request.user.firebase_uid
        )
    
    def update(self, request, *args, **kwargs):
        """Bildirimi güncelle (okundu işaretleme vb.)"""
        instance = self.get_object()
        
        # Okundu işaretleme
        if request.data.get('mark_as_read'):
            instance.mark_as_read()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        
        return super().update(request, *args, **kwargs)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """Bildirimi okundu olarak işaretle"""
    try:
        notification = Notification.objects.get(
            id=notification_id,
            firebase_uid=request.user.firebase_uid
        )
        notification.mark_as_read()
        serializer = NotificationSerializer(notification)
        return Response(serializer.data)
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Bildirim bulunamadı'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """Tüm bildirimleri okundu olarak işaretle"""
    user = request.user
    updated_count = Notification.objects.filter(
        firebase_uid=user.firebase_uid,
        is_read=False
    ).update(
        is_read=True,
        read_at=timezone.now()
    )
    
    return Response({
        'message': f'{updated_count} bildirim okundu olarak işaretlendi',
        'updated_count': updated_count
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notification(request, notification_id):
    """Bildirimi sil"""
    try:
        notification = Notification.objects.get(
            id=notification_id,
            firebase_uid=request.user.firebase_uid
        )
        notification.delete()
        return Response({'message': 'Bildirim silindi'})
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Bildirim bulunamadı'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_all_notifications(request):
    """Tüm bildirimleri sil"""
    user = request.user
    deleted_count = Notification.objects.filter(
        firebase_uid=user.firebase_uid
    ).delete()[0]
    
    return Response({
        'message': f'{deleted_count} bildirim silindi',
        'deleted_count': deleted_count
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_stats(request):
    """
    Bildirim istatistiklerini getir
    """
    try:
        firebase_uid = request.user.firebase_uid
        notifications = Notification.objects.filter(firebase_uid=firebase_uid)
        
        stats = {
            'total_count': notifications.count(),
            'unread_count': notifications.filter(is_read=False).count(),
            'read_count': notifications.filter(is_read=True).count(),
            'daily_question_count': notifications.filter(notification_type='daily_question').count(),
            'task_reminder_count': notifications.filter(notification_type='task_reminder').count(),
            'goal_reminder_count': notifications.filter(notification_type='goal_reminder').count(),
            'achievement_count': notifications.filter(notification_type='achievement').count(),
            'system_count': notifications.filter(notification_type='system').count(),
            'study_reminder_count': notifications.filter(notification_type='study_reminder').count(),
            'exam_reminder_count': notifications.filter(notification_type='exam_reminder').count(),
            'quick_solution_count': notifications.filter(notification_type='quick_solution').count(),
            'low_priority_count': notifications.filter(priority='low').count(),
            'medium_priority_count': notifications.filter(priority='medium').count(),
            'high_priority_count': notifications.filter(priority='high').count(),
            'urgent_priority_count': notifications.filter(priority='urgent').count(),
        }
        
        return Response({
            'success': True,
            'data': stats
        })
        
    except Exception as e:
        print(f"❌ Bildirim istatistikleri hatası: {e}")
        return Response({
            'success': False,
            'message': 'İstatistikler alınamadı'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class NotificationSettingsView(generics.RetrieveUpdateAPIView):
    """Bildirim ayarları"""
    serializer_class = NotificationSettingsSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [FirebaseAuthentication]
    
    def get_object(self):
        """Kullanıcının ayarlarını getir veya oluştur"""
        user = self.request.user
        settings, created = NotificationSettings.objects.get_or_create(
            firebase_uid=user.firebase_uid
        )
        return settings
    
    def update(self, request, *args, **kwargs):
        """Ayarları güncelle"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_system_notification(request):
    """Sistem bildirimi oluştur (admin için)"""
    # TODO: Admin yetkisi kontrolü ekle
    serializer = NotificationCreateSerializer(data=request.data)
    if serializer.is_valid():
        notification = serializer.save()
        response_serializer = NotificationSerializer(notification)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
