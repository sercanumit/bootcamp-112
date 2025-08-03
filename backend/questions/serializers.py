from rest_framework import serializers
from .models import Question


class QuestionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user_name', read_only=True)
    difficulty_display = serializers.CharField(source='get_difficulty_display', read_only=True)
    subject_display = serializers.CharField(source='get_subject_display', read_only=True)
    
    class Meta:
        model = Question
        fields = [
            'id', 'firebase_uid', 'subject', 'subject_display', 'topic', 'question_text',
            'options', 'correct_answer', 'explanation', 'difficulty', 'difficulty_display',
            'tags', 'is_active', 'created_at', 'updated_at', 'user_name'
        ]
        read_only_fields = ['id', 'firebase_uid', 'created_at', 'updated_at', 'user_name']
    
    def create(self, validated_data):
        # firebase_uid'yi request'ten al
        validated_data['firebase_uid'] = self.context['request'].user.firebase_uid
        return super().create(validated_data) 