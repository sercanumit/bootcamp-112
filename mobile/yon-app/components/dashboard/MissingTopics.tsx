import { StyleSheet, View } from "react-native";
import { Card, Text, List, Button, IconButton } from "react-native-paper";
import { ThemedView } from "@/components/ThemedView";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { useAppTheme } from "@/constants/PaperTheme";

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
  const theme = useAppTheme();

  return (
    <Card
      mode="elevated"
      style={[
        styles.topicCard,
        { backgroundColor: theme.colors.elevation.level2 },
      ]}
      elevation={2}
      onPress={() => {}}
    >
      <Card.Content style={styles.cardContent}>
        {/* Header with subject and difficulty badge */}
        <View style={styles.cardHeader}>
          <View style={styles.subjectContainer}>
            <Text
              variant="labelMedium"
              style={[styles.subject, { color: theme.colors.primary }]}
            >
              {subject}
            </Text>
          </View>
          <DifficultyBadge difficulty={difficulty} size="small" />
        </View>

        {/* Main content with button */}
        <View style={styles.cardBody}>
          <View style={styles.topicInfo}>
            <Text
              variant="titleMedium"
              style={[styles.topicTitle, { color: theme.colors.onSurface }]}
              numberOfLines={2}
            >
              {topic}
            </Text>

            <Text
              variant="bodySmall"
              style={[
                styles.questionCount,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {questionCount} soru mevcut
            </Text>
          </View>

          {/* Action button positioned at bottom right */}
          <IconButton
            icon="arrow-right-bottom"
            size={28}
            iconColor={theme.colors.primary}
            containerColor="transparent"
            style={styles.practiceButton}
            onPress={() => {}}
          />
        </View>
      </Card.Content>
    </Card>
  );
}

interface MissingTopicsProps {
  topics?: string[];
}

export function MissingTopics({ topics }: MissingTopicsProps) {
  const theme = useAppTheme();

  // Default topics if not provided
  const missingTopics = topics?.length ? topics.map((topic, index) => ({
    subject: ["Matematik", "Fizik", "Kimya"][index % 3],
    topic: topic,
    difficulty: (["Kolay", "Orta", "Zor"] as const)[index % 3],
    questionCount: Math.floor(Math.random() * 30) + 10,
  })) : [
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
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Eksik Konular
        </Text>
        <Button mode="text" onPress={() => {}}>
          Tümünü Gör
        </Button>
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
    fontFamily: "Poppins_700Bold",
  },
  topicsList: {
    gap: 12,
  },
  topicCard: {
    borderRadius: 16,
    marginVertical: 2,
  },
  cardContent: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  subjectContainer: {
    flex: 1,
  },
  subject: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  topicInfo: {
    flex: 1,
    paddingRight: 12,
  },
  topicTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  questionCount: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
  },
  practiceButton: {
    borderRadius: 20,
    margin: 0,
    backgroundColor: "transparent",
  },
});
