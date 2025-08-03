from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from firebase_admin import auth
from yon_backend.authentication import get_current_user, get_user_uid
import firebase_admin
from firebase_admin import firestore
from datetime import datetime, date
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from yon_backend.authentication import require_firebase_auth

# Firebase Firestore client
db = firestore.client()

@api_view(['POST'])
@permission_classes([AllowAny])
def firebase_login(request):
    """Firebase ID token ile giriş"""
    try:
        firebase_token = request.data.get('firebase_token')
        if not firebase_token:
            return Response({
                'success': False,
                'message': 'Firebase token gerekli'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Firebase token'ı doğrula
        decoded_token = auth.verify_id_token(firebase_token)
        user_uid = decoded_token['uid']

        # Kullanıcıyı Firestore'dan al veya oluştur
        user_ref = db.collection('users').document(user_uid)
        doc = user_ref.get()

        if doc.exists:
            user_data = doc.to_dict()
            # last_login güncelle
            user_ref.update({'last_login': firestore.SERVER_TIMESTAMP})
        else:
            # Yeni kullanıcı oluştur
            user_data = {
                'firebase_uid': user_uid,
                'email': decoded_token.get('email', ''),
                'first_name': decoded_token.get('name', '').split()[0] if decoded_token.get('name') else '',
                'last_name': ' '.join(decoded_token.get('name', '').split()[1:]) if decoded_token.get('name') and len(decoded_token.get('name', '').split()) > 1 else '',
                'target_profession': '',
                'department': '',
                'grade': '',
                'created_at': firestore.SERVER_TIMESTAMP,
                'last_login': firestore.SERVER_TIMESTAMP,
                'is_active': True,
                'email_verified': decoded_token.get('email_verified', False)
            }
            user_ref.set(user_data)

            # Kullanıcı alt koleksiyonlarını oluştur
            create_user_subcollections(user_uid)

        return Response({
            'success': True,
            'message': 'Giriş başarılı',
            'data': {
                'user': user_data,
                'token': firebase_token  # Frontend'e token'ı geri gönder
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Firebase login error: {e}")
        return Response({
            'success': False,
            'message': 'Giriş yapılamadı'
        }, status=status.HTTP_401_UNAUTHORIZED)

def create_user_subcollections(user_uid):
    """Kullanıcı alt koleksiyonlarını oluştur"""
    try:
        user_ref = db.collection('users').document(user_uid)
        
        # Daily Data
        daily_data = {
            'study_hours': 0.0,
            'total_questions': 0,
            'date': firestore.SERVER_TIMESTAMP,
            'created_at': firestore.SERVER_TIMESTAMP
        }
        user_ref.collection('daily_data').add(daily_data)
        
        # Weak Topics
        user_ref.collection('weak_topics').add({})
        
        # Study Plans
        user_ref.collection('study_plans').add({})
        
        # Flashcards
        user_ref.collection('flashcards').add({})
        
    except Exception as e:
        print(f"Error creating user subcollections: {e}")

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """Kullanıcı profilini getir"""
    try:
        user_uid = request.user.firebase_uid
        if not user_uid:
            return Response({'success': False, 'message': 'Kullanıcı bulunamadı'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Firestore'dan kullanıcı bilgilerini al
        user_ref = db.collection('users').document(user_uid)
        user_doc = user_ref.get()
        
        if user_doc.exists:
            user_data = user_doc.to_dict()
            return Response({
                'success': True,
                'data': {
                    'name': user_data.get('name', ''),
                    'email': user_data.get('email', ''),
                    'grade': user_data.get('grade', ''),
                    'department': user_data.get('department', ''),
                    'target_profession': user_data.get('target_profession', ''),
                    'created_at': user_data.get('created_at', ''),
                    'onboarding_completed': user_data.get('onboarding_completed', False)
                }
            })
        else:
            return Response({'success': False, 'message': 'Profil bulunamadı'}, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        print(f"❌ get_user_profile hatası: {e}")
        return Response({'success': False, 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@require_firebase_auth
def save_user_profile(request):
    """Kullanıcı profil bilgilerini güncelle"""
    try:
        user_uid = get_user_uid(request)
        if not user_uid:
            return Response({
                'success': False,
                'message': 'Kullanıcı kimliği bulunamadı'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Gelen verileri al
        target_profession = request.data.get('target_profession')
        exam_type = request.data.get('exam_type')
        grade = request.data.get('grade')
        onboarding_completed = request.data.get('onboarding_completed')

        # Firestore'da kullanıcı dokümanını güncelle
        user_ref = db.collection('users').document(user_uid)
        
        update_data = {}
        if target_profession is not None:
            update_data['target_profession'] = target_profession
        if exam_type is not None:
            update_data['exam_type'] = exam_type
        if grade is not None:
            update_data['grade'] = grade
        if onboarding_completed is not None:
            update_data['onboarding_completed'] = onboarding_completed
        
        # Onboarding tamamlandıysa tarih ekle
        if onboarding_completed:
            update_data['onboarding_completed_at'] = firestore.SERVER_TIMESTAMP
        
        if update_data:
            update_data['updated_at'] = firestore.SERVER_TIMESTAMP
            user_ref.update(update_data)

        return Response({
            'success': True,
            'message': 'Profil başarıyla güncellendi'
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Save user profile error: {e}")
        return Response({
            'success': False,
            'message': 'Profil güncellenirken hata oluştu'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@require_firebase_auth
@csrf_exempt
@require_http_methods(["POST"])
def save_daily_data(request):
    """Günlük veri kaydet"""
    try:
        user = get_current_user(request)
        if not user:
            return JsonResponse({'success': False, 'message': 'Kullanıcı bulunamadı'}, status=401)
        
        data = json.loads(request.body)
        study_hours = data.get('studyHours', 0)
        total_questions = data.get('totalQuestions', 0)
        
        # Bugünün tarihini al
        today = date.today().isoformat()
        
        # Firestore'da günlük veri kaydet
        user_ref = db.collection('users').document(user['uid'])
        daily_data_ref = user_ref.collection('daily_data').document(today)
        
        daily_data_ref.set({
            'date': today,
            'study_hours': study_hours,
            'total_questions': total_questions,
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP
        }, merge=True)
        
        print(f"✅ Günlük veri kaydedildi: {user['uid']} - {today}")
        
        return JsonResponse({
            'success': True,
            'message': 'Günlük veri kaydedildi'
        })
        
    except Exception as e:
        print(f"❌ save_daily_data hatası: {e}")
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

@require_firebase_auth
@csrf_exempt
@require_http_methods(["POST"])
def save_daily_goals(request):
    """Günlük hedefleri kaydet"""
    try:
        user = get_current_user(request)
        if not user:
            return JsonResponse({'success': False, 'message': 'Kullanıcı bulunamadı'}, status=401)
        
        data = json.loads(request.body)
        study_hours_goal = data.get('studyHoursGoal', 8)
        total_questions_goal = data.get('totalQuestionsGoal', 100)
        
        # Firestore'da hedefleri kaydet
        user_ref = db.collection('users').document(user['uid'])
        goals_ref = user_ref.collection('goals').document('daily')
        
        goals_ref.set({
            'study_hours_goal': study_hours_goal,
            'total_questions_goal': total_questions_goal,
            'updated_at': firestore.SERVER_TIMESTAMP
        }, merge=True)
        
        print(f"✅ Günlük hedefler kaydedildi: {user['uid']}")
        
        return JsonResponse({
            'success': True,
            'message': 'Hedefler kaydedildi'
        })
        
    except Exception as e:
        print(f"❌ save_daily_goals hatası: {e}")
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

@require_firebase_auth
def get_daily_data(request):
    """Günlük veri ve hedefleri getir - Sadece veri varsa döndür"""
    try:
        user = get_current_user(request)
        if not user:
            return JsonResponse({'success': False, 'message': 'Kullanıcı bulunamadı'}, status=401)
        
        today = date.today().isoformat()
        
        # Firestore'dan günlük veri ve hedefleri al
        user_ref = db.collection('users').document(user['uid'])
        
        # Günlük veri
        daily_data_ref = user_ref.collection('daily_data').document(today)
        daily_doc = daily_data_ref.get()
        
        # Hedefler
        goals_ref = user_ref.collection('goals').document('daily')
        goals_doc = goals_ref.get()
        
        # Eğer bugün için veri yoksa, veri olmadığını belirt
        has_daily_data = False
        daily_data = {
            'studyHours': 0,
            'totalQuestions': 0
        }
        
        if daily_doc.exists:
            firestore_data = daily_doc.to_dict()
            # Sadece gerçekten veri girilmişse kabul et
            study_hours = firestore_data.get('study_hours', 0)
            total_questions = firestore_data.get('total_questions', 0)
            
            # Eğer herhangi bir veri girilmişse
            if study_hours > 0 or total_questions > 0:
                has_daily_data = True
                daily_data = {
                    'studyHours': study_hours,
                    'totalQuestions': total_questions
                }
        
        goals_data = {
            'studyHoursGoal': 8,
            'totalQuestionsGoal': 100
        }
        
        if goals_doc.exists:
            goals = goals_doc.to_dict()
            goals_data = {
                'studyHoursGoal': goals.get('study_hours_goal', 8),
                'totalQuestionsGoal': goals.get('total_questions_goal', 100)
            }
        
        return JsonResponse({
            'success': True,
            'data': {
                'dailyData': daily_data,
                'goals': goals_data,
                'hasData': has_daily_data  # Veri olup olmadığını belirt
            }
        })
        
    except Exception as e:
        print(f"❌ get_daily_data hatası: {e}")
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

@require_firebase_auth
def reset_daily_data(request):
    """Günlük verileri sıfırla (otomatik sıfırlama için)"""
    try:
        user = get_current_user(request)
        if not user:
            return JsonResponse({'success': False, 'message': 'Kullanıcı bulunamadı'}, status=401)
        
        # Bugünün tarihini al
        today = date.today().isoformat()
        
        # Firestore'da günlük veriyi sıfırla
        user_ref = db.collection('users').document(user['uid'])
        daily_data_ref = user_ref.collection('daily_data').document(today)
        
        daily_data_ref.set({
            'date': today,
            'study_hours': 0,
            'total_questions': 0,
            'updated_at': firestore.SERVER_TIMESTAMP
        }, merge=True)
        
        print(f"✅ Günlük veri sıfırlandı: {user['uid']} - {today}")
        
        return JsonResponse({
            'success': True,
            'message': 'Günlük veri sıfırlandı'
        })
        
    except Exception as e:
        print(f"❌ reset_daily_data hatası: {e}")
        return JsonResponse({'success': False, 'message': str(e)}, status=500)