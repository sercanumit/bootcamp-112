from rest_framework import serializers
from .models import QuickSolution

class QuickSolutionSerializer(serializers.ModelSerializer):
    """
    Hızlı çözüm için serializer
    """
    user_name = serializers.CharField(source='user.first_name', read_only=True)
    
    class Meta:
        model = QuickSolution
        fields = [
            'id', 'user', 'user_name', 'konu', 'ders', 'mesaj', 'fotograf',
            'vision_text', 'gemini_response', 'is_processed', 'created_at', 'processed_at'
        ]
        read_only_fields = ['vision_text', 'gemini_response', 'is_processed', 'processed_at']

class QuickSolutionCreateSerializer(serializers.ModelSerializer):
    """
    Hızlı çözüm oluşturma için serializer
    """
    class Meta:
        model = QuickSolution
        fields = ['konu', 'ders', 'mesaj', 'fotograf']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data) 