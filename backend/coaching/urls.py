from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserExamAttemptViewSet, SubjectPerformanceViewSet, StudyPlanViewSet,
    CoachingRecommendationViewSet, UserProgressViewSet,
    SpacedRepetitionViewSet, StudySessionViewSet
)

router = DefaultRouter()
router.register(r'exam-attempts', UserExamAttemptViewSet, basename='exam-attempt')
router.register(r'subject-performance', SubjectPerformanceViewSet, basename='subject-performance')
router.register(r'study-plans', StudyPlanViewSet, basename='study-plan')
router.register(r'recommendations', CoachingRecommendationViewSet, basename='recommendation')
router.register(r'progress', UserProgressViewSet, basename='progress')
router.register(r'spaced-repetition', SpacedRepetitionViewSet, basename='spaced-repetition')
router.register(r'study-sessions', StudySessionViewSet, basename='study-session')

urlpatterns = [
    path('', include(router.urls)),
] 