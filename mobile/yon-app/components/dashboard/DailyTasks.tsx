import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Text, Card, Checkbox, IconButton, Button, Chip, FAB } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/constants/PaperTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { getDailyTasks, createDailyTask, updateDailyTask, deleteDailyTask } from '@/services/api';
import { AddTaskModal } from './AddTaskModal';
import { TaskDetailModal } from './TaskDetailModal';

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
}

interface DailyTasksData {
  tasks: Task[];
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
}

export function DailyTasks() {
  const theme = useAppTheme();
  const [tasksData, setTasksData] = useState<DailyTasksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addTaskModalVisible, setAddTaskModalVisible] = useState(false);
  const [taskDetailModalVisible, setTaskDetailModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      console.log('🔄 loadTasks çağrıldı');
      setLoading(true);
      const response = await getDailyTasks();
      console.log('📊 getDailyTasks response:', response);
      if (response.success && response.data) {
        console.log('✅ Görevler yüklendi:', response.data.tasks?.length || 0, 'görev');
        setTasksData(response.data);
      } else {
        console.log('❌ getDailyTasks başarısız:', response.message);
      }
    } catch (error) {
      console.error('❌ Görevler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const handleTaskToggle = async (taskId: number, isCompleted: boolean) => {
    try {
      const response = await updateDailyTask(taskId, { is_completed: !isCompleted });
      if (response.success) {
        await loadTasks(); // Görevleri yenile
      }
    } catch (error) {
      console.error('Görev güncellenirken hata:', error);
      Alert.alert('Hata', 'Görev güncellenemedi');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
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
              const response = await deleteDailyTask(taskId);
              if (response.success) {
                await loadTasks();
              }
            } catch (error) {
              console.error('Görev silinirken hata:', error);
              Alert.alert('Hata', 'Görev silinemedi');
            }
          },
        },
      ]
    );
  };

  const handleTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setTaskDetailModalVisible(true);
  };

  const handleTaskUpdated = () => {
    loadTasks();
  };

  const handleTaskDeleted = () => {
    loadTasks();
    setTaskDetailModalVisible(false);
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

  const handleAddTask = () => {
    setAddTaskModalVisible(true);
  };

  const handleTaskCreated = () => {
    console.log('🎯 handleTaskCreated çağrıldı');
    loadTasks(); // Görevleri yenile
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
          Görevler yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primary, theme.colors.primaryContainer]}
          locations={[0, 0.7, 1]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Ionicons name="list" size={20} color="white" />
              <Text style={styles.headerTitle}>Günün Görevleri</Text>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.headerStats}>
                <Text style={styles.statText}>
                  {tasksData?.completed_tasks || 0}/{tasksData?.total_tasks || 0}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddTask}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Tasks List */}
      <ScrollView
        style={styles.tasksContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {tasksData?.tasks && tasksData.tasks.length > 0 ? (
          tasksData.tasks.map((task) => (
            <Card key={task.id} style={styles.taskCard}>
              <Card.Content style={styles.taskContent}>
                {/* Task Header with Type and Priority */}
                <View style={styles.taskHeader}>
                  <View style={styles.taskLeft}>
                    <Checkbox
                      status={task.is_completed ? 'checked' : 'unchecked'}
                      onPress={() => handleTaskToggle(task.id, task.is_completed)}
                      color={theme.colors.primary}
                    />
                    <View style={styles.taskInfo}>
                      <Text
                        style={[
                          styles.taskTitle,
                          {
                            color: theme.colors.onSurface,
                            textDecorationLine: task.is_completed ? 'line-through' : 'none',
                          },
                        ]}
                      >
                        {task.title}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.taskRight}>
                    <View style={styles.taskChipsRow}>
                      <Chip
                        icon={() => (
                          <Ionicons
                            name={getTaskTypeIcon(task.task_type) as any}
                            size={12}
                            color={theme.colors.primary}
                          />
                        )}
                        style={styles.taskChip}
                        textStyle={styles.chipText}
                      >
                        {task.task_type}
                      </Chip>
                      <View
                        style={[
                          styles.priorityDot,
                          { backgroundColor: getPriorityColor(task.priority) },
                        ]}
                      />
                      <View style={styles.durationChip}>
                        <Ionicons name="time" size={12} color={theme.colors.onSurfaceVariant} />
                        <Text style={[styles.durationText, { color: theme.colors.onSurfaceVariant }]}>
                          {formatDuration(task.estimated_duration)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.detailIconButton}
                      onPress={() => handleTaskDetail(task)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Task Description - Moved to bottom */}
                {task.description && (
                  <View style={styles.descriptionContainer}>
                    <Text
                      style={[
                        styles.taskDescription,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                      numberOfLines={1}
                    >
                      {task.description}
                    </Text>
                  </View>
                )}

                {/* Delete Button - Bottom Right */}
                <View style={styles.deleteButtonContainer}>
                  <TouchableOpacity
                    style={styles.deleteIconButton}
                    onPress={() => handleDeleteTask(task.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash" size={16} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="list-outline" size={48} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
              Henüz görev yok
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
              Bugün için görev ekleyerek başlayın
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Task Modal */}
      <AddTaskModal
        visible={addTaskModalVisible}
        onClose={() => setAddTaskModalVisible(false)}
        onTaskCreated={handleTaskCreated}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        visible={taskDetailModalVisible}
        task={selectedTask}
        onClose={() => setTaskDetailModalVisible(false)}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    flex: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
  },
  header: {
    marginBottom: 12,
  },
  headerGradient: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  headerContent: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: 'white',
    marginLeft: 6,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerStats: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: 'white',
  },
  addButton: {
    padding: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tasksContainer: {
    flex: 1,
  },
  taskCard: {
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    position: 'relative',
  },
  taskContent: {
    padding: 12,
    paddingBottom: 40, // Delete button için alan bırak
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  taskInfo: {
    flex: 1,
    marginLeft: 6,
  },
  taskTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 2,
  },
  taskDescription: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 16,
  },
  taskRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskChip: {
    height: 22,
  },
  chipText: {
    fontSize: 9,
    fontFamily: 'Poppins_500Medium',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  durationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  durationText: {
    fontSize: 9,
    fontFamily: 'Poppins_500Medium',
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailIconButton: {
    padding: 2,
  },
  deleteIconButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  descriptionContainer: {
    marginTop: 4,
    marginLeft: 32,
  },
  deleteButtonContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
  },
}); 