from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Prefetch
from .models import ExamCategory, Subject, Topic, Question, ExamRecord
from .serializers import (
    ExamCategorySerializer, SubjectSerializer, TopicTreeSerializer,
    TopicListSerializer, QuestionSerializer, QuestionDetailSerializer,
    ExamRecordSerializer, ExamRecordListSerializer
)
from yon_backend.authentication import require_firebase_auth, get_current_user
from django.http import JsonResponse
import firebase_admin
from firebase_admin import firestore

# Firebase Firestore client
db = firestore.client()

class ExamCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Sınav kategorileri (TYT, AYT, Dil, MSÜ)
    """
    queryset = ExamCategory.objects.filter(is_active=True)
    serializer_class = ExamCategorySerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['get'])
    def subjects(self, request, pk=None):
        """Kategoriye ait dersleri getir"""
        category = self.get_object()
        subjects = category.subjects.filter(is_active=True).order_by('order', 'name')
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)

class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Dersler (Matematik, Fizik, Kimya vs.)
    """
    queryset = Subject.objects.filter(is_active=True).select_related('category')
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        category_type = self.request.query_params.get('category_type')
        if category_type:
            queryset = queryset.filter(category__category_type=category_type)
        return queryset
    
    @action(detail=True, methods=['get'])
    def topics_tree(self, request, pk=None):
        """Dersin konularını tree yapısında getir"""
        subject = self.get_object()
        # Sadece ana konuları getir (parent_topic=None)
        main_topics = subject.topics.filter(
            is_active=True, 
            parent_topic=None
        ).prefetch_related(
            Prefetch('subtopics', queryset=Topic.objects.filter(is_active=True))
        ).order_by('order', 'name')
        
        serializer = TopicTreeSerializer(main_topics, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def topics_flat(self, request, pk=None):
        """Dersin konularını düz liste olarak getir"""
        subject = self.get_object()
        topics = subject.topics.filter(is_active=True).select_related('parent_topic').order_by('level', 'order', 'name')
        serializer = TopicListSerializer(topics, many=True)
        return Response(serializer.data)

class TopicViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Konular (Hiyerarşik yapı)
    """
    queryset = Topic.objects.filter(is_active=True).select_related('subject__category', 'parent_topic')
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'tree':
            return TopicTreeSerializer
        return TopicListSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtreleme seçenekleri
        subject_id = self.request.query_params.get('subject')
        level = self.request.query_params.get('level')
        parent_id = self.request.query_params.get('parent')
        
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
        if level is not None:
            queryset = queryset.filter(level=level)
        if parent_id:
            queryset = queryset.filter(parent_topic_id=parent_id)
            
        return queryset.order_by('level', 'order', 'name')
    
    @action(detail=False, methods=['get'])
    def tree(self, request):
        """Tüm konuları tree yapısında getir"""
        # Sadece ana konuları getir
        main_topics = self.get_queryset().filter(parent_topic=None)
        serializer = TopicTreeSerializer(main_topics, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def children(self, request, pk=None):
        """Konunun alt konularını getir"""
        topic = self.get_object()
        children = topic.get_children()
        serializer = TopicListSerializer(children, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """Konuya ait soruları getir"""
        topic = self.get_object()
        questions = topic.questions.filter(is_active=True).order_by('-created_at')
        
        # Sınav modu vs normal mod
        exam_mode = request.query_params.get('exam_mode', 'false').lower() == 'true'
        if exam_mode:
            serializer = QuestionDetailSerializer(questions, many=True)
        else:
            serializer = QuestionSerializer(questions, many=True)
            
        return Response(serializer.data)

class QuestionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Sorular
    """
    queryset = Question.objects.filter(is_active=True).select_related('topic__subject__category')
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtreleme seçenekleri
        topic_id = self.request.query_params.get('topic')
        subject_id = self.request.query_params.get('subject')
        difficulty = self.request.query_params.get('difficulty')
        question_type = self.request.query_params.get('type')
        
        if topic_id:
            queryset = queryset.filter(topic_id=topic_id)
        if subject_id:
            queryset = queryset.filter(topic__subject_id=subject_id)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        if question_type:
            queryset = queryset.filter(question_type=question_type)
            
        return queryset.order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def random(self, request):
        """Rastgele sorular getir (sınav için)"""
        count = int(request.query_params.get('count', 10))
        topic_ids = request.query_params.getlist('topics')
        
        queryset = self.get_queryset()
        if topic_ids:
            queryset = queryset.filter(topic_id__in=topic_ids)
        
        # Rastgele sorular
        random_questions = queryset.order_by('?')[:count]
        serializer = QuestionDetailSerializer(random_questions, many=True)
        return Response(serializer.data)

@require_firebase_auth
def get_firebase_subjects(request):
    """Firebase'den unique subject'leri getir"""
    try:
        # Topics koleksiyonundan tüm verileri al
        topics_ref = db.collection('topics')
        topics = topics_ref.stream()
        
        # Unique subject'leri topla
        subjects = set()
        topic_count = 0
        for topic in topics:
            topic_data = topic.to_dict()
            topic_count += 1
            if 'subject' in topic_data:
                subjects.add(topic_data['subject'])
        
        print(f"🔍 Firebase'den {topic_count} topic okundu")
        print(f"🔍 Bulunan unique subjects: {subjects}")
        print(f"🔍 Subjects count: {len(subjects)}")
        
        # Subject listesini oluştur
        subjects_list = []
        for i, subject_name in enumerate(sorted(subjects)):
            # Normal subject mapping
            code_mapping = {
                'AYT Matematik': 'ayt_mat',
                'AYT Fizik': 'ayt_fizik',
                'AYT Kimya': 'ayt_kimya',
                'AYT Biyoloji': 'ayt_biyoloji',
                'AYT Türk Dili ve Edebiyatı': 'ayt_edebiyat',
                'AYT Tarih': 'ayt_tarih',
                'AYT Coğrafya': 'ayt_cografya',
                'AYT Felsefe': 'ayt_felsefe',
                'TYT Türkçe': 'tyt_turkce',
                'TYT Matematik': 'tyt_mat',
                'TYT Fen Bilgisi': 'tyt_fen',
                'TYT Sosyal Bilgiler': 'tyt_sosyal',
                'Geometri': 'geometri'
            }
            
            subjects_list.append({
                'id': f'subject_{i}',
                'name': subject_name,
                'code': code_mapping.get(subject_name, subject_name.lower().replace(' ', '_'))
            })
        
        print(f"🔍 Döndürülen subjects count: {len(subjects_list)}")
        print(f"🔍 İlk 5 subject: {subjects_list[:5]}")
        
        return JsonResponse({
            'success': True,
            'data': subjects_list
        })
    except Exception as e:
        print(f"❌ Firebase subjects hatası: {e}")
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)

