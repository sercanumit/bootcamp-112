# users/authentication.py
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from firebase_admin import auth
from django.contrib.auth import get_user_model

class FirebaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        id_token = auth_header.split(' ')[1]

        try:
            decoded = auth.verify_id_token(id_token)
            uid = decoded['uid']
            email = decoded.get('email')

            User = get_user_model()
            user, _ = User.objects.get_or_create(firebase_uid=uid, defaults={
                'username': email.split('@')[0] if email else uid,
                'email': email,
            })
            return (user, None)
        except Exception as e:
            raise AuthenticationFailed('Token doğrulanamadı: ' + str(e))
