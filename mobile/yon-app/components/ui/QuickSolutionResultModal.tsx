import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { quickSolutionsAPI, QuickSolution } from '@/services/api';

const { width, height } = Dimensions.get('window');

interface QuickSolutionResultModalProps {
  visible: boolean;
  onClose: () => void;
  solutionId?: number;
}

export function QuickSolutionResultModal({ 
  visible, 
  onClose, 
  solutionId 
}: QuickSolutionResultModalProps) {
  const theme = useTheme();
  const [solution, setSolution] = useState<QuickSolution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && solutionId) {
      loadSolution();
    }
  }, [visible, solutionId]);

  const loadSolution = async () => {
    if (!solutionId) {
      console.log('❌ SolutionId yok!');
      return;
    }
    
    console.log('🎯 Çözüm yükleniyor, ID:', solutionId);
    
    try {
      setLoading(true);
      const response = await quickSolutionsAPI.getQuickSolutionDetail(solutionId);
      console.log('🎯 Çözüm response:', response);
      
      if (response.success) {
        console.log('✅ Çözüm yüklendi:', response.data);
        setSolution(response.data);
      } else {
        console.log('❌ Çözüm yüklenemedi:', response.message);
        Alert.alert('Hata', 'Çözüm yüklenemedi');
      }
    } catch (error) {
      console.error('❌ Çözüm yükleme hatası:', error);
      Alert.alert('Hata', 'Çözüm yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSolution(null);
    setLoading(true);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
              Çözüm
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
                  Çözüm hazırlanıyor...
                </Text>
              </View>
            ) : solution ? (
              <>
                {/* Soru Bilgileri */}
                <View style={[styles.section, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                    Soru Bilgileri
                  </Text>
                  
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: theme.colors.onSurface }]}>Konu:</Text>
                    <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                      {solution.konu}
                    </Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: theme.colors.onSurface }]}>Ders:</Text>
                    <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                      {solution.ders}
                    </Text>
                  </View>
                  
                  {solution.mesaj && (
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: theme.colors.onSurface }]}>Mesaj:</Text>
                      <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                        {solution.mesaj}
                      </Text>
                    </View>
                  )}
                </View>

                {/* AI Çözümü */}
                {solution.is_processed && solution.gemini_response && (
                  <View style={[styles.section, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                      AI Çözümü
                    </Text>
                    <Text style={[styles.solutionText, { color: theme.colors.onSurface }]}>
                      {solution.gemini_response}
                    </Text>
                  </View>
                )}

                {/* İşlenmemiş Durum */}
                {!solution.is_processed && (
                  <View style={[styles.section, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <View style={styles.processingContainer}>
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                      <Text style={[styles.processingText, { color: theme.colors.onSurface }]}>
                        Çözüm hazırlanıyor...
                      </Text>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
                <Text style={[styles.errorText, { color: theme.colors.onBackground }]}>
                  Çözüm bulunamadı
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.95,
    height: height * 0.9,
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    width: 60,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },
  solutionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  visionText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  processingText: {
    marginLeft: 12,
    fontSize: 14,
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
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
}); 