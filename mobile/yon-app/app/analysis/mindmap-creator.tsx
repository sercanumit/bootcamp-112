import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, Card, Button, FAB, Portal, Modal, TextInput } from 'react-native-paper';
import { useAppTheme } from '@/constants/PaperTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createMindMapFromSpeech, getUserMindMaps, MindMapSummary } from '../../services/api';

export default function MindMapCreatorScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mindMaps, setMindMaps] = useState<MindMapSummary[]>([]);
  const [showMindMapsModal, setShowMindMapsModal] = useState(false);

  const handleCreateMindMap = async () => {
    if (!inputText.trim()) {
      Alert.alert('Uyarı', 'Lütfen önce konu açıklaması girin');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await createMindMapFromSpeech(inputText);
      
              if (result.success && result.data) {
          Alert.alert(
            'Başarılı!', 
            'Zihin haritası oluşturuldu',
            [
              {
                text: 'Haritayı Görüntüle',
                onPress: () => router.push({
                  pathname: '/analysis/mindmap-viewer',
                  params: { mindMapId: result.data!.id }
                })
              },
              {
                text: 'Tamam',
                style: 'cancel'
              }
            ]
          );
        setInputText('');
      } else {
        Alert.alert('Hata', result.message || 'Zihin haritası oluşturulamadı');
      }
    } catch (error: any) {
      console.error('Mind map creation error:', error);
      
      if (error.message?.includes('Network Error')) {
        Alert.alert(
          'Bağlantı Hatası', 
          'Backend sunucusuna bağlanılamadı. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.',
          [
            { text: 'Tekrar Dene', onPress: () => handleCreateMindMap() },
            { text: 'İptal', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert('Hata', 'Zihin haritası oluşturulurken bir hata oluştu');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const loadMindMaps = async () => {
    try {
      const result = await getUserMindMaps();
      if (result.success && result.data) {
        setMindMaps(result.data);
      }
    } catch (error) {
      console.error('Load mind maps error:', error);
    }
  };

  const handleViewMindMaps = () => {
    loadMindMaps();
    setShowMindMapsModal(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 20 + insets.bottom }}
      >
        <View style={styles.header}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
            Zihin Haritası Oluşturucu
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Konu açıklaması yazın, AI zihin haritanızı oluştursun
          </Text>
        </View>

        <Card style={[styles.inputCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.inputHeader}>
              <Ionicons 
                name="chatbubble-outline" 
                size={32} 
                color={theme.colors.primary} 
              />
              <Text variant="titleMedium" style={[styles.inputTitle, { color: theme.colors.onSurface }]}>
                Konu Açıklaması
              </Text>
            </View>
            
            <Text variant="bodyMedium" style={[styles.instruction, { color: theme.colors.onSurfaceVariant }]}>
              Öğrenmek istediğiniz konuyu açıklayın. AI sizin için zihin haritası oluşturacak.
            </Text>

            <TextInput
              mode="outlined"
              label="Konu açıklaması girin..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              numberOfLines={4}
              style={styles.textInput}
              placeholder="Örnek: Matematikte fonksiyonlar konusunu öğrenmek istiyorum"
            />
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleCreateMindMap}
            loading={isProcessing}
            disabled={!inputText.trim()}
            style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
            textColor={theme.colors.onPrimary}
            icon="brain"
          >
            Zihin Haritası Oluştur
          </Button>
        </View>

        <Card style={[styles.infoCard, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Card.Content>
            <Text variant="titleSmall" style={[styles.infoTitle, { color: theme.colors.onSurfaceVariant }]}>
              💡 İpuçları
            </Text>
            <Text variant="bodySmall" style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
              • "Matematikte fonksiyonlar konusunu öğrenmek istiyorum"
            </Text>
            <Text variant="bodySmall" style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
              • "Fizikte mekanik konularını çalışacağım"
            </Text>
            <Text variant="bodySmall" style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
              • "Kimya atom yapısı hakkında konuşalım"
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* FAB - Mevcut Haritalar */}
      <FAB
        icon="format-list-bulleted"
        label="Haritalarım"
        style={[styles.fab, { backgroundColor: theme.colors.secondary }]}
        onPress={handleViewMindMaps}
      />

      {/* Mind Maps Modal */}
      <Portal>
        <Modal
          visible={showMindMapsModal}
          onDismiss={() => setShowMindMapsModal(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.background }]}
        >
          <View style={styles.modalHeader}>
            <Text variant="headlineSmall" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
              Zihin Haritalarım
            </Text>
            <Button
              mode="text"
              onPress={() => setShowMindMapsModal(false)}
              icon="close"
            >
              Kapat
            </Button>
          </View>

          <ScrollView style={styles.modalContent}>
            {mindMaps.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                Henüz zihin haritanız yok. Yeni bir harita oluşturun!
              </Text>
            ) : (
              mindMaps.map((mindMap) => (
                <Card
                  key={mindMap.id}
                  style={[styles.mindMapCard, { backgroundColor: theme.colors.surface }]}
                  onPress={() => {
                    setShowMindMapsModal(false);
                    router.push({
                      pathname: '/analysis/mindmap-viewer',
                      params: { mindMapId: mindMap.id }
                    });
                  }}
                >
                  <Card.Content>
                    <Text variant="titleMedium" style={[styles.mindMapTitle, { color: theme.colors.onSurface }]}>
                      {mindMap.title}
                    </Text>
                    <Text variant="bodySmall" style={[styles.mindMapTopic, { color: theme.colors.onSurfaceVariant }]}>
                      {mindMap.main_topic}
                    </Text>
                    <View style={styles.mindMapStats}>
                      <Text variant="bodySmall" style={[styles.mindMapStat, { color: theme.colors.onSurfaceVariant }]}>
                        {mindMap.node_count} düğüm
                      </Text>
                      <Text variant="bodySmall" style={[styles.mindMapStat, { color: theme.colors.onSurfaceVariant }]}>
                        {mindMap.connection_count} bağlantı
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              ))
            )}
          </ScrollView>
        </Modal>
      </Portal>
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
  inputCard: {
    margin: 20,
    marginBottom: 10,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputTitle: {
    marginLeft: 12,
    fontWeight: '600',
  },
  instruction: {
    marginBottom: 16,
  },
  textInput: {
    marginTop: 8,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  createButton: {
    marginBottom: 8,
  },
  infoCard: {
    margin: 20,
    marginTop: 10,
  },
  infoTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    marginBottom: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontWeight: '600',
  },
  modalContent: {
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 40,
  },
  mindMapCard: {
    marginBottom: 12,
  },
  mindMapTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  mindMapTopic: {
    marginBottom: 8,
  },
  mindMapStats: {
    flexDirection: 'row',
    gap: 16,
  },
  mindMapStat: {
    opacity: 0.7,
  },
}); 