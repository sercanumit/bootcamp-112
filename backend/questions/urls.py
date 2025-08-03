from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    upload_image, QuestionViewSet
)

router = DefaultRouter()
router.register(r'questions', QuestionViewSet, basename='questions')

urlpatterns = [
    path('upload-image/', upload_image, name='upload-image'),
    path('', include(router.urls)),
]
