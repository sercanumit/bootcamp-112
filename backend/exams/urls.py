from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# DRF Router ile ViewSet endpoint'leri
router = DefaultRouter()
router.register(r'categories', views.ExamCategoryViewSet, basename='exam-categories')
router.register(r'subjects', views.SubjectViewSet, basename='subjects')
router.register(r'topics', views.TopicViewSet, basename='topics')
router.register(r'questions', views.QuestionViewSet, basename='questions')
router.register(r'exam-records', views.ExamRecordViewSet, basename='exam-records')

urlpatterns = [
    # Sınav endpoint'leri
    path('', include(router.urls)),
    
    # Firebase endpoint'leri
    path('firebase/subjects/', views.get_firebase_subjects, name='firebase-subjects'),
    path('firebase/topics/', views.get_firebase_topics, name='firebase-topics'),
    path('firebase/subjects/<str:subject_name>/topics/', views.get_firebase_topics_by_subject, name='firebase-topics-by-subject'),
    path('firebase/test/', views.test_firebase_connection, name='firebase-test'),
    
    # Test endpoint'leri
    path('test/topics/', views.test_topics_endpoint, name='test-topics'),
    
    # # Özel endpoint'ler (ViewSet action'ları ile hallediliyor)
    # GET /api/v1/exams/categories/{id}/subjects/
    # GET /api/v1/exams/subjects/{id}/topics_tree/
    # GET /api/v1/exams/subjects/{id}/topics_flat/
    # GET /api/v1/exams/topics/tree/
    # GET /api/v1/exams/topics/{id}/children/
    # GET /api/v1/exams/topics/{id}/questions/
    # GET /api/v1/exams/questions/random/
] 