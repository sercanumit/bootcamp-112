from django.contrib import admin
from .models import MindMap, MindMapNode, MindMapConnection

@admin.register(MindMap)
class MindMapAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'main_topic', 'created_at', 'is_active']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'main_topic', 'user__username']

@admin.register(MindMapNode)
class MindMapNodeAdmin(admin.ModelAdmin):
    list_display = ['label', 'mind_map', 'level', 'icon', 'created_at']
    list_filter = ['level', 'created_at']
    search_fields = ['label', 'mind_map__title']

@admin.register(MindMapConnection)
class MindMapConnectionAdmin(admin.ModelAdmin):
    list_display = ['source_node', 'target_node', 'connection_type', 'created_at']
    list_filter = ['connection_type', 'created_at'] 