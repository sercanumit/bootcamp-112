#!/usr/bin/env python3
"""
YÖN App Firebase Database Setup Script
Bu script YÖN app için gerekli tüm Firestore koleksiyonlarını ve örnek verileri oluşturur.
"""

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta
import json
import os

# Firebase service account key dosyası
SERVICE_ACCOUNT_KEY_PATH = "yon_backend/firebase-service.json"

def initialize_firebase():
    """Firebase'i başlat"""
    try:
        # Service account key dosyası var mı kontrol et
        if os.path.exists(SERVICE_ACCOUNT_KEY_PATH):
            cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
            firebase_admin.initialize_app(cred)
        else:
            # Eğer key dosyası yoksa, environment variable kullan
            firebase_admin.initialize_app()
        
        print("✅ Firebase başarıyla başlatıldı!")
        return firestore.client()
    except Exception as e:
        print(f"❌ Firebase başlatma hatası: {e}")
        return None

def create_users_collection(db):
    """Users koleksiyonunu oluştur"""
    print("\n📝 Users koleksiyonu oluşturuluyor...")
    
    # Örnek kullanıcılar
    sample_users = [
        {
            "firebase_uid": "user_123",
            "email": "ahmet@gmail.com",
            "first_name": "Ahmet",
            "last_name": "Yılmaz",
            "target_profession": "Engineer",
            "department": "Computer Engineering",
            "grade": "12",  # 9, 10, 11, 12, graduate
            "created_at": datetime.now(),
            "last_login": datetime.now(),
            "is_active": True
        },
        {
            "firebase_uid": "user_456",
            "email": "ayse@gmail.com",
            "first_name": "Ayşe",
            "last_name": "Demir",
            "target_profession": "Doctor",
            "department": "Faculty of Medicine",
            "grade": "graduate",
            "created_at": datetime.now(),
            "last_login": datetime.now(),
            "is_active": True
        }
    ]
    
    users_ref = db.collection('users')
    
    for user_data in sample_users:
        try:
            # Kullanıcı dokümanını oluştur
            user_doc = users_ref.document(user_data['firebase_uid'])
            user_doc.set(user_data)
            print(f"✅ Kullanıcı oluşturuldu: {user_data['email']}")
            
        except Exception as e:
            print(f"❌ Kullanıcı oluşturma hatası: {e}")

