"""
URL configuration for yon_backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from yon_backend.authentication import require_firebase_auth, get_current_user

def test_endpoint(request):
    """Test endpoint - Firebase auth olmadan"""
    return JsonResponse({
        'message': 'Test endpoint çalışıyor!',
        'firebase_user': getattr(request, 'firebase_user', None),
        'user_uid': getattr(request, 'user_uid', None)
    })

@require_firebase_auth
def protected_endpoint(request):
    """Korumalı endpoint - Firebase auth gerekli"""
    user = get_current_user(request)
    return JsonResponse({
        'message': 'Korumalı endpoint çalışıyor!',
        'user': user,
        'user_uid': get_user_uid(request)
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Test endpoints
    path('api/test/', test_endpoint, name='test'),
    path('api/protected/', protected_endpoint, name='protected'),
    
    # API v1
    path('api/v1/auth/', include('users.urls')),
    path('api/v1/exams/', include('exams.urls')),
    path('api/v1/flashcards/', include('flashcards.urls')),
    path('api/v1/coaching/', include('coaching.urls')),
    path('api/v1/questions/', include('questions.urls')),
    path('api/v1/tasks/', include('tasks.urls')),
    path('api/v1/notifications/', include('notifications.urls')),
    path('api/v1/quick-solutions/', include('quick_solutions.urls')),
    path('api/v1/analytics/', include('analytics.urls')),
    path('api/v1/mindmaps/', include('mindmaps.urls')),
]
