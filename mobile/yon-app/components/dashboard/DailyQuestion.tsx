import { StyleSheet, View, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export function DailyQuestion() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const currentDifficulty = "Orta";

  return (
    <ThemedView style={styles.container}>
      <View style={styles.sectionHeader}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Günün Sorusu
        </ThemedText>
        <DifficultyBadge difficulty={currentDifficulty} size="medium" />
      </View>

      <View
        style={[
          styles.questionCard,
          { backgroundColor: colors.cardBackground },
        ]}
      >
        <View style={styles.questionHeader}>
          <View style={styles.subjectInfo}>
            <ThemedText style={[styles.subject, { color: colors.tint }]}>
              Matematik
            </ThemedText>
            <ThemedText style={[styles.topic, { color: colors.icon }]}>
              Türev Uygulamaları
            </ThemedText>
          </View>
          <View style={styles.questionNumber}>
            <ThemedText
              style={[styles.questionNumberText, { color: colors.icon }]}
            >
              15/20
            </ThemedText>
          </View>
        </View>

        <View style={styles.questionContent}>
          <ThemedText style={styles.questionText}>
            f(x) = x³ - 3x² + 2x + 1 fonksiyonunun yerel minimum noktasının x
            koordinatı kaçtır?
          </ThemedText>
        </View>

        <View style={styles.options}>
          <TouchableOpacity
            style={[styles.option, { backgroundColor: colors.cardBackground }]}
          >
            <View style={[styles.optionCircle, { borderColor: colors.icon }]}>
              <ThemedText style={[styles.optionLetter, { color: colors.icon }]}>
                A
              </ThemedText>
            </View>
            <ThemedText style={styles.optionText}>x = 1/3</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, { backgroundColor: colors.cardBackground }]}
          >
            <View style={[styles.optionCircle, { borderColor: colors.icon }]}>
              <ThemedText style={[styles.optionLetter, { color: colors.icon }]}>
                B
              </ThemedText>
            </View>
            <ThemedText style={styles.optionText}>x = 2</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, { backgroundColor: colors.cardBackground }]}
          >
            <View style={[styles.optionCircle, { borderColor: colors.icon }]}>
              <ThemedText style={[styles.optionLetter, { color: colors.icon }]}>
                C
              </ThemedText>
            </View>
            <ThemedText style={styles.optionText}>x = 1</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, { backgroundColor: colors.cardBackground }]}
          >
            <View style={[styles.optionCircle, { borderColor: colors.icon }]}>
              <ThemedText style={[styles.optionLetter, { color: colors.icon }]}>
                D
              </ThemedText>
            </View>
            <ThemedText style={styles.optionText}>x = 0</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.skipButton, { borderColor: colors.icon }]}
          >
            <ThemedText style={[styles.skipButtonText, { color: colors.icon }]}>
              Geç
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.answerButton, { backgroundColor: colors.tint }]}
          >
            <ThemedText style={styles.answerButtonText}>Cevapla</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
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
    marginBottom: 0,
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    lineHeight: 28,
  },
  questionCard: {
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
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
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 2,
  },
  topic: {
    fontSize: 9,
    lineHeight: 13,
    fontFamily: "Poppins_400Regular",
  },
  questionNumber: {
    padding: 8,
    borderRadius: 8,
  },
  questionNumberText: {
    fontSize: 9,
    lineHeight: 13,
    fontFamily: "Poppins_600SemiBold",
  },
  questionContent: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: "Poppins_400Regular",
  },
  options: {
    marginBottom: 20,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  optionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optionLetter: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily: "Poppins_600SemiBold",
  },
  optionText: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Poppins_400Regular",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  skipButtonText: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Poppins_600SemiBold",
  },
  answerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  answerButtonText: {
    color: "#fff",
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Poppins_600SemiBold",
  },
});
