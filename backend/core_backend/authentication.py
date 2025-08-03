"""
Firebase Authentication Middleware for Django
Bu modül Firebase Auth kullanıcılarını Django ile entegre eder.
"""

import firebase_admin
from firebase_admin import auth, credentials, firestore
from django.http import JsonResponse
from django.conf import settings
import os
from datetime import datetime

# Firebase'i başlat
if not firebase_admin._apps:
    SERVICE_ACCOUNT_KEY_PATH = os.path.join(settings.BASE_DIR, "yon_backend", "firebase-service.json")
    if os.path.exists(SERVICE_ACCOUNT_KEY_PATH):
        cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
        firebase_admin.initialize_app(cred)
    else:
        firebase_admin.initialize_app()

db = firestore.client()

class FirebaseAuthenticationMiddleware:
    """Firebase Authentication Middleware"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Firebase ID token'ı header'dan al
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            id_token = auth_header.split('Bearer ')[1]
            
            try:
                # Token'ı doğrula
                decoded_token = auth.verify_id_token(id_token)
                user_uid = decoded_token['uid']
                
                # Kullanıcıyı Firestore'dan al veya oluştur
                user_data = self.get_or_create_user(user_uid, decoded_token)
                
                # Request'e kullanıcı bilgilerini ekle
                request.firebase_user = user_data
                request.user_uid = user_uid
                
            except Exception as e:
                print(f"Firebase authentication error: {e}")
                request.firebase_user = None
                request.user_uid = None
        
        response = self.get_response(request)
        return response
    
    def get_or_create_user(self, user_uid, decoded_token):
        """Kullanıcıyı Firestore'dan al veya oluştur"""
        try:
            user_ref = db.collection('users').document(user_uid)
            doc = user_ref.get()
            
            if doc.exists:
                # Mevcut kullanıcı - last_login güncelle
                user_data = doc.to_dict()
                user_ref.update({
                    'last_login': datetime.now(),
                    'email_verified': decoded_token.get('email_verified', False)
                })
                return user_data
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
                    'created_at': datetime.now(),
                    'last_login': datetime.now(),
                    'is_active': True,
                    'email_verified': decoded_token.get('email_verified', False)
                }
                
                user_ref.set(user_data)
                
                # Kullanıcı alt koleksiyonlarını oluştur
                self.create_user_subcollections(user_uid)
                
                return user_data
                
        except Exception as e:
            print(f"Error getting/creating user: {e}")
            return None
    
    def create_user_subcollections(self, user_uid):
        """Kullanıcı alt koleksiyonlarını oluştur"""
        try:
            user_ref = db.collection('users').document(user_uid)
            
            # Daily Data
            daily_data = {
                'study_hours': 0.0,
                'total_questions': 0,
                'date': datetime.now().date().isoformat(),
                'created_at': datetime.now()
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

def require_firebase_auth(view_func):
    """Firebase authentication gerektiren view decorator"""
    def wrapper(request, *args, **kwargs):
        if not hasattr(request, 'firebase_user') or not request.firebase_user:
            return JsonResponse({
                'error': 'Authentication required',
                'message': 'Firebase ID token is required'
            }, status=401)
        
        return view_func(request, *args, **kwargs)
    
    return wrapper

def get_current_user(request):
    """Mevcut kullanıcıyı al"""
    return getattr(request, 'firebase_user', None)

def get_user_uid(request):
    """Kullanıcı UID'sini al"""
    return getattr(request, 'user_uid', None)


# DRF Authentication Class
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import AnonymousUser


class FirebaseAuthentication(BaseAuthentication):
    """DRF için Firebase Authentication"""
    
    def authenticate(self, request):
        # Firebase ID token'ı header'dan al
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return None
        
        id_token = auth_header.split('Bearer ')[1]
        
        try:
            # Token'ı doğrula
            decoded_token = auth.verify_id_token(id_token)
            user_uid = decoded_token['uid']
            
            # Kullanıcıyı Firestore'dan al veya oluştur
            user_data = self.get_or_create_user(user_uid, decoded_token)
            
            if user_data:
                # Django User objesi oluştur (Firebase UID ile)
                user = FirebaseUser(user_uid, user_data)
                return (user, None)
            else:
                raise AuthenticationFailed('Kullanıcı oluşturulamadı')
                
        except Exception as e:
            raise AuthenticationFailed(f'Firebase authentication failed: {str(e)}')
    
    def get_or_create_user(self, user_uid, decoded_token):
        """Kullanıcıyı Firestore'dan al veya oluştur"""
        try:
            user_ref = db.collection('users').document(user_uid)
            doc = user_ref.get()
            
            if doc.exists:
                # Mevcut kullanıcı - last_login güncelle
                user_data = doc.to_dict()
                user_ref.update({
                    'last_login': datetime.now(),
                    'email_verified': decoded_token.get('email_verified', False)
                })
                return user_data
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
                    'created_at': datetime.now(),
                    'last_login': datetime.now(),
                    'is_active': True,
                    'email_verified': decoded_token.get('email_verified', False)
                }
                
                user_ref.set(user_data)
                
                # Kullanıcı alt koleksiyonlarını oluştur
                self.create_user_subcollections(user_uid)
                
                return user_data
                
        except Exception as e:
            print(f"Error getting/creating user: {e}")
            return None
    
    def create_user_subcollections(self, user_uid):
        """Kullanıcı alt koleksiyonlarını oluştur"""
        try:
            user_ref = db.collection('users').document(user_uid)
            
            # Daily Data
            daily_data = {
                'study_hours': 0.0,
                'total_questions': 0,
                'date': datetime.now().date().isoformat(),
                'created_at': datetime.now()
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


class FirebaseUser:
    """Firebase kullanıcısı için Django User benzeri obje"""
    
    def __init__(self, firebase_uid, user_data):
        self.firebase_uid = firebase_uid
        self.user_data = user_data
        self.is_authenticated = True
        self.is_anonymous = False
    
    @property
    def is_active(self):
        return self.user_data.get('is_active', True)
    
    @property
    def email(self):
        return self.user_data.get('email', '')
    
    @property
    def first_name(self):
        return self.user_data.get('first_name', '')
    
    @property
    def last_name(self):
        return self.user_data.get('last_name', '')
    
    @property
    def name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_full_name(self):
        return self.name
    
    def get_short_name(self):
        return self.first_name
    
    def __str__(self):
        return f"FirebaseUser({self.firebase_uid})"
