import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, Card, Chip } from "react-native-paper";
import { useAppTheme } from "@/constants/PaperTheme";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { Question } from "@/types";

interface QuestionCardProps {
  question: Question;
  onPress: () => void;
  showBookmarkChip?: boolean; // true for wrong questions carousel, false for bookmarked questions carousel
}

export function QuestionCard({
  question,
  onPress,
  showBookmarkChip = false,
}: QuestionCardProps) {
  const theme = useAppTheme();

  // Check if chip should be shown
  const shouldShowChip =
    (showBookmarkChip && question.isBookmarked) ||
    (!showBookmarkChip && question.isWrong);

  return (
    <Card style={styles.questionCard} mode="elevated" onPress={onPress}>
      <Card.Content style={styles.questionCardContent}>
        <View style={styles.questionCardBody}>
          <View style={styles.questionCardHeader}>
            <Text
              variant="labelMedium"
              style={[styles.subjectText, { color: theme.colors.primary }]}
            >
              {question.subject}
            </Text>
            <DifficultyBadge difficulty={question.difficulty} size="small" />
          </View>

          <Text variant="bodyMedium" style={styles.topicText} numberOfLines={1}>
            {question.topic}
          </Text>

          <Text
            variant="bodySmall"
            style={styles.questionPreview}
            numberOfLines={shouldShowChip ? 4 : 5}
          >
            {question.questionText}
          </Text>
        </View>

        {shouldShowChip && (
          <View style={styles.questionCardFooter}>
            <View style={{ flex: 1 }} />
            {showBookmarkChip && question.isBookmarked && (
              <Chip
                mode="outlined"
                style={[
                  styles.compactChip,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: theme.colors.outline,
                  },
                ]}
                textStyle={[
                  styles.compactChipText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
                icon="bookmark"
                compact
              >
                İşaretli
              </Chip>
            )}
            {!showBookmarkChip && question.isWrong && (
              <Chip
                mode="outlined"
                style={[
                  styles.compactChip,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: theme.colors.outline,
                  },
                ]}
                textStyle={[
                  styles.compactChipText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
                icon="close-circle"
                compact
              >
                Yanlış
              </Chip>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  questionCard: {
    width: 280,
    height: 200,
    borderRadius: 16,
    marginVertical: 4,
    marginHorizontal: 2,
  },
  questionCardContent: {
    padding: 16,
    height: "100%",
  },
  questionCardBody: {
    flex: 1,
  },
  questionCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  subjectText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  topicText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    marginBottom: 4,
  },
  questionPreview: {
    fontFamily: "Poppins_400Regular",
    lineHeight: 16,
    marginBottom: 6,
    opacity: 0.8,
  },
  questionCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  compactChip: {
    minHeight: 22,
    borderRadius: 10,
    paddingVertical: 0,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 3,
    marginRight: 4,
    elevation: 0,
    borderWidth: 1,
    maxWidth: 80,
  },
  compactChipText: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    lineHeight: 13,
    textAlign: "center",
    marginLeft: 2,
  },
});
