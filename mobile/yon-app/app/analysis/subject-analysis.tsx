import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { Text, Card, Chip, Button } from 'react-native-paper';
import { useAppTheme } from '@/constants/PaperTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { getSubjectTopicAnalysis, getSubjects, getTopicsBySubject } from '@/services/api';

const { width, height } = Dimensions.get('window');

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Topic {
  id: string;
  name: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  emptyAnswers: number;
  accuracy: number;
}

interface FirebaseTopic {
  id: string;
  name: string;
  subject_id: string;
}

// Mock data - gerçek veriler API'den gelecek
const mockTopics: Topic[] = [
  { id: '1', name: 'Temel Kavramlar', totalQuestions: 45, correctAnswers: 32, wrongAnswers: 10, emptyAnswers: 3, accuracy: 71 },
  { id: '2', name: 'Rasyonel Sayılar', totalQuestions: 38, correctAnswers: 28, wrongAnswers: 8, emptyAnswers: 2, accuracy: 74 },
  { id: '3', name: 'Mutlak Değer', totalQuestions: 25, correctAnswers: 15, wrongAnswers: 8, emptyAnswers: 2, accuracy: 60 },
  { id: '4', name: 'Basit Eşitsizlikler', totalQuestions: 30, correctAnswers: 22, wrongAnswers: 6, emptyAnswers: 2, accuracy: 73 },
  { id: '5', name: 'Köklü İfadeler', totalQuestions: 20, correctAnswers: 12, wrongAnswers: 6, emptyAnswers: 2, accuracy: 60 },
  { id: '6', name: 'Çarpanlara Ayırma', totalQuestions: 35, correctAnswers: 20, wrongAnswers: 12, emptyAnswers: 3, accuracy: 57 },
  { id: '7', name: 'Oran Orantı', totalQuestions: 28, correctAnswers: 24, wrongAnswers: 3, emptyAnswers: 1, accuracy: 86 },
  { id: '8', name: 'Yüzde Problemleri', totalQuestions: 32, correctAnswers: 26, wrongAnswers: 5, emptyAnswers: 1, accuracy: 81 },
];

