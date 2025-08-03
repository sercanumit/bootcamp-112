from rest_framework import serializers
from .models import Notification, NotificationSettings


class NotificationSerializer(serializers.ModelSerializer):
    """Bildirim serializer'ı"""
    
    icon = serializers.ReadOnlyField()
    priority_color = serializers.ReadOnlyField()
    time_ago = serializers.ReadOnlyField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'firebase_uid', 'notification_type', 'title', 'message', 'data',
            'priority', 'is_read', 'created_at', 'read_at',
            'icon', 'priority_color', 'time_ago'
        ]
        read_only_fields = ['id', 'created_at', 'read_at', 'icon', 'priority_color', 'time_ago']
    
    def get_icon(self, obj):
        """Bildirim ikonunu döndür"""
        return obj.get_icon()
    
    def get_priority_color(self, obj):
        """Öncelik rengini döndür"""
        return obj.get_priority_color()
    
    def get_time_ago(self, obj):
        """Oluşturulma zamanını "x dakika önce" formatında döndür"""
        from django.utils import timezone
        from datetime import datetime
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.days > 0:
            return f"{diff.days} gün önce"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} saat önce"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes} dakika önce"
        else:
            return "Az önce"


class NotificationSettingsSerializer(serializers.ModelSerializer):
    """Bildirim ayarları serializer'ı"""
    
    class Meta:
        model = NotificationSettings
        fields = [
            'firebase_uid', 'daily_question_enabled', 'task_reminder_enabled',
            'goal_reminder_enabled', 'achievement_enabled', 'system_enabled',
            'study_reminder_enabled', 'exam_reminder_enabled',
            'push_notifications', 'email_notifications',
            'quiet_hours_start', 'quiet_hours_end'
        ]
    
    def create(self, validated_data):
        """Ayarları oluştur veya güncelle"""
        firebase_uid = validated_data.get('firebase_uid')
        settings, created = NotificationSettings.objects.get_or_create(
            firebase_uid=firebase_uid,
            defaults=validated_data
        )
        if not created:
            for attr, value in validated_data.items():
                setattr(settings, attr, value)
            settings.save()
        return settings


class NotificationCreateSerializer(serializers.ModelSerializer):
    """Bildirim oluşturma serializer'ı"""
    
    class Meta:
        model = Notification
        fields = [
            'firebase_uid', 'notification_type', 'title', 'message',
            'priority', 'extra_data', 'action_url', 'icon'
        ]
    
    def validate(self, data):
        """Bildirim türüne göre validasyon"""
        notification_type = data.get('notification_type')
        
        # Bildirim türüne göre zorunlu alanları kontrol et
        if notification_type == 'daily_question':
            if not data.get('extra_data', {}).get('question_id'):
                raise serializers.ValidationError(
                    "Günlük soru bildirimi için question_id gerekli"
                )
        elif notification_type == 'task_reminder':
            if not data.get('extra_data', {}).get('task_id'):
                raise serializers.ValidationError(
                    "Görev hatırlatması için task_id gerekli"
                )
        
        return data


class NotificationStatsSerializer(serializers.Serializer):
    """Bildirim istatistikleri serializer'ı"""
    
    total_notifications = serializers.IntegerField()
    unread_count = serializers.IntegerField()
    read_count = serializers.IntegerField()
    archived_count = serializers.IntegerField()
    
    # Tür bazında sayılar
    daily_question_count = serializers.IntegerField()
    task_reminder_count = serializers.IntegerField()
    goal_reminder_count = serializers.IntegerField()
    achievement_count = serializers.IntegerField()
    system_count = serializers.IntegerField()
    study_reminder_count = serializers.IntegerField()
    exam_reminder_count = serializers.IntegerField()
    
    # Öncelik bazında sayılar
    low_priority_count = serializers.IntegerField()
    medium_priority_count = serializers.IntegerField()
    high_priority_count = serializers.IntegerField()
    urgent_priority_count = serializers.IntegerField() 