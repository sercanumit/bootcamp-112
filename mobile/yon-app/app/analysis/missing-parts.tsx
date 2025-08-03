import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, FAB } from 'react-native-paper';
import { useAppTheme } from '@/constants/PaperTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Subject {
  id: string;
  name: string;
  code: string;
  examType: 'tyt' | 'ayt' | 'dil';
  icon: string;
}

const subjects: Subject[] = [
  { id: '1', name: 'TYT Matematik', code: 'tyt_mat', examType: 'tyt', icon: 'calculator' },
  { id: '2', name: 'TYT Türkçe', code: 'tyt_turkce', examType: 'tyt', icon: 'book' },
  { id: '3', name: 'TYT Fen Bilimleri', code: 'tyt_fen', examType: 'tyt', icon: 'flask' },
  { id: '4', name: 'TYT Sosyal Bilimler', code: 'tyt_sosyal', examType: 'tyt', icon: 'earth' },
  { id: '5', name: 'AYT Matematik', code: 'ayt_mat', examType: 'ayt', icon: 'calculator' },
  { id: '6', name: 'AYT Fizik', code: 'ayt_fizik', examType: 'ayt', icon: 'flash' },
  { id: '7', name: 'AYT Kimya', code: 'ayt_kimya', examType: 'ayt', icon: 'flask' },
  { id: '8', name: 'AYT Biyoloji', code: 'ayt_biyoloji', examType: 'ayt', icon: 'leaf' },
  { id: '9', name: 'AYT Türk Dili ve Edebiyatı', code: 'ayt_edebiyat', examType: 'ayt', icon: 'book' },
  { id: '10', name: 'AYT Tarih', code: 'ayt_tarih', examType: 'ayt', icon: 'time' },
  { id: '11', name: 'AYT Coğrafya', code: 'ayt_cografya', examType: 'ayt', icon: 'earth' },
  { id: '12', name: 'AYT Felsefe', code: 'ayt_felsefe', examType: 'ayt', icon: 'bulb' },
];

export default function MissingPartsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleSubjectPress = (subject: Subject) => {
    router.push({
      pathname: '/analysis/subject-analysis',
      params: { 
        subjectId: subject.id,
        subjectName: subject.name,
        subjectCode: subject.code,
        examType: subject.examType
      }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 20 + insets.bottom }}
      >
        <View style={styles.header}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
            Eksik Kısımlar
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Ders seçin ve konu bazlı eksikliklerinizi analiz edin
          </Text>
        </View>

        <View style={styles.subjectsContainer}>
          {subjects.map((subject) => (
            <TouchableOpacity
              key={subject.id}
              style={[styles.subjectCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => handleSubjectPress(subject)}
              activeOpacity={0.7}
            >
              <View style={styles.subjectContent}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
                  <Ionicons 
                    name={subject.icon as any} 
                    size={24} 
                    color={theme.colors.onPrimaryContainer} 
                  />
                </View>
                <View style={styles.subjectInfo}>
                  <Text style={[styles.subjectName, { color: theme.colors.onSurface }]}>
                    {subject.name}
                  </Text>
                  <Text style={[styles.examType, { color: theme.colors.onSurfaceVariant }]}>
                    {subject.examType.toUpperCase()}
                  </Text>
                </View>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={theme.colors.onSurfaceVariant} 
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Zihin Haritası Card */}
        <TouchableOpacity
          style={[styles.mindMapCard, { backgroundColor: theme.colors.surface }]}
          onPress={() => router.push('/analysis/mindmap-creator')}
          activeOpacity={0.7}
        >
          <View style={styles.mindMapContent}>
            <View style={[styles.mindMapIconContainer, { backgroundColor: theme.colors.secondaryContainer }]}>
              <Ionicons 
                name="brain" 
                size={28} 
                color={theme.colors.onSecondaryContainer} 
              />
            </View>
            <View style={styles.mindMapInfo}>
              <Text style={[styles.mindMapTitle, { color: theme.colors.onSurface }]}>
                Zihin Haritası Oluşturucu
              </Text>
              <Text style={[styles.mindMapSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                AI ile sesli zihin haritası oluşturun
              </Text>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={theme.colors.onSurfaceVariant} 
            />
          </View>
        </TouchableOpacity>
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
  subjectsContainer: {
    padding: 16,
  },
  subjectCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  subjectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  examType: {
    fontSize: 12,
    fontWeight: '500',
  },
  mindMapCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mindMapContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  mindMapIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mindMapInfo: {
    flex: 1,
  },
  mindMapTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  mindMapSubtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
}); 