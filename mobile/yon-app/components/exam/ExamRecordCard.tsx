import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, IconButton } from 'react-native-paper';
import { ExamRecord } from '@/services/api';
import { useAppTheme } from '@/constants/PaperTheme';

interface ExamRecordCardProps {
  examRecord: ExamRecord;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ExamRecordCard({ examRecord, onPress, onEdit, onDelete }: ExamRecordCardProps) {
  const theme = useAppTheme();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#4CAF50';
      case 'medium':
        return '#FF9800';
      case 'hard':
        return '#F44336';
      default:
        return theme.colors.primary;
    }
  };

  const getExamTypeColor = (examType: string) => {
    switch (examType) {
      case 'tyt':
        return '#2196F3';
      case 'ayt':
        return '#9C27B0';
      case 'dil':
        return '#FF5722';
      case 'msu':
        return '#607D8B';
      default:
        return theme.colors.primary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateAccuracy = () => {
    if (examRecord.total_questions === 0) return 0;
    return Math.round((examRecord.total_correct / examRecord.total_questions) * 100);
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
                {examRecord.exam_name}
              </Text>
              <Text variant="bodySmall" style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
                {formatDate(examRecord.exam_date)}
              </Text>
            </View>
            
            <View style={styles.actions}>
              {onEdit && (
                <IconButton
                  icon="pencil"
                  size={20}
                  onPress={onEdit}
                  iconColor={theme.colors.primary}
                />
              )}
              {onDelete && (
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={onDelete}
                  iconColor={theme.colors.error}
                />
              )}
            </View>
          </View>

          {/* Chips */}
          <View style={styles.chipsContainer}>
            <Chip
              mode="outlined"
              textStyle={{ color: getExamTypeColor(examRecord.exam_type) }}
              style={[styles.chip, { borderColor: getExamTypeColor(examRecord.exam_type) }]}
            >
              {examRecord.exam_type_display}
            </Chip>
            
            <Chip
              mode="outlined"
              textStyle={{ color: getDifficultyColor(examRecord.difficulty) }}
              style={[styles.chip, { borderColor: getDifficultyColor(examRecord.difficulty) }]}
            >
              {examRecord.difficulty_display}
            </Chip>
            
            <Chip
              mode="outlined"
              textStyle={{ color: theme.colors.primary }}
              style={[styles.chip, { borderColor: theme.colors.primary }]}
            >
              {examRecord.exam_subject_name}
            </Chip>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text variant="labelSmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Soru Sayısı
              </Text>
              <Text variant="titleMedium" style={[styles.statValue, { color: theme.colors.onSurface }]}>
                {examRecord.total_questions}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text variant="labelSmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Doğru
              </Text>
              <Text variant="titleMedium" style={[styles.statValue, { color: '#4CAF50' }]}>
                {examRecord.total_correct}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text variant="labelSmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Yanlış
              </Text>
              <Text variant="titleMedium" style={[styles.statValue, { color: '#F44336' }]}>
                {examRecord.total_wrong}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text variant="labelSmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Net
              </Text>
              <Text variant="titleMedium" style={[styles.statValue, { color: theme.colors.primary }]}>
                {examRecord.total_net.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text variant="labelSmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Başarı
              </Text>
              <Text variant="titleMedium" style={[styles.statValue, { color: getDifficultyColor(examRecord.difficulty) }]}>
                %{calculateAccuracy()}
              </Text>
            </View>
          </View>

          {/* Duration */}
          {examRecord.normal_duration && examRecord.student_duration && (
            <View style={styles.durationContainer}>
              <Text variant="bodySmall" style={[styles.durationText, { color: theme.colors.onSurfaceVariant }]}>
                Süre: {examRecord.student_duration}dk / {examRecord.normal_duration}dk
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
    borderRadius: 12,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    opacity: 0.7,
  },
  actions: {
    flexDirection: 'row',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    height: 28,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontWeight: '600',
    textAlign: 'center',
  },
  durationContainer: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  durationText: {
    fontStyle: 'italic',
  },
}); 