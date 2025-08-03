from django.db import models
from django.conf import settings

class QuickSolution(models.Model):
    """
    Hızlı çözüm sistemi için model
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quick_solutions')
    konu = models.CharField(max_length=100, verbose_name='Konu')
    ders = models.CharField(max_length=50, verbose_name='Ders')
    mesaj = models.TextField(verbose_name='Kullanıcı Mesajı')
    fotograf = models.ImageField(upload_to='quick_solutions/', verbose_name='Fotoğraf')
    
    # AI İşlem Sonuçları
    vision_text = models.TextField(blank=True, null=True, verbose_name='Vision AI Metni')
    gemini_response = models.TextField(blank=True, null=True, verbose_name='Gemini Cevabı')
    
    # Durum
    is_processed = models.BooleanField(default=False, verbose_name='İşlendi mi?')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Oluşturulma Tarihi')
    processed_at = models.DateTimeField(blank=True, null=True, verbose_name='İşlenme Tarihi')
    
    class Meta:
        verbose_name = 'Hızlı Çözüm'
        verbose_name_plural = 'Hızlı Çözümler'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.first_name} - {self.konu} ({self.ders})" 