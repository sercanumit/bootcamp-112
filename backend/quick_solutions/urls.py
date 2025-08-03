from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_quick_solution, name='create-quick-solution'),
    path('list/', views.get_quick_solutions, name='get-quick-solutions'),
    path('detail/<int:solution_id>/', views.get_quick_solution_detail, name='get-quick-solution-detail'),
] 