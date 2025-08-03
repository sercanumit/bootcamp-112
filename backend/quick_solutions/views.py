from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from .models import QuickSolution
from .serializers import QuickSolutionCreateSerializer, QuickSolutionSerializer
from .services import AIServices
import os
import threading
from notifications.models import Notification
from firebase_admin import storage
import uuid

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_quick_solution(request):
    """
    Hızlı çözüm oluştur
    """
    serializer = QuickSolutionCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        quick_solution = serializer.save()
        
        # AI işlemlerini arka planda başlat
        def process_ai():
            try:
                ai_services = AIServices()
                
                # Firebase Storage'a yükle
                try:
                    # Firebase Storage bucket'ı
                    bucket = storage.bucket('directionapp-ec3b6.appspot.com')
                    file_name = f"quick_solutions/{uuid.uuid4()}.jpg"
                    
                    # Django media dosyasını Firebase Storage'a yükle
                    blob = bucket.blob(file_name)
                    blob.upload_from_filename(quick_solution.fotograf.path)
                    blob.make_public()
                    
                    print(f"✅ Firebase Storage'a yüklendi: {file_name}")
                    
                    # Firebase Vision AI ile fotoğraf analizi
                    vision_text = ai_services.analyze_image_with_firebase_vision(file_name)
                    
                except Exception as e:
                    print(f"❌ Firebase Storage hatası: {e}")
                    print("🔄 Gemini Vision kullanılıyor...")
                    # Fallback: Django media dosyasını kullan
                    vision_text = ai_services.analyze_image_with_firebase_vision(quick_solution.fotograf.path)
                
                # Gemini AI ile çözüm
                gemini_response = ai_services.get_gemini_solution(
                    quick_solution.konu,
                    quick_solution.ders,
                    quick_solution.mesaj,
                    vision_text
                )
                
                # Sonuçları kaydet
                quick_solution.vision_text = vision_text
                quick_solution.gemini_response = gemini_response
                quick_solution.is_processed = True
                quick_solution.processed_at = timezone.now()
                quick_solution.save()
                
                print(f"✅ AI işlemi tamamlandı - ID: {quick_solution.id}")
                
                # Bildirim gönder
                try:
                    notification = Notification.objects.create(
                        firebase_uid=request.user.firebase_uid,
                        notification_type='quick_solution',
                        title='Çözümünüz Hazır! 🎉',
                        message=f'{quick_solution.konu} konusundaki sorunuz çözüldü. Görmek için tıklayın.',
                        data={
                            'solution_id': quick_solution.id,
                            'konu': quick_solution.konu,
                            'ders': quick_solution.ders
                        }
                    )
                    print(f"✅ Bildirim gönderildi - ID: {notification.id}")
                except Exception as e:
                    print(f"❌ Bildirim gönderilemedi: {e}")
                
            except Exception as e:
                print(f"❌ AI işlemi hatası - ID: {quick_solution.id}: {e}")
                quick_solution.gemini_response = f"AI işlemi sırasında hata: {str(e)}"
                quick_solution.is_processed = True
                quick_solution.processed_at = timezone.now()
                quick_solution.save()
        
        # Arka planda AI işlemini başlat
        thread = threading.Thread(target=process_ai)
        thread.daemon = True
        thread.start()
        
        return Response({
            'success': True,
            'message': 'Soru başarıyla gönderildi! Çözüm hazırlanıyor...',
            'data': QuickSolutionSerializer(quick_solution).data
        }, status=status.HTTP_201_CREATED)
    else:
        return Response({
            'success': False,
            'message': 'Veri doğrulama hatası',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quick_solutions(request):
    """
    Kullanıcının hızlı çözümlerini getir
    """
    solutions = QuickSolution.objects.filter(user=request.user)
    serializer = QuickSolutionSerializer(solutions, many=True)
    
    return Response({
        'success': True,
        'data': serializer.data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quick_solution_detail(request, solution_id):
    """
    Belirli bir hızlı çözümü getir
    """
    try:
        solution = QuickSolution.objects.get(id=solution_id, user=request.user)
        serializer = QuickSolutionSerializer(solution)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    except QuickSolution.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Hızlı çözüm bulunamadı'
        }, status=status.HTTP_404_NOT_FOUND) 