from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from .models import MindMap, MindMapNode, MindMapConnection
from .gemini_service import MindMapGeminiService
import json

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_mindmap_from_speech(request):
    """Ses kaydından zihin haritası oluştur"""
    try:
        speech_text = request.data.get('speech_text')
        if not speech_text:
            return Response({
                'success': False,
                'message': 'Ses kaydı metni gerekli'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Gemini ile analiz
        gemini_service = MindMapGeminiService()
        analysis_result = gemini_service.analyze_speech_for_mindmap(speech_text)
        
        # Zihin haritasını oluştur
        mind_map = MindMap.objects.create(
            user=request.user,
            title=analysis_result.get('title', 'Yeni Zihin Haritası'),
            main_topic=analysis_result.get('main_topic', 'Ana Konu'),
            description=analysis_result.get('description', '')
        )
        
        # Ana düğümü oluştur
        main_node = MindMapNode.objects.create(
            mind_map=mind_map,
            label=analysis_result.get('main_topic', 'Ana Konu'),
            icon='🧠',
            color='#2196F3',
            level=0,
            position_x=0,
            position_y=0
        )
        
        # Alt düğümleri oluştur
        nodes_data = analysis_result.get('nodes', [])
        print(f"DEBUG: {len(nodes_data)} alt düğüm bulundu")
        
        for i, node_data in enumerate(nodes_data):
            print(f"DEBUG: Düğüm {i+1} oluşturuluyor: {node_data}")
            node = MindMapNode.objects.create(
                mind_map=mind_map,
                label=node_data.get('label', f'Alt Konu {i+1}'),
                icon=node_data.get('icon', '📝'),
                color=node_data.get('color', '#4CAF50'),
                level=node_data.get('level', 1),
                notes=node_data.get('notes', ''),
                parent=main_node,
                position_x=(i + 1) * 200,
                position_y=100
            )
            print(f"DEBUG: Düğüm oluşturuldu: {node.label} (ID: {node.id})")
        
        # Bağlantıları oluştur
        connections_data = analysis_result.get('connections', [])
        print(f"DEBUG: {len(connections_data)} bağlantı bulundu")
        
        for conn_data in connections_data:
            source_label = conn_data.get('source')
            target_label = conn_data.get('target')
            
            print(f"DEBUG: Bağlantı oluşturuluyor: {source_label} -> {target_label}")
            
            source_node = MindMapNode.objects.filter(
                mind_map=mind_map, 
                label=source_label
            ).first()
            target_node = MindMapNode.objects.filter(
                mind_map=mind_map, 
                label=target_label
            ).first()
            
            if source_node and target_node:
                MindMapConnection.objects.create(
                    mind_map=mind_map,
                    source_node=source_node,
                    target_node=target_node,
                    connection_type=conn_data.get('type', 'default')
                )
                print(f"DEBUG: Bağlantı oluşturuldu: {source_node.label} -> {target_node.label}")
            else:
                print(f"DEBUG: Bağlantı oluşturulamadı - source: {source_node}, target: {target_node}")
        
        # Eğer bağlantı yoksa veya bağlantı sayısı azsa, ana düğümden tüm alt düğümlere otomatik bağlantı oluştur
        alt_nodes = MindMapNode.objects.filter(mind_map=mind_map, level=1)
        existing_connections = MindMapConnection.objects.filter(mind_map=mind_map)
        
        if len(existing_connections) < len(alt_nodes):
            print(f"DEBUG: Bağlantı eksik, {len(alt_nodes)} alt düğüm için otomatik bağlantılar oluşturuluyor")
            for alt_node in alt_nodes:
                # Bu bağlantı zaten var mı kontrol et
                existing_conn = existing_connections.filter(
                    source_node=main_node,
                    target_node=alt_node
                ).first()
                
                if not existing_conn:
                    MindMapConnection.objects.create(
                        mind_map=mind_map,
                        source_node=main_node,
                        target_node=alt_node,
                        connection_type='default'
                    )
                    print(f"DEBUG: Otomatik bağlantı oluşturuldu: {main_node.label} -> {alt_node.label}")
                else:
                    print(f"DEBUG: Bağlantı zaten mevcut: {main_node.label} -> {alt_node.label}")
        
        return Response({
            'success': True,
            'mind_map_id': mind_map.id,
            'data': {
                'id': mind_map.id,
                'title': mind_map.title,
                'main_topic': mind_map.main_topic,
                'description': mind_map.description,
                'nodes': list(mind_map.nodes.values()),
                'connections': list(mind_map.connections.values()),
                'analysis_result': analysis_result
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Zihin haritası oluşturma hatası: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_mindmaps(request):
    """Kullanıcının zihin haritalarını getir"""
    try:
        mindmaps = MindMap.objects.filter(user=request.user, is_active=True)
        
        mindmaps_data = []
        for mindmap in mindmaps:
            mindmaps_data.append({
                'id': mindmap.id,
                'title': mindmap.title,
                'main_topic': mindmap.main_topic,
                'description': mindmap.description,
                'created_at': mindmap.created_at,
                'updated_at': mindmap.updated_at,
                'node_count': mindmap.nodes.count(),
                'connection_count': mindmap.connections.count()
            })
        
        return Response({
            'success': True,
            'data': mindmaps_data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Zihin haritaları getirme hatası: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_mindmap_detail(request, mindmap_id):
    """Zihin haritası detayını getir"""
    try:
        mindmap = MindMap.objects.get(id=mindmap_id, user=request.user)
        
        nodes_data = []
        for node in mindmap.nodes.all():
            nodes_data.append({
                'id': node.id,
                'label': node.label,
                'icon': node.icon,
                'color': node.color,
                'level': node.level,
                'notes': node.notes,
                'position_x': node.position_x,
                'position_y': node.position_y,
                'parent_id': node.parent.id if node.parent else None
            })
        
        connections_data = []
        for conn in mindmap.connections.all():
            connections_data.append({
                'id': conn.id,
                'source_node': {
                    'id': conn.source_node.id,
                    'label': conn.source_node.label
                },
                'target_node': {
                    'id': conn.target_node.id,
                    'label': conn.target_node.label
                },
                'connection_type': conn.connection_type
            })
        
        return Response({
            'success': True,
            'data': {
                'id': mindmap.id,
                'title': mindmap.title,
                'main_topic': mindmap.main_topic,
                'description': mindmap.description,
                'nodes': nodes_data,
                'connections': connections_data
            }
        })
        
    except MindMap.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Zihin haritası bulunamadı'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Zihin haritası detay hatası: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def expand_mindmap_node(request, mindmap_id):
    """Zihin haritası düğümünü genişlet"""
    try:
        node_id = request.data.get('node_id')
        speech_text = request.data.get('speech_text')
        
        if not node_id or not speech_text:
            return Response({
                'success': False,
                'message': 'Düğüm ID ve ses kaydı gerekli'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        node = MindMapNode.objects.get(id=node_id, mind_map__user=request.user)
        
        # Gemini ile genişletme
        gemini_service = MindMapGeminiService()
        expansion_result = gemini_service.expand_mindmap_node(node.label, speech_text)
        
        if 'error' in expansion_result:
            return Response({
                'success': False,
                'message': expansion_result['error']
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Yeni düğümleri oluştur
        new_nodes = expansion_result.get('new_nodes', [])
        created_nodes = []
        
        for i, node_data in enumerate(new_nodes):
            new_node = MindMapNode.objects.create(
                mind_map=node.mind_map,
                label=node_data.get('label', f'Yeni Alt Konu {i+1}'),
                icon=node_data.get('icon', '📝'),
                color=node_data.get('color', '#4CAF50'),
                level=node_data.get('level', node.level + 1),
                notes=node_data.get('notes', ''),
                parent=node,
                position_x=node.position_x + (i + 1) * 150,
                position_y=node.position_y + 100
            )
            created_nodes.append(new_node)
        
        # Yeni bağlantıları oluştur
        new_connections = expansion_result.get('new_connections', [])
        for conn_data in new_connections:
            target_label = conn_data.get('target')
            target_node = MindMapNode.objects.filter(
                mind_map=node.mind_map,
                label=target_label
            ).first()
            
            if target_node:
                MindMapConnection.objects.create(
                    mind_map=node.mind_map,
                    source_node=node,
                    target_node=target_node,
                    connection_type=conn_data.get('type', 'default')
                )
        
        return Response({
            'success': True,
            'data': {
                'parent_node_id': node.id,
                'new_nodes': [{
                    'id': n.id,
                    'label': n.label,
                    'icon': n.icon,
                    'color': n.color,
                    'level': n.level,
                    'position_x': n.position_x,
                    'position_y': n.position_y
                } for n in created_nodes],
                'expansion_result': expansion_result
            }
        })
        
    except MindMapNode.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Düğüm bulunamadı'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Düğüm genişletme hatası: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 