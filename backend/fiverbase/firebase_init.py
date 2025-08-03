import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials

load_dotenv()  # .env dosyasını yükle

key_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY_PATH')

if not key_path:
    raise Exception("FIREBASE_SERVICE_ACCOUNT_KEY_PATH environment variable is not set")

cred = credentials.Certificate(key_path)
firebase_admin.initialize_app(cred)

print("Firebase initialized successfully.")