@require_firebase_auth
def get_firebase_topics_by_subject(request, subject_name):
    """Firebase'den belirli subject'e ait topics'leri getir"""
    try:
        print(f"🔍 Topics aranıyor, subject_name: {subject_name}")
        
        # Subject name mapping (frontend'den gelen code'ları backend name'lerine çevir)
        subject_mapping = {
            'tyt_fen': 'TYT Fen Bilgisi',
            'ayt_mat': 'AYT Matematik',
            'ayt_fizik': 'AYT Fizik',
            'ayt_kimya': 'AYT Kimya',
            'ayt_biyoloji': 'AYT Biyoloji',
            'ayt_edebiyat': 'AYT Türk Dili ve Edebiyatı',
            'ayt_tarih': 'AYT Tarih',
            'ayt_cografya': 'AYT Coğrafya',
            'ayt_felsefe': 'AYT Felsefe',
            'tyt_turkce': 'TYT Türkçe',
            'tyt_mat': 'TYT Matematik',
            'tyt_sosyal': 'TYT Sosyal Bilgiler'
        }
        
        # Eğer mapping varsa kullan, yoksa direkt subject_name kullan
        firebase_subject_name = subject_mapping.get(subject_name, subject_name)
        
        # Topics koleksiyonundan subject'e göre filtrele
        topics_ref = db.collection('topics')
        topics = topics_ref.where('subject', '==', firebase_subject_name).stream()
        
        # Topics listesini oluştur
        topics_list = []
        topic_count = 0
        
        for topic in topics:
            topic_count += 1
            topic_data = topic.to_dict()
            
            # Normal konular
            topics_list.append({
                'id': topic.id,
                'name': topic_data.get('name', ''),
                'subject_id': topic_data.get('subject', '')
            })
        
        print(f"🔍 {topic_count} topic bulundu, {len(topics_list)} filtrelendi")
        print(f"🔍 İlk 3 topic: {topics_list[:3]}")
        
        return JsonResponse({
            'success': True,
            'data': topics_list
        })
    except Exception as e:
        print(f"❌ Firebase topics hatası: {e}")
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)

