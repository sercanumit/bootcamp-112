from django.db import models
from django.contrib.auth import get_user_model
from exams.models import Topic

User = get_user_model()

class Flashcard(models.Model):
    """
    Hafıza kartları - Konulara bağlı bilgi kartları
    """
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='flashcards')
    title = models.CharField(max_length=200)
    question = models.TextField()  # Kartın ön yüzü
    answer = models.TextField()    # Kartın arka yüzü
    explanation = models.TextField(blank=True)  # Ek açıklama
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.topic} - {self.title}"
    
    class Meta:
        db_table = 'flashcards'
        verbose_name = 'Hafıza Kartı'
        verbose_name_plural = 'Hafıza Kartları'


class FlashcardDeck(models.Model):
    """
    Hafıza kartı destesi - Kullanıcıların kendi setleri
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='flashcard_decks')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    flashcards = models.ManyToManyField(Flashcard, through='FlashcardDeckItem')
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.name}"
    
    class Meta:
        db_table = 'flashcard_decks'
        verbose_name = 'Hafıza Kartı Destesi'
        verbose_name_plural = 'Hafıza Kartı Desteleri'


class FlashcardDeckItem(models.Model):
    """
    Deste-Kart ilişkisi
    """
    deck = models.ForeignKey(FlashcardDeck, on_delete=models.CASCADE)
    flashcard = models.ForeignKey(Flashcard, on_delete=models.CASCADE)
    order = models.IntegerField(default=0)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'flashcard_deck_items'
        unique_together = ['deck', 'flashcard']
        ordering = ['order']


class FlashcardProgress(models.Model):
    """
    Kullanıcının hafıza kartlarındaki ilerlemesi (Spaced Repetition için)
    """
    DIFFICULTY_LEVELS = [
        (1, 'Çok Kolay'),
        (2, 'Kolay'),
        (3, 'Orta'),
        (4, 'Zor'),
        (5, 'Çok Zor'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    flashcard = models.ForeignKey(Flashcard, on_delete=models.CASCADE)
    difficulty = models.IntegerField(choices=DIFFICULTY_LEVELS, default=3)
    repetition_count = models.IntegerField(default=0)
    interval_days = models.IntegerField(default=1)  # Bir sonraki tekrar için gün sayısı
    ease_factor = models.FloatField(default=2.5)    # Spaced repetition algoritması için
    next_review_date = models.DateTimeField()
    last_reviewed = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.flashcard.title}"
    
    class Meta:
        db_table = 'flashcard_progress'
        unique_together = ['user', 'flashcard']
        verbose_name = 'Hafıza Kartı İlerlemesi'
        verbose_name_plural = 'Hafıza Kartı İlerlemeleri'
