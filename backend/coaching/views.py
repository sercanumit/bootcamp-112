from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import datetime, timedelta, date
from django.db.models import Q, Avg, Count, Sum, F
from django.db import transaction
import json

from .models import (
    UserExamAttempt, UserQuestionAnswer, SubjectPerformance, 
    StudyPlan, CoachingRecommendation, UserProgress,
    SpacedRepetition, StudySession
)
from .serializers import (
    UserExamAttemptSerializer, UserExamAttemptCreateSerializer,
    UserQuestionAnswerSerializer, SubjectPerformanceSerializer,
    StudyPlanSerializer, StudyPlanCreateSerializer,
    CoachingRecommendationSerializer, UserProgressSerializer,
    AnalyticsSummarySerializer, ExamResultSerializer
)
from exams.models import ExamCategory, Subject, Question, Topic
from analytics.analysis_service import ComprehensiveAnalyzer


class UserExamAttemptViewSet(viewsets.ModelViewSet):
    """
    Sınav denemeleri CRUD işlemleri
    """
    queryset = UserExamAttempt.objects.all()
    serializer_class = UserExamAttemptSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserExamAttempt.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def submit_exam_result(self, request):
        """
        Sınav sonucunu gönder ve analiz et
        """
        serializer = ExamResultSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            with transaction.atomic():
                # Sınav denemesini oluştur
                exam_attempt = UserExamAttempt.objects.create(
                    user=request.user,
                    exam_category_id=data['exam_category_id'],
                    total_questions=data['total_questions'],
                    correct_answers=data['correct_answers'],
                    wrong_answers=data['wrong_answers'],
                    empty_answers=data['empty_answers'],
                    duration_minutes=data['duration_minutes']
                )
                
                # Soru cevaplarını kaydet
                for answer_data in data['question_answers']:
                    question = Question.objects.get(id=answer_data['question_id'])
                    UserQuestionAnswer.objects.create(
                        exam_attempt=exam_attempt,
                        question=question,
                        user_answer=answer_data.get('user_answer', ''),
                        is_correct=answer_data.get('is_correct', False),
                        time_spent_seconds=answer_data.get('time_spent_seconds', 0)
                    )
                
                # Performans analizini güncelle
                self.update_subject_performance(exam_attempt)
                
                # Koçluk önerilerini oluştur
                self.generate_recommendations(request.user)
                
                # User progress'i güncelle
                self.update_user_progress(request.user, exam_attempt)
            
            return Response({
                'message': 'Sınav sonucu başarıyla kaydedildi',
                'exam_attempt_id': exam_attempt.id,
                'score': exam_attempt.score
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def update_subject_performance(self, exam_attempt):
        """
        Ders bazlı performans analizini güncelle
        """
        # Soru cevaplarını analiz et
        question_answers = exam_attempt.question_answers.all()
        
        # Ders bazlı grupla
        subject_stats = {}
        for answer in question_answers:
            subject = answer.question.topic.subject
            if subject not in subject_stats:
                subject_stats[subject] = {
                    'total': 0, 'correct': 0, 'total_time': 0
                }
            
            subject_stats[subject]['total'] += 1
            if answer.is_correct:
                subject_stats[subject]['correct'] += 1
            subject_stats[subject]['total_time'] += answer.time_spent_seconds
        
        # Her ders için performans kaydet/güncelle
        for subject, stats in subject_stats.items():
            success_rate = (stats['correct'] / stats['total']) * 100 if stats['total'] > 0 else 0
            avg_time = stats['total_time'] / stats['total'] if stats['total'] > 0 else 0
            
            SubjectPerformance.objects.update_or_create(
                user=exam_attempt.user,
                subject=subject,
                defaults={
                    'total_questions_answered': F('total_questions_answered') + stats['total'],
                    'correct_answers': F('correct_answers') + stats['correct'],
                    'success_rate': success_rate,
                    'average_time_per_question': avg_time
                }
            )
    
    def generate_recommendations(self, user):
        """
        AI tabanlı koçluk önerileri oluştur
        """
        # Zayıf dersleri bul
        weak_subjects = SubjectPerformance.objects.filter(
            user=user,
            success_rate__lt=60
        ).order_by('success_rate')[:3]
        
        for subject_perf in weak_subjects:
            CoachingRecommendation.objects.create(
                user=user,
                recommendation_type='topic_focus',
                title=f'{subject_perf.subject.name} Odaklanın',
                description=f'{subject_perf.subject.name} dersinde başarı oranınız %{subject_perf.success_rate:.1f}. Bu derse daha fazla zaman ayırın.',
                subject=subject_perf.subject,
                priority_score=80,
                valid_until=timezone.now() + timedelta(days=7)
            )
    
    def update_user_progress(self, user, exam_attempt):
        """
        Kullanıcı ilerleme durumunu güncelle
        """
        progress, created = UserProgress.objects.get_or_create(user=user)
        
        # Toplam deneme sayısını güncelle
        progress.total_exam_attempts = UserExamAttempt.objects.filter(user=user).count()
        
        # Ortalama skoru güncelle
        avg_score = UserExamAttempt.objects.filter(user=user).aggregate(Avg('score'))['score__avg'] or 0
        progress.average_score = avg_score
        
        # Zayıf/güçlü dersleri güncelle
        weak_subjects = SubjectPerformance.objects.filter(
            user=user,
            success_rate__lt=60
        ).values_list('subject__name', flat=True)
        
        strong_subjects = SubjectPerformance.objects.filter(
            user=user,
            success_rate__gte=80
        ).values_list('subject__name', flat=True)
        
        progress.weak_subjects = list(weak_subjects)
        progress.strong_subjects = list(strong_subjects)
        
        progress.save()


class SubjectPerformanceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Ders performans analizi
    """
    queryset = SubjectPerformance.objects.all()
    serializer_class = SubjectPerformanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return SubjectPerformance.objects.filter(user=self.request.user)


class StudyPlanViewSet(viewsets.ModelViewSet):
    """
    Çalışma planları
    """
    queryset = StudyPlan.objects.all()
    serializer_class = StudyPlanSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return StudyPlan.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return StudyPlanCreateSerializer
        return StudyPlanSerializer


class CoachingRecommendationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Koçluk önerileri
    """
    queryset = CoachingRecommendation.objects.all()
    serializer_class = CoachingRecommendationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return CoachingRecommendation.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_applied(self, request, pk=None):
        """Öneriyi uygulandı olarak işaretle"""
        recommendation = self.get_object()
        recommendation.is_applied = True
        recommendation.save()
        
        return Response({'message': 'Öneri uygulandı olarak işaretlendi'})


class UserProgressViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Kullanıcı ilerleme durumu
    """
    queryset = UserProgress.objects.all()
    serializer_class = UserProgressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserProgress.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def analytics_summary(self, request):
        """
        Analytics özeti
        """
        user = request.user
        
        # Kapsamlı analiz servisi kullan
        analyzer = ComprehensiveAnalyzer(user)
        analysis = analyzer.get_comprehensive_analysis()
        
        return Response(analysis)
    
    @action(detail=False, methods=['get'])
    def exam_analysis(self, request):
        """
        Deneme analizi
        """
        user = request.user
        analyzer = ComprehensiveAnalyzer(user)
        exam_analysis = analyzer.analyze_exam_performance()
        
        return Response(exam_analysis)
    
    @action(detail=False, methods=['get'])
    def task_analysis(self, request):
        """
        Görev analizi
        """
        user = request.user
        analyzer = ComprehensiveAnalyzer(user)
        task_analysis = analyzer.analyze_task_completion()
        
        return Response(task_analysis)
    
    @action(detail=False, methods=['get'])
    def study_analysis(self, request):
        """
        Çalışma analizi
        """
        user = request.user
        analyzer = ComprehensiveAnalyzer(user)
        study_analysis = analyzer.analyze_study_patterns()
        
        return Response(study_analysis)
    
    @action(detail=False, methods=['get'])
    def topic_analysis(self, request):
        """
        Konu analizi
        """
        user = request.user
        analyzer = ComprehensiveAnalyzer(user)
        topic_analysis = analyzer.analyze_topic_performance()
        
        return Response(topic_analysis)
    
    @action(detail=False, methods=['get'])
    def recommendations(self, request):
        """
        Kişiselleştirilmiş öneriler
        """
        user = request.user
        analyzer = ComprehensiveAnalyzer(user)
        recommendations = analyzer.generate_recommendations()
        
        return Response(recommendations)


class SpacedRepetitionViewSet(viewsets.ModelViewSet):
    """
    Spaced Repetition sistemi
    """
    queryset = SpacedRepetition.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return SpacedRepetition.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def due_reviews(self, request):
        """Tekrar zamanı gelen konular"""
        user = request.user
        due_reviews = SpacedRepetition.objects.filter(
            user=user,
            is_active=True
        ).filter(
            Q(next_review__lte=timezone.now()) | Q(next_review__isnull=True)
        )
        
        return Response({
            'due_reviews': list(due_reviews.values('topic__name', 'topic__subject__name', 'difficulty'))
        })
    
    @action(detail=True, methods=['post'])
    def submit_review(self, request, pk=None):
        """Tekrar sonucunu gönder"""
        repetition = self.get_object()
        quality = request.data.get('quality', 3)  # 0-5 arası
        
        repetition.calculate_next_review(quality)
        
        return Response({
            'message': 'Tekrar sonucu kaydedildi',
            'next_review': repetition.next_review
        })


class StudySessionViewSet(viewsets.ModelViewSet):
    """
    Çalışma oturumları
    """
    queryset = StudySession.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return StudySession.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def start_session(self, request):
        """Çalışma oturumu başlat"""
        user = request.user
        session_type = request.data.get('session_type', 'study')
        subject_id = request.data.get('subject_id')
        topic_id = request.data.get('topic_id')
        
        session = StudySession.objects.create(
            user=user,
            session_type=session_type,
            subject_id=subject_id,
            topic_id=topic_id,
            start_time=timezone.now()
        )
        
        return Response({
            'session_id': session.id,
            'start_time': session.start_time
        })
    
    @action(detail=True, methods=['post'])
    def end_session(self, request, pk=None):
        """Çalışma oturumu bitir"""
        session = self.get_object()
        
        session.end_time = timezone.now()
        session.calculate_duration()
        session.is_completed = True
        
        # Performans verilerini güncelle
        session.questions_answered = request.data.get('questions_answered', 0)
        session.correct_answers = request.data.get('correct_answers', 0)
        session.focus_score = request.data.get('focus_score', 0)
        session.notes = request.data.get('notes', '')
        
        session.save()
        
        return Response({
            'message': 'Oturum tamamlandı',
            'duration_minutes': session.duration_minutes,
            'success_rate': session.calculate_success_rate()
        })