@require_firebase_auth
def get_firebase_topics(request):
    """Firebase'den tüm topics'leri getir"""
    try:
        print("🔍 Firebase'den tüm topics okunuyor")
        
        # Topics koleksiyonundan tüm topics'leri al
        topics_ref = db.collection('topics')
        topics = topics_ref.stream()
        
        # Topics listesini oluştur
        topics_list = []
        topic_count = 0
        
        for topic in topics:
            topic_count += 1
            topic_data = topic.to_dict()
            topics_list.append({
                'id': topic.id,
                'name': topic_data.get('name', ''),
                'subject_id': topic_data.get('subject', '')
            })
        
        print(f"🔍 {topic_count} topic bulundu")
        print(f"🔍 İlk 5 topic: {topics_list[:5]}")
        
        return JsonResponse({
            'success': True,
            'data': topics_list
        })
    except Exception as e:
        print(f"❌ Firebase topics hatası: {e}")
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)

def test_topics_endpoint(request):
    """Test endpoint - Firebase auth olmadan"""
    return JsonResponse({
        'success': True,
        'message': 'Topics endpoint çalışıyor!',
        'data': [
            {'id': 'test_1', 'name': 'Test Konu 1', 'subject_id': 'test_subject'},
            {'id': 'test_2', 'name': 'Test Konu 2', 'subject_id': 'test_subject'},
        ]
    })

@require_firebase_auth
def test_firebase_connection(request):
    """Firebase bağlantısını test et"""
    try:
        # Firebase'den basit bir sorgu yap
        topics_ref = db.collection('topics')
        topics = topics_ref.limit(5).stream()
        
        topic_count = 0
        subjects = set()
        
        for topic in topics:
            topic_count += 1
            topic_data = topic.to_dict()
            if 'subject' in topic_data:
                subjects.add(topic_data['subject'])
        
        return JsonResponse({
            'success': True,
            'message': 'Firebase bağlantısı başarılı!',
            'data': {
                'topic_count': topic_count,
                'subjects_found': list(subjects),
                'total_subjects': len(subjects)
            }
        })
    except Exception as e:
        print(f"❌ Firebase test hatası: {e}")
        return JsonResponse({
            'success': False,
            'message': f'Firebase bağlantı hatası: {str(e)}'
        }, status=500)


class ExamRecordViewSet(viewsets.ModelViewSet):
    """
    Deneme kayıt CRUD işlemleri
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Sadece kullanıcının kendi kayıtlarını getir"""
        return ExamRecord.objects.filter(user=self.request.user).select_related(
            'exam_subject', 'user'
        ).prefetch_related('exam_topics')
    
    def get_serializer_class(self):
        """Action'a göre serializer seç"""
        if self.action == 'list':
            return ExamRecordListSerializer
        return ExamRecordSerializer
    
    def perform_create(self, serializer):
        """Kullanıcıyı otomatik ata"""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Kullanıcının deneme istatistiklerini getir"""
        from django.db.models import Sum, Avg
        
        queryset = self.get_queryset()
        
        # Toplam istatistikler
        total_exams = queryset.count()
        total_questions = queryset.aggregate(total=Sum('total_questions'))['total'] or 0
        total_correct = queryset.aggregate(total=Sum('total_correct'))['total'] or 0
        total_wrong = queryset.aggregate(total=Sum('total_wrong'))['total'] or 0
        
        # Ortalama net
        avg_net = queryset.aggregate(avg=Avg('total_net'))['avg'] or 0
        
        # Son 5 deneme
        recent_exams = queryset.order_by('-exam_date')[:5]
        recent_serializer = ExamRecordListSerializer(recent_exams, many=True)
        
        return Response({
            'total_exams': total_exams,
            'total_questions': total_questions,
            'total_correct': total_correct,
            'total_wrong': total_wrong,
            'avg_net': round(avg_net, 2),
            'recent_exams': recent_serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def by_subject(self, request):
        """Derse göre deneme kayıtlarını getir"""
        subject_id = request.query_params.get('subject_id')
        if not subject_id:
            return Response({'error': 'subject_id parametresi gerekli'}, status=400)
        
        queryset = self.get_queryset().filter(exam_subject_id=subject_id)
        serializer = ExamRecordListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Deneme türüne göre kayıtları getir"""
        exam_type = request.query_params.get('exam_type')
        if not exam_type:
            return Response({'error': 'exam_type parametresi gerekli'}, status=400)
        
        queryset = self.get_queryset().filter(exam_type=exam_type)
        serializer = ExamRecordListSerializer(queryset, many=True)
        return Response(serializer.data)
