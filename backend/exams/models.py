from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class ExamCategory(models.Model):
    """
    Sınav kategorileri (TYT, AYT, Dil vs.)
    """
    CATEGORY_TYPES = [
        ('tyt', 'TYT'),
        ('ayt', 'AYT'), 
        ('dil', 'Dil'),
        ('msu', 'MSÜ'),
    ]
    
    name = models.CharField(max_length=100)
    category_type = models.CharField(max_length=10, choices=CATEGORY_TYPES)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} ({self.get_category_type_display()})"
    
    class Meta:
        db_table = 'exam_categories'
        verbose_name = 'Sınav Kategorisi'
        verbose_name_plural = 'Sınav Kategorileri'


class Subject(models.Model):
    """
    Ders konuları (Matematik, Türkçe, Fizik vs.)
    """
    category = models.ForeignKey(ExamCategory, on_delete=models.CASCADE, related_name='subjects')
    name = models.CharField(max_length=100)  # Matematik, Türkçe, Fizik...
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)  # Sıralama için
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.category.name} - {self.name}"
    
    class Meta:
        db_table = 'subjects'
        verbose_name = 'Ders'
        verbose_name_plural = 'Dersler'
        ordering = ['category', 'order', 'name']


class Topic(models.Model):
    """
    Konu hiyerarşisi (Ana Konu → Alt Konu → Alt-Alt Konu)
    Örnek: Fizik → Hareket ve Kuvvet → Newton'un Hareket Yasaları
    """
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='topics')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    parent_topic = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subtopics')
    
    # Hiyerarşi için yardımcı alanlar
    level = models.IntegerField(default=0)  # 0=Ana konu, 1=Alt konu, 2=Alt-alt konu
    order = models.IntegerField(default=0)
    full_path = models.CharField(max_length=500, blank=True)  # "Fizik > Hareket ve Kuvvet > Newton Yasaları"
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        # Otomatik level ve full_path hesaplama
        if self.parent_topic:
            self.level = self.parent_topic.level + 1
            self.full_path = f"{self.parent_topic.full_path} > {self.name}"
        else:
            self.level = 0
            self.full_path = f"{self.subject.name} > {self.name}"
        super().save(*args, **kwargs)
    
    def get_children(self):
        """Alt konuları getir"""
        return self.subtopics.filter(is_active=True).order_by('order', 'name')
    
    def get_all_descendants(self):
        """Tüm alt konuları recursive getir"""
        descendants = []
        for child in self.get_children():
            descendants.append(child)
            descendants.extend(child.get_all_descendants())
        return descendants
    
    def is_leaf(self):
        """Yaprak node mu? (alt konusu yok mu?)"""
        return not self.subtopics.exists()
    
    def get_root(self):
        """Kök konuyu getir"""
        if self.parent_topic:
            return self.parent_topic.get_root()
        return self
    
    def __str__(self):
        return self.full_path or f"{self.subject.name} > {self.name}"
    
    class Meta:
        db_table = 'topics'
        verbose_name = 'Konu'
        verbose_name_plural = 'Konular'
        ordering = ['subject', 'level', 'order', 'name']
        indexes = [
            models.Index(fields=['subject', 'parent_topic']),
            models.Index(fields=['level']),
        ]


class Question(models.Model):
    """
    Sorular - Generic yapı (TYT, AYT, Dil hepsi için)
    """
    QUESTION_TYPES = [
        ('multiple_choice', 'Çoktan Seçmeli'),
        ('true_false', 'Doğru-Yanlış'),
        ('fill_blank', 'Boşluk Doldurma'),
        ('essay', 'Açık Uçlu'),
    ]
    
    DIFFICULTY_LEVELS = [
        ('easy', 'Kolay'),
        ('medium', 'Orta'),
        ('hard', 'Zor'),
    ]
    
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='multiple_choice')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_LEVELS, default='medium')
    
    # Cevap seçenekleri (JSON field - Django 3.1+)
    choices = models.JSONField(default=list, blank=True)  # [{"A": "Seçenek A"}, {"B": "Seçenek B"}]
    correct_answer = models.CharField(max_length=10)  # "A", "B", "C", "D" vs.
    explanation = models.TextField(blank=True)
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.topic} - {self.question_text[:50]}..."
    
    class Meta:
        db_table = 'questions'
        verbose_name = 'Soru'
        verbose_name_plural = 'Sorular'


class ExamRecord(models.Model):
    """
    Deneme kayıt sistemi
    """
    EXAM_TYPES = [
        ('tyt', 'TYT'),
        ('ayt', 'AYT'),
        ('dil', 'Dil'),
        ('msu', 'MSÜ'),
    ]
    
    DIFFICULTY_LEVELS = [
        ('easy', 'Kolay'),
        ('medium', 'Orta'),
        ('hard', 'Zor'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exam_records')
    exam_name = models.CharField(max_length=200, verbose_name="Deneme Adı")  # "Deneme 3D"
    exam_date = models.DateField(verbose_name="Deneme Tarihi")
    exam_type = models.CharField(max_length=10, choices=EXAM_TYPES, verbose_name="Deneme Türü")
    exam_subject = models.ForeignKey(Subject, on_delete=models.CASCADE, verbose_name="Deneme Dersi", null=True, blank=True)
    exam_topics = models.ManyToManyField(Topic, blank=True, verbose_name="Deneme Konuları")
    
    # Süre bilgileri
    normal_duration = models.IntegerField(help_text="Normal süre (dakika)", verbose_name="Normal Süre", null=True, blank=True)
    student_duration = models.IntegerField(help_text="Öğrencinin bitirme süresi (dakika)", verbose_name="Öğrenci Süresi", null=True, blank=True)
    
    # İstatistikler
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_LEVELS, verbose_name="Zorluk", null=True, blank=True)
    total_questions = models.IntegerField(verbose_name="Soru Sayısı", null=True, blank=True)
    total_marked = models.IntegerField(verbose_name="Toplam İşaretleme", null=True, blank=True)
    total_correct = models.IntegerField(verbose_name="Toplam Doğru", null=True, blank=True)
    total_wrong = models.IntegerField(verbose_name="Toplam Yanlış", null=True, blank=True)
    total_net = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Toplam Net", null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.exam_name} - {self.exam_date} - {self.user.email}"
    
    def calculate_net_score(self):
        """Net skor hesapla"""
        if self.total_questions > 0:
            # 4 yanlış 1 doğruyu götürür formülü
            net = self.total_correct - (self.total_wrong / 4)
            return max(0, net)  # Negatif olmasın
        return 0
    
    def save(self, *args, **kwargs):
        # Net skoru otomatik hesapla
        if not self.total_net:
            self.total_net = self.calculate_net_score()
        super().save(*args, **kwargs)
    
    class Meta:
        db_table = 'exam_records'
        verbose_name = 'Deneme Kaydı'
        verbose_name_plural = 'Deneme Kayıtları'
        ordering = ['-exam_date', '-created_at']
        indexes = [
            models.Index(fields=['user', 'exam_date']),
            models.Index(fields=['exam_type', 'exam_subject']),
        ]
