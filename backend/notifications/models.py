from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('daily_question', 'Günlük Soru'),
        ('task_reminder', 'Görev Hatırlatması'),
        ('goal_reminder', 'Hedef Hatırlatması'),
        ('achievement', 'Başarı'),
        ('system', 'Sistem'),
        ('study_reminder', 'Çalışma Hatırlatması'),
        ('exam_reminder', 'Sınav Hatırlatması'),
        ('quick_solution', 'Hızlı Çözüm'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Düşük'),
        ('medium', 'Orta'),
        ('high', 'Yüksek'),
        ('urgent', 'Acil'),
    ]
    
    firebase_uid = models.CharField(max_length=128)
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    data = models.JSONField(default=dict, blank=True)  # Ek veri için
    is_read = models.BooleanField(default=False)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['firebase_uid', 'is_read']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.firebase_uid}"
    
    @property
    def icon(self):
        """Bildirim türüne göre icon döndür"""
        icon_map = {
            'daily_question': 'help-circle',
            'task_reminder': 'checkmark-circle',
            'goal_reminder': 'target',
            'achievement': 'trophy',
            'system': 'information-circle',
            'study_reminder': 'book',
            'exam_reminder': 'calendar',
            'quick_solution': 'bulb',
        }
        return icon_map.get(self.notification_type, 'notifications')
    
    @property
    def priority_color(self):
        """Öncelik seviyesine göre renk döndür"""
        color_map = {
            'low': '#6c757d',
            'medium': '#007bff',
            'high': '#ffc107',
            'urgent': '#dc3545',
        }
        return color_map.get(self.priority, '#007bff')
    
    @property
    def time_ago(self):
        """Oluşturulma zamanından bu yana geçen süre"""
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - self.created_at
        
        if diff < timedelta(minutes=1):
            return "Az önce"
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f"{minutes} dakika önce"
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f"{hours} saat önce"
        elif diff < timedelta(days=7):
            days = diff.days
            return f"{days} gün önce"
        else:
            return self.created_at.strftime("%d.%m.%Y")


class NotificationSettings(models.Model):
    """
    Kullanıcı bildirim ayarları
    """
    firebase_uid = models.CharField(max_length=128, unique=True)
    push_enabled = models.BooleanField(default=True)
    email_enabled = models.BooleanField(default=False)
    daily_reminders = models.BooleanField(default=True)
    weekly_reports = models.BooleanField(default=True)
    achievement_notifications = models.BooleanField(default=True)
    study_reminders = models.BooleanField(default=True)
    exam_reminders = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Bildirim Ayarı'
        verbose_name_plural = 'Bildirim Ayarları'
    
    def __str__(self):
        return f"Bildirim Ayarları - {self.firebase_uid}"
