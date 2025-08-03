from rest_framework import serializers
from .models import (
    UserExamAttempt, UserQuestionAnswer, SubjectPerformance, 
    StudyPlan, CoachingRecommendation, UserProgress
)
from exams.serializers import ExamCategorySerializer, SubjectSerializer, QuestionSerializer
from users.serializers import UserSerializer


class UserQuestionAnswerSerializer(serializers.ModelSerializer):
    question_detail = QuestionSerializer(source='question', read_only=True)
    
    class Meta:
        model = UserQuestionAnswer
        fields = [
            'id', 'exam_attempt', 'question', 'question_detail',
            'user_answer', 'is_correct', 'time_spent_seconds', 'answered_at'
        ]
        read_only_fields = ['answered_at']


class UserExamAttemptSerializer(serializers.ModelSerializer):
    exam_category_detail = ExamCategorySerializer(source='exam_category', read_only=True)
    user_detail = UserSerializer(source='user', read_only=True)
    question_answers = UserQuestionAnswerSerializer(many=True, read_only=True)
    success_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = UserExamAttempt
        fields = [
            'id', 'user', 'user_detail', 'exam_category', 'exam_category_detail',
            'total_questions', 'correct_answers', 'wrong_answers', 'empty_answers',
            'score', 'duration_minutes', 'completed_at', 'question_answers', 'success_rate'
        ]
        read_only_fields = ['user', 'completed_at']
    
    def get_success_rate(self, obj):
        if obj.total_questions > 0:
            return round((obj.correct_answers / obj.total_questions) * 100, 2)
        return 0.0


class UserExamAttemptCreateSerializer(serializers.ModelSerializer):
    """
    Sınav denemesi oluşturma için serializer
    """
    class Meta:
        model = UserExamAttempt
        fields = [
            'exam_category', 'total_questions', 'correct_answers', 
            'wrong_answers', 'empty_answers', 'duration_minutes'
        ]
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['score'] = self.calculate_score(validated_data)
        return super().create(validated_data)
    
    def calculate_score(self, data):
        """Basit puan hesaplama"""
        total = data['total_questions']
        correct = data['correct_answers']
        wrong = data['wrong_answers']
        
        # 4 yanlış 1 doğruyu götürür mantığı
        net_correct = correct - (wrong / 4)
        if net_correct < 0:
            net_correct = 0
            
        return round((net_correct / total) * 100, 2)


class SubjectPerformanceSerializer(serializers.ModelSerializer):
    subject_detail = SubjectSerializer(source='subject', read_only=True)
    user_detail = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = SubjectPerformance
        fields = [
            'id', 'user', 'user_detail', 'subject', 'subject_detail',
            'total_questions_answered', 'correct_answers', 'success_rate',
            'average_time_per_question', 'weak_topics', 'strong_topics', 'last_updated'
        ]
        read_only_fields = ['user', 'last_updated']


class StudyPlanSerializer(serializers.ModelSerializer):
    subject_detail = SubjectSerializer(source='subject', read_only=True)
    user_detail = UserSerializer(source='user', read_only=True)
    days_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = StudyPlan
        fields = [
            'id', 'user', 'user_detail', 'title', 'description', 'subject', 'subject_detail',
            'priority', 'target_date', 'estimated_hours', 'is_completed', 'completed_date',
            'created_at', 'updated_at', 'days_remaining'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def get_days_remaining(self, obj):
        from datetime import date
        if obj.target_date:
            remaining = (obj.target_date - date.today()).days
            return max(0, remaining)
        return 0


class StudyPlanCreateSerializer(serializers.ModelSerializer):
    """
    Çalışma planı oluşturma için serializer
    """
    class Meta:
        model = StudyPlan
        fields = [
            'title', 'description', 'subject', 'priority', 
            'target_date', 'estimated_hours'
        ]
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class CoachingRecommendationSerializer(serializers.ModelSerializer):
    subject_detail = SubjectSerializer(source='subject', read_only=True)
    user_detail = UserSerializer(source='user', read_only=True)
    recommendation_type_display = serializers.CharField(source='get_recommendation_type_display', read_only=True)
    
    class Meta:
        model = CoachingRecommendation
        fields = [
            'id', 'user', 'user_detail', 'recommendation_type', 'recommendation_type_display',
            'title', 'description', 'subject', 'subject_detail', 'priority_score',
            'is_read', 'is_applied', 'valid_until', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']


class UserProgressSerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = UserProgress
        fields = [
            'id', 'user', 'user_detail', 'total_study_hours', 'total_questions_solved',
            'current_level', 'target_score', 'last_exam_score', 'streak_days',
            'last_study_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']


class AnalyticsSummarySerializer(serializers.Serializer):
    """
    Analytics özeti için serializer
    """
    total_exam_attempts = serializers.IntegerField()
    average_score = serializers.FloatField()
    best_subject = serializers.CharField()
    worst_subject = serializers.CharField()
    total_study_hours = serializers.FloatField()
    streak_days = serializers.IntegerField()
    recent_performance = serializers.ListField(child=serializers.DictField())
    weak_topics = serializers.ListField(child=serializers.CharField())
    strong_topics = serializers.ListField(child=serializers.CharField())


class ExamResultSerializer(serializers.Serializer):
    """
    Sınav sonucu gönderme için serializer
    """
    exam_category_id = serializers.IntegerField()
    total_questions = serializers.IntegerField()
    correct_answers = serializers.IntegerField()
    wrong_answers = serializers.IntegerField()
    empty_answers = serializers.IntegerField()
    duration_minutes = serializers.IntegerField()
    question_answers = serializers.ListField(child=serializers.DictField()) 