"""
API Test Senaryoları - Manuel Test için
Bu dosyayı çalıştırmayın, sadece endpoint'leri test etmek için referans
"""

import requests
import json

# Base URL
BASE_URL = "http://192.168.56.1:8000/api/v1"

# 1. Kullanıcı Kaydı
register_data = {
    "username": "testuser",
    "email": "test@example.com", 
    "password": "testpass123",
    "password_confirm": "testpass123",
    "first_name": "Test",
    "last_name": "User",
    "bolum": "sayisal",
    "hedef_meslek": "Mühendis"
}

# POST /api/v1/auth/register/
print("1. Kullanıcı Kaydı:")
print(f"POST {BASE_URL}/auth/register/")
print(f"Data: {json.dumps(register_data, indent=2)}")
print()

# 2. Login (JWT Token Al)
login_data = {
    "email": "test@example.com",
    "password": "testpass123"
}

# POST /api/v1/auth/login/
print("2. Login:")
print(f"POST {BASE_URL}/auth/login/")
print(f"Data: {json.dumps(login_data, indent=2)}")
print("Response: JWT access_token ve refresh_token")
print()

# 3. Kategorileri Getir (TYT, AYT)
print("3. Sınav Kategorileri:")
print(f"GET {BASE_URL}/exams/categories/")
print("Headers: Authorization: Bearer <access_token>")
print()

# 4. TYT Derslerini Getir
print("4. TYT Dersleri:")
print(f"GET {BASE_URL}/exams/subjects/?category_type=tyt")
print()

# 5. Fizik Konularını Tree Yapısında Getir
print("5. Fizik Konuları (Tree):")
print(f"GET {BASE_URL}/exams/subjects/1/topics_tree/")
print()

# 6. Tüm Konuları Düz Liste Olarak Getir
print("6. Tüm Konular (Tree Global):")
print(f"GET {BASE_URL}/exams/topics/tree/")
print()

# 7. Belirli Konunun Sorularını Getir
print("7. Konu Soruları:")
print(f"GET {BASE_URL}/exams/topics/1/questions/")
print()

# 8. Rastgele Sınav Soruları
print("8. Rastgele Sınav:")
print(f"GET {BASE_URL}/exams/questions/random/?count=5&topics=1,2,3")
print()

# 9. Kullanıcı Profili
print("9. Kullanıcı Profili:")
print(f"GET {BASE_URL}/auth/profile/")
print()

print("=" * 50)
print("🧪 API TEST KOMUTLARI (Postman/curl için):")
print("=" * 50)

curl_commands = [
    # Register
    f"""curl -X POST {BASE_URL}/auth/register/ \\
  -H "Content-Type: application/json" \\
  -d '{json.dumps(register_data)}'""",
    
    # Login
    f"""curl -X POST {BASE_URL}/auth/login/ \\
  -H "Content-Type: application/json" \\
  -d '{json.dumps(login_data)}'""",
    
    # Categories (with token)
    f"""curl -X GET {BASE_URL}/exams/categories/ \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" """,
    
    # Topics Tree
    f"""curl -X GET {BASE_URL}/exams/topics/tree/ \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" """
]

for i, cmd in enumerate(curl_commands, 1):
    print(f"\n{i}. {cmd}\n")

print("=" * 50)
print("🎯 FRONTEND TEST ENDPOINT'LERİ:")
print("=" * 50)

endpoints = [
    f"GET {BASE_URL}/exams/categories/",
    f"GET {BASE_URL}/exams/subjects/?category_type=tyt",
    f"GET {BASE_URL}/exams/subjects/1/topics_tree/",
    f"GET {BASE_URL}/exams/topics/tree/",
    f"GET {BASE_URL}/exams/topics/1/questions/?exam_mode=true",
    f"GET {BASE_URL}/exams/questions/random/?count=10",
    f"GET {BASE_URL}/auth/profile/",
]

for endpoint in endpoints:
    print(endpoint)
print()
print("⚠️  Tüm endpoint'ler Authentication gerektirir (Login JWT token'i ile)") 