from django.contrib import admin
from .models import QuickSolution

@admin.register(QuickSolution)
class QuickSolutionAdmin(admin.ModelAdmin):
    list_display = ('user', 'konu', 'ders', 'is_processed', 'created_at')
    list_filter = ('ders', 'is_processed', 'created_at')
    search_fields = ('user__first_name', 'user__last_name', 'konu', 'ders')
    readonly_fields = ('created_at', 'processed_at')
    
    fieldsets = (
        ('Kullanıcı Bilgileri', {
            'fields': ('user',)
        }),
        ('Soru Bilgileri', {
            'fields': ('konu', 'ders', 'mesaj', 'fotograf')
        }),
        ('AI Sonuçları', {
            'fields': ('vision_text', 'gemini_response', 'is_processed', 'processed_at'),
            'classes': ('collapse',)
        }),
        ('Zaman Bilgileri', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    ) 