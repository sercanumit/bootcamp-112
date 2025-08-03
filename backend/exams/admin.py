from django.contrib import admin
from .models import ExamCategory, Subject, Topic, Question, ExamRecord

@admin.register(ExamCategory)
class ExamCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'category_type', 'is_active', 'created_at')
    list_filter = ('category_type', 'is_active', 'created_at')
    search_fields = ('name',)
    ordering = ('category_type', 'name')

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'order', 'is_active', 'created_at')
    list_filter = ('category', 'is_active', 'created_at')
    search_fields = ('name', 'category__name')
    ordering = ('category', 'order', 'name')

@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('name_with_level', 'subject', 'level', 'parent_topic', 'order', 'is_active')
    list_filter = ('subject', 'level', 'is_active', 'created_at')
    search_fields = ('name', 'subject__name', 'full_path')
    ordering = ('subject', 'level', 'order', 'name')
    raw_id_fields = ('parent_topic',)
    readonly_fields = ('level', 'full_path')
    
    # Tree yapısını daha iyi göstermek için
    list_per_page = 100
    
    def name_with_level(self, obj):
        """Konuyu seviyesine göre indentli göster"""
        indent = "— " * obj.level
        return f"{indent}{obj.name}"
    name_with_level.short_description = 'Konu Adı'
    
    def get_queryset(self, request):
        """İlişkili objeleri optimize et"""
        return super().get_queryset(request).select_related('subject', 'parent_topic')

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('question_text_short', 'topic_path', 'question_type', 'difficulty', 'is_active', 'created_at')
    list_filter = ('question_type', 'difficulty', 'is_active', 'created_at', 'topic__subject')
    search_fields = ('question_text', 'topic__name', 'topic__full_path')
    ordering = ('-created_at',)
    raw_id_fields = ('topic', 'created_by')
    readonly_fields = ('created_at', 'updated_at')
    
    def question_text_short(self, obj):
        return obj.question_text[:50] + "..." if len(obj.question_text) > 50 else obj.question_text
    question_text_short.short_description = 'Soru Metni'
    
    def topic_path(self, obj):
        return obj.topic.full_path
    topic_path.short_description = 'Konu Yolu'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('topic__subject__category')


@admin.register(ExamRecord)
class ExamRecordAdmin(admin.ModelAdmin):
    list_display = ('exam_name', 'user_email', 'exam_type', 'exam_subject', 'exam_date', 'total_net', 'difficulty')
    list_filter = ('exam_type', 'exam_subject', 'difficulty', 'exam_date', 'created_at')
    search_fields = ('exam_name', 'user__email', 'exam_subject__name')
    ordering = ('-exam_date', '-created_at')
    readonly_fields = ('created_at', 'updated_at', 'total_net')
    raw_id_fields = ('user', 'exam_subject', 'exam_topics')
    date_hierarchy = 'exam_date'
    
    fieldsets = (
        ('Temel Bilgiler', {
            'fields': ('user', 'exam_name', 'exam_date', 'exam_type', 'exam_subject', 'exam_topics')
        }),
        ('Süre Bilgileri', {
            'fields': ('normal_duration', 'student_duration')
        }),
        ('İstatistikler', {
            'fields': ('difficulty', 'total_questions', 'total_marked', 'total_correct', 'total_wrong', 'total_net')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Kullanıcı'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'exam_subject')
