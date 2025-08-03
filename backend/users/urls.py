# users/urls.py
from django.urls import path
from .views import (
    firebase_login, 
    get_user_profile, 
    save_user_profile,
    save_daily_data, 
    save_daily_goals, 
    get_daily_data, 
    reset_daily_data
)

urlpatterns = [
    # Firebase Authentication
    path('firebase-login/', firebase_login, name='firebase-login'),
    
    # User Profile
    path('profile/', get_user_profile, name='user-profile'),
    path('profile/update/', save_user_profile, name='save-user-profile'),
    
    # Daily Data Management
    path('daily-data/', get_daily_data, name='get-daily-data'),
    path('daily-data/save/', save_daily_data, name='save-daily-data'),
    path('daily-goals/save/', save_daily_goals, name='save-daily-goals'),
    path('daily-data/reset/', reset_daily_data, name='reset-daily-data'),
]
