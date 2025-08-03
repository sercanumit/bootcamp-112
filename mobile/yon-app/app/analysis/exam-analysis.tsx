import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/constants/PaperTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getExamAnalysis, ExamAnalysis } from '@/services/api';

export default function ExamAnalysisScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [examData, setExamData] = useState<ExamAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExamData();
  }, []);

  const loadExamData = async () => {
    try {
      setLoading(true);
      const response = await getExamAnalysis();
      if (response.success && response.data) {
        setExamData(response.data);
      }
    } catch (error) {
      console.error('Deneme analizi yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
          Deneme analizi yükleniyor...
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
        <View style={styles.header}>
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
            Deneme Analizi
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Detaylı deneme performansınızı inceleyin ve gelişim alanlarınızı keşfedin
          </Text>
        </View>

        {examData ? (
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
                      {examData.total_exams}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                      Toplam Deneme
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                      {examData.average_net ? examData.average_net.toFixed(1) : '0.0'}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                      Ortalama Net
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* En İyi/Kötü Denemeler */}
            {examData.best_exam && examData.worst_exam && (
              <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
                <Card.Content>
                  <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                    En İyi ve En Kötü Denemeler
                  </Text>
                  <View style={styles.examContainer}>
                    <View style={styles.examItem}>
                      <Ionicons name="trophy" size={20} color={theme.colors.primary} />
                      <View style={styles.examInfo}>
                        <Text style={[styles.examName, { color: theme.colors.onSurface }]}>
                          {examData.best_exam.exam_name}
                        </Text>
                        <Text style={[styles.examScore, { color: theme.colors.primary }]}>
                          Net: {examData.best_exam.total_net}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.examItem}>
                      <Ionicons name="alert-circle" size={20} color={theme.colors.error} />
                      <View style={styles.examInfo}>
                        <Text style={[styles.examName, { color: theme.colors.onSurface }]}>
                          {examData.worst_exam.exam_name}
                        </Text>
                        <Text style={[styles.examScore, { color: theme.colors.error }]}>
                          Net: {examData.worst_exam.total_net}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            )}

            {/* Ders Performansları */}
            {examData.best_subject && examData.worst_subject && (
              <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
                <Card.Content>
                  <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                    Ders Performansı
                  </Text>
                  <View style={styles.subjectContainer}>
                    <View style={styles.subjectItem}>
                      <Ionicons name="trending-up" size={20} color={theme.colors.primary} />
                      <Text style={[styles.subjectText, { color: theme.colors.onSurface }]}>
                        En İyi: {examData.best_subject}
                      </Text>
                    </View>
                    <View style={styles.subjectItem}>
                      <Ionicons name="trending-down" size={20} color={theme.colors.error} />
                      <Text style={[styles.subjectText, { color: theme.colors.onSurface }]}>
                        Geliştirilecek: {examData.worst_subject}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            )}

            {/* Ders Detayları */}
            {Object.keys(examData.subject_performance).length > 0 && (
              <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
                <Card.Content>
                  <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                    Ders Detayları
                  </Text>
                  {Object.entries(examData.subject_performance).map(([subject, performance]) => (
                    <View key={subject} style={styles.subjectDetailItem}>
                      <Text style={[styles.subjectDetailName, { color: theme.colors.onSurface }]}>
                        {subject}
                      </Text>
                      <View style={styles.subjectDetailStats}>
                        <Text style={[styles.subjectDetailStat, { color: theme.colors.onSurfaceVariant }]}>
                          {performance.total_exams} deneme
                        </Text>
                        <Text style={[styles.subjectDetailStat, { color: theme.colors.primary }]}>
                          Ort. {performance.average_net ? performance.average_net.toFixed(1) : '0.0'} net
                        </Text>
                      </View>
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
                Henüz deneme kaydı bulunmuyor. Deneme kayıtları ekleyerek analiz verilerinizi görebilirsiniz.
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.8,
  },
  card: {
    margin: 16,
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
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
  examContainer: {
    marginTop: 16,
  },
  examItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  examInfo: {
    marginLeft: 12,
    flex: 1,
  },
  examName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  examScore: {
    fontSize: 14,
    fontWeight: '500',
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
  subjectDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  subjectDetailName: {
    fontSize: 14,
    fontWeight: '500',
  },
  subjectDetailStats: {
    flexDirection: 'row',
    gap: 16,
  },
  subjectDetailStat: {
    fontSize: 12,
  },
}); 