def create_global_collections(db):
    """Global koleksiyonları oluştur"""
    print("\n🌍 Global koleksiyonlar oluşturuluyor...")
    
    # 1. Subjects (Dersler) - TYT/AYT ayrımı ile
    subjects = [
        # TYT Dersleri
        {"name": "TYT Türkçe", "code": "tyt_turkce", "exam_type": "TYT", "color": "#FF6B6B"},
        {"name": "TYT Matematik", "code": "tyt_matematik", "exam_type": "TYT", "color": "#4ECDC4"},
        {"name": "TYT Sosyal Bilgiler", "code": "tyt_sosyal", "exam_type": "TYT", "color": "#45B7D1"},
        {"name": "TYT Fen Bilgisi", "code": "tyt_fen", "exam_type": "TYT", "color": "#96CEB4"},
        
        # AYT Dersleri
        {"name": "AYT Matematik", "code": "ayt_matematik", "exam_type": "AYT", "color": "#4ECDC4"},
        {"name": "AYT Fizik", "code": "ayt_fizik", "exam_type": "AYT", "color": "#FF9F43"},
        {"name": "AYT Kimya", "code": "ayt_kimya", "exam_type": "AYT", "color": "#10AC84"},
        {"name": "AYT Biyoloji", "code": "ayt_biyoloji", "exam_type": "AYT", "color": "#54A0FF"},
        {"name": "AYT Edebiyat", "code": "ayt_edebiyat", "exam_type": "AYT", "color": "#FF6B6B"},
        {"name": "AYT Coğrafya", "code": "ayt_cografya", "exam_type": "AYT", "color": "#5F27CD"},
        {"name": "AYT Tarih", "code": "ayt_tarih", "exam_type": "AYT", "color": "#FF6348"},
        {"name": "AYT Felsefe", "code": "ayt_felsefe", "exam_type": "AYT", "color": "#2ED573"},
        
        # Geometri (TYT/AYT ortak)
        {"name": "Geometri", "code": "geometri", "exam_type": "TYT/AYT", "color": "#FFA502"}
    ]
    
    subjects_ref = db.collection('subjects')
    for subject in subjects:
        subjects_ref.add(subject)
    print("✅ Subjects oluşturuldu")
    
    # 2. Topics (Konular) - TYT konuları
    topics = [
        # TYT Türkçe Konuları (2026 güncel)
        {"name": "Sözcükte Anlam", "subject": "TYT Türkçe"},
        {"name": "Söz Yorumu", "subject": "TYT Türkçe"},
        {"name": "Deyim ve Atasözü", "subject": "TYT Türkçe"},
        {"name": "Cümlede Anlam", "subject": "TYT Türkçe"},
        {"name": "Paragraf", "subject": "TYT Türkçe"},
        {"name": "Paragrafta Anlatım Teknikleri", "subject": "TYT Türkçe"},
        {"name": "Paragrafta Düşünceyi Geliştirme Yolları", "subject": "TYT Türkçe"},
        {"name": "Paragrafta Yapı", "subject": "TYT Türkçe"},
        {"name": "Paragrafta Konu-Ana Düşünce", "subject": "TYT Türkçe"},
        {"name": "Paragrafta Yardımcı Düşünce", "subject": "TYT Türkçe"},
        {"name": "Ses Bilgisi", "subject": "TYT Türkçe"},
        {"name": "Yazım Kuralları", "subject": "TYT Türkçe"},
        {"name": "Noktalama İşaretleri", "subject": "TYT Türkçe"},
        {"name": "Sözcükte Yapı/Ekler", "subject": "TYT Türkçe"},
        {"name": "Sözcük Türleri", "subject": "TYT Türkçe"},
        {"name": "İsimler", "subject": "TYT Türkçe"},
        {"name": "Zamirler", "subject": "TYT Türkçe"},
        {"name": "Sıfatlar", "subject": "TYT Türkçe"},
        {"name": "Zarflar", "subject": "TYT Türkçe"},
        {"name": "Edat – Bağlaç – Ünlem", "subject": "TYT Türkçe"},
        {"name": "Fiiller", "subject": "TYT Türkçe"},
        {"name": "Fiilde Anlam (Kip-Kişi-Yapı)", "subject": "TYT Türkçe"},
        {"name": "Ek Fiil", "subject": "TYT Türkçe"},
        {"name": "Fiilimsi", "subject": "TYT Türkçe"},
        {"name": "Fiilde Çatı", "subject": "TYT Türkçe"},
        {"name": "Sözcük Grupları", "subject": "TYT Türkçe"},
        {"name": "Cümlenin Ögeleri", "subject": "TYT Türkçe"},
        {"name": "Cümle Türleri", "subject": "TYT Türkçe"},
        {"name": "Anlatım Bozukluğu", "subject": "TYT Türkçe"},
        
        # TYT Matematik Konuları (2026 güncel)
        {"name": "Temel Kavramlar", "subject": "TYT Matematik"},
        {"name": "Sayı Basamakları", "subject": "TYT Matematik"},
        {"name": "Bölme ve Bölünebilme", "subject": "TYT Matematik"},
        {"name": "EBOB – EKOK", "subject": "TYT Matematik"},
        {"name": "Rasyonel Sayılar", "subject": "TYT Matematik"},
        {"name": "Basit Eşitsizlikler", "subject": "TYT Matematik"},
        {"name": "Mutlak Değer", "subject": "TYT Matematik"},
        {"name": "Üslü Sayılar", "subject": "TYT Matematik"},
        {"name": "Köklü Sayılar", "subject": "TYT Matematik"},
        {"name": "Çarpanlara Ayırma", "subject": "TYT Matematik"},
        {"name": "Oran Orantı", "subject": "TYT Matematik"},
        {"name": "Denklem Çözme", "subject": "TYT Matematik"},
        {"name": "Problemler", "subject": "TYT Matematik"},
        {"name": "Sayı Problemleri", "subject": "TYT Matematik"},
        {"name": "Kesir Problemleri", "subject": "TYT Matematik"},
        {"name": "Yaş Problemleri", "subject": "TYT Matematik"},
        {"name": "Hareket Hız Problemleri", "subject": "TYT Matematik"},
        {"name": "İşçi Emek Problemleri", "subject": "TYT Matematik"},
        {"name": "Yüzde Problemleri", "subject": "TYT Matematik"},
        {"name": "Kar Zarar Problemleri", "subject": "TYT Matematik"},
        {"name": "Karışım Problemleri", "subject": "TYT Matematik"},
        {"name": "Grafik Problemleri", "subject": "TYT Matematik"},
        {"name": "Rutin Olmayan Problemleri", "subject": "TYT Matematik"},
        {"name": "Kümeler – Kartezyen Çarpım", "subject": "TYT Matematik"},
        {"name": "Mantık", "subject": "TYT Matematik"},
        {"name": "Fonskiyonlar", "subject": "TYT Matematik"},
        {"name": "Polinomlar", "subject": "TYT Matematik"},
        {"name": "2.Dereceden Denklemler", "subject": "TYT Matematik"},
        {"name": "Permütasyon ve Kombinasyon", "subject": "TYT Matematik"},
        {"name": "Olasılık", "subject": "TYT Matematik"},
        {"name": "Veri – İstatistik", "subject": "TYT Matematik"},
        
        # TYT Geometri Konuları (2026 güncel)
        {"name": "Temel Kavramlar", "subject": "Geometri"},
        {"name": "Doğruda Açılar", "subject": "Geometri"},
        {"name": "Üçgende Açılar", "subject": "Geometri"},
        {"name": "Özel Üçgenler", "subject": "Geometri"},
        {"name": "Dik Üçgen", "subject": "Geometri"},
        {"name": "İkizkenar Üçgen", "subject": "Geometri"},
        {"name": "Eşkenar Üçgen", "subject": "Geometri"},
        {"name": "Açıortay", "subject": "Geometri"},
        {"name": "Kenarortay", "subject": "Geometri"},
        {"name": "Eşlik ve Benzerlik", "subject": "Geometri"},
        {"name": "Üçgende Alan", "subject": "Geometri"},
        {"name": "Üçgende Benzerlik", "subject": "Geometri"},
        {"name": "Açı Kenar Bağıntıları", "subject": "Geometri"},
        {"name": "Çokgenler", "subject": "Geometri"},
        {"name": "Özel Dörtgenler", "subject": "Geometri"},
        {"name": "Dörtgenler", "subject": "Geometri"},
        {"name": "Deltoid", "subject": "Geometri"},
        {"name": "Paralelkenar", "subject": "Geometri"},
        {"name": "Eşkenar Dörtgen", "subject": "Geometri"},
        {"name": "Dikdörtgen", "subject": "Geometri"},
        {"name": "Kare", "subject": "Geometri"},
        {"name": "İkizkenar", "subject": "Geometri"},
        {"name": "Yamuk", "subject": "Geometri"},
        {"name": "Çember ve Daire", "subject": "Geometri"},
        {"name": "Çemberde Açı", "subject": "Geometri"},
        {"name": "Çemberde Uzunluk", "subject": "Geometri"},
        {"name": "Dairede Çevre ve Alan", "subject": "Geometri"},
        {"name": "Analitik Geometri", "subject": "Geometri"},
        {"name": "Noktanın Analitiği", "subject": "Geometri"},
        {"name": "Doğrunun Analitiği", "subject": "Geometri"},
        {"name": "Dönüşüm Geometrisi", "subject": "Geometri"},
        {"name": "Katı Cisimler", "subject": "Geometri"},
        {"name": "Prizmalar", "subject": "Geometri"},
        {"name": "Küp", "subject": "Geometri"},
        {"name": "Silindir", "subject": "Geometri"},
        {"name": "Piramit", "subject": "Geometri"},
        {"name": "Koni", "subject": "Geometri"},
        {"name": "Küre", "subject": "Geometri"},
        {"name": "Çemberin Analitiği", "subject": "Geometri"},
        
        # TYT Fizik Konuları (2026 güncel)
        {"name": "Fizik Bilimine Giriş", "subject": "TYT Fen Bilgisi"},
        {"name": "Madde ve Özellikleri", "subject": "TYT Fen Bilgisi"},
        {"name": "Sıvıların Kaldırma Kuvveti", "subject": "TYT Fen Bilgisi"},
        {"name": "Basınç", "subject": "TYT Fen Bilgisi"},
        {"name": "Isı, Sıcaklık ve Genleşme", "subject": "TYT Fen Bilgisi"},
        {"name": "Hareket ve Kuvvet", "subject": "TYT Fen Bilgisi"},
        {"name": "Dinamik", "subject": "TYT Fen Bilgisi"},
        {"name": "İş, Güç ve Enerji", "subject": "TYT Fen Bilgisi"},
        {"name": "Elektrik", "subject": "TYT Fen Bilgisi"},
        {"name": "Manyetizma", "subject": "TYT Fen Bilgisi"},
        {"name": "Dalgalar", "subject": "TYT Fen Bilgisi"},
        {"name": "Optik", "subject": "TYT Fen Bilgisi"},
        
        # TYT Kimya Konuları (2026 güncel)
        {"name": "Kimya Bilimi", "subject": "TYT Fen Bilgisi"},
        {"name": "Atom ve Periyodik Sistem", "subject": "TYT Fen Bilgisi"},
        {"name": "Kimyasal Türler Arası Etkileşimler", "subject": "TYT Fen Bilgisi"},
        {"name": "Maddenin Halleri", "subject": "TYT Fen Bilgisi"},
        {"name": "Doğa ve Kimya", "subject": "TYT Fen Bilgisi"},
        {"name": "Kimyanın Temel Kanunları", "subject": "TYT Fen Bilgisi"},
        {"name": "Kimyasal Hesaplamalar", "subject": "TYT Fen Bilgisi"},
        {"name": "Karışımlar", "subject": "TYT Fen Bilgisi"},
        {"name": "Asit, Baz ve Tuz", "subject": "TYT Fen Bilgisi"},
        {"name": "Kimya Her Yerde", "subject": "TYT Fen Bilgisi"},
        
        # TYT Biyoloji Konuları (2026 güncel)
        {"name": "Canlıların Ortak Özellikleri", "subject": "TYT Fen Bilgisi"},
        {"name": "Canlıların Temel Bileşenleri", "subject": "TYT Fen Bilgisi"},
        {"name": "Hücre ve Organelleri", "subject": "TYT Fen Bilgisi"},
        {"name": "Hücre Zarından Madde Geçişi", "subject": "TYT Fen Bilgisi"},
        {"name": "Canlıların Sınıflandırılması", "subject": "TYT Fen Bilgisi"},
        {"name": "Mitoz ve Eşeysiz Üreme", "subject": "TYT Fen Bilgisi"},
        {"name": "Mayoz ve Eşeyli Üreme", "subject": "TYT Fen Bilgisi"},
        {"name": "Kalıtım", "subject": "TYT Fen Bilgisi"},
        {"name": "Ekosistem Ekolojisi", "subject": "TYT Fen Bilgisi"},
        {"name": "Güncel Çevre Sorunları", "subject": "TYT Fen Bilgisi"},
        
        # TYT Tarih Konuları (2026 güncel)
        {"name": "Tarih ve Zaman", "subject": "TYT Sosyal Bilgiler"},
        {"name": "İnsanlığın İlk Dönemleri", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Orta Çağ'da Dünya", "subject": "TYT Sosyal Bilgiler"},
        {"name": "İlk ve Orta Çağlarda Türk Dünyası", "subject": "TYT Sosyal Bilgiler"},
        {"name": "İslam Medeniyetinin Doğuşu", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Türklerin İslamiyet'i Kabulü ve İlk Türk İslam Devletleri", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Yerleşme ve Devletleşme Sürecinde Selçuklu Türkiyesi", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Beylikten Devlete Osmanlı Siyaseti", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Devletleşme Sürecinde Savaşçılar ve Askerler", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Beylikten Devlete Osmanlı Medeniyeti", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Dünya Gücü Osmanlı", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Sultan ve Osmanlı Merkez Teşkilatı", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Klasik Çağda Osmanlı Toplum Düzeni", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Değişen Dünya Dengeleri Karşısında Osmanlı Siyaseti", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Değişim Çağında Avrupa ve Osmanlı", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Uluslararası İlişkilerde Denge Stratejisi (1774-1914)", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Devrimler Çağında Değişen Devlet-Toplum İlişkileri", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Sermaye ve Emek", "subject": "TYT Sosyal Bilgiler"},
        {"name": "XIX. ve XX. Yüzyılda Değişen Gündelik Hayat", "subject": "TYT Sosyal Bilgiler"},
        {"name": "XX. Yüzyıl Başlarında Osmanlı Devleti ve Dünya", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Milli Mücadele", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Atatürkçülük ve Türk İnkılabı", "subject": "TYT Sosyal Bilgiler"},
        
        # TYT Coğrafya Konuları (2026 güncel)
        {"name": "Doğa ve İnsan", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Dünya'nın Şekli ve Hareketleri", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Coğrafi Konum", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Harita Bilgisi", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Atmosfer ve Sıcaklık", "subject": "TYT Sosyal Bilgiler"},
        {"name": "İklimler", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Basınç ve Rüzgarlar", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Nem, Yağış ve Buharlaşma", "subject": "TYT Sosyal Bilgiler"},
        {"name": "İç Kuvvetler / Dış Kuvvetler", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Su – Toprak ve Bitkiler", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Nüfus", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Göç", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Yerleşme", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Türkiye'nin Yer Şekilleri", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Ekonomik Faaliyetler", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Bölgeler", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Uluslararası Ulaşım Hatları", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Çevre ve Toplum", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Doğal Afetler", "subject": "TYT Sosyal Bilgiler"},
        
        # TYT Felsefe Konuları (2026 güncel)
        {"name": "Felsefe'nin Konusu", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Bilgi Felsefesi", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Varlık Felsefesi", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Ahlak Felsefesi", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Sanat Felsefesi", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Din Felsefesi", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Siyaset Felsefesi", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Bilim Felsefesi", "subject": "TYT Sosyal Bilgiler"},
        {"name": "İlk Çağ Felsefesi", "subject": "TYT Sosyal Bilgiler"},
        {"name": "2. Yüzyıl ve 15. Yüzyıl Felsefeleri", "subject": "TYT Sosyal Bilgiler"},
        {"name": "15. Yüzyıl ve 17. Yüzyıl Felsefeleri", "subject": "TYT Sosyal Bilgiler"},
        {"name": "18. Yüzyıl ve 19. Yüzyıl Felsefeleri", "subject": "TYT Sosyal Bilgiler"},
        {"name": "20. Yüzyıl Felsefesi", "subject": "TYT Sosyal Bilgiler"},
        
        # TYT Din Kültürü Konuları (2026 güncel)
        {"name": "Bilgi ve İnanç", "subject": "TYT Sosyal Bilgiler"},
        {"name": "İslam ve İbadet", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Ahlak ve Değerler", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Allah İnsan İlişkisi", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Hz. Muhammed (S.A.V.)", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Vahiy ve Akıl", "subject": "TYT Sosyal Bilgiler"},
        {"name": "İslam Düşüncesinde Yorumlar, Mezhepler", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Din, Kültür ve Medeniyet", "subject": "TYT Sosyal Bilgiler"},
        {"name": "İslam ve Bilim, Estetik, Barış", "subject": "TYT Sosyal Bilgiler"},
        {"name": "Yaşayan Dinler", "subject": "TYT Sosyal Bilgiler"},
        
        # AYT Matematik Konuları (2026 güncel)
        {"name": "Temel Kavramlar", "subject": "AYT Matematik"},
        {"name": "Sayı Basamakları", "subject": "AYT Matematik"},
        {"name": "Bölme ve Bölünebilme", "subject": "AYT Matematik"},
        {"name": "EBOB - EKOK", "subject": "AYT Matematik"},
        {"name": "Rasyonel Sayılar", "subject": "AYT Matematik"},
        {"name": "Basit Eşitsizlikler", "subject": "AYT Matematik"},
        {"name": "Mutlak Değer", "subject": "AYT Matematik"},
        {"name": "Üslü Sayılar", "subject": "AYT Matematik"},
        {"name": "Köklü Sayılar", "subject": "AYT Matematik"},
        {"name": "Çarpanlara Ayırma", "subject": "AYT Matematik"},
        {"name": "Oran Orantı", "subject": "AYT Matematik"},
        {"name": "Denklem Çözme", "subject": "AYT Matematik"},
        {"name": "Problemler", "subject": "AYT Matematik"},
        {"name": "Kümeler", "subject": "AYT Matematik"},
        {"name": "Kartezyen Çarpım", "subject": "AYT Matematik"},
        {"name": "Mantık", "subject": "AYT Matematik"},
        {"name": "Fonskiyonlar", "subject": "AYT Matematik"},
        {"name": "Polinomlar", "subject": "AYT Matematik"},
        {"name": "2.Dereceden Denklemler", "subject": "AYT Matematik"},
        {"name": "Permütasyon ve Kombinasyon", "subject": "AYT Matematik"},
        {"name": "Binom ve Olasılık", "subject": "AYT Matematik"},
        {"name": "İstatistik", "subject": "AYT Matematik"},
        {"name": "Karmaşık Sayılar", "subject": "AYT Matematik"},
        {"name": "2.Dereceden Eşitsizlikler", "subject": "AYT Matematik"},
        {"name": "Parabol", "subject": "AYT Matematik"},
        {"name": "Trigonometri", "subject": "AYT Matematik"},
        {"name": "Logaritma", "subject": "AYT Matematik"},
        {"name": "Diziler", "subject": "AYT Matematik"},
        {"name": "Limit", "subject": "AYT Matematik"},
        {"name": "Türev", "subject": "AYT Matematik"},
        {"name": "İntegral", "subject": "AYT Matematik"},
        
        # AYT Edebiyat Konuları (2026 güncel)
        {"name": "Anlam Bilgisi", "subject": "AYT Edebiyat"},
        {"name": "Dil Bilgisi", "subject": "AYT Edebiyat"},
        {"name": "Güzel Sanatlar ve Edebiyat", "subject": "AYT Edebiyat"},
        {"name": "Metinlerin Sınıflandırılması", "subject": "AYT Edebiyat"},
        {"name": "Şiir Bilgisi", "subject": "AYT Edebiyat"},
        {"name": "Edebi Sanatlar", "subject": "AYT Edebiyat"},
        {"name": "Türk Edebiyatı Dönemleri", "subject": "AYT Edebiyat"},
        {"name": "İslamiyet Öncesi Türk Edebiyatı ve Geçiş Dönemi", "subject": "AYT Edebiyat"},
        {"name": "Halk Edebiyatı", "subject": "AYT Edebiyat"},
        {"name": "Divan Edebiyatı", "subject": "AYT Edebiyat"},
        {"name": "Tanzimat Edebiyatı", "subject": "AYT Edebiyat"},
        {"name": "Servet-i Fünun Edebiyatı", "subject": "AYT Edebiyat"},
        {"name": "Fecr-i Ati Edebiyatı", "subject": "AYT Edebiyat"},
        {"name": "Milli Edebiyat", "subject": "AYT Edebiyat"},
        {"name": "Cumhuriyet Dönemi Edebiyatı", "subject": "AYT Edebiyat"},
        {"name": "Edebiyat Akımları", "subject": "AYT Edebiyat"},
        {"name": "Dünya Edebiyatı", "subject": "AYT Edebiyat"},
        
        # AYT Fizik Konuları (2026 güncel)
        {"name": "Vektörler", "subject": "AYT Fizik"},
        {"name": "Kuvvet, Tork ve Denge", "subject": "AYT Fizik"},
        {"name": "Kütle Merkezi", "subject": "AYT Fizik"},
        {"name": "Basit Makineler", "subject": "AYT Fizik"},
        {"name": "Hareket", "subject": "AYT Fizik"},
        {"name": "Newton'un Hareket Yasaları", "subject": "AYT Fizik"},
        {"name": "İş, Güç ve Enerji II", "subject": "AYT Fizik"},
        {"name": "Atışlar", "subject": "AYT Fizik"},
        {"name": "İtme ve Momentum", "subject": "AYT Fizik"},
        {"name": "Elektrik Alan ve Potansiyel", "subject": "AYT Fizik"},
        {"name": "Paralel Levhalar ve Sığa", "subject": "AYT Fizik"},
        {"name": "Manyetik Alan ve Manyetik Kuvvet", "subject": "AYT Fizik"},
        {"name": "İndüksiyon, Alternatif Akım ve Transformatörler", "subject": "AYT Fizik"},
        {"name": "Çembersel Hareket", "subject": "AYT Fizik"},
        {"name": "Dönme, Yuvarlanma ve Açısal Momentum", "subject": "AYT Fizik"},
        {"name": "Kütle Çekim ve Kepler Yasaları", "subject": "AYT Fizik"},
        {"name": "Basit Harmonik Hareket", "subject": "AYT Fizik"},
        {"name": "Dalga Mekaniği ve Elektromanyetik Dalgalar", "subject": "AYT Fizik"},
        {"name": "Atom Modelleri", "subject": "AYT Fizik"},
        {"name": "Büyük Patlama ve Parçacık Fiziği", "subject": "AYT Fizik"},
        {"name": "Radyoaktivite", "subject": "AYT Fizik"},
        {"name": "Özel Görelilik", "subject": "AYT Fizik"},
        {"name": "Kara Cisim Işıması", "subject": "AYT Fizik"},
        {"name": "Fotoelektrik Olay ve Compton Olayı", "subject": "AYT Fizik"},
        {"name": "Modern Fiziğin Teknolojideki Uygulamaları", "subject": "AYT Fizik"},
        
        # AYT Kimya Konuları (2026 güncel)
        {"name": "Kimya Bilimi", "subject": "AYT Kimya"},
        {"name": "Atom ve Periyodik Sistem", "subject": "AYT Kimya"},
        {"name": "Kimyasal Türler Arası Etkileşimler", "subject": "AYT Kimya"},
        {"name": "Kimyasal Hesaplamalar", "subject": "AYT Kimya"},
        {"name": "Kimyanın Temel Kanunları", "subject": "AYT Kimya"},
        {"name": "Asit, Baz ve Tuz", "subject": "AYT Kimya"},
        {"name": "Maddenin Halleri", "subject": "AYT Kimya"},
        {"name": "Karışımlar", "subject": "AYT Kimya"},
        {"name": "Doğa ve Kimya", "subject": "AYT Kimya"},
        {"name": "Kimya Her Yerde", "subject": "AYT Kimya"},
        {"name": "Modern Atom Teorisi", "subject": "AYT Kimya"},
        {"name": "Gazlar", "subject": "AYT Kimya"},
        {"name": "Sıvı Çözeltiler", "subject": "AYT Kimya"},
        {"name": "Kimyasal Tepkimelerde Enerji", "subject": "AYT Kimya"},
        {"name": "Kimyasal Tepkimelerde Hız", "subject": "AYT Kimya"},
        {"name": "Kimyasal Tepkimelerde Denge", "subject": "AYT Kimya"},
        {"name": "Asit-Baz Dengesi", "subject": "AYT Kimya"},
        {"name": "Çözünürlük Dengesi", "subject": "AYT Kimya"},
        {"name": "Kimya ve Elektrik", "subject": "AYT Kimya"},
        {"name": "Organik Kimyaya Giriş", "subject": "AYT Kimya"},
        {"name": "Organik Kimya", "subject": "AYT Kimya"},
        {"name": "Enerji Kaynakları ve Bilimsel Gelişmeler", "subject": "AYT Kimya"},
        
        # AYT Biyoloji Konuları (2026 güncel)
        {"name": "Sinir Sistemi", "subject": "AYT Biyoloji"},
        {"name": "Endokrin Sistem ve Hormonlar", "subject": "AYT Biyoloji"},
        {"name": "Duyu Organları", "subject": "AYT Biyoloji"},
        {"name": "Destek ve Hareket Sistemi", "subject": "AYT Biyoloji"},
        {"name": "Sindirim Sistemi", "subject": "AYT Biyoloji"},
        {"name": "Dolaşım ve Bağışıklık Sistemi", "subject": "AYT Biyoloji"},
        {"name": "Solunum Sistemi", "subject": "AYT Biyoloji"},
        {"name": "Üriner Sistem (Boşaltım Sistemi)", "subject": "AYT Biyoloji"},
        {"name": "Üreme Sistemi ve Embriyonik Gelişim", "subject": "AYT Biyoloji"},
        {"name": "Komünite Ekolojisi", "subject": "AYT Biyoloji"},
        {"name": "Popülasyon Ekolojisi", "subject": "AYT Biyoloji"},
        {"name": "Genden Proteine", "subject": "AYT Biyoloji"},
        {"name": "Nükleik Asitler", "subject": "AYT Biyoloji"},
        {"name": "Genetik Şifre ve Protein Sentezi", "subject": "AYT Biyoloji"},
        {"name": "Canlılarda Enerji Dönüşümleri", "subject": "AYT Biyoloji"},
        {"name": "Canlılık ve Enerji", "subject": "AYT Biyoloji"},
        {"name": "Fotosentez", "subject": "AYT Biyoloji"},
        {"name": "Kemosentez", "subject": "AYT Biyoloji"},
        {"name": "Hücresel Solunum", "subject": "AYT Biyoloji"},
        {"name": "Bitki Biyolojisi", "subject": "AYT Biyoloji"},
        {"name": "Canlılar ve Çevre", "subject": "AYT Biyoloji"},
        
        # AYT Tarih Konuları (2026 güncel)
        {"name": "Tarih ve Zaman", "subject": "AYT Tarih"},
        {"name": "İnsanlığın İlk Dönemleri", "subject": "AYT Tarih"},
        {"name": "Orta Çağ'da Dünya", "subject": "AYT Tarih"},
        {"name": "İlk ve Orta Çağlarda Türk Dünyası", "subject": "AYT Tarih"},
        {"name": "İslam Medeniyetinin Doğuşu", "subject": "AYT Tarih"},
        {"name": "Türklerin İslamiyet'i Kabulü ve İlk Türk İslam Devletleri", "subject": "AYT Tarih"},
        {"name": "Yerleşme ve Devletleşme Sürecinde Selçuklu Türkiyesi", "subject": "AYT Tarih"},
        {"name": "Beylikten Devlete Osmanlı Siyaseti", "subject": "AYT Tarih"},
        {"name": "Devletleşme Sürecinde Savaşçılar ve Askerler", "subject": "AYT Tarih"},
        {"name": "Beylikten Devlete Osmanlı Medeniyeti", "subject": "AYT Tarih"},
        {"name": "Dünya Gücü Osmanlı", "subject": "AYT Tarih"},
        {"name": "Sultan ve Osmanlı Merkez Teşkilatı", "subject": "AYT Tarih"},
        {"name": "Klasik Çağda Osmanlı Toplum Düzeni", "subject": "AYT Tarih"},
        {"name": "Değişen Dünya Dengeleri Karşısında Osmanlı Siyaseti", "subject": "AYT Tarih"},
        {"name": "Değişim Çağında Avrupa ve Osmanlı", "subject": "AYT Tarih"},
        {"name": "Uluslararası İlişkilerde Denge Stratejisi (1774-1914)", "subject": "AYT Tarih"},
        {"name": "Devrimler Çağında Değişen Devlet-Toplum İlişkileri", "subject": "AYT Tarih"},
        {"name": "Sermaye ve Emek", "subject": "AYT Tarih"},
        {"name": "XIX. ve XX. Yüzyılda Değişen Gündelik Hayat", "subject": "AYT Tarih"},
        {"name": "XX. Yüzyıl Başlarında Osmanlı Devleti ve Dünya", "subject": "AYT Tarih"},
        {"name": "Milli Mücadele", "subject": "AYT Tarih"},
        {"name": "Atatürkçülük ve Türk İnkılabı", "subject": "AYT Tarih"},
        {"name": "İki Savaş Arasındaki Dönemde Türkiye ve Dünya", "subject": "AYT Tarih"},
        {"name": "II. Dünya Savaşı Sürecinde Türkiye ve Dünya", "subject": "AYT Tarih"},
        {"name": "II. Dünya Savaşı Sonrasında Türkiye ve Dünya", "subject": "AYT Tarih"},
        {"name": "Toplumsal Devrim Çağında Dünya ve Türkiye", "subject": "AYT Tarih"},
        {"name": "XXI. Yüzyılın Eşiğinde Türkiye ve Dünya", "subject": "AYT Tarih"},
        
        # AYT Coğrafya Konuları (2026 güncel)
        {"name": "Ekosistem", "subject": "AYT Coğrafya"},
        {"name": "Biyoçeşitlilik", "subject": "AYT Coğrafya"},
        {"name": "Biyomlar", "subject": "AYT Coğrafya"},
        {"name": "Ekosistemin Unsurları", "subject": "AYT Coğrafya"},
        {"name": "Enerji Akışı ve Madde Döngüsü", "subject": "AYT Coğrafya"},
        {"name": "Ekstrem Doğa Olayları", "subject": "AYT Coğrafya"},
        {"name": "Küresel İklim Değişimi", "subject": "AYT Coğrafya"},
        {"name": "Nüfus Politikaları", "subject": "AYT Coğrafya"},
        {"name": "Türkiye'de Nüfus ve Yerleşme", "subject": "AYT Coğrafya"},
        {"name": "Ekonomik Faaliyetler ve Doğal Kaynaklar", "subject": "AYT Coğrafya"},
        {"name": "Göç ve Şehirleşme", "subject": "AYT Coğrafya"},
        {"name": "Türkiye Ekonomisi", "subject": "AYT Coğrafya"},
        {"name": "Türkiye'nin Ekonomi Politikaları", "subject": "AYT Coğrafya"},
        {"name": "Türkiye Ekonomisinin Sektörel Dağılımı", "subject": "AYT Coğrafya"},
        {"name": "Türkiye'de Tarım", "subject": "AYT Coğrafya"},
        {"name": "Türkiye'de Hayvancılık", "subject": "AYT Coğrafya"},
        {"name": "Türkiye'de Madenler ve Enerji Kaynakları", "subject": "AYT Coğrafya"},
        {"name": "Türkiye'de Sanayi", "subject": "AYT Coğrafya"},
        {"name": "Türkiye'de Ulaşım", "subject": "AYT Coğrafya"},
        {"name": "Türkiye'de Ticaret ve Turizm", "subject": "AYT Coğrafya"},
        {"name": "Geçmişten Geleceğe Şehir ve Ekonomi", "subject": "AYT Coğrafya"},
        {"name": "Türkiye'nin İşlevsel Bölgeleri ve Kalkınma Projeleri", "subject": "AYT Coğrafya"},
        {"name": "Hizmet Sektörünün Ekonomideki Yeri", "subject": "AYT Coğrafya"},
        {"name": "Küresel Ticaret", "subject": "AYT Coğrafya"},
        {"name": "Bölgeler ve Ülkeler", "subject": "AYT Coğrafya"},
        {"name": "İlk Uygarlıklar", "subject": "AYT Coğrafya"},
        {"name": "Kültür Bölgeleri ve Türk Kültürü", "subject": "AYT Coğrafya"},
        {"name": "Sanayileşme Süreci: Almanya", "subject": "AYT Coğrafya"},
        {"name": "Tarım ve Ekonomi İlişkisi Fransa – Somali", "subject": "AYT Coğrafya"},
        {"name": "Ülkeler Arası Etkileşim", "subject": "AYT Coğrafya"},
        {"name": "Jeopolitik Konum", "subject": "AYT Coğrafya"},
        {"name": "Çatışma Bölgeleri", "subject": "AYT Coğrafya"},
        {"name": "Küresel ve Bölgesel Örgütler", "subject": "AYT Coğrafya"},
        {"name": "Çevre ve Toplum", "subject": "AYT Coğrafya"},
        {"name": "Çevre Sorunları ve Türleri", "subject": "AYT Coğrafya"},
        {"name": "Madenler ve Enerji Kaynaklarının Çevreye Etkisi", "subject": "AYT Coğrafya"},
        {"name": "Doğal Kaynakların Sürdürülebilir Kullanımı", "subject": "AYT Coğrafya"},
        {"name": "Ekolojik Ayak İzi", "subject": "AYT Coğrafya"},
        {"name": "Doğal Çevrenin Sınırlılığı", "subject": "AYT Coğrafya"},
        {"name": "Çevre Politikaları", "subject": "AYT Coğrafya"},
        {"name": "Çevresel Örgütler", "subject": "AYT Coğrafya"},
        {"name": "Çevre Anlaşmaları", "subject": "AYT Coğrafya"},
        {"name": "Doğal Afetler", "subject": "AYT Coğrafya"},
        
        # AYT Felsefe Konuları (2026 güncel)
        {"name": "Felsefe'nin Konusu", "subject": "AYT Felsefe"},
        {"name": "Bilgi Felsefesi", "subject": "AYT Felsefe"},
        {"name": "Varlık Felsefesi", "subject": "AYT Felsefe"},
        {"name": "Ahlak Felsefesi", "subject": "AYT Felsefe"},
        {"name": "Sanat Felsefesi", "subject": "AYT Felsefe"},
        {"name": "Din Felsefesi", "subject": "AYT Felsefe"},
        {"name": "Siyaset Felsefesi", "subject": "AYT Felsefe"},
        {"name": "Bilim Felsefesi", "subject": "AYT Felsefe"},
        {"name": "İlk Çağ Felsefesi", "subject": "AYT Felsefe"},
        {"name": "MÖ 6. Yüzyıl – MS 2. Yüzyıl Felsefesi", "subject": "AYT Felsefe"},
        {"name": "MS 2. Yüzyıl – MS 15. Yüzyıl Felsefesi", "subject": "AYT Felsefe"},
        {"name": "15. Yüzyıl – 17. Yüzyıl Felsefesi", "subject": "AYT Felsefe"},
        {"name": "18. Yüzyıl – 19. Yüzyıl Felsefesi", "subject": "AYT Felsefe"},
        {"name": "20. Yüzyıl Felsefesi", "subject": "AYT Felsefe"},
        {"name": "Mantığa Giriş", "subject": "AYT Felsefe"},
        {"name": "Klasik Mantık", "subject": "AYT Felsefe"},
        {"name": "Mantık ve Dil", "subject": "AYT Felsefe"},
        {"name": "Sembolik Mantık", "subject": "AYT Felsefe"},
        {"name": "Psikoloji Bilimini Tanıyalım", "subject": "AYT Felsefe"},
        {"name": "Psikolojinin Temel Süreçleri", "subject": "AYT Felsefe"},
        {"name": "Öğrenme Bellek Düşünme", "subject": "AYT Felsefe"},
        {"name": "Ruh Sağlığının Temelleri", "subject": "AYT Felsefe"},
        {"name": "Sosyolojiye Giriş", "subject": "AYT Felsefe"},
        {"name": "Birey ve Toplum", "subject": "AYT Felsefe"},
        {"name": "Toplumsal Yapı", "subject": "AYT Felsefe"},
        {"name": "Toplumsal Değişme ve Gelişme", "subject": "AYT Felsefe"},
        {"name": "Toplum ve Kültür", "subject": "AYT Felsefe"},
        {"name": "Toplumsal Kurumlar", "subject": "AYT Felsefe"},
    ]
    
    topics_ref = db.collection('topics')
    for topic in topics:
        topics_ref.add(topic)
    print("✅ TYT ve AYT Topics oluşturuldu")
    
    # 3. Questions (Sorular - örnek)
    questions = [
        {
            "question_text": "Aşağıdakilerden hangisi bir paragrafın ana fikri olabilir?",
            "options": ["A", "B", "C", "D", "E"],
            "correct_answer": "A",
            "explanation": "Ana fikir paragrafın temel mesajıdır.",
            "subject": "TYT Türkçe",
            "topic": "Paragrafta Konu-Ana Düşünce",
            "created_at": datetime.now()
        },
        {
            "question_text": "x² + 2x + 1 = 0 denkleminin çözümü nedir?",
            "options": ["x = -1", "x = 1", "x = 0", "x = 2", "x = -2"],
            "correct_answer": "A",
            "explanation": "Bu bir tam kare ifadedir: (x+1)² = 0",
            "subject": "TYT Matematik",
            "topic": "Denklem Çözme",
            "created_at": datetime.now()
        },
        {
            "question_text": "Fizikte 'kuvvet' birimi aşağıdakilerden hangisidir?",
            "options": ["Joule", "Newton", "Watt", "Pascal", "Volt"],
            "correct_answer": "B",
            "explanation": "Kuvvet birimi Newton'dur (N).",
            "subject": "TYT Fen Bilgisi",
            "topic": "Hareket ve Kuvvet",
            "created_at": datetime.now()
        },
        {
            "question_text": "Hangi element periyodik tabloda 'Fe' sembolü ile gösterilir?",
            "options": ["Flor", "Demir", "Fosfor", "Fermiyum", "Fransiyum"],
            "correct_answer": "B",
            "explanation": "Fe sembolü Demir elementini gösterir.",
            "subject": "TYT Fen Bilgisi",
            "topic": "Periyodik Sistem",
            "created_at": datetime.now()
        },
        {
            "question_text": "Türev nedir?",
            "options": ["Bir fonksiyonun belirli bir noktadaki değişim oranı", "Bir fonksiyonun alanı", "Bir fonksiyonun integrali", "Bir fonksiyonun limiti", "Bir fonksiyonun değeri"],
            "correct_answer": "A",
            "explanation": "Türev, bir fonksiyonun belirli bir noktadaki değişim oranıdır.",
            "subject": "AYT Matematik",
            "topic": "Türev",
            "created_at": datetime.now()
        },
        {
            "question_text": "Ohm Kanunu nedir?",
            "options": ["V = I × R", "P = V × I", "F = m × a", "E = mc²", "PV = nRT"],
            "correct_answer": "A",
            "explanation": "Ohm Kanunu: V = I × R (Gerilim = Akım × Direnç)",
            "subject": "AYT Fizik",
            "topic": "Elektrik Alan ve Potansiyel",
            "created_at": datetime.now()
        }
    ]
    
    questions_ref = db.collection('questions')
    for question in questions:
        questions_ref.add(question)
    print("✅ Questions oluşturuldu")

def main():
    """Ana fonksiyon"""
    print("🚀 YÖN App Firebase Database Setup")
    print("=" * 50)
    
    # Firebase'i başlat
    db = initialize_firebase()
    if not db:
        return
    
    try:
        # Global koleksiyonları oluştur
        create_global_collections(db)
        
        # Kullanıcı koleksiyonlarını oluştur
        create_users_collection(db)
        
        print("\n🎉 Firebase database başarıyla kuruldu!")
        print("\n📋 Oluşturulan Koleksiyonlar:")
        print("├── users/")
        print("├── subjects/")
        print("└── topics/")
        
        print("\n🔗 Firebase Console: https://console.firebase.google.com/project/directionapp-ec3b6/firestore")
        
    except Exception as e:
        print(f"❌ Database kurulum hatası: {e}")

if __name__ == "__main__":
    main() 