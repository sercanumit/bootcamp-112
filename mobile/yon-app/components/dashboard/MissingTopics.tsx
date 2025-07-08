import { StyleSheet, View, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

interface TopicItemProps {
  subject: string;
  topic: string;
  difficulty: "Kolay" | "Orta" | "Zor";
  questionCount: number;
}

function TopicItem({
  subject,
  topic,
  difficulty,
  questionCount,
}: TopicItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <TouchableOpacity
      style={[styles.topicItem, { backgroundColor: colors.cardBackground }]}
    >
      <View style={styles.topicHeader}>
        <View style={styles.topicInfo}>
          <ThemedText type="defaultSemiBold" style={styles.topicTitle}>
            {topic}
          </ThemedText>
          <ThemedText style={[styles.subject, { color: colors.icon }]}>
            {subject}
          </ThemedText>
        </View>
        <View style={styles.topicMeta}>
          <DifficultyBadge difficulty={difficulty} size="medium" />
          <ThemedText style={[styles.questionCount, { color: colors.icon }]}>
            {questionCount} soru
          </ThemedText>
        </View>
      </View>
      <View style={styles.actionRow}>
        <IconSymbol name="chevron.right" size={16} color={colors.tint} />
      </View>
    </TouchableOpacity>
  );
}

export function MissingTopics() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const missingTopics = [
    {
      subject: "Matematik",
      topic: "Türev Uygulamaları",
      difficulty: "Zor" as const,
      questionCount: 25,
    },
    {
      subject: "Fizik",
      topic: "Elektrik ve Manyetizma",
      difficulty: "Orta" as const,
      questionCount: 18,
    },
    {
      subject: "Kimya",
      topic: "Asit-Baz Dengesi",
      difficulty: "Kolay" as const,
      questionCount: 12,
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.sectionHeader}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Eksik Konular
        </ThemedText>
        <TouchableOpacity>
          <ThemedText style={[styles.viewAll, { color: colors.tint }]}>
            Tümünü Gör
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.topicsList}>
        {missingTopics.map((topic, index) => (
          <TopicItem
            key={index}
            subject={topic.subject}
            topic={topic.topic}
            difficulty={topic.difficulty}
            questionCount={topic.questionCount}
          />
        ))}
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
  viewAll: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Poppins_600SemiBold",
  },
  topicsList: {
    gap: 12,
  },
  topicItem: {
    padding: 15,
    borderRadius: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  topicHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    marginBottom: 4,
    lineHeight: 22,
  },
  subject: {
    fontSize: 9,
    lineHeight: 13,
    fontFamily: "Poppins_400Regular",
  },
  topicMeta: {
    alignItems: "flex-end",
  },
  questionCount: {
    fontSize: 9,
    lineHeight: 13,
    fontFamily: "Poppins_400Regular",
  },
  actionRow: {
    alignItems: "flex-end",
  },
});
