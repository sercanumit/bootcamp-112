from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .analysis_service import ComprehensiveAnalyzer
from users.models import User

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_subject_topic_analysis(request):
    """Belirli bir dersin konu bazlı analizi"""
    try:
        # Kullanıcıyı al
        user = request.user
        
        # Subject code parametresini al
        subject_code = request.GET.get('subject_code')
        if not subject_code:
            return Response({
                'success': False,
                'message': 'Subject code parametresi gerekli'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Analiz servisini başlat
        analyzer = ComprehensiveAnalyzer(user)
        
        # Konu analizini al
        analysis_result = analyzer.get_subject_topic_analysis(subject_code)
        
        if 'error' in analysis_result:
            return Response({
                'success': False,
                'message': analysis_result['error']
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': True,
            'data': analysis_result
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Analiz hatası: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_comprehensive_analysis(request):
    """Kapsamlı analiz raporu"""
    try:
        # Kullanıcıyı al
        user = request.user
        
        # Analiz servisini başlat
        analyzer = ComprehensiveAnalyzer(user)
        
        # Kapsamlı analizi al
        analysis_result = analyzer.get_comprehensive_analysis()
        
        return Response({
            'success': True,
            'data': analysis_result
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Analiz hatası: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 