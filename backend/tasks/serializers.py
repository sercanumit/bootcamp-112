from rest_framework import serializers
from .models import DailyTask

class DailyTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyTask
        fields = [
            'id',
            'title',
            'description',
            'task_type',
            'priority',
            'estimated_duration',
            'actual_duration',
            'is_completed',
            'completed_at',
            'subject',
            'topic',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Progress percentage'ı hesapla
        data['progress_percentage'] = instance.get_progress_percentage()
        return data 