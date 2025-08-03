import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ProfileStatsProps {
  stats: {
    totalStudyHours: number;
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    streakDays: number;
    weeklyGoal: number;
  };
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  const theme = useTheme();

  const statItems = [
    {
      id: 'studyHours',
      title: 'Toplam Çalışma',
      value: `${stats.totalStudyHours}h`,
      icon: 'time-outline',
      color: theme.colors.primary,
    },
    {
      id: 'questions',
      title: 'Toplam Soru',
      value: stats.totalQuestions.toString(),
      icon: 'help-circle-outline',
      color: theme.colors.secondary,
    },
    {
      id: 'accuracy',
      title: 'Doğruluk Oranı',
      value: `%${stats.accuracy}`,
      icon: 'checkmark-circle-outline',
      color: theme.colors.tertiary,
    },
    {
      id: 'streak',
      title: 'Günlük Seri',
      value: `${stats.streakDays} gün`,
      icon: 'flame-outline',
      color: theme.colors.error,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        İstatistikler
      </Text>
      
      <View style={styles.statsGrid}>
        {statItems.map((item) => (
          <View key={item.id} style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <LinearGradient
              colors={[item.color, `${item.color}80`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconContainer}
            >
              <Ionicons name={item.icon as any} size={24} color="white" />
            </LinearGradient>
            
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                {item.value}
              </Text>
              <Text style={[styles.statTitle, { color: theme.colors.onSurfaceVariant }]}>
                {item.title}
              </Text>
            </View>
          </View>
        ))}
      </View>
      
      <View style={[styles.weeklyGoalCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.weeklyGoalHeader}>
          <Ionicons name="trophy-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.weeklyGoalTitle, { color: theme.colors.onSurface }]}>
            Haftalık Hedef
          </Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${Math.min((stats.totalStudyHours / stats.weeklyGoal) * 100, 100)}%` }]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
            {stats.totalStudyHours}/{stats.weeklyGoal}h
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    textAlign: 'center',
  },
  weeklyGoalCard: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  weeklyGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  weeklyGoalTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    marginLeft: 8,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
}); 