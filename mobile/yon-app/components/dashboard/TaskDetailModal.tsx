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
  Card,
  ActivityIndicator,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/constants/PaperTheme';
import { updateDailyTask, deleteDailyTask, getTaskDetail } from '@/services/api';

const { width } = Dimensions.get('window');

interface Task {
  id: number;
  title: string;
  description: string;
  task_type: string;
  priority: 'low' | 'medium' | 'high';
  estimated_duration: number;
  actual_duration?: number;
  is_completed: boolean;
  completed_at?: string;
  subject: string;
  topic: string;
  progress_percentage: number;
  created_at: string;
  updated_at?: string;
}

interface TaskDetailModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onTaskUpdated: () => void;
  onTaskDeleted: () => void;
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

export function TaskDetailModal({ 
  visible, 
  task, 
  onClose, 
  onTaskUpdated, 
  onTaskDeleted 
}: TaskDetailModalProps) {
  const theme = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [loadingTask, setLoadingTask] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Task>>({});
  const [taskData, setTaskData] = useState<Task | null>(null);

  useEffect(() => {
    if (visible && task) {
      loadTaskDetail();
    }
  }, [visible, task]);

  const loadTaskDetail = async () => {
    if (!task) return;
    
    setLoadingTask(true);
    try {
      const response = await getTaskDetail(task.id);
      if (response.success && response.data) {
        setTaskData(response.data);
        setFormData({
          title: response.data.title,
          description: response.data.description,
          task_type: response.data.task_type,
          priority: response.data.priority,
          estimated_duration: response.data.estimated_duration,
          actual_duration: response.data.actual_duration,
          subject: response.data.subject,
          topic: response.data.topic,
        });
      } else {
        Alert.alert('Hata', response.message || 'Görev detayı yüklenemedi');
      }
    } catch (error) {
      console.error('Görev detayı yükleme hatası:', error);
      Alert.alert('Hata', 'Görev detayı yüklenemedi');
    } finally {
      setLoadingTask(false);
    }
  };

  const handleUpdate = async () => {
    if (!task) return;

    try {
      setLoading(true);
      const response = await updateDailyTask(task.id, {
        title: formData.title,
        description: formData.description,
        task_type: formData.task_type,
        priority: formData.priority,
        estimated_duration: formData.estimated_duration,
        actual_duration: formData.actual_duration,
      });

      if (response.success) {
        Alert.alert('Başarılı', 'Görev güncellendi');
        onTaskUpdated();
        setEditMode(false);
        await loadTaskDetail(); // Detayları yenile
      } else {
        Alert.alert('Hata', response.message || 'Görev güncellenemedi');
      }
    } catch (error) {
      console.error('Görev güncelleme hatası:', error);
      Alert.alert('Hata', 'Görev güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;

    Alert.alert(
      'Görevi Sil',
      'Bu görevi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await deleteDailyTask(task.id);
              if (response.success) {
                Alert.alert('Başarılı', 'Görev silindi');
                onTaskDeleted();
                onClose();
              } else {
                Alert.alert('Hata', response.message || 'Görev silinemedi');
              }
            } catch (error) {
              console.error('Görev silme hatası:', error);
              Alert.alert('Hata', 'Görev silinemedi');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#FF6B6B';
      case 'medium':
        return '#FF9F43';
      case 'low':
        return '#10AC84';
      default:
        return theme.colors.primary;
    }
  };

  const getTaskTypeIcon = (taskType: string) => {
    switch (taskType) {
      case 'study':
        return 'book';
      case 'practice':
        return 'fitness';
      case 'review':
        return 'refresh';
      case 'exam':
        return 'document-text';
      case 'flashcard':
        return 'card';
      case 'custom':
        return 'create';
      default:
        return 'checkmark-circle';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} dk`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}s ${remainingMinutes}dk` : `${hours}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!task) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            icon="close"
            size={24}
            onPress={onClose}
            style={styles.closeButton}
          />
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            Görev Detayları
          </Text>
          <View style={styles.headerActions}>
            <IconButton
              icon={editMode ? "check" : "pencil"}
              size={24}
              onPress={() => {
                if (editMode) {
                  handleUpdate();
                } else {
                  setEditMode(true);
                }
              }}
              disabled={loading || loadingTask}
              style={styles.actionButton}
            />
            <IconButton
              icon="delete"
              size={24}
              onPress={handleDelete}
              disabled={loading || loadingTask}
              iconColor={theme.colors.error}
              style={styles.actionButton}
            />
          </View>
        </View>

        {loadingTask ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
              Görev detayları yükleniyor...
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Task Info Card */}
            <Card style={styles.infoCard}>
              <Card.Content>
                <View style={styles.taskHeader}>
                  <View style={styles.taskLeft}>
                    <Text style={[styles.taskTitle, { color: theme.colors.onSurface }]}>
                      {taskData?.title || task.title}
                    </Text>
                    {taskData?.description && (
                      <Text style={[styles.taskDescription, { color: theme.colors.onSurfaceVariant }]}>
                        {taskData.description}
                      </Text>
                    )}
                  </View>
                  <View style={[styles.statusDot, { backgroundColor: getPriorityColor(taskData?.priority || task.priority) }]} />
                </View>

                {/* Task Details */}
                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <Ionicons name="bookmark" size={16} color={theme.colors.primary} />
                    <Text style={[styles.detailLabel, { color: theme.colors.onSurface }]}>
                      Tip:
                    </Text>
                    <Chip
                      icon={() => (
                        <Ionicons
                          name={getTaskTypeIcon(taskData?.task_type || task.task_type) as any}
                          size={14}
                          color={theme.colors.primary}
                        />
                      )}
                      style={styles.detailChip}
                      textStyle={styles.chipText}
                    >
                      {taskData?.task_type || task.task_type}
                    </Chip>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="flag" size={16} color={theme.colors.primary} />
                    <Text style={[styles.detailLabel, { color: theme.colors.onSurface }]}>
                      Öncelik:
                    </Text>
                    <View style={[styles.priorityChip, { backgroundColor: getPriorityColor(taskData?.priority || task.priority) }]}>
                      <Text style={[styles.priorityText, { color: 'white' }]}>
                        {taskData?.priority || task.priority}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="time" size={16} color={theme.colors.primary} />
                    <Text style={[styles.detailLabel, { color: theme.colors.onSurface }]}>
                      Tahmini Süre:
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.colors.onSurfaceVariant }]}>
                      {formatDuration(taskData?.estimated_duration || task.estimated_duration)}
                    </Text>
                  </View>

                  {taskData?.actual_duration && (
                    <View style={styles.detailRow}>
                      <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                      <Text style={[styles.detailLabel, { color: theme.colors.onSurface }]}>
                        Gerçekleşen Süre:
                      </Text>
                      <Text style={[styles.detailValue, { color: theme.colors.primary }]}>
                        {formatDuration(taskData.actual_duration)}
                      </Text>
                    </View>
                  )}

                  {taskData?.subject && (
                    <View style={styles.detailRow}>
                      <Ionicons name="school" size={16} color={theme.colors.primary} />
                      <Text style={[styles.detailLabel, { color: theme.colors.onSurface }]}>
                        Ders:
                      </Text>
                      <Text style={[styles.detailValue, { color: theme.colors.onSurfaceVariant }]}>
                        {taskData.subject}
                      </Text>
                    </View>
                  )}

                  {taskData?.topic && (
                    <View style={styles.detailRow}>
                      <Ionicons name="library" size={16} color={theme.colors.primary} />
                      <Text style={[styles.detailLabel, { color: theme.colors.onSurface }]}>
                        Konu:
                      </Text>
                      <Text style={[styles.detailValue, { color: theme.colors.onSurfaceVariant }]}>
                        {taskData.topic}
                      </Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Ionicons name="calendar" size={16} color={theme.colors.primary} />
                    <Text style={[styles.detailLabel, { color: theme.colors.onSurface }]}>
                      Oluşturulma:
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.colors.onSurfaceVariant }]}>
                      {formatDate(taskData?.created_at || task.created_at)}
                    </Text>
                  </View>

                  {taskData?.completed_at && (
                    <View style={styles.detailRow}>
                      <Ionicons name="checkmark-done" size={16} color={theme.colors.primary} />
                      <Text style={[styles.detailLabel, { color: theme.colors.onSurface }]}>
                        Tamamlanma:
                      </Text>
                      <Text style={[styles.detailValue, { color: theme.colors.primary }]}>
                        {formatDate(taskData.completed_at)}
                      </Text>
                    </View>
                  )}

                  {taskData?.updated_at && taskData.updated_at !== taskData.created_at && (
                    <View style={styles.detailRow}>
                      <Ionicons name="refresh" size={16} color={theme.colors.primary} />
                      <Text style={[styles.detailLabel, { color: theme.colors.onSurface }]}>
                        Son Güncelleme:
                      </Text>
                      <Text style={[styles.detailValue, { color: theme.colors.onSurfaceVariant }]}>
                        {formatDate(taskData.updated_at)}
                      </Text>
                    </View>
                  )}
                </View>
              </Card.Content>
            </Card>

            {/* Edit Form */}
            {editMode && (
              <Card style={styles.editCard}>
                <Card.Content>
                  <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                    Görevi Düzenle
                  </Text>

                  {/* Title */}
                  <View style={styles.formSection}>
                    <Text style={[styles.formLabel, { color: theme.colors.onSurface }]}>
                      Başlık
                    </Text>
                    <TextInput
                      mode="outlined"
                      value={formData.title}
                      onChangeText={(text) => setFormData({ ...formData, title: text })}
                      style={styles.formInput}
                      outlineStyle={styles.inputOutline}
                    />
                  </View>

                  {/* Description */}
                  <View style={styles.formSection}>
                    <Text style={[styles.formLabel, { color: theme.colors.onSurface }]}>
                      Açıklama
                    </Text>
                    <TextInput
                      mode="outlined"
                      value={formData.description}
                      onChangeText={(text) => setFormData({ ...formData, description: text })}
                      multiline
                      numberOfLines={3}
                      style={styles.formInput}
                      outlineStyle={styles.inputOutline}
                    />
                  </View>

                  {/* Task Type */}
                  <View style={styles.formSection}>
                    <Text style={[styles.formLabel, { color: theme.colors.onSurface }]}>
                      Görev Tipi
                    </Text>
                    <View style={styles.chipContainer}>
                      {TASK_TYPES.map((type) => (
                        <Chip
                          key={type.value}
                          selected={formData.task_type === type.value}
                          onPress={() => setFormData({ ...formData, task_type: type.value as any })}
                          style={[
                            styles.formChip,
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
                              size={14}
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

                  {/* Priority */}
                  <View style={styles.formSection}>
                    <Text style={[styles.formLabel, { color: theme.colors.onSurface }]}>
                      Öncelik
                    </Text>
                    <View style={styles.chipContainer}>
                      {PRIORITIES.map((priority) => (
                        <Chip
                          key={priority.value}
                          selected={formData.priority === priority.value}
                          onPress={() => setFormData({ ...formData, priority: priority.value as any })}
                          style={[
                            styles.formChip,
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

                  {/* Duration */}
                  <View style={styles.formSection}>
                    <Text style={[styles.formLabel, { color: theme.colors.onSurface }]}>
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

                  {/* Actual Duration */}
                  <View style={styles.formSection}>
                    <Text style={[styles.formLabel, { color: theme.colors.onSurface }]}>
                      Gerçekleşen Süre (Opsiyonel)
                    </Text>
                    <TextInput
                      mode="outlined"
                      value={formData.actual_duration?.toString() || ''}
                      onChangeText={(text) => {
                        const value = text ? parseInt(text) : undefined;
                        setFormData({ ...formData, actual_duration: value });
                      }}
                      placeholder="Dakika cinsinden"
                      keyboardType="numeric"
                      style={styles.formInput}
                      outlineStyle={styles.inputOutline}
                    />
                  </View>
                </Card.Content>
              </Card>
            )}
          </ScrollView>
        )}
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
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    margin: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    marginTop: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    marginTop: 16,
    marginBottom: 8,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  taskLeft: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 20,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    flex: 1,
  },
  detailChip: {
    height: 24,
  },
  priorityChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
  chipText: {
    fontSize: 10,
    fontFamily: 'Poppins_500Medium',
  },
  editCard: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 16,
  },
  formSection: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'transparent',
  },
  inputOutline: {
    borderRadius: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  formChip: {
    marginBottom: 8,
  },
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  durationText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
}); 