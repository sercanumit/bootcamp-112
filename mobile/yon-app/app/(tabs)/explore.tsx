import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
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
import { tasksAPI } from '@/services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCompleted: boolean;
  isToday: boolean;
  isFuture: boolean;
  taskCount: number;
  completedTasks: number;
  hasTasks: boolean; // Görev var mı?
}

interface TaskData {
  id: string;
  user_uid: string;
  title: string;
  description: string;
  task_type: 'study' | 'practice' | 'review' | 'exam' | 'flashcard' | 'custom';
  priority: 'low' | 'medium' | 'high';
  estimated_duration: number;
  actual_duration?: number;
  is_completed: boolean;
  completed_at?: Date;
  subject?: string;
  topic?: string;
  due_date: Date;
  created_at: Date;
  updated_at: Date;
}

export default function CalendarScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [tasks, setTasks] = useState<TaskData[]>([]);

  useEffect(() => {
    initializeCalendar();
  }, []);

  const initializeCalendar = async () => {
    try {
      setLoading(true);
      await generateCalendarDays();
      await loadTasksForSelectedDate();
    } catch (error) {
      console.error('Takvim başlatılamadı:', error);
      Alert.alert('Hata', 'Takvim yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = async () => {
    const today = new Date();
    const days: CalendarDay[] = [];
    
    // Son 7 gün ve gelecek 7 gün
    for (let i = -7; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const isToday = date.toDateString() === today.toDateString();
      const isFuture = date > today;
      
      // API'den o günün görevlerini çek
      try {
        const dateStr = date.toISOString().split('T')[0];
        const dayTasks = await tasksAPI.getTasksByDate(dateStr);
        const taskCount = dayTasks.length || 0;
        const completedTasks = dayTasks.filter((task: TaskData) => task.is_completed).length || 0;
        const hasTasks = taskCount > 0;
        
        // Sadece görev varsa ve tamamlanmışsa yeşil olacak
        const isCompleted = hasTasks && completedTasks === taskCount && taskCount > 0;
        
        days.push({
          date,
          dayNumber: date.getDate(),
          isCompleted,
          isToday,
          isFuture,
          taskCount,
          completedTasks,
          hasTasks,
        });
      } catch (error) {
        console.error(`Görevler yüklenemedi (${date.toDateString()}):`, error);
        // Hata durumunda boş gün olarak ekle
        days.push({
          date,
          dayNumber: date.getDate(),
          isCompleted: false,
          isToday,
          isFuture,
          taskCount: 0,
          completedTasks: 0,
          hasTasks: false,
        });
      }
    }
    
    setCalendarDays(days);
  };

  const loadTasksForSelectedDate = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const dayTasks = await tasksAPI.getTasksByDate(dateStr);
      setTasks(dayTasks);
    } catch (error) {
      console.error('Görevler yüklenemedi:', error);
      Alert.alert('Hata', 'Görevler yüklenemedi');
    }
  };

  const handleDateSelect = async (day: CalendarDay) => {
    setSelectedDate(day.date);
    await loadTasksForSelectedDate();
  };

  const handleTaskToggle = async (taskId: string, currentStatus: boolean) => {
    try {
      await tasksAPI.toggleTaskCompletion(taskId, !currentStatus);
      
      // Görevleri yeniden yükle
      await loadTasksForSelectedDate();
      await generateCalendarDays(); // Takvimi güncelle
    } catch (error) {
      console.error('Görev güncellenemedi:', error);
      Alert.alert('Hata', 'Görev güncellenemedi');
    }
  };

  const getDayStyle = (day: CalendarDay) => {
    if (day.isToday) {
      return {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
      };
    }
    
    if (day.isCompleted && day.hasTasks) {
      return {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
      };
    }
    
    if (day.hasTasks && !day.isCompleted) {
      return {
        backgroundColor: '#F44336',
        borderColor: '#F44336',
      };
    }
    
    if (day.isFuture) {
      return {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.outline,
      };
    }
    
    // Geçmiş günlerde görev yoksa gri
    return {
      backgroundColor: '#9E9E9E',
      borderColor: '#9E9E9E',
    };
  };

  const getDayTextStyle = (day: CalendarDay) => {
    if (day.isToday || day.isCompleted || (day.hasTasks && !day.isCompleted)) {
      return { color: 'white' };
    }
    
    if (day.isFuture) {
      return { color: theme.colors.onSurface };
    }
    
    return { color: 'white' };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#F44336';
      case 'medium':
        return '#FF9800';
      case 'low':
        return '#4CAF50';
      default:
        return theme.colors.outline;
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
          Takvim yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
            Takvim
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Görevlerinizi takip edin ve ilerlemenizi görün
          </Text>
        </View>

        {/* Calendar Card */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Ionicons name="calendar" size={24} color={theme.colors.primary} />
                <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                  Bu Hafta
                </Text>
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            {/* Calendar Days */}
            <View style={styles.calendarContainer}>
              {calendarDays.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCircle,
                    getDayStyle(day),
                    day.isToday && styles.todayCircle,
                  ]}
                  onPress={() => handleDateSelect(day)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayNumber, getDayTextStyle(day)]}>
                    {day.dayNumber}
                  </Text>
                  
                  {/* Progress Indicator - sadece görev varsa göster */}
                  {day.hasTasks && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${(day.completedTasks / day.taskCount) * 100}%`,
                              backgroundColor: day.isCompleted ? 'white' : '#FFD700',
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.progressText, getDayTextStyle(day)]}>
                        {day.completedTasks}/{day.taskCount}
                      </Text>
                    </View>
                  )}
                  
                  {/* Status Icon - sadece tamamlanmışsa göster */}
                  {day.isCompleted && day.hasTasks && (
                    <View style={styles.completedIcon}>
                      <Ionicons name="checkmark" size={12} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Legend */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
                <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>
                  Bugün
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>
                  Tamamlandı
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
                <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>
                  Eksik
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#9E9E9E' }]} />
                <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>
                  Boş
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Selected Date Tasks */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                {selectedDate.toLocaleDateString('tr-TR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>

            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <View key={task.id} style={styles.taskItem}>
                  <View style={styles.taskLeft}>
                    <TouchableOpacity
                      style={[
                        styles.taskCheckbox,
                        task.is_completed && { backgroundColor: '#4CAF50' },
                      ]}
                      onPress={() => handleTaskToggle(task.id, task.is_completed)}
                    >
                      {task.is_completed && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </TouchableOpacity>
                    
                    <View style={styles.taskContent}>
                      <Text style={[styles.taskTitle, { color: theme.colors.onSurface }]}>
                        {task.title}
                      </Text>
                      <Text style={[styles.taskDescription, { color: theme.colors.onSurfaceVariant }]}>
                        {task.description}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.taskRight}>
                    <Chip
                      mode="outlined"
                      style={[
                        styles.priorityChip,
                        { borderColor: getPriorityColor(task.priority) },
                      ]}
                      textStyle={{ color: getPriorityColor(task.priority) }}
                    >
                      {task.priority === 'high' ? 'Yüksek' : 
                       task.priority === 'medium' ? 'Orta' : 'Düşük'}
                    </Chip>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={theme.colors.onSurfaceVariant} />
                <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                  Bu tarih için görev bulunmuyor
                </Text>
              </View>
            )}

            {/* Add Task Button */}
            <Button
              mode="contained"
              onPress={() => {
                // TODO: Add task modal
                console.log('Add task');
              }}
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
              contentStyle={styles.buttonContent}
            >
              Görev Ekle
            </Button>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  moreButton: {
    padding: 4,
  },
  calendarContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayCircle: {
    width: (width - 64) / 7 - 8,
    height: (width - 64) / 7 - 8,
    borderRadius: ((width - 64) / 7 - 8) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    position: 'relative',
  },
  todayCircle: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    right: 2,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1,
  },
  progressText: {
    fontSize: 8,
    marginTop: 2,
  },
  completedIcon: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
  },
  taskRight: {
    marginLeft: 8,
  },
  priorityChip: {
    height: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  addButton: {
    borderRadius: 12,
    marginTop: 16,
  },
  buttonContent: {
    height: 48,
  },
});
