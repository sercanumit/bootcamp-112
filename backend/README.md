# 🎯 YÖN Backend - Sınav Hazırlık Platformu

Django REST Framework ile geliştirilmiş modern sınav hazırlık sistemi backend'i.

## 🏗️ **Proje Yapısı**

```
Yon_backend/
├── users/           → Kullanıcı yönetimi ve JWT authentication
├── exams/          → TYT/AYT sınav sistemi (hiyerarşik konu yapısı)
├── flashcards/     → Hafıza kartları sistemi  
├── coaching/       → Performans analizi ve koçluk önerileri
└── yon_backend/    → Proje konfigürasyonu
```

## 🔥 **Özellikler**

### ✅ **Kullanıcı Sistemi**
- JWT tabanlı authentication
- Email ile giriş
- Kullanıcı profil yönetimi
- Şifre değiştirme

### ✅ **Hiyerarşik Sınav Sistemi**
- **Kategoriler:** TYT, AYT, Dil, MSÜ
- **Dersler:** Matematik, Fizik, Kimya, Türkçe...
- **Konular:** Tree yapısında (Ana Konu → Alt Konu → Alt-Alt Konu)
- **Sorular:** Çoktan seçmeli, zorluk seviyeli

### ✅ **Veri Modeli**
```
ExamCategory (TYT/AYT) 
    ↓
Subject (Matematik/Fizik)
    ↓  
Topic (Self-referencing tree)
    ↓
Question (Sorular)
```

### ✅ **Yüklenen Veriler**
- **Fizik TYT:** 67 konu (10 ana başlık altında)
- **Fizik AYT:** 27 konu (3 ana başlık altında)  
- **Matematik TYT:** 17 konu (4 ana başlık altında)

## 🚀 **Kurulum**

### 1. **Gereksinimler**
```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers
```

### 2. **Veritabanı Kurulumu**
```bash
python manage.py migrate
python manage.py load_topics    # Konuları yükle
python manage.py createsuperuser
```

### 3. **Geliştirme Sunucusu**
```bash
python manage.py runserver
```

## 📊 **API Endpoint'leri**

### **🔐 Authentication**
```bash
POST   /api/v1/auth/register/         # Kullanıcı kaydı
POST   /api/v1/auth/login/            # JWT token alma
POST   /api/v1/auth/refresh/          # Token yenileme
GET    /api/v1/auth/profile/          # Profil görüntüleme
PUT    /api/v1/auth/profile/          # Profil güncelleme
PUT    /api/v1/auth/change-password/  # Şifre değiştirme
```

### **📚 Sınav Sistemi**
```bash
# Kategoriler
GET    /api/v1/exams/categories/                    # TYT, AYT listesi
GET    /api/v1/exams/categories/{id}/subjects/      # Kategorinin dersleri

# Dersler  
GET    /api/v1/exams/subjects/?category_type=tyt    # TYT dersleri
GET    /api/v1/exams/subjects/{id}/topics_tree/     # Dersin konuları (tree)
GET    /api/v1/exams/subjects/{id}/topics_flat/     # Dersin konuları (düz)

# Konular (Hiyerarşik)
GET    /api/v1/exams/topics/tree/                   # Tüm konular (tree)
GET    /api/v1/exams/topics/?subject=1&level=0      # Filtrelenmiş konular
GET    /api/v1/exams/topics/{id}/children/          # Alt konular
GET    /api/v1/exams/topics/{id}/questions/         # Konunun soruları

# Sorular
GET    /api/v1/exams/questions/                     # Tüm sorular
GET    /api/v1/exams/questions/random/?count=10     # Rastgele sınav
GET    /api/v1/exams/questions/?topic=1&difficulty=medium
```

## 🧪 **API Test**

### **1. Kullanıcı Kaydı**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123", 
    "password_confirm": "testpass123",
    "first_name": "Test",
    "last_name": "User",
    "bolum": "sayisal"
  }'
```

### **2. Login ve Token Alma**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

### **3. Authenticated API Çağrısı**
```bash
curl -X GET http://127.0.0.1:8000/api/v1/exams/categories/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🌐 **Browsable API**

Django REST Framework'ün web UI'ı:
- **API Root:** http://127.0.0.1:8000/api/v1/
- **Admin Panel:** http://127.0.0.1:8000/admin/
- **Session Login:** http://127.0.0.1:8000/api-auth/login/

## 🎯 **Django'nun Hiyerarşik Yaklaşımı**

### **Self-Referencing Model**
```python
class Topic(models.Model):
    parent_topic = models.ForeignKey('self', null=True, blank=True)
    level = models.IntegerField(default=0)  # 0=Ana, 1=Alt, 2=Alt-Alt
    full_path = models.CharField(max_length=500)  # "Fizik > Hareket > Newton"
```

### **Tree Navigation**
```python
def get_children(self):        # Alt konuları getir
def get_all_descendants():    # Tüm alt dalları recursive
def is_leaf():                # Son dal mı?
```

### **Örnek Hiyerarşi**
```
TYT → Fizik → FİZİK BİLİMİNE GİRİŞ
                ├── Fiziğin Tanımı ve Özellikleri  
                ├── Fiziğin Alt Dalları
                └── Fiziksel Niceliklerin Sınıflandırılması
        
        → HAREKET VE KUVVET  
                ├── Hareket
                ├── Kuvvet
                └── Newton'un Hareket Yasaları
```

## 🔧 **Django Sektör Standartları**

### **✅ Uygulanan Özellikler:**
- **App-based architecture** (users, exams, flashcards, coaching)
- **Django REST Framework** ViewSet'leri
- **JWT Authentication** (Simple JWT)
- **Self-referencing models** (Tree yapısı)
- **Management commands** (load_topics)
- **Custom User model** (AbstractUser)
- **Admin panel customization**
- **Browsable API**
- **CORS headers** (React Native için)

### **📊 Performans Optimizasyonları:**
- **select_related()** ve **prefetch_related()** 
- **Database indexing**
- **Pagination** (20 item/sayfa)
- **Optimized queryset'ler**

## 📱 **Frontend Entegrasyon**

React Native için hazır JSON API:

```javascript
// Kategorileri getir
const categories = await fetch('/api/v1/exams/categories/', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Konuları tree yapısında getir  
const topics = await fetch('/api/v1/exams/subjects/1/topics_tree/', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Rastgele sınav oluştur
const exam = await fetch('/api/v1/exams/questions/random/?count=20', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## 🎉 **Sonuç**

✅ **Tamamlanan:** Hiyerarşik sınav sistemi, user authentication, API endpoints
🔄 **Devam Edecek:** Flashcards view'ları, coaching analytics, soru ekleme sistem

**Django'nun doğal yaklaşımı** ile modern, ölçeklenebilir bir backend hazır! 🚀 