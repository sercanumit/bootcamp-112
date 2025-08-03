from rest_framework import serializers
from .models import Flashcard, FlashcardDeck, FlashcardDeckItem, FlashcardProgress
from exams.serializers import TopicListSerializer


class FlashcardSerializer(serializers.ModelSerializer):
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    topic_full_path = serializers.CharField(source='topic.full_path', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Flashcard
        fields = [
            'id', 'title', 'question', 'answer', 'explanation',
            'topic', 'topic_name', 'topic_full_path', 
            'created_by', 'created_by_username', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']


class FlashcardStudySerializer(serializers.ModelSerializer):
    """
    Çalışma sırasında kullanılan serializer - cevap gizli
    """
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    
    class Meta:
        model = Flashcard
        fields = ['id', 'title', 'question', 'topic', 'topic_name', 'explanation']


class FlashcardDeckItemSerializer(serializers.ModelSerializer):
    flashcard = FlashcardSerializer(read_only=True)
    
    class Meta:
        model = FlashcardDeckItem
        fields = ['id', 'flashcard', 'order', 'added_at']


class FlashcardDeckSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    flashcard_count = serializers.SerializerMethodField()
    flashcard_items = FlashcardDeckItemSerializer(source='flashcarddeckitem_set', many=True, read_only=True)
    
    class Meta:
        model = FlashcardDeck
        fields = [
            'id', 'name', 'description', 'is_public', 
            'user', 'user_username', 'flashcard_count',
            'flashcard_items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def get_flashcard_count(self, obj):
        return obj.flashcards.count()


class FlashcardDeckListSerializer(serializers.ModelSerializer):
    """
    Liste görünümü için basit serializer
    """
    user_username = serializers.CharField(source='user.username', read_only=True)
    flashcard_count = serializers.SerializerMethodField()
    
    class Meta:
        model = FlashcardDeck
        fields = [
            'id', 'name', 'description', 'is_public',
            'user_username', 'flashcard_count', 'created_at'
        ]
    
    def get_flashcard_count(self, obj):
        return obj.flashcards.count()


class FlashcardProgressSerializer(serializers.ModelSerializer):
    flashcard_title = serializers.CharField(source='flashcard.title', read_only=True)
    flashcard_question = serializers.CharField(source='flashcard.question', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    difficulty_display = serializers.CharField(source='get_difficulty_display', read_only=True)
    
    class Meta:
        model = FlashcardProgress
        fields = [
            'id', 'flashcard', 'flashcard_title', 'flashcard_question',
            'user', 'user_username', 'difficulty', 'difficulty_display',
            'repetition_count', 'interval_days', 'ease_factor',
            'next_review_date', 'last_reviewed', 'created_at'
        ]
        read_only_fields = ['user', 'created_at', 'last_reviewed']


class FlashcardReviewSerializer(serializers.Serializer):
    """
    Flashcard review için kullanılan serializer
    """
    difficulty = serializers.IntegerField(min_value=1, max_value=5)
    
    def validate_difficulty(self, value):
        if value not in [1, 2, 3, 4, 5]:
            raise serializers.ValidationError("Zorluk seviyesi 1-5 arasında olmalıdır.")
        return value 