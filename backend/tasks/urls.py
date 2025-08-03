from django.urls import path
from . import views

urlpatterns = [
    path('daily-tasks/', views.get_daily_tasks, name='get_daily_tasks'),
    path('daily-tasks/by-date/', views.get_tasks_by_date, name='get_tasks_by_date'),
    path('daily-tasks/<int:task_id>/', views.get_task_detail, name='get_task_detail'),
    path('daily-tasks/create/', views.create_daily_task, name='create_daily_task'),
    path('daily-tasks/<int:task_id>/update/', views.update_daily_task, name='update_daily_task'),
    path('daily-tasks/<int:task_id>/delete/', views.delete_daily_task, name='delete_daily_task'),
] 