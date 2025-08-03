import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Text, Button, Modal, Portal, TextInput } from 'react-native-paper';
import { ThemedView } from '@/components/ThemedView';
import { useAppTheme } from '@/constants/PaperTheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface DailyDataInputProps {
  onDataChange?: (data: { studyHours: number; totalQuestions: number }) => void;
  hasData?: boolean; // Veri olup olmadığını belirtir
}

interface DailyGoals {
  studyHours: number;
  totalQuestions: number;
}

export function DailyDataInput({ onDataChange, hasData = false }: DailyDataInputProps) {
  const theme = useAppTheme();
  const [studyHours, setStudyHours] = useState(hasData ? 2.5 : 0);
  const [totalQuestions, setTotalQuestions] = useState(hasData ? 70 : 0);
  const [goals, setGoals] = useState<DailyGoals>({ studyHours: 8, totalQuestions: 100 });
  const [currentDate, setCurrentDate] = useState('');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempGoals, setTempGoals] = useState<DailyGoals>({ studyHours: 8, totalQuestions: 100 });

  const handleStudyHoursChange = (increment: boolean) => {
    const newValue = increment ? studyHours + 0.5 : Math.max(0, studyHours - 0.5);
    setStudyHours(newValue);
    onDataChange?.({ studyHours: newValue, totalQuestions });
  };

  const handleTotalQuestionsChange = (increment: boolean) => {
    const newValue = increment ? totalQuestions + 10 : Math.max(0, totalQuestions - 10);
    setTotalQuestions(newValue);
    onDataChange?.({ studyHours, totalQuestions: newValue });
  };

  // Tarih formatını ayarla
  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setCurrentDate(today.toLocaleDateString('tr-TR', options));
  }, []);

  // Progress hesaplamaları - Bileşik hesaplama
  const studyProgress = Math.min((studyHours / goals.studyHours) * 100, 100);
  const questionProgress = Math.min((totalQuestions / goals.totalQuestions) * 100, 100);
  const overallProgress = Math.min(((studyHours / goals.studyHours) + (totalQuestions / goals.totalQuestions)) / 2 * 100, 100);

  // Hedef modal fonksiyonları
  const openGoalModal = () => {
    setTempGoals(goals);
    setShowGoalModal(true);
  };

  const saveGoals = () => {
    setGoals(tempGoals);
    setShowGoalModal(false);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Title Section - Overlapping Design */}
      <View style={styles.titleSection}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.titleGradient}
        >
          <Text style={styles.titleText}>Günün Verileri</Text>
        </LinearGradient>
      </View>

      {/* Main Card */}
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Study Hours Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
              Çalışma Süresi
            </Text>
            <View style={styles.valueRow}>
              <TouchableOpacity
                style={[styles.controlBtn, { backgroundColor: theme.colors.surfaceVariant }]}
                onPress={() => handleStudyHoursChange(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={16} color={theme.colors.onSurface} />
              </TouchableOpacity>
              <Text style={[styles.value, { color: theme.colors.onSurface }]}>
                {studyHours.toFixed(1)}
              </Text>
              <TouchableOpacity
                style={[styles.controlBtn, { backgroundColor: theme.colors.surfaceVariant }]}
                onPress={() => handleStudyHoursChange(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={16} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Total Questions Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
              Toplam Soru
            </Text>
            <View style={styles.valueRow}>
              <TouchableOpacity
                style={[styles.controlBtn, { backgroundColor: theme.colors.surfaceVariant }]}
                onPress={() => handleTotalQuestionsChange(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={16} color={theme.colors.onSurface} />
              </TouchableOpacity>
              <Text style={[styles.value, { color: theme.colors.onSurface }]}>
                {totalQuestions}
              </Text>
              <TouchableOpacity
                style={[styles.controlBtn, { backgroundColor: theme.colors.surfaceVariant }]}
                onPress={() => handleTotalQuestionsChange(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={16} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Progress Bar - Top Right */}
        <View style={styles.progressContainer}>
          <View style={styles.progressRow}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${overallProgress}%` }]}
              />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
              {Math.round(overallProgress)}%
            </Text>
          </View>
        </View>

        {/* Ayar Tuşu - Sağ Köşe */}
        <TouchableOpacity onPress={openGoalModal} style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={18} color={theme.colors.onSurfaceVariant} />
        </TouchableOpacity>

        {/* Tarih - Sağ Köşe */}
        <View style={styles.dateContainer}>
          <Text style={[styles.dateText, { color: theme.colors.onSurfaceVariant }]}>
            {new Date().toLocaleDateString('tr-TR', { 
              day: 'numeric', 
              month: 'numeric'
            })}
          </Text>
        </View>
      </View>

      {/* Hedef Belirleme Modal */}
      <Portal>
        <Modal
          visible={showGoalModal}
          onDismiss={() => setShowGoalModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            Günlük Hedefler
          </Text>
          
          <View style={styles.modalSection}>
            <Text style={[styles.modalLabel, { color: theme.colors.onSurfaceVariant }]}>
              Çalışma Süresi Hedefi (Saat)
            </Text>
            <TextInput
              value={tempGoals.studyHours.toString()}
              onChangeText={(text) => setTempGoals({...tempGoals, studyHours: parseFloat(text) || 0})}
              keyboardType="numeric"
              style={styles.modalInput}
              mode="outlined"
            />
          </View>

          <View style={styles.modalSection}>
            <Text style={[styles.modalLabel, { color: theme.colors.onSurfaceVariant }]}>
              Soru Hedefi
            </Text>
            <TextInput
              value={tempGoals.totalQuestions.toString()}
              onChangeText={(text) => setTempGoals({...tempGoals, totalQuestions: parseInt(text) || 0})}
              keyboardType="numeric"
              style={styles.modalInput}
              mode="outlined"
            />
          </View>

          <View style={styles.modalButtons}>
            <Button 
              mode="outlined" 
              onPress={() => setShowGoalModal(false)}
              style={styles.modalButton}
            >
              İptal
            </Button>
            <Button 
              mode="contained" 
              onPress={saveGoals}
              style={styles.modalButton}
            >
              Kaydet
            </Button>
          </View>
        </Modal>
      </Portal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  titleSection: {
    marginBottom: -15,
    zIndex: 1,
  },
  titleGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  titleText: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: 'white',
    textAlign: 'center',
  },

  card: {
    borderRadius: 16,
    padding: 20,
    paddingTop: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  section: {
    flex: 1,
    alignItems: 'flex-start',
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
  },
  controlBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    position: 'absolute',
    top: 10,
    right: 100,
    alignItems: 'flex-end',
    width: 80,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressButton: {
    padding: 4,
    marginBottom: 4,
  },
  progressBar: {
    width: 60,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    fontFamily: 'Poppins_500Medium',
  },
  // Modal stilleri
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalSection: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: 'transparent',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  dateContainer: {
    position: 'absolute',
    top: 10,
    right: 50,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dateText: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
  },
  settingsButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    padding: 4,
  },
}); 