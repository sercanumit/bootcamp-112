import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Card, ProgressBar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/constants/PaperTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { getAnalyticsSummary, AnalyticsSummary } from '@/services/api';

export default function StudyDataScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await getAnalyticsSummary();
      if (response.success && response.data) {
        setAnalyticsData(response.data);
      }
    } catch (error) {
      console.error('Analytics verisi yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
          Analiz verileri yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 20 + insets.bottom }}
      >
        <View style={styles.content}>
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
            Çalışma Analizi
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Detaylı çalışma istatistiklerinizi keşfedin
          </Text>
        </View>

        {analyticsData ? (
          <>
            {/* Genel İstatistikler */}
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
              <Card.Content>
                <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                  Genel Performans
                </Text>
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                      {analyticsData.exam_analysis.total_exams}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                      Toplam Deneme
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                      {analyticsData.exam_analysis.average_net ? analyticsData.exam_analysis.average_net.toFixed(1) : '0.0'}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                      Ortalama Net
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                      {analyticsData.study_analysis.total_study_hours ? analyticsData.study_analysis.total_study_hours.toFixed(0) : '0'}h
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                      Çalışma Saati
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Görev Analizi */}
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
              <Card.Content>
                <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                  Görev Tamamlama
                </Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
                      Tamamlanan: {analyticsData.task_analysis.completed_tasks}/{analyticsData.task_analysis.total_tasks}
                    </Text>
                    <Text style={[styles.progressPercentage, { color: theme.colors.primary }]}>
                      %{analyticsData.task_analysis.completion_rate ? analyticsData.task_analysis.completion_rate.toFixed(0) : '0'}
                    </Text>
                  </View>
                  <ProgressBar 
                    progress={analyticsData.task_analysis.completion_rate / 100} 
                    color={theme.colors.primary}
                    style={styles.progressBar}
                  />
                </View>
              </Card.Content>
            </Card>

            {/* En İyi/Kötü Dersler */}
            {analyticsData.exam_analysis.best_subject && analyticsData.exam_analysis.worst_subject && (
              <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
                <Card.Content>
                  <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                    Ders Performansı
                  </Text>
                  <View style={styles.subjectContainer}>
                    <View style={styles.subjectItem}>
                      <Ionicons name="trending-up" size={20} color={theme.colors.primary} />
                      <Text style={[styles.subjectText, { color: theme.colors.onSurface }]}>
                        En İyi: {analyticsData.exam_analysis.best_subject}
                      </Text>
                    </View>
                    <View style={styles.subjectItem}>
                      <Ionicons name="trending-down" size={20} color={theme.colors.error} />
                      <Text style={[styles.subjectText, { color: theme.colors.onSurface }]}>
                        Geliştirilecek: {analyticsData.exam_analysis.worst_subject}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            )}

            {/* Öneriler */}
            {analyticsData.recommendations.length > 0 && (
              <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
                <Card.Content>
                  <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                    Öneriler
                  </Text>
                  {analyticsData.recommendations.slice(0, 3).map((recommendation, index) => (
                    <View key={index} style={styles.recommendationItem}>
                      <Ionicons name="bulb-outline" size={16} color={theme.colors.primary} />
                      <Text style={[styles.recommendationText, { color: theme.colors.onSurfaceVariant }]}>
                        {recommendation.title}
                      </Text>
                    </View>
                  ))}
                </Card.Content>
              </Card>
            )}
          </>
        ) : (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
            <Card.Content>
              <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                Veri Bulunamadı
              </Text>
              <Text style={[styles.cardText, { color: theme.colors.onSurfaceVariant }]}>
                Henüz analiz verisi bulunmuyor. Deneme kayıtları ve görevler ekleyerek analiz verilerinizi görebilirsiniz.
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 20,
  },
  subtitle: {
    opacity: 0.8,
    fontSize: 14,
  },
  card: {
    margin: 16,
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  progressContainer: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  subjectContainer: {
    marginTop: 16,
  },
  subjectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectText: {
    marginLeft: 8,
    fontSize: 14,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
}); 