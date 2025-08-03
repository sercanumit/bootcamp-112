from django.urls import path
from . import views

urlpatterns = [
    path('subject-topic-analysis/', views.get_subject_topic_analysis, name='get_subject_topic_analysis'),
    path('comprehensive-analysis/', views.get_comprehensive_analysis, name='get_comprehensive_analysis'),
] 