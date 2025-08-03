#!/usr/bin/env python3
"""
Firebase Authentication - Firestore Database Senkronizasyon Script
Bu script Firebase Auth kullanıcılarını Firestore database ile senkronize eder.
"""

import firebase_admin
from firebase_admin import credentials, firestore, auth
from datetime import datetime
import os

# Firebase service account key dosyası
SERVICE_ACCOUNT_KEY_PATH = "yon_backend/firebase-service.json"

def initialize_firebase():
    """Firebase'i başlat"""
    try:
        if os.path.exists(SERVICE_ACCOUNT_KEY_PATH):
            cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
            firebase_admin.initialize_app(cred)
        else:
            firebase_admin.initialize_app()
        
        print("✅ Firebase başarıyla başlatıldı!")
        return firestore.client()
    except Exception as e:
        print(f"❌ Firebase başlatma hatası: {e}")
        return None

def sync_auth_users_to_firestore(db):
    """Firebase Auth kullanıcılarını Firestore'a senkronize et"""
    print("\n🔄 Firebase Auth kullanıcıları Firestore'a senkronize ediliyor...")
    
    try:
        # Firebase Auth'tan tüm kullanıcıları al
        auth_users = auth.list_users()
        
        users_ref = db.collection('users')
        
        for user in auth_users.users:
            # Kullanıcı zaten Firestore'da var mı kontrol et
            user_doc = users_ref.document(user.uid)
            doc = user_doc.get()
            
            if not doc.exists:
                # Yeni kullanıcı - Firestore'a ekle
                user_data = {
                    "firebase_uid": user.uid,
                    "email": user.email,
                    "first_name": user.display_name.split()[0] if user.display_name else "",
                    "last_name": " ".join(user.display_name.split()[1:]) if user.display_name and len(user.display_name.split()) > 1 else "",
                    "target_profession": "",  # Boş bırak, kullanıcı doldursun
                    "department": "",  # Boş bırak, kullanıcı doldursun
                    "grade": "",  # Boş bırak, kullanıcı doldursun
                    "created_at": datetime.fromtimestamp(user.user_metadata.creation_timestamp / 1000),
                    "last_login": datetime.fromtimestamp(user.user_metadata.last_sign_in_timestamp / 1000) if user.user_metadata.last_sign_in_timestamp else datetime.now(),
                    "is_active": not user.disabled,
                    "email_verified": user.email_verified
                }
                
                user_doc.set(user_data)
                print(f"✅ Yeni kullanıcı eklendi: {user.email}")
            else:
                # Mevcut kullanıcı - bilgileri güncelle
                existing_data = doc.to_dict()
                update_data = {
                    "last_login": datetime.fromtimestamp(user.user_metadata.last_sign_in_timestamp / 1000) if user.user_metadata.last_sign_in_timestamp else existing_data.get("last_login"),
                    "is_active": not user.disabled,
                    "email_verified": user.email_verified
                }
                
                user_doc.update(update_data)
                print(f"🔄 Kullanıcı güncellendi: {user.email}")
        
        print(f"✅ Toplam {len(auth_users.users)} kullanıcı senkronize edildi!")
        
    except Exception as e:
        print(f"❌ Senkronizasyon hatası: {e}")

def create_user_profile_template(db, user_uid):
    """Yeni kullanıcı için profil şablonu oluştur"""
    print(f"\n📝 Kullanıcı {user_uid} için profil şablonu oluşturuluyor...")
    
    try:
        # Kullanıcı alt koleksiyonları
        user_ref = db.collection('users').document(user_uid)
        
        # Daily Data
        daily_data = {
            "study_hours": 0.0,
            "total_questions": 0,
            "date": datetime.now().date().isoformat(),
            "created_at": datetime.now()
        }
        user_ref.collection('daily_data').add(daily_data)
        
        # Weak Topics
        weak_topics = []
        user_ref.collection('weak_topics').add(weak_topics)
        
        # Study Plans
        study_plans = []
        user_ref.collection('study_plans').add(study_plans)
        
        # Flashcards
        flashcards = []
        user_ref.collection('flashcards').add(flashcards)
        
        print(f"✅ Kullanıcı {user_uid} için profil şablonu oluşturuldu!")
        
    except Exception as e:
        print(f"❌ Profil şablonu oluşturma hatası: {e}")

def get_user_by_email(db, email):
    """Email ile kullanıcı bul"""
    try:
        users_ref = db.collection('users')
        query = users_ref.where('email', '==', email).limit(1)
        docs = query.stream()
        
        for doc in docs:
            return doc.to_dict()
        
        return None
    except Exception as e:
        print(f"❌ Kullanıcı arama hatası: {e}")
        return None

def update_user_profile(db, user_uid, profile_data):
    """Kullanıcı profilini güncelle"""
    try:
        user_ref = db.collection('users').document(user_uid)
        user_ref.update(profile_data)
        print(f"✅ Kullanıcı {user_uid} profili güncellendi!")
    except Exception as e:
        print(f"❌ Profil güncelleme hatası: {e}")

def main():
    """Ana fonksiyon"""
    print("🔄 Firebase Auth - Firestore Senkronizasyon")
    print("=" * 50)
    
    # Firebase'i başlat
    db = initialize_firebase()
    if not db:
        return
    
    try:
        # Auth kullanıcılarını Firestore'a senkronize et
        sync_auth_users_to_firestore(db)
        
        print("\n🎉 Senkronizasyon tamamlandı!")
        print("\n📋 Kullanım Örnekleri:")
        print("1. Yeni kullanıcı kaydolduğunda otomatik Firestore'a eklenir")
        print("2. Kullanıcı giriş yaptığında last_login güncellenir")
        print("3. Profil bilgileri güncellenebilir")
        
    except Exception as e:
        print(f"❌ Ana işlem hatası: {e}")

if __name__ == "__main__":
    main() 