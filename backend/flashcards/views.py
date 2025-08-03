from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Q, Prefetch
import random

from .models import Flashcard, FlashcardDeck, FlashcardDeckItem, FlashcardProgress
from .serializers import (
    FlashcardSerializer, FlashcardStudySerializer, FlashcardDeckSerializer,
    FlashcardDeckListSerializer, FlashcardProgressSerializer, 
    FlashcardReviewSerializer
)
from exams.models import Topic


class FlashcardViewSet(viewsets.ModelViewSet):
    """
    Flashcard CRUD işlemleri
    """
    queryset = Flashcard.objects.all()
    serializer_class = FlashcardSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Flashcard.objects.select_related('topic', 'created_by').filter(is_active=True)
        
        # Konu filtreleme
        topic_id = self.request.query_params.get('topic', None)
        if topic_id:
            queryset = queryset.filter(topic_id=topic_id)
        
        # Arama
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(question__icontains=search) |
                Q(answer__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def by_topic(self, request):
        """
        Konuya göre flashcard'ları getir
        """
        topic_id = request.query_params.get('topic_id')
        if not topic_id:
            return Response({'error': 'topic_id parametresi gerekli'}, status=status.HTTP_400_BAD_REQUEST)
        
        flashcards = self.get_queryset().filter(topic_id=topic_id)
        serializer = self.get_serializer(flashcards, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def random(self, request):
        """
        Rastgele flashcard'lar getir
        """
        count = int(request.query_params.get('count', 10))
        topic_id = request.query_params.get('topic_id')
        
        queryset = self.get_queryset()
        if topic_id:
            queryset = queryset.filter(topic_id=topic_id)
        
        # Rastgele seçim
        flashcards = list(queryset)
        if len(flashcards) > count:
            flashcards = random.sample(flashcards, count)
        
        serializer = FlashcardStudySerializer(flashcards, many=True)
        return Response(serializer.data)


class FlashcardDeckViewSet(viewsets.ModelViewSet):
    """
    Flashcard Deck CRUD işlemleri
    """
    queryset = FlashcardDeck.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return FlashcardDeckListSerializer
        return FlashcardDeckSerializer
    
    def get_queryset(self):
        queryset = FlashcardDeck.objects.select_related('user').prefetch_related(
            Prefetch('flashcarddeckitem_set', 
                    queryset=FlashcardDeckItem.objects.select_related('flashcard__topic'))
        )
        
        # Kullanıcı kendi destelerini veya public desteleri görebilir
        return queryset.filter(
            Q(user=self.request.user) | Q(is_public=True)
        ).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_flashcard(self, request, pk=None):
        """
        Desteye flashcard ekle
        """
        deck = self.get_object()
        if deck.user != request.user:
            return Response({'error': 'Bu desteyi düzenleme yetkiniz yok'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        flashcard_id = request.data.get('flashcard_id')
        if not flashcard_id:
            return Response({'error': 'flashcard_id gerekli'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            flashcard = Flashcard.objects.get(id=flashcard_id)
            deck_item, created = FlashcardDeckItem.objects.get_or_create(
                deck=deck,
                flashcard=flashcard,
                defaults={'order': deck.flashcarddeckitem_set.count()}
            )
            
            if created:
                return Response({'message': 'Flashcard desteye eklendi'})
            else:
                return Response({'message': 'Flashcard zaten destede var'})
                
        except Flashcard.DoesNotExist:
            return Response({'error': 'Flashcard bulunamadı'}, 
                          status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['delete'])
    def remove_flashcard(self, request, pk=None):
        """
        Desteden flashcard kaldır
        """
        deck = self.get_object()
        if deck.user != request.user:
            return Response({'error': 'Bu desteyi düzenleme yetkiniz yok'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        flashcard_id = request.data.get('flashcard_id')
        if not flashcard_id:
            return Response({'error': 'flashcard_id gerekli'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            deck_item = FlashcardDeckItem.objects.get(deck=deck, flashcard_id=flashcard_id)
            deck_item.delete()
            return Response({'message': 'Flashcard desteden kaldırıldı'})
        except FlashcardDeckItem.DoesNotExist:
            return Response({'error': 'Flashcard destede bulunamadı'}, 
                          status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['get'])
    def study(self, request, pk=None):
        """
        Deste çalışma modu - cevaplar gizli
        """
        deck = self.get_object()
        flashcards = [item.flashcard for item in deck.flashcarddeckitem_set.all()]
        serializer = FlashcardStudySerializer(flashcards, many=True)
        return Response({
            'deck_name': deck.name,
            'flashcard_count': len(flashcards),
            'flashcards': serializer.data
        })


class FlashcardProgressViewSet(viewsets.ModelViewSet):
    """
    Flashcard Progress (Spaced Repetition) işlemleri
    """
    queryset = FlashcardProgress.objects.all()
    serializer_class = FlashcardProgressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return FlashcardProgress.objects.select_related(
            'flashcard', 'user'
        ).filter(user=self.request.user).order_by('-last_reviewed')
    
    @action(detail=False, methods=['get'])
    def due_for_review(self, request):
        """
        Tekrar edilmesi gereken flashcard'ları getir
        """
        now = timezone.now()
        due_progress = self.get_queryset().filter(next_review_date__lte=now)
        serializer = self.get_serializer(due_progress, many=True)
        return Response({
            'count': due_progress.count(),
            'flashcards': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        """
        Flashcard'ı değerlendir ve bir sonraki tekrar tarihini hesapla
        """
        progress = self.get_object()
        serializer = FlashcardReviewSerializer(data=request.data)
        
        if serializer.is_valid():
            difficulty = serializer.validated_data['difficulty']
            
            # Spaced Repetition algoritması (basitleştirilmiş SM-2)
            if difficulty >= 3:  # Doğru cevap
                progress.repetition_count += 1
                if progress.repetition_count == 1:
                    progress.interval_days = 1
                elif progress.repetition_count == 2:
                    progress.interval_days = 6
                else:
                    progress.interval_days = int(progress.interval_days * progress.ease_factor)
                
                # Ease factor güncelleme
                progress.ease_factor = max(1.3, progress.ease_factor + (0.1 - (5 - difficulty) * (0.08 + (5 - difficulty) * 0.02)))
            else:  # Yanlış cevap
                progress.repetition_count = 0
                progress.interval_days = 1
            
            progress.difficulty = difficulty
            progress.next_review_date = timezone.now() + timedelta(days=progress.interval_days)
            progress.save()
            
            return Response({'message': 'Değerlendirme kaydedildi', 'next_review_date': progress.next_review_date})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def start_learning(self, request):
        """
        Yeni bir flashcard öğrenmeye başla
        """
        flashcard_id = request.data.get('flashcard_id')
        if not flashcard_id:
            return Response({'error': 'flashcard_id gerekli'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            flashcard = Flashcard.objects.get(id=flashcard_id)
            progress, created = FlashcardProgress.objects.get_or_create(
                user=request.user,
                flashcard=flashcard,
                defaults={
                    'next_review_date': timezone.now() + timedelta(days=1),
                    'difficulty': 3
                }
            )
            
            if created:
                return Response({'message': 'Flashcard öğrenmeye eklendi'})
            else:
                return Response({'message': 'Bu flashcard zaten öğrenme listesinde'})
                
        except Flashcard.DoesNotExist:
            return Response({'error': 'Flashcard bulunamadı'}, 
                          status=status.HTTP_404_NOT_FOUND)
