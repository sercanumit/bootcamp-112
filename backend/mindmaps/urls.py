from django.urls import path
from . import views

urlpatterns = [
    path('create-from-speech/', views.create_mindmap_from_speech, name='create_mindmap_from_speech'),
    path('user-mindmaps/', views.get_user_mindmaps, name='get_user_mindmaps'),
    path('mindmap/<int:mindmap_id>/', views.get_mindmap_detail, name='get_mindmap_detail'),
    path('mindmap/<int:mindmap_id>/expand-node/', views.expand_mindmap_node, name='expand_mindmap_node'),
] 