from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Question(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Kolay'),
        ('medium', 'Orta'),
        ('hard', 'Zor'),
    ]
    
    SUBJECT_CHOICES = [
        ('tyt_turkce', 'TYT Türkçe'),
        ('tyt_matematik', 'TYT Matematik'),
        ('tyt_fen', 'TYT Fen Bilgisi'),
        ('tyt_sosyal', 'TYT Sosyal Bilgiler'),
        ('ayt_matematik', 'AYT Matematik'),
        ('ayt_fizik', 'AYT Fizik'),
        ('ayt_kimya', 'AYT Kimya'),
        ('ayt_biyoloji', 'AYT Biyoloji'),
        ('ayt_turkce', 'AYT Türkçe'),
        ('ayt_tarih', 'AYT Tarih'),
        ('ayt_cografya', 'AYT Coğrafya'),
        ('ayt_felsefe', 'AYT Felsefe'),
        ('geometri', 'Geometri'),
    ]
    
    firebase_uid = models.CharField(max_length=128)  # Hangi kullanıcının sorusu
    subject = models.CharField(max_length=50, choices=SUBJECT_CHOICES)
    topic = models.CharField(max_length=100)  # Konu başlığı
    question_text = models.TextField()
    options = models.JSONField(default=list)  # Şık listesi
    correct_answer = models.CharField(max_length=10)  # Doğru cevap (A, B, C, D)
    explanation = models.TextField(blank=True)  # Açıklama
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    tags = models.JSONField(default=list)  # Etiketler
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Soru'
        verbose_name_plural = 'Sorular'
    
    def __str__(self):
        return f"{self.subject} - {self.topic} - {self.question_text[:50]}"
    
    @property
    def user_name(self):
        """Kullanıcı adını getir"""
        try:
            user = User.objects.get(firebase_uid=self.firebase_uid)
            return user.name or user.email
        except User.DoesNotExist:
            return "Bilinmeyen Kullanıcı"
