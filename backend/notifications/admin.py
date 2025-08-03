from django.contrib import admin
from .models import Notification, NotificationSettings


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'firebase_uid', 'notification_type', 'title', 'priority', 'is_read', 'created_at']
    list_filter = ['notification_type', 'priority', 'is_read', 'created_at']
    search_fields = ['firebase_uid', 'title', 'message']
    readonly_fields = ['created_at', 'read_at']
    list_per_page = 50
    
    fieldsets = (
        ('Temel Bilgiler', {
            'fields': ('firebase_uid', 'notification_type', 'title', 'message', 'data')
        }),
        ('Durum', {
            'fields': ('priority', 'is_read', 'read_at')
        }),
        ('Zaman', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        ('Bildirim Bilgileri', {
            'fields': ('firebase_uid', 'notification_type', 'title', 'message', 'data', 'priority')
        }),
    )
    
    actions = ['mark_as_read', 'mark_as_unread', 'delete_selected']
    
    def mark_as_read(self, request, queryset):
        updated = queryset.update(is_read=True)
        self.message_user(request, f'{updated} bildirim okundu olarak işaretlendi.')
    mark_as_read.short_description = "Seçili bildirimleri okundu olarak işaretle"
    
    def mark_as_unread(self, request, queryset):
        updated = queryset.update(is_read=False)
        self.message_user(request, f'{updated} bildirim okunmadı olarak işaretlendi.')
    mark_as_unread.short_description = "Seçili bildirimleri okunmadı olarak işaretle"


@admin.register(NotificationSettings)
class NotificationSettingsAdmin(admin.ModelAdmin):
    list_display = ['firebase_uid', 'push_enabled', 'email_enabled', 'daily_reminders', 'weekly_reports']
    list_filter = ['push_enabled', 'email_enabled', 'daily_reminders', 'weekly_reports']
    search_fields = ['firebase_uid']
    
    fieldsets = (
        ('Kullanıcı', {
            'fields': ('firebase_uid',)
        }),
        ('Bildirim Türleri', {
            'fields': ('push_enabled', 'email_enabled', 'daily_reminders', 'weekly_reports', 'achievement_notifications', 'study_reminders', 'exam_reminders')
        }),
    )