export default function SubjectAnalysisScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [firebaseTopics, setFirebaseTopics] = useState<FirebaseTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [showTopicSelector, setShowTopicSelector] = useState(false);

  const subjectName = params.subjectName as string;
  const examType = params.examType as string;
  const subjectCode = params.subjectCode as string;

  useEffect(() => {
    loadTopicAnalysis();
  }, []);

  const loadTopicAnalysis = async () => {
    try {
      setLoading(true);
      
      // Firebase'den konuları yükle
      await loadFirebaseTopics();
      
      // Analiz verilerini yükle
      const response = await getSubjectTopicAnalysis(subjectCode);
      if (response.success && response.data) {
        setTopics(response.data.topics);
      } else {
        setTopics(mockTopics);
      }
    } catch (error) {
      console.error('Konu analizi yüklenirken hata:', error);
      setTopics(mockTopics);
    } finally {
      setLoading(false);
    }
  };

  const loadFirebaseTopics = async () => {
    try {
      setLoadingTopics(true);
      console.log('🎯 Firebase konuları yükleniyor, subjectCode:', subjectCode);
      
      // Subject code'dan subject name'i bul
      const subjectsResponse = await getSubjects();
      if (subjectsResponse.success && subjectsResponse.data) {
        const subject = subjectsResponse.data.find(s => s.code === subjectCode);
        if (subject) {
          const topicsResponse = await getTopicsBySubject(subject.name);
          if (topicsResponse.success && topicsResponse.data) {
            console.log('✅ Firebase konuları yüklendi:', topicsResponse.data);
            setFirebaseTopics(topicsResponse.data);
          } else {
            console.error('❌ Firebase konuları yüklenemedi:', topicsResponse.message);
            setFirebaseTopics([]);
          }
        } else {
          console.error('❌ Subject bulunamadı:', subjectCode);
          setFirebaseTopics([]);
        }
      } else {
        console.error('❌ Subjects yüklenemedi:', subjectsResponse.message);
        setFirebaseTopics([]);
      }
    } catch (error) {
      console.error('❌ Firebase konuları yükleme hatası:', error);
      setFirebaseTopics([]);
    } finally {
      setLoadingTopics(false);
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return '#4CAF50';
    if (accuracy >= 60) return '#6BCF7F';
    if (accuracy >= 40) return '#FFD93D';
    if (accuracy >= 20) return '#FF9F43';
    return '#FF6B6B';
  };

  const getAccuracyText = (accuracy: number) => {
    if (accuracy >= 80) return 'Mükemmel';
    if (accuracy >= 60) return 'İyi';
    if (accuracy >= 40) return 'Orta';
    if (accuracy >= 20) return 'Geliştirilmeli';
    return 'Çok Zayıf';
  };

  const getAccuracyIcon = (accuracy: number) => {
    if (accuracy >= 80) return '🎯';
    if (accuracy >= 60) return '👍';
    if (accuracy >= 40) return '⚖️';
    if (accuracy >= 20) return '⚠️';
    return '❌';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            {subjectName}
          </Text>
        </View>
      </View>

      {/* Topic Selector */}
      <View style={[styles.topicSelectorContainer, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[styles.topicSelector, { backgroundColor: theme.colors.primaryContainer }]}
          onPress={() => setShowTopicSelector(true)}
          activeOpacity={0.8}
        >
          <View style={styles.topicSelectorContent}>
            <Ionicons name="book-outline" size={20} color={theme.colors.onPrimaryContainer} />
            <Text style={[styles.topicSelectorText, { color: theme.colors.onPrimaryContainer }]}>
              {selectedTopic ? selectedTopic.name : 'Konu Seçin'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={theme.colors.onPrimaryContainer} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Analysis Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTopic ? (
          <View style={styles.analysisContainer}>
            {/* Topic Header */}
            <Card style={[styles.topicCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <View style={styles.topicHeader}>
                  <View style={styles.topicInfo}>
                    <Text style={[styles.topicSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                      {selectedTopic.totalQuestions} soru • {selectedTopic.accuracy}% doğru
                    </Text>
                  </View>
                  <View style={[styles.accuracyChip, { backgroundColor: getAccuracyColor(selectedTopic.accuracy) }]}>
                    <Text style={styles.accuracyChipText}>
                      {getAccuracyIcon(selectedTopic.accuracy)} {getAccuracyText(selectedTopic.accuracy)}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Statistics Grid */}
            <View style={styles.statsGrid}>
              <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                <Card.Content style={styles.statContent}>
                  <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                    {selectedTopic.totalQuestions}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Toplam Soru
                  </Text>
                </Card.Content>
              </Card>

              <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                <Card.Content style={styles.statContent}>
                  <Text style={[styles.statValue, { color: '#4CAF50' }]}>
                    {selectedTopic.correctAnswers}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Doğru
                  </Text>
                </Card.Content>
              </Card>

              <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                <Card.Content style={styles.statContent}>
                  <Text style={[styles.statValue, { color: '#FF6B6B' }]}>
                    {selectedTopic.wrongAnswers}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Yanlış
                  </Text>
                </Card.Content>
              </Card>

              <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                <Card.Content style={styles.statContent}>
                  <Text style={[styles.statValue, { color: '#FF9F43' }]}>
                    {selectedTopic.emptyAnswers}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Boş
                  </Text>
                </Card.Content>
              </Card>
            </View>

            {/* Progress Bars */}
            <Card style={[styles.progressCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                {/* Accuracy Progress */}
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={[styles.progressTitle, { color: theme.colors.onSurface }]}>
                      Doğruluk Oranı
                    </Text>
                    <Text style={[styles.progressValue, { color: getAccuracyColor(selectedTopic.accuracy) }]}>
                      %{selectedTopic.accuracy}
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <LinearGradient
                      colors={['#FF6B6B', '#FFD93D', '#4CAF50']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressGradient, { width: `${selectedTopic.accuracy}%` }]}
                    />
                  </View>
                </View>

                                 {/* Performance Progress */}
                 <View style={styles.progressSection}>
                   <View style={styles.progressHeader}>
                     <Text style={[styles.progressTitle, { color: theme.colors.onSurface }]}>
                       Performans
                     </Text>
                     <Text style={[styles.progressValue, { color: getAccuracyColor(selectedTopic.accuracy) }]}>
                       %{selectedTopic.accuracy}
                     </Text>
                   </View>
                   <View style={styles.progressBar}>
                     <LinearGradient
                       colors={['#FF6B6B', '#FFD93D', '#4CAF50']}
                       start={{ x: 0, y: 0 }}
                       end={{ x: 1, y: 0 }}
                       style={[styles.progressGradient, { width: `${selectedTopic.accuracy}%` }]}
                     />
                   </View>
                 </View>
              </Card.Content>
            </Card>

            {/* Recommendations */}
            <Card style={[styles.recommendationCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Text style={[styles.recommendationTitle, { color: theme.colors.onSurface }]}>
                  Öneriler
                </Text>
                <View style={styles.recommendationItem}>
                  <Ionicons name="bulb-outline" size={20} color={theme.colors.primary} />
                  <Text style={[styles.recommendationText, { color: theme.colors.onSurfaceVariant }]}>
                    {selectedTopic.accuracy < 70 ? 
                      'Bu konuda daha fazla pratik yapmanız gerekiyor.' : 
                      'Bu konuda iyi performans gösteriyorsunuz.'
                    }
                  </Text>
                </View>
                                 <View style={styles.recommendationItem}>
                   <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
                   <Text style={[styles.recommendationText, { color: theme.colors.onSurfaceVariant }]}>
                     {selectedTopic.accuracy < 60 ? 
                       'Bu konuda daha fazla pratik yapmanız gerekiyor.' : 
                       'Bu konuda iyi performans gösteriyorsunuz.'
                     }
                   </Text>
                 </View>
              </Card.Content>
            </Card>
          </View>
        ) : (
          <View style={styles.noSelectionContainer}>
            <Ionicons name="analytics-outline" size={80} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.noSelectionTitle, { color: theme.colors.onSurface }]}>
              Konu Seçin
            </Text>
            <Text style={[styles.noSelectionText, { color: theme.colors.onSurfaceVariant }]}>
              Analiz için yukarıdan bir konu seçin
            </Text>
            <Button
              mode="contained"
              onPress={() => setShowTopicSelector(true)}
              style={styles.selectButton}
              contentStyle={styles.selectButtonContent}
            >
              Konu Seç
            </Button>
          </View>
        )}
      </ScrollView>

      {/* Topic Selector Modal */}
      <Modal
        visible={showTopicSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTopicSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                Konu Seçin
              </Text>
              <TouchableOpacity
                onPress={() => setShowTopicSelector(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>
            
                         <ScrollView style={styles.topicList} showsVerticalScrollIndicator={false}>
               {loadingTopics ? (
                 <View style={{ padding: 20, alignItems: 'center' }}>
                   <Text style={{ color: theme.colors.onSurfaceVariant }}>
                     Konular yükleniyor...
                   </Text>
                 </View>
               ) : firebaseTopics && firebaseTopics.length > 0 ? (
                 firebaseTopics.map((firebaseTopic) => {
                   // Analiz verilerinden bu konuyu bul
                   const analysisTopic = topics.find(t => t.id === firebaseTopic.id);
                   
                   return (
                     <TouchableOpacity
                       key={firebaseTopic.id}
                       style={[
                         styles.topicItem,
                         selectedTopic?.id === firebaseTopic.id && { backgroundColor: theme.colors.primaryContainer }
                       ]}
                       onPress={() => {
                         // Eğer analiz verisi varsa onu kullan, yoksa mock data oluştur
                         if (analysisTopic) {
                           setSelectedTopic(analysisTopic);
                         } else {
                           // Mock data oluştur
                           const mockTopic: Topic = {
                             id: firebaseTopic.id,
                             name: firebaseTopic.name,
                             totalQuestions: 0,
                             correctAnswers: 0,
                             wrongAnswers: 0,
                             emptyAnswers: 0,
                             accuracy: 0
                           };
                           setSelectedTopic(mockTopic);
                         }
                         setShowTopicSelector(false);
                       }}
                       activeOpacity={0.7}
                     >
                       <View style={styles.topicItemContent}>
                         <View style={styles.topicItemInfo}>
                           <Text style={[styles.topicItemName, { color: theme.colors.onSurface }]}>
                             {firebaseTopic.name}
                           </Text>
                           <Text style={[styles.topicItemStats, { color: theme.colors.onSurfaceVariant }]}>
                             {analysisTopic ? `${analysisTopic.totalQuestions} soru • ${analysisTopic.accuracy}% doğru` : 'Henüz veri yok'}
                           </Text>
                         </View>
                         {analysisTopic && (
                           <View style={[styles.topicItemBadge, { backgroundColor: getAccuracyColor(analysisTopic.accuracy) }]}>
                             <Text style={styles.topicItemBadgeText}>
                               {getAccuracyText(analysisTopic.accuracy)}
                             </Text>
                           </View>
                         )}
                       </View>
                     </TouchableOpacity>
                   );
                 })
               ) : (
                 <View style={{ padding: 20, alignItems: 'center' }}>
                   <Text style={{ color: theme.colors.onSurfaceVariant }}>
                     Konu bulunamadı
                   </Text>
                 </View>
               )}
             </ScrollView>
          </View>
        </View>
      </Modal>
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
  },
  topicSelectorContainer: {
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  topicSelector: {
    borderRadius: 12,
    padding: 16,
  },
  topicSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topicSelectorText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginLeft: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  analysisContainer: {
    gap: 16,
  },
  topicCard: {
    borderRadius: 16,
    elevation: 2,
  },
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  topicSubtitle: {
    fontSize: 14,
  },
  accuracyChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  accuracyChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 64) / 2 - 6,
    borderRadius: 12,
    elevation: 1,
  },
  statContent: {
    alignItems: 'center',
    padding: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressCard: {
    borderRadius: 16,
    elevation: 2,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressGradient: {
    height: '100%',
    borderRadius: 4,
  },
  recommendationCard: {
    borderRadius: 16,
    elevation: 2,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  noSelectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noSelectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noSelectionText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  selectButton: {
    borderRadius: 12,
    paddingHorizontal: 24,
  },
  selectButtonContent: {
    paddingVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.7,
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
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  topicList: {
    padding: 16,
  },
  topicItem: {
    borderRadius: 12,
    marginBottom: 8,
    padding: 16,
  },
  topicItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topicItemInfo: {
    flex: 1,
  },
  topicItemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  topicItemStats: {
    fontSize: 12,
  },
  topicItemBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topicItemBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
}); 