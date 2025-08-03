from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom User Admin Panel
    """
    list_display = ('email', 'username', 'first_name', 'last_name', 'yas', 'cinsiyet', 'bolum', 'is_staff', 'is_active', 'created_at')
    list_filter = ('bolum', 'cinsiyet', 'is_staff', 'is_active', 'created_at')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-created_at',)
    
    # Fieldsets for detailed view
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Öğrenci Bilgileri', {
            'fields': ('hedef_meslek', 'bolum', 'yas', 'cinsiyet', 'dogum_tarihi')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    # Add form
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Öğrenci Bilgileri', {
            'fields': ('email', 'first_name', 'last_name', 'hedef_meslek', 'bolum', 'yas', 'cinsiyet', 'dogum_tarihi')
        }),
    )
