from django.db import models
from django.contrib.auth import get_user_model
from exams.models import ExamCategory, Subject, Question, Topic
from datetime import timedelta

User = get_user_model()

class UserExamAttempt(models.Model):
    """
    Kullanıcının sınav denemeleri
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exam_attempts')
    exam_category = models.ForeignKey(ExamCategory, on_delete=models.CASCADE)
    total_questions = models.IntegerField()
    correct_answers = models.IntegerField(default=0)
    wrong_answers = models.IntegerField(default=0)
    empty_answers = models.IntegerField(default=0)
    score = models.FloatField(default=0.0)
    duration_minutes = models.IntegerField()  # Sınav süresi
    completed_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.exam_category.name} ({self.score})"
    
    class Meta:
        db_table = 'user_exam_attempts'
        verbose_name = 'Sınav Denemesi'
        verbose_name_plural = 'Sınav Denemeleri'
        ordering = ['-completed_at']


class UserQuestionAnswer(models.Model):
    """
    Kullanıcının sorulara verdiği cevaplar
    """
    exam_attempt = models.ForeignKey(UserExamAttempt, on_delete=models.CASCADE, related_name='question_answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    user_answer = models.CharField(max_length=10, blank=True)  # A, B, C, D vs.
    is_correct = models.BooleanField(default=False)
    time_spent_seconds = models.IntegerField(default=0)  # Soru başına harcanan süre
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.exam_attempt.user.username} - {self.question.topic.name}"
    
    class Meta:
        db_table = 'user_question_answers'
        verbose_name = 'Soru Cevabı'
        verbose_name_plural = 'Soru Cevapları'
        unique_together = ['exam_attempt', 'question']


class SubjectPerformance(models.Model):
    """
    Kullanıcının ders bazlı performans analizi
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subject_performances')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    total_questions_answered = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    success_rate = models.FloatField(default=0.0)  # Başarı oranı %
    average_time_per_question = models.FloatField(default=0.0)  # Soru başına ortalama süre
    weak_topics = models.JSONField(default=list)  # Zayıf olduğu konular
    strong_topics = models.JSONField(default=list)  # Güçlü olduğu konular
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.subject.name} (%{self.success_rate:.1f})"
    
    class Meta:
        db_table = 'subject_performances'
        unique_together = ['user', 'subject']
        verbose_name = 'Ders Performansı'
        verbose_name_plural = 'Ders Performansları'


