from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.decorators import action
import uuid
import os
import datetime
import tempfile
import json

from firebase_admin import storage, firestore, auth

from yon_backend.settings import FIREBASE_DB
from .models import Question
from .serializers import QuestionSerializer


@csrf_exempt
def upload_image(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST allowed'}, status=405)

    try:
        # Firebase token'ı al ve doğrula
        id_token = request.META.get('HTTP_AUTHORIZATION')
        if not id_token:
            return JsonResponse({'error': 'Authorization token missing'}, status=401)

        decoded_token = auth.verify_id_token(id_token)
        user_id = decoded_token['uid']

        # Resim dosyasını al
        image_file = request.FILES.get('image')
        if not image_file:
            return JsonResponse({'error': 'Image file is required'}, status=400)

        # Ekstra verileri al
        extra_text = request.POST.get('extra_text', '')
        category = request.POST.get('category', '')

        # Benzersiz bir job_id oluştur
        job_id = str(uuid.uuid4())
        image_filename = f"images/{user_id}/{job_id}.png"

        # Resmi geçici olarak kaydet
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_file:
            for chunk in image_file.chunks():
                temp_file.write(chunk)
            temp_path = temp_file.name

        # Firebase Storage'a yükle
        bucket = storage.bucket()
        blob = bucket.blob(image_filename)
        blob.upload_from_filename(temp_path)
        blob.make_public()

        # Geçici dosyayı sil
        os.remove(temp_path)

        # Firestore'a belge oluştur
        job_doc = {
            'user_id': user_id,
            'image_path': image_filename,
            'extra_text': extra_text,
            'category': category,
            'status': 'pending_ocr',
            'timestamp': firestore.SERVER_TIMESTAMP
        }

        FIREBASE_DB.collection('jobs').document(job_id).set(job_doc)

        return JsonResponse({'job_id': job_id, 'message': 'Image uploaded successfully'})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


class QuestionViewSet(viewsets.ModelViewSet):
    """
    Soru yönetimi
    """
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Question.objects.filter(
            firebase_uid=self.request.user.firebase_uid
        ).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(firebase_uid=self.request.user.firebase_uid)
    
    @action(detail=False, methods=['get'])
    def my_questions(self, request):
        """
        Kullanıcının kendi soruları
        """
        questions = Question.objects.filter(
            firebase_uid=request.user.firebase_uid,
            is_active=True
        ).order_by('-created_at')
        
        serializer = self.get_serializer(questions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """
        Soruyu aktif/pasif yap
        """
        question = self.get_object()
        question.is_active = not question.is_active
        question.save()
        
        return Response({
            'message': f'Soru {"aktif" if question.is_active else "pasif"} yapıldı',
            'is_active': question.is_active
        })
