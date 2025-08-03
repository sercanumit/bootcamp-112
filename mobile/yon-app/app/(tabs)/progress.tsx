import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  Button,
  ActivityIndicator,
  Surface,
  Divider,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/constants/PaperTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

interface AnalysisData {
  totalExams: number;
  averageNet: number;
  bestSubject: string;
  worstSubject: string;
  studyHours: number;
  streakDays: number;
  weakTopics: string[];
  strongTopics: string[];
  recentPerformance: Array<{
    examName: string;
    net: number;
    date: string;
  }>;
}

export default function ProgressScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

  useEffect(() => {
    loadAnalysisData();
  }, []);

  const loadAnalysisData = async () => {
    try {
      setLoading(true);
      // TODO: API'den analiz verilerini çek
      const mockData: AnalysisData = {
        totalExams: 15,
        averageNet: 28.5,
        bestSubject: 'Matematik',
        worstSubject: 'Fizik',
        studyHours: 42,
        streakDays: 7,
        weakTopics: ['Newton Yasaları', 'Paragraf', 'Denklem Çözme'],
        strongTopics: ['Geometri', 'Kimya', 'Tarih'],
        recentPerformance: [
          { examName: 'Deneme 3D', net: 32.5, date: '2024-01-15' },
          { examName: 'Deneme 3C', net: 29.0, date: '2024-01-12' },
          { examName: 'Deneme 3B', net: 26.5, date: '2024-01-09' },
        ],
      };
      setAnalysisData(mockData);
    } catch (error) {
      console.error('Analiz verileri yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalysisData();
    setRefreshing(false);
  };

  const handleAnalysisButton = (type: string) => {
    console.log(`${type} analizi açılıyor...`);
    
    switch (type) {
      case 'study-data':
        router.push('/analysis/study-data');
        break;
      case 'topic-map':
        router.push('/analysis/topic-map');
        break;
      case 'exam-analysis':
        router.push('/analysis/exam-analysis');
        break;
      case 'missing-parts':
        router.push('/analysis/missing-parts');
        break;
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
          Analiz verileri yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Modern Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <View style={[styles.heroIcon, { backgroundColor: theme.colors.primaryContainer }]}>
              <Ionicons name="analytics" size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.heroText}>
              <Text variant="headlineMedium" style={[styles.heroTitle, { color: theme.colors.onSurface }]}>
                Analiz Merkezi
              </Text>
              <Text variant="bodyLarge" style={[styles.heroSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                Performansınızı keşfedin, hedeflerinize ulaşın
              </Text>
            </View>
          </View>
        </View>

        {/* Analysis Tools Section */}
        <View style={styles.toolsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Analiz Araçları
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Detaylı analizler için araçlarımızı kullanın
          </Text>
          
          <View style={styles.toolsGrid}>
            {/* Çalışma Verilerim */}
            <TouchableOpacity
              style={[styles.toolCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => handleAnalysisButton('study-data')}
              activeOpacity={0.8}
            >
              <View style={styles.toolCardContent}>
                <View style={[styles.toolIcon, { backgroundColor: '#E8F5E8' }]}>
                  <Ionicons name="trending-up" size={24} color="#4CAF50" />
                </View>
                <View style={styles.toolText}>
                  <Text style={[styles.toolTitle, { color: theme.colors.onSurface }]}>
                    Çalışma Verilerim
                  </Text>
                  <Text style={[styles.toolDescription, { color: theme.colors.onSurfaceVariant }]}>
                    Detaylı çalışma istatistiklerinizi inceleyin
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.onSurfaceVariant} />
              </View>
            </TouchableOpacity>

            {/* Konu Haritası */}
            <TouchableOpacity
              style={[styles.toolCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => handleAnalysisButton('topic-map')}
              activeOpacity={0.8}
            >
              <View style={styles.toolCardContent}>
                <View style={[styles.toolIcon, { backgroundColor: '#FFF3E0' }]}>
                  <Ionicons name="map" size={24} color="#FF9800" />
                </View>
                <View style={styles.toolText}>
                  <Text style={[styles.toolTitle, { color: theme.colors.onSurface }]}>
                    Konu Haritası
                  </Text>
                  <Text style={[styles.toolDescription, { color: theme.colors.onSurfaceVariant }]}>
                    Konuları görsel olarak keşfedin
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.onSurfaceVariant} />
              </View>
            </TouchableOpacity>

            {/* Deneme Analizi */}
            <TouchableOpacity
              style={[styles.toolCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => handleAnalysisButton('exam-analysis')}
              activeOpacity={0.8}
            >
              <View style={styles.toolCardContent}>
                <View style={[styles.toolIcon, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="analytics" size={24} color="#2196F3" />
                </View>
                <View style={styles.toolText}>
                  <Text style={[styles.toolTitle, { color: theme.colors.onSurface }]}>
                    Deneme Analizi
                  </Text>
                  <Text style={[styles.toolDescription, { color: theme.colors.onSurfaceVariant }]}>
                    Detaylı deneme performansınızı inceleyin
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.onSurfaceVariant} />
              </View>
            </TouchableOpacity>

            {/* Eksik Kısımlar */}
            <TouchableOpacity
              style={[styles.toolCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => handleAnalysisButton('missing-parts')}
              activeOpacity={0.8}
            >
              <View style={styles.toolCardContent}>
                <View style={[styles.toolIcon, { backgroundColor: '#FFEBEE' }]}>
                  <Ionicons name="warning" size={24} color="#F44336" />
                </View>
                <View style={styles.toolText}>
                  <Text style={[styles.toolTitle, { color: theme.colors.onSurface }]}>
                    Eksik Kısımlar
                  </Text>
                  <Text style={[styles.toolDescription, { color: theme.colors.onSurfaceVariant }]}>
                    Gelişim alanlarınızı tespit edin
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.onSurfaceVariant} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Motivation Section */}
        <View style={styles.motivationSection}>
          <Card style={[styles.motivationCard, { backgroundColor: theme.colors.primaryContainer }]} elevation={3}>
            <Card.Content style={styles.motivationContent}>
              <View style={styles.motivationIcon}>
                <Ionicons name="bulb" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.motivationText}>
                <Text style={[styles.motivationTitle, { color: theme.colors.primary }]}>
                  Başarı İpucu
                </Text>
                <Text style={[styles.motivationDescription, { color: theme.colors.onPrimaryContainer }]}>
                  Düzenli analiz yaparak güçlü ve zayıf yanlarınızı keşfedin. Bu sayede çalışma stratejinizi optimize edebilirsiniz.
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  scrollView: {
    flex: 1,
  },
  heroSection: {
    padding: 20,
    paddingTop: 24,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontWeight: '700',
    marginBottom: 4,
    fontSize: 28,
  },
  heroSubtitle: {
    opacity: 0.8,
    fontSize: 16,
    lineHeight: 22,
  },
  toolsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  toolsGrid: {
    gap: 12,
  },
  toolCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  toolCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  toolText: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 16,
  },
  motivationSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  motivationCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  motivationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
  },
  motivationIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  motivationText: {
    flex: 1,
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  motivationDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});
