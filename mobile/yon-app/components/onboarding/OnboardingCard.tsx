import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/constants/PaperTheme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface OnboardingOption {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface OnboardingCardProps {
  title: string;
  subtitle: string;
  options: OnboardingOption[];
  selectedOptions: string[];
  onOptionSelect: (optionId: string) => void;
  onContinue: () => void;
  onSkip?: () => void;
  minSelection?: number;
  maxSelection?: number;
}

export function OnboardingCard({
  title,
  subtitle,
  options,
  selectedOptions,
  onOptionSelect,
  onContinue,
  onSkip,
  minSelection = 1,
  maxSelection = 3,
}: OnboardingCardProps) {
  const theme = useAppTheme();
  const canContinue = selectedOptions.length >= minSelection;

  const handleOptionPress = (optionId: string) => {
    if (selectedOptions.includes(optionId)) {
      // Seçili ise kaldır
      onOptionSelect(optionId);
    } else {
      // Seçili değilse ekle (max limit kontrolü ile)
      if (selectedOptions.length < maxSelection) {
        onOptionSelect(optionId);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      {onSkip && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={onSkip}
          activeOpacity={0.7}
        >
          <Text style={[styles.skipText, { color: theme.colors.primary }]}>
            Geç
          </Text>
        </TouchableOpacity>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          {subtitle}
        </Text>
      </View>

      {/* Options Grid */}
      <ScrollView 
        style={styles.optionsContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.optionsContent}
      >
        <View style={styles.optionsGrid}>
          {options.map((option) => {
            const isSelected = selectedOptions.includes(option.id);
            
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: isSelected ? option.color : theme.colors.surfaceVariant,
                    borderColor: isSelected ? option.color : 'transparent',
                  },
                ]}
                onPress={() => handleOptionPress(option.id)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={isSelected ? 'white' : option.color}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: isSelected ? 'white' : theme.colors.onSurface,
                      },
                    ]}
                  >
                    {option.title}
                  </Text>
                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                    size={20}
                    color={isSelected ? 'white' : option.color}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={onContinue}
          disabled={!canContinue}
          style={[
            styles.continueButton,
            {
              backgroundColor: canContinue ? theme.colors.primary : theme.colors.surfaceVariant,
            },
          ]}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          {canContinue ? 'Devam Et' : `${minSelection} seçim yapın`}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    flex: 1,
  },
  optionsContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionChip: {
    width: (width - 60) / 2, // 2 sütun, padding ve gap hesabı
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 16,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    flex: 1,
    marginHorizontal: 8,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  continueButton: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    height: 56,
  },
  buttonLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
  },
  skipButton: {
    position: 'absolute',
    top: 40,
    right: 24,
    backgroundColor: 'transparent',
    padding: 8,
  },
  skipText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
}); 