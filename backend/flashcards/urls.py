from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FlashcardViewSet, FlashcardDeckViewSet, FlashcardProgressViewSet

app_name = 'flashcards'

router = DefaultRouter()
router.register(r'flashcards', FlashcardViewSet)
router.register(r'decks', FlashcardDeckViewSet) 
router.register(r'progress', FlashcardProgressViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 