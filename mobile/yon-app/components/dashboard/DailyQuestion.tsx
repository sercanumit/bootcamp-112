import { StyleSheet, View } from "react-native";
import { Card, Text, Button, Chip, RadioButton } from "react-native-paper";
import { ThemedView } from "@/components/ThemedView";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { useAppTheme } from "@/constants/PaperTheme";
import { useState } from "react";

export function DailyQuestion() {
  const theme = useAppTheme();
  const [selectedOption, setSelectedOption] = useState("");

  const currentDifficulty = "Orta";
  const options = [
    { text: "x = 0" },
    { text: "x = 1/3" },
    { text: "x = 2" },
    { text: "x = 1" },
    { text: "x = -1" },
  ];

  // Şık harflerini oluştur (A, B, C, D, E, ...)
  const getOptionLetter = (index: number) => String.fromCharCode(65 + index);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Günün Sorusu
        </Text>
      </View>

      <Card mode="elevated" style={styles.questionCard}>
        <Card.Content>
          <View style={styles.questionHeader}>
            <View style={styles.subjectInfo}>
              <Text
                variant="titleMedium"
                style={[styles.subject, { color: theme.colors.primary }]}
              >
                Matematik
              </Text>
              <Text
                variant="bodySmall"
                style={[styles.topic, { color: theme.colors.onSurfaceVariant }]}
              >
                Türev Uygulamaları
              </Text>
            </View>
            <DifficultyBadge difficulty={currentDifficulty} size="small" />
          </View>

          <View style={styles.questionContent}>
            <Text variant="bodyLarge" style={styles.questionText}>
              f(x) = x³ - 3x² + 2x + 1 fonksiyonunun yerel minimum noktasının x
              koordinatı kaçtır?
            </Text>
          </View>

          <RadioButton.Group
            onValueChange={setSelectedOption}
            value={selectedOption}
          >
            {options.map((option, index) => {
              const optionLetter = getOptionLetter(index);
              return (
                <View key={`option-${index}`} style={styles.optionContainer}>
                  <RadioButton.Item
                    label={`${optionLetter}) ${option.text}`}
                    value={`option-${index}`}
                    style={styles.radioItem}
                    labelStyle={styles.optionText}
                    position="leading"
                  />
                </View>
              );
            })}
          </RadioButton.Group>
        </Card.Content>

        <Card.Actions style={styles.cardActions}>
          <Button
            mode="contained-tonal"
            onPress={() => {}}
            style={styles.skipButton}
          >
            Geç
          </Button>
          <Button
            mode="contained"
            onPress={() => {}}
            style={styles.answerButton}
            disabled={!selectedOption}
          >
            Cevapla
          </Button>
        </Card.Actions>
      </Card>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontFamily: "Poppins_700Bold",
  },
  questionCard: {
    borderRadius: 16,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  subjectInfo: {
    flex: 1,
  },
  subject: {
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 2,
  },
  topic: {
    fontFamily: "Poppins_400Regular",
  },
  questionContent: {
    marginBottom: 20,
  },
  questionText: {
    fontFamily: "Poppins_400Regular",
    lineHeight: 24,
  },
  optionContainer: {
    marginVertical: 2,
  },
  radioItem: {
    paddingLeft: 0,
  },
  optionText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    textAlign: "left",
  },
  cardActions: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  skipButton: {
    flex: 1,
    marginRight: 8,
  },
  answerButton: {
    flex: 1,
    marginLeft: 8,
  },
});
