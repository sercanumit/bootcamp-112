import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { OnboardingCard } from '@/components/onboarding/OnboardingCard';
import { useAuth } from '@/hooks/useAuth';
import { saveUserProfile } from '@/services/api';

interface OnboardingData {
  targetProfession: string[];
  examType: string[];
  grade: string[];
}

export default function OnboardingScreen() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    targetProfession: [],
    examType: [],
    grade: [],
  });

  // Onboarding adımları
  const steps = [
    {
      id: 'targetProfession',
      title: 'Hedef Mesleğiniz Nedir?',
      subtitle: 'Hangi mesleği hedefliyorsunuz? Birden fazla seçebilirsiniz.',
      options: [
        { id: 'engineer', title: 'Mühendislik', icon: 'construct' as const, color: '#4ECDC4' },
        { id: 'doctor', title: 'Tıp', icon: 'medical' as const, color: '#FF6B6B' },
        { id: 'lawyer', title: 'Hukuk', icon: 'library' as const, color: '#45B7D1' },
        { id: 'teacher', title: 'Öğretmenlik', icon: 'school' as const, color: '#96CEB4' },
        { id: 'architect', title: 'Mimarlık', icon: 'business' as const, color: '#FF9F43' },
        { id: 'accountant', title: 'Muhasebe', icon: 'calculator' as const, color: '#10AC84' },
        { id: 'psychologist', title: 'Psikoloji', icon: 'heart' as const, color: '#54A0FF' },
        { id: 'dentist', title: 'Diş Hekimliği', icon: 'medical-outline' as const, color: '#5F27CD' },
      ],
      minSelection: 1,
      maxSelection: 3,
    },
    {
      id: 'examType',
      title: 'Hangi Sınavlara Hazırlanıyorsunuz?',
      subtitle: 'Hedeflediğiniz sınav türlerini seçin.',
      options: [
        { id: 'tyt', title: 'TYT', icon: 'book' as const, color: '#4ECDC4' },
        { id: 'ayt', title: 'AYT', icon: 'library' as const, color: '#FF6B6B' },
        { id: 'ydt', title: 'YDT', icon: 'language' as const, color: '#45B7D1' },
        { id: 'kpss', title: 'KPSS', icon: 'document-text' as const, color: '#96CEB4' },
        { id: 'ales', title: 'ALES', icon: 'analytics' as const, color: '#FF9F43' },
        { id: 'yks', title: 'YKS', icon: 'trophy' as const, color: '#10AC84' },
      ],
      minSelection: 1,
      maxSelection: 2,
    },
    {
      id: 'grade',
      title: 'Sınıfınız Nedir?',
      subtitle: 'Mevcut durumunuzu seçin.',
      options: [
        { id: '9', title: '9. Sınıf', icon: 'school' as const, color: '#4ECDC4' },
        { id: '10', title: '10. Sınıf', icon: 'school' as const, color: '#FF6B6B' },
        { id: '11', title: '11. Sınıf', icon: 'school' as const, color: '#45B7D1' },
        { id: '12', title: '12. Sınıf', icon: 'school' as const, color: '#96CEB4' },
        { id: 'graduate', title: 'Mezun', icon: 'person' as const, color: '#FF9F43' },
      ],
      minSelection: 1,
      maxSelection: 1,
    },
  ];

  const currentStepData = steps[currentStep];

  const handleOptionSelect = (optionId: string) => {
    const stepKey = currentStepData.id as keyof OnboardingData;
    const currentSelections = onboardingData[stepKey];
    
    let newSelections: string[];
    if (currentSelections.includes(optionId)) {
      // Seçili ise kaldır
      newSelections = currentSelections.filter(id => id !== optionId);
    } else {
      // Seçili değilse ekle
      newSelections = [...currentSelections, optionId];
    }
    
    setOnboardingData(prev => ({
      ...prev,
      [stepKey]: newSelections,
    }));
  };

  const handleContinue = async () => {
    if (currentStep < steps.length - 1) {
      // Sonraki adıma geç
      setCurrentStep(currentStep + 1);
    } else {
      // Onboarding tamamlandı, verileri kaydet
      try {
        await saveOnboardingData();
      } catch (error) {
        console.error('Onboarding kaydetme hatası:', error);
        Alert.alert('Hata', 'Veriler kaydedilemedi. Tekrar deneyin.');
      }
    }
  };

  const handleSkip = () => {
    // Skip butonuna basıldığında ana sayfaya yönlendir
    router.replace('/(tabs)');
  };

  const saveOnboardingData = async () => {
    try {
      console.log('💾 Onboarding verileri kaydediliyor:', onboardingData);
      
      // Onboarding verilerini backend'e kaydet
      const response = await saveUserProfile({
        target_profession: onboardingData.targetProfession.join(', '),
        exam_type: onboardingData.examType.join(', '),
        grade: onboardingData.grade.join(', '),
        onboarding_completed: true, // Onboarding tamamlandı işareti
      });

      if (response.success) {
        console.log('✅ Onboarding verileri kaydedildi');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Hata', response.message || 'Veriler kaydedilemedi');
      }
    } catch (error) {
      console.error('Onboarding kaydetme hatası:', error);
      Alert.alert('Hata', 'Veriler kaydedilemedi. Tekrar deneyin.');
    }
  };

  const getCurrentSelections = () => {
    const stepKey = currentStepData.id as keyof OnboardingData;
    return onboardingData[stepKey];
  };

  return (
    <View style={styles.container}>
      <OnboardingCard
        title={currentStepData.title}
        subtitle={currentStepData.subtitle}
        options={currentStepData.options}
        selectedOptions={getCurrentSelections()}
        onOptionSelect={handleOptionSelect}
        onContinue={handleContinue}
        onSkip={handleSkip}
        minSelection={currentStepData.minSelection}
        maxSelection={currentStepData.maxSelection}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
}); 