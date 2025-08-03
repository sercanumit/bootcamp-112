from rest_framework import serializers
from .models import ExamCategory, Subject, Topic, Question, ExamRecord

class ExamCategorySerializer(serializers.ModelSerializer):
    subjects_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ExamCategory
        fields = ['id', 'name', 'category_type', 'description', 'subjects_count', 'is_active']
    
    def get_subjects_count(self, obj):
        return obj.subjects.filter(is_active=True).count()

class SubjectSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    topics_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Subject
        fields = ['id', 'name', 'category', 'category_name', 'description', 'order', 'topics_count', 'is_active']
    
    def get_topics_count(self, obj):
        return obj.topics.filter(is_active=True).count()

class TopicTreeSerializer(serializers.ModelSerializer):
    """
    Recursive tree yapısı için serializer
    Frontend'de tree component'lerde kullanılır
    """
    children = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    questions_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Topic
        fields = [
            'id', 'name', 'subject', 'subject_name', 'level', 
            'full_path', 'order', 'questions_count', 'children'
        ]
    
    def get_children(self, obj):
        """Alt konuları recursive olarak serialize et"""
        children = obj.get_children()
        return TopicTreeSerializer(children, many=True, context=self.context).data
    
    def get_questions_count(self, obj):
        return obj.questions.filter(is_active=True).count()

class TopicSerializer(serializers.ModelSerializer):
    """
    Genel Topic serializer - diğer app'ler tarafından kullanılır
    """
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    parent_name = serializers.CharField(source='parent_topic.name', read_only=True)
    questions_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Topic
        fields = [
            'id', 'name', 'subject', 'subject_name', 'parent_topic', 
            'parent_name', 'level', 'full_path', 'questions_count', 'is_active'
        ]
    
    def get_questions_count(self, obj):
        return obj.questions.filter(is_active=True).count()

class TopicListSerializer(serializers.ModelSerializer):
    """
    Liste view için basit serializer (performance için)
    """
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    parent_name = serializers.CharField(source='parent_topic.name', read_only=True)
    questions_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Topic
        fields = [
            'id', 'name', 'subject', 'subject_name', 'parent_topic', 
            'parent_name', 'level', 'full_path', 'questions_count'
        ]
    
    def get_questions_count(self, obj):
        return obj.questions.filter(is_active=True).count()

class QuestionSerializer(serializers.ModelSerializer):
    topic_path = serializers.CharField(source='topic.full_path', read_only=True)
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    
    class Meta:
        model = Question
        fields = [
            'id', 'topic', 'topic_name', 'topic_path', 'question_text',
            'question_type', 'difficulty', 'choices', 'correct_answer', 
            'explanation', 'is_active', 'created_at'
        ]
        read_only_fields = ['created_at']

class QuestionDetailSerializer(serializers.ModelSerializer):
    """
    Sınav için detaylı soru serializer (cevapları gizli)
    """
    topic_path = serializers.CharField(source='topic.full_path', read_only=True)
    
    class Meta:
        model = Question
        fields = [
            'id', 'topic_path', 'question_text', 'question_type', 
            'difficulty', 'choices'
        ]
        # correct_answer ve explanation gizli (sınav modunda)


class ExamRecordSerializer(serializers.ModelSerializer):
    """
    Deneme kayıt serializer'ı
    """
    exam_subject_name = serializers.CharField(source='exam_subject.name', read_only=True)
    exam_type_display = serializers.CharField(source='get_exam_type_display', read_only=True)
    difficulty_display = serializers.CharField(source='get_difficulty_display', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    topics_list = serializers.SerializerMethodField()
    
    class Meta:
        model = ExamRecord
        fields = [
            'id', 'exam_name', 'exam_date', 'exam_type', 'exam_type_display',
            'exam_subject', 'exam_subject_name', 'exam_topics', 'topics_list',
            'normal_duration', 'student_duration', 'difficulty', 'difficulty_display',
            'total_questions', 'total_marked', 'total_correct', 'total_wrong', 'total_net',
            'user_email', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user_email', 'created_at', 'updated_at', 'total_net']
    
    def get_topics_list(self, obj):
        """Konuları liste olarak getir"""
        return [{'id': topic.id, 'name': topic.name} for topic in obj.exam_topics.all()]
    
    def create(self, validated_data):
        """Kullanıcıyı otomatik ata"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['user'] = request.user
        return super().create(validated_data)


class ExamRecordListSerializer(serializers.ModelSerializer):
    """
    Liste view için basit serializer (performance için)
    """
    exam_subject_name = serializers.CharField(source='exam_subject.name', read_only=True)
    exam_type_display = serializers.CharField(source='get_exam_type_display', read_only=True)
    difficulty_display = serializers.CharField(source='get_difficulty_display', read_only=True)
    
    class Meta:
        model = ExamRecord
        fields = [
            'id', 'exam_name', 'exam_date', 'exam_type', 'exam_type_display',
            'exam_subject_name', 'difficulty', 'difficulty_display',
            'total_questions', 'total_correct', 'total_wrong', 'total_net',
            'created_at'
        ] 