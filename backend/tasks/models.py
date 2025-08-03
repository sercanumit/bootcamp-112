from django.db import models
from django.utils import timezone

class DailyTask(models.Model):
    """Günlük görevler için model"""
    
    TASK_TYPES = [
        ('study', 'Çalışma'),
        ('practice', 'Pratik'),
        ('review', 'Tekrar'),
        ('exam', 'Sınav'),
        ('flashcard', 'Flashcard'),
        ('custom', 'Özel'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Düşük'),
        ('medium', 'Orta'),
        ('high', 'Yüksek'),
    ]
    
    # Firebase user ID
    user_uid = models.CharField(max_length=128)
    
    # Görev bilgileri
    title = models.CharField(max_length=200, verbose_name="Görev Başlığı")
    description = models.TextField(blank=True, verbose_name="Açıklama")
    task_type = models.CharField(max_length=20, choices=TASK_TYPES, default='study')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    
    # Süre bilgileri
    estimated_duration = models.IntegerField(help_text="Dakika cinsinden", verbose_name="Tahmini Süre")
    actual_duration = models.IntegerField(null=True, blank=True, help_text="Gerçekleşen süre (dakika)")
    
    # Durum
    is_completed = models.BooleanField(default=False, verbose_name="Tamamlandı")
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Tarih bilgileri
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    due_date = models.DateField(default=timezone.now, verbose_name="Bitiş Tarihi")
    
    # İlişkili veriler
    subject = models.CharField(max_length=100, blank=True, verbose_name="Ders")
    topic = models.CharField(max_length=100, blank=True, verbose_name="Konu")
    
    class Meta:
        verbose_name = "Günlük Görev"
        verbose_name_plural = "Günlük Görevler"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.user_uid}"
    
    def complete_task(self):
        """Görevi tamamla"""
        self.is_completed = True
        self.completed_at = timezone.now()
        self.save()
    
    def get_progress_percentage(self):
        """Görev ilerleme yüzdesi"""
        if self.actual_duration and self.estimated_duration:
            return min(100, (self.actual_duration / self.estimated_duration) * 100)
        return 0
