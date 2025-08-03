import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Chip } from 'react-native-paper';
import { useAppTheme } from '@/constants/PaperTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getMindMapDetail } from '../../services/api';

const { width, height } = Dimensions.get('window');

export default function MindMapViewerScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { mindMapId } = useLocalSearchParams();
  
  const [mindMap, setMindMap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    loadMindMap();
  }, [mindMapId]);

  const loadMindMap = async () => {
    if (!mindMapId) {
      setError('Mind map ID bulunamadı');
      setLoading(false);
      return;
    }

    try {
      const result = await getMindMapDetail(Number(mindMapId));
      
      if (result.success && result.data) {
        setMindMap(result.data);
        // Ana düğümü seç
        const mainNode = result.data.nodes?.find((node: any) => node.level === 0);
        if (mainNode) {
          setSelectedNode(mainNode);
        }
      } else {
        setError(result.message || 'Mind map yüklenemedi');
      }
    } catch (error) {
      console.error('Load mind map error:', error);
      setError('Mind map yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodeId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const selectNode = (node: any) => {
    console.log('Node seçildi:', node.label, node.id);
    setSelectedNode(node);
    // Düğümü otomatik genişlet
    if (!expandedNodes.has(node.id)) {
      setExpandedNodes(new Set([...expandedNodes, node.id]));
    }
  };

  const getNodeIcon = (icon: string, level: number) => {
    if (icon && icon !== '📝') return icon;
    
    const icons = ['🧠', '📚', '🔬', '⚡', '💡', '🎯', '📖', '🔍', '⚛️', '🔬', '🧪', '📊'];
    return icons[level % icons.length];
  };

  const getNodeColor = (level: number) => {
    const colors = ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#00BCD4', '#795548', '#607D8B', '#E91E63', '#3F51B5', '#009688', '#FF5722'];
    return colors[level % colors.length];
  };

  const getChildNodes = (parentId: number) => {
    return mindMap.nodes?.filter((node: any) => node.parent === parentId) || [];
  };

  const getConnectedNodes = (nodeId: number) => {
    console.log('DEBUG: getConnectedNodes çağrıldı, nodeId:', nodeId);
    console.log('DEBUG: Mind map connections:', mindMap.connections?.length);
    console.log('DEBUG: Mind map nodes:', mindMap.nodes?.length);
    
    // Eğer bağlantılar yoksa, parent ilişkisini kontrol et
    if (!mindMap.connections || mindMap.connections.length === 0) {
      // Ana düğümün child'larını bul
      const childNodes = mindMap.nodes?.filter((node: any) => 
        node.parent_id === nodeId || node.parent === nodeId
      ) || [];
      console.log('DEBUG: Parent ilişkisi ile bulunan düğümler:', childNodes.length, childNodes.map((n: any) => n.label));
      return childNodes;
    }
    
    const connections = mindMap.connections?.filter((conn: any) => 
      conn.source_node?.id === nodeId || conn.target_node?.id === nodeId
    ) || [];
    
    console.log('DEBUG: Bulunan bağlantılar:', connections.length);
    console.log('DEBUG: Bağlantı detayları:', connections.map((conn: any) => ({
      source: conn.source_node?.id,
      target: conn.target_node?.id,
      source_label: conn.source_node?.label,
      target_label: conn.target_node?.label
    })));
    
    const connectedNodeIds = new Set();
    connections.forEach((conn: any) => {
      if (conn.source_node?.id === nodeId) {
        connectedNodeIds.add(conn.target_node?.id);
      } else {
        connectedNodeIds.add(conn.source_node?.id);
      }
    });
    
    const connectedNodes = mindMap.nodes?.filter((node: any) => connectedNodeIds.has(node.id)) || [];
    console.log('DEBUG: Bağlantılı düğümler:', connectedNodes.length, connectedNodes.map((n: any) => n.label));
    return connectedNodes;
  };

  const renderCentralNode = (node: any) => {
    const isExpanded = expandedNodes.has(node.id);
    const childNodes = getChildNodes(node.id);
    const connectedNodes = getConnectedNodes(node.id);

    console.log('Connected nodes:', connectedNodes.length, connectedNodes.map((n: any) => n.label));
    console.log('Mind map nodes:', mindMap.nodes?.length, mindMap.nodes?.map((n: any) => ({ id: n.id, label: n.label, level: n.level })));

    return (
      <View style={styles.centralNodeContainer}>
        {/* Ana Düğüm */}
        <TouchableOpacity
          style={[
            styles.centralNode,
            { backgroundColor: getNodeColor(node.level || 0) }
          ]}
          onPress={() => selectNode(node)}
          activeOpacity={0.8}
        >
          <Text style={styles.centralNodeIcon}>
            {getNodeIcon(node.icon, node.level || 0)}
          </Text>
          <Text style={styles.centralNodeLabel}>
            {node.label}
          </Text>
        </TouchableOpacity>



                 {/* Bağlantılı Düğümler */}
                 <View style={styles.connectedNodesContainer}>
                   {connectedNodes.length > 0 ? (
                     connectedNodes.map((connectedNode: any, index: number) => {
                       // Düğümleri daire şeklinde yerleştir
                       const angle = (index * 2 * Math.PI) / connectedNodes.length;
                       const radius = 150;
                       const x = Math.cos(angle) * radius;
                       const y = Math.sin(angle) * radius;
                       
                       console.log(`Node ${connectedNode.label} pozisyonu:`, { x, y, left: x + 150 - 40, top: y + 100 - 40 });
                       
                       return (
                         <TouchableOpacity
                           key={connectedNode.id}
                           style={[
                             styles.connectedNode,
                             { 
                               backgroundColor: getNodeColor(connectedNode.level || 0),
                               left: x + 150 - 40, // 150 container genişliğinin yarısı, 40 node genişliğinin yarısı
                               top: y + 100 - 40,  // 100 container yüksekliğinin yarısı, 40 node yüksekliğinin yarısı
                             }
                           ]}
                           onPress={() => selectNode(connectedNode)}
                           activeOpacity={0.8}
                         >
                           <Text style={styles.connectedNodeIcon}>
                             {getNodeIcon(connectedNode.icon, connectedNode.level || 0)}
                           </Text>
                           <Text style={styles.connectedNodeLabel}>
                             {connectedNode.label}
                           </Text>
                         </TouchableOpacity>
                       );
                     })
                   ) : (
                     <Text style={[styles.noNodesText, { color: theme.colors.onSurfaceVariant }]}>
                       Bağlantılı düğüm bulunamadı
                     </Text>
                   )}
                 </View>

        {/* Alt Düğümler */}
        {isExpanded && childNodes.length > 0 && (
          <View style={styles.childNodesContainer}>
            {childNodes.map((childNode: any) => (
              <TouchableOpacity
                key={childNode.id}
                style={[
                  styles.childNode,
                  { backgroundColor: getNodeColor(childNode.level || 0) }
                ]}
                onPress={() => selectNode(childNode)}
                activeOpacity={0.8}
              >
                <Text style={styles.childNodeIcon}>
                  {getNodeIcon(childNode.icon, childNode.level || 0)}
                </Text>
                <Text style={styles.childNodeLabel}>
                  {childNode.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderNodeDetails = (node: any) => {
    if (!node) return null;

    const childNodes = getChildNodes(node.id);
    const connectedNodes = getConnectedNodes(node.id);

    return (
      <Card style={[styles.detailsCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.detailsHeader}>
            <View style={[styles.detailsIcon, { backgroundColor: getNodeColor(node.level || 0) }]}>
              <Text style={styles.detailsIconText}>
                {getNodeIcon(node.icon, node.level || 0)}
              </Text>
            </View>
            <View style={styles.detailsInfo}>
              <Text variant="titleMedium" style={[styles.detailsTitle, { color: theme.colors.onSurface }]}>
                {node.label}
              </Text>
              <Text variant="bodySmall" style={[styles.detailsLevel, { color: theme.colors.onSurfaceVariant }]}>
                Seviye {node.level || 0}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => toggleNode(node.id)}
              style={styles.expandButton}
            >
              <Ionicons 
                name={expandedNodes.has(node.id) ? "chevron-up" : "chevron-down"} 
                size={24} 
                color={theme.colors.primary} 
              />
            </TouchableOpacity>
          </View>

          {node.notes && (
            <Text variant="bodyMedium" style={[styles.detailsNotes, { color: theme.colors.onSurface }]}>
              {node.notes}
            </Text>
          )}

          {/* Bağlantılı Düğümler */}
          {connectedNodes.length > 0 && (
            <View style={styles.connectionsSection}>
              <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                🔗 Bağlantılı Düğümler ({connectedNodes.length})
              </Text>
              <View style={styles.connectionsList}>
                {connectedNodes.map((connectedNode: any) => (
                  <Chip
                    key={connectedNode.id}
                    style={[styles.connectionChip, { backgroundColor: getNodeColor(connectedNode.level || 0) }]}
                    textStyle={{ color: 'white' }}
                    onPress={() => selectNode(connectedNode)}
                  >
                    {connectedNode.label}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {/* Alt Düğümler */}
          {expandedNodes.has(node.id) && childNodes.length > 0 && (
            <View style={styles.childrenSection}>
              <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                📋 Alt Düğümler ({childNodes.length})
              </Text>
              <View style={styles.childrenList}>
                {childNodes.map((childNode: any) => (
                  <TouchableOpacity
                    key={childNode.id}
                    style={[styles.childItem, { backgroundColor: theme.colors.surfaceVariant }]}
                    onPress={() => selectNode(childNode)}
                  >
                    <Text style={[styles.childItemIcon, { color: getNodeColor(childNode.level || 0) }]}>
                      {getNodeIcon(childNode.icon, childNode.level || 0)}
                    </Text>
                    <Text style={[styles.childItemLabel, { color: theme.colors.onSurface }]}>
                      {childNode.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
          Zihin haritası yükleniyor...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
        <Text style={[styles.errorTitle, { color: theme.colors.onSurface }]}>
          Hata
        </Text>
        <Text style={[styles.errorText, { color: theme.colors.onSurfaceVariant }]}>
          {error}
        </Text>
        <Button
          mode="contained"
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
        >
          Geri Dön
        </Button>
      </View>
    );
  }

  if (!mindMap) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="document-outline" size={64} color={theme.colors.onSurfaceVariant} />
        <Text style={[styles.errorTitle, { color: theme.colors.onSurface }]}>
          Mind Map Bulunamadı
        </Text>
        <Button
          mode="contained"
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
        >
          Geri Dön
        </Button>
      </View>
    );
  }

  const mainNode = mindMap.nodes?.find((node: any) => node.level === 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 20 + insets.bottom }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
            {mindMap.title}
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            {mindMap.main_topic}
          </Text>
        </View>

        {/* Mind Map Visualization */}
        <View style={styles.mindMapContainer}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            🧠 Zihin Haritası
          </Text>
          
          <View style={styles.mindMapVisual}>
            {mainNode && renderCentralNode(mainNode)}
          </View>
        </View>

        {/* Selected Node Details */}
        {selectedNode && renderNodeDetails(selectedNode)}

        {/* Stats */}
        <Card style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleSmall" style={[styles.statsTitle, { color: theme.colors.onSurface }]}>
              📊 İstatistikler
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                  {mindMap.nodes?.length || 0}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Düğüm
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                  {mindMap.connections?.length || 0}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Bağlantı
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                  {Math.max(...(mindMap.nodes?.map((n: any) => n.level || 0) || [0])) + 1}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Seviye
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
  },
  mindMapContainer: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  mindMapVisual: {
    alignItems: 'center',
    minHeight: 300,
    marginTop: 80,
  },
  centralNodeContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  centralNode: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  centralNodeIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  centralNodeLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  connectedNodesContainer: {
    position: 'absolute',
    width: 300,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 150,
  },

  connectedNode: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  connectedNodeIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  connectedNodeLabel: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  childNodesContainer: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  childNode: {
    width: 100,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  childNodeIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  childNodeLabel: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  detailsCard: {
    margin: 20,
    marginTop: 10,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailsIconText: {
    fontSize: 24,
  },
  detailsInfo: {
    flex: 1,
  },
  detailsTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  detailsLevel: {
    opacity: 0.7,
  },
  expandButton: {
    padding: 8,
  },
  detailsNotes: {
    marginBottom: 16,
    fontStyle: 'italic',
  },
  connectionsSection: {
    marginBottom: 16,
  },
  connectionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  connectionChip: {
    marginBottom: 4,
  },
  childrenSection: {
    marginTop: 16,
  },
  childrenList: {
    gap: 8,
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  childItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  childItemLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsCard: {
    margin: 20,
    marginTop: 10,
  },
  statsTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
     backButton: {
     marginTop: 16,
   },
   noNodesText: {
     fontSize: 14,
     textAlign: 'center',
     fontStyle: 'italic',
   },
}); 