class StudyPlan(models.Model):
    """
    Kişiselleştirilmiş çalışma planları
    """
    PRIORITY_CHOICES = [
        ('low', 'Düşük'),
        ('medium', 'Orta'),
        ('high', 'Yüksek'),
        ('urgent', 'Acil'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='study_plans')
    title = models.CharField(max_length=200)
    description = models.TextField()
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, null=True, blank=True)
    topics = models.ManyToManyField(Topic, blank=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    estimated_hours = models.FloatField(default=0.0)
    target_date = models.DateField()
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"
    
    class Meta:
        db_table = 'study_plans'
        verbose_name = 'Çalışma Planı'
        verbose_name_plural = 'Çalışma Planları'
        ordering = ['target_date', '-priority']


class CoachingRecommendation(models.Model):
    """
    AI tabanlı koçluk önerileri
    """
    RECOMMENDATION_TYPES = [
        ('study_plan', 'Çalışma Planı'),
        ('topic_focus', 'Konu Odaklı'),
        ('time_management', 'Zaman Yönetimi'),
        ('practice_more', 'Daha Fazla Pratik'),
        ('review_weak', 'Zayıf Konuları Gözden Geçir'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recommendations')
    recommendation_type = models.CharField(max_length=20, choices=RECOMMENDATION_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, null=True, blank=True)
    priority_score = models.IntegerField(default=50)  # 0-100 arası öncelik skoru
    is_read = models.BooleanField(default=False)
    is_applied = models.BooleanField(default=False)
    valid_until = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"
    
    class Meta:
        db_table = 'coaching_recommendations'
        verbose_name = 'Koçluk Önerisi'
        verbose_name_plural = 'Koçluk Önerileri'
        ordering = ['-priority_score', '-created_at']


class UserProgress(models.Model):
    """
    Kullanıcının genel ilerleme durumu
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress')
    total_study_hours = models.FloatField(default=0.0)
    streak_days = models.IntegerField(default=0)  # Ardışık çalışma günleri
    total_exam_attempts = models.IntegerField(default=0)
    average_score = models.FloatField(default=0.0)
    weak_subjects = models.JSONField(default=list)
    strong_subjects = models.JSONField(default=list)
    last_study_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - Progress"
    
    class Meta:
        db_table = 'user_progress'
        verbose_name = 'Kullanıcı İlerlemesi'
        verbose_name_plural = 'Kullanıcı İlerlemeleri'


class SpacedRepetition(models.Model):
    """
    Spaced Repetition sistemi - Tekrar algoritması
    """
    DIFFICULTY_LEVELS = [
        ('easy', 'Kolay'),
        ('medium', 'Orta'),
        ('hard', 'Zor'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='spaced_repetitions')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, null=True, blank=True)
    
    # Tekrar algoritması parametreleri
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_LEVELS, default='medium')
    interval_days = models.IntegerField(default=1)  # Sonraki tekrar günü
    ease_factor = models.FloatField(default=2.5)  # Kolaylık faktörü (1.3-2.5)
    repetition_count = models.IntegerField(default=0)  # Tekrar sayısı
    
    # Tekrar geçmişi
    last_reviewed = models.DateTimeField(null=True, blank=True)
    next_review = models.DateTimeField(null=True, blank=True)
    
    # Performans
    correct_count = models.IntegerField(default=0)
    wrong_count = models.IntegerField(default=0)
    success_rate = models.FloatField(default=0.0)
    
    # Durum
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.topic.name} (Repetition {self.repetition_count})"
    
    def calculate_next_review(self, quality: int):
        """
        Spaced repetition algoritması
        quality: 0-5 arası (0=çok zor, 5=çok kolay)
        """
        if quality < 3:  # Yanlış cevap
            self.repetition_count = 0
            self.interval_days = 1
        else:  # Doğru cevap
            if self.repetition_count == 0:
                self.interval_days = 1
            elif self.repetition_count == 1:
                self.interval_days = 6
            else:
                self.interval_days = int(self.interval_days * self.ease_factor)
            
            self.repetition_count += 1
        
        # Ease factor güncelle
        self.ease_factor = max(1.3, self.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
        
        # Sonraki tekrar tarihini hesapla
        from django.utils import timezone
        self.next_review = timezone.now() + timedelta(days=self.interval_days)
        
        # Performans güncelle
        if quality >= 3:
            self.correct_count += 1
        else:
            self.wrong_count += 1
        
        total_attempts = self.correct_count + self.wrong_count
        self.success_rate = (self.correct_count / total_attempts) * 100 if total_attempts > 0 else 0
        
        self.save()
    
    def is_due_for_review(self) -> bool:
        """Tekrar zamanı geldi mi?"""
        from django.utils import timezone
        return self.next_review and timezone.now() >= self.next_review
    
    class Meta:
        db_table = 'spaced_repetitions'
        verbose_name = 'Spaced Repetition'
        verbose_name_plural = 'Spaced Repetitions'
        unique_together = ['user', 'topic']
        ordering = ['next_review']


class StudySession(models.Model):
    """
    Çalışma oturumları takibi
    """
    SESSION_TYPES = [
        ('study', 'Çalışma'),
        ('practice', 'Pratik'),
        ('review', 'Tekrar'),
        ('exam', 'Sınav'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='study_sessions')
    session_type = models.CharField(max_length=20, choices=SESSION_TYPES)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, null=True, blank=True)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, null=True, blank=True)
    
    # Süre bilgileri
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.IntegerField(default=0)
    
    # Performans
    questions_answered = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    focus_score = models.FloatField(default=0.0)  # Odaklanma skoru (0-100)
    
    # Notlar
    notes = models.TextField(blank=True)
    is_completed = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.get_session_type_display()} ({self.duration_minutes}min)"
    
    def calculate_duration(self):
        """Süreyi hesapla"""
        if self.end_time and self.start_time:
            duration = self.end_time - self.start_time
            self.duration_minutes = int(duration.total_seconds() / 60)
    
    def calculate_success_rate(self):
        """Başarı oranını hesapla"""
        if self.questions_answered > 0:
            return (self.correct_answers / self.questions_answered) * 100
        return 0
    
    class Meta:
        db_table = 'study_sessions'
        verbose_name = 'Çalışma Oturumu'
        verbose_name_plural = 'Çalışma Oturumları'
        ordering = ['-start_time']
