import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Chip,
  SegmentedButtons,
  IconButton,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/constants/PaperTheme';
import { createDailyTask } from '@/services/api';
import { getSubjects, getTopicsBySubject } from '@/services/api';

const { width } = Dimensions.get('window');

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
}

interface TaskFormData {
  title: string;
  description: string;
  task_type: 'study' | 'practice' | 'review' | 'exam' | 'flashcard' | 'custom';
  priority: 'low' | 'medium' | 'high';
  estimated_duration: number;
  subject: string;
  topic: string;
}

const TASK_TYPES = [
  { value: 'study', label: 'Çalışma', icon: 'book' },
  { value: 'practice', label: 'Pratik', icon: 'fitness' },
  { value: 'review', label: 'Tekrar', icon: 'refresh' },
  { value: 'exam', label: 'Sınav', icon: 'document-text' },
  { value: 'flashcard', label: 'Flashcard', icon: 'card' },
  { value: 'custom', label: 'Özel', icon: 'create' },
];

const PRIORITIES = [
  { value: 'low', label: 'Düşük', color: '#10AC84' },
  { value: 'medium', label: 'Orta', color: '#FF9F43' },
  { value: 'high', label: 'Yüksek', color: '#FF6B6B' },
];

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

export function AddTaskModal({ visible, onClose, onTaskCreated }: AddTaskModalProps) {
  const theme = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);

  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    task_type: 'study',
    priority: 'medium',
    estimated_duration: 30,
    subject: '',
    topic: '',
  });

  useEffect(() => {
    if (visible) {
      loadSubjects();
    }
  }, [visible]);

  const loadSubjects = async () => {
    try {
      const response = await getSubjects();
      if (response.success && response.data) {
        // Firebase'den gelen veriyi düzleştir
        const subjectsList = response.data.map((subject: any) => subject.name);
        setSubjects(subjectsList);
      }
    } catch (error) {
      console.error('Dersler yüklenirken hata:', error);
      // Hata durumunda varsayılan dersler
      setSubjects(['Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Türkçe', 'Tarih', 'Coğrafya', 'Felsefe']);
    }
  };

  const loadTopics = async (subject: string) => {
    try {
      const response = await getTopicsBySubject(subject);
      if (response.success && response.data) {
        // Firebase'den gelen veriyi düzleştir
        const topicsList = response.data.map((topic: any) => topic.name);
        setTopics(topicsList);
      }
    } catch (error) {
      console.error('Konular yüklenirken hata:', error);
      // Hata durumunda boş liste
      setTopics([]);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Hata', 'Görev başlığı gerekli');
      return;
    }

    try {
      setLoading(true);
      const response = await createDailyTask(formData);
      
      if (response.success) {
        Alert.alert('Başarılı', 'Görev başarıyla oluşturuldu');
        onTaskCreated();
        handleClose();
      } else {
        Alert.alert('Hata', response.message || 'Görev oluşturulamadı');
      }
    } catch (error) {
      console.error('Görev oluşturma hatası:', error);
      Alert.alert('Hata', 'Görev oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      task_type: 'study',
      priority: 'medium',
      estimated_duration: 30,
      subject: '',
      topic: '',
    });
    setSelectedSubject('');
    setTopics([]);
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    const priorityItem = PRIORITIES.find(p => p.value === priority);
    return priorityItem?.color || theme.colors.primary;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} dk`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}s ${remainingMinutes}dk` : `${hours}s`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            icon="close"
            size={24}
            onPress={handleClose}
            style={styles.closeButton}
          />
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            Yeni Görev
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Görev Başlığı */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Görev Başlığı *
            </Text>
            <TextInput
              mode="outlined"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Görev başlığını girin"
              style={styles.input}
              outlineStyle={styles.inputOutline}
              autoCapitalize="words"
              autoCorrect={false}
              textContentType="none"
            />
          </View>

          {/* Açıklama */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Açıklama
            </Text>
            <TextInput
              mode="outlined"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Görev açıklaması (opsiyonel)"
              multiline
              numberOfLines={3}
              style={styles.input}
              outlineStyle={styles.inputOutline}
              autoCapitalize="sentences"
              autoCorrect={false}
              textContentType="none"
            />
          </View>

          {/* Görev Tipi */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Görev Tipi
            </Text>
            <View style={styles.chipContainer}>
              {TASK_TYPES.map((type) => (
                <Chip
                  key={type.value}
                  selected={formData.task_type === type.value}
                  onPress={() => setFormData({ ...formData, task_type: type.value as any })}
                  style={[
                    styles.chip,
                    formData.task_type === type.value && {
                      backgroundColor: theme.colors.primaryContainer,
                    },
                  ]}
                  textStyle={[
                    styles.chipText,
                    formData.task_type === type.value && {
                      color: theme.colors.onPrimaryContainer,
                    },
                  ]}
                  icon={() => (
                    <Ionicons
                      name={type.icon as any}
                      size={16}
                      color={
                        formData.task_type === type.value
                          ? theme.colors.onPrimaryContainer
                          : theme.colors.onSurfaceVariant
                      }
                    />
                  )}
                >
                  {type.label}
                </Chip>
              ))}
            </View>
          </View>

          {/* Öncelik */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Öncelik
            </Text>
            <View style={styles.chipContainer}>
              {PRIORITIES.map((priority) => (
                <Chip
                  key={priority.value}
                  selected={formData.priority === priority.value}
                  onPress={() => setFormData({ ...formData, priority: priority.value as any })}
                  style={[
                    styles.chip,
                    formData.priority === priority.value && {
                      backgroundColor: priority.color,
                    },
                  ]}
                  textStyle={[
                    styles.chipText,
                    formData.priority === priority.value && {
                      color: 'white',
                    },
                  ]}
                >
                  {priority.label}
                </Chip>
              ))}
            </View>
          </View>

          {/* Tahmini Süre */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Tahmini Süre
            </Text>
            <View style={styles.durationContainer}>
              {DURATION_OPTIONS.map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.durationButton,
                    formData.estimated_duration === duration && {
                      backgroundColor: theme.colors.primaryContainer,
                    },
                  ]}
                  onPress={() => setFormData({ ...formData, estimated_duration: duration })}
                >
                  <Text
                    style={[
                      styles.durationText,
                      formData.estimated_duration === duration && {
                        color: theme.colors.onPrimaryContainer,
                      },
                    ]}
                  >
                    {formatDuration(duration)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Ders Seçimi */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Ders (Opsiyonel)
            </Text>
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={() => setShowSubjectModal(true)}
            >
              <Text style={[styles.selectionText, { color: theme.colors.onSurface }]}>
                {formData.subject || 'Ders seçin'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Konu Seçimi */}
          {formData.subject && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Konu (Opsiyonel)
              </Text>
              <TouchableOpacity
                style={styles.selectionButton}
                onPress={() => {
                  if (formData.subject) {
                    loadTopics(formData.subject);
                    setShowTopicModal(true);
                  }
                }}
              >
                <Text style={[styles.selectionText, { color: theme.colors.onSurface }]}>
                  {formData.topic || 'Konu seçin'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={theme.colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading || !formData.title.trim()}
            style={styles.submitButton}
            contentStyle={styles.submitButtonContent}
          >
            Görev Oluştur
          </Button>
        </View>

        {/* Subject Selection Modal */}
        <Modal
          visible={showSubjectModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowSubjectModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowSubjectModal(false)}
              />
              <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                Ders Seçin
              </Text>
              <View style={styles.modalHeaderSpacer} />
            </View>
            <ScrollView style={styles.modalContent}>
              {subjects.map((subject) => (
                <TouchableOpacity
                  key={subject}
                  style={styles.modalItem}
                  onPress={() => {
                    setFormData({ ...formData, subject, topic: '' });
                    setSelectedSubject(subject);
                    setShowSubjectModal(false);
                  }}
                >
                  <Text style={[styles.modalItemText, { color: theme.colors.onSurface }]}>
                    {subject}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Modal>

        {/* Topic Selection Modal */}
        <Modal
          visible={showTopicModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowTopicModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowTopicModal(false)}
              />
              <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                Konu Seçin
              </Text>
              <View style={styles.modalHeaderSpacer} />
            </View>
            <ScrollView style={styles.modalContent}>
              {topics.map((topic) => (
                <TouchableOpacity
                  key={topic}
                  style={styles.modalItem}
                  onPress={() => {
                    setFormData({ ...formData, topic });
                    setShowTopicModal(false);
                  }}
                >
                  <Text style={[styles.modalItemText, { color: theme.colors.onSurface }]}>
                    {topic}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    margin: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'transparent',
  },
  inputOutline: {
    borderRadius: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
  },
  chipText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  durationText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  selectionText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  submitButton: {
    borderRadius: 12,
  },
  submitButtonContent: {
    height: 48,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    flex: 1,
    textAlign: 'center',
  },
  modalHeaderSpacer: {
    width: 48,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalItemText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
  },
}); 