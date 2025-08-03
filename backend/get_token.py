import requests

API_KEY = "AIzaSyDNSe4iKEx5_O0ULLuwSabuMbPAppC-gIw"  # Doğrudan config'ten aldık
email = "tesst123@gmail.com"
password = "123456"  # Firebase Console'da oluşturduğun kullanıcıya ait

url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={API_KEY}"
payload = {
    "email": email,
    "password": password,
    "returnSecureToken": True
}

res = requests.post(url, json=payload)
token_data = res.json()

if "idToken" in token_data:
    print("✅ ID Token:", token_data["idToken"])
else:
    print("❌ Token alınamadı:", token_data)

# Ek hata detayları
print("Status:", res.status_code)
print("Raw Response:", res.text)
