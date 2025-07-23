import React from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { Text, Card, Button } from "react-native-paper";
import { useAppTheme } from "@/constants/PaperTheme";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Question } from "@/types";
import { QuestionCard } from "./QuestionCard";

interface QuestionCarouselProps {
  title: string;
  questions: Question[];
  onSeeMore: () => void;
  emptyMessage: string;
  showBookmarkChip?: boolean; // Pass this to QuestionCard
  onQuestionPress: (question: Question) => void;
}

export function QuestionCarousel({
  title,
  questions,
  onSeeMore,
  emptyMessage,
  showBookmarkChip = false,
  onQuestionPress,
}: QuestionCarouselProps) {
  const theme = useAppTheme();

  if (questions.length === 0) {
    return (
      <View style={styles.carouselContainer}>
        <View style={styles.carouselHeader}>
          <Text variant="titleMedium" style={styles.carouselTitle}>
            {title}
          </Text>
        </View>
        <Card style={styles.emptyCard} mode="outlined">
          <Card.Content style={styles.emptyCardContent}>
            <View
              style={[
                styles.emptyIconContainer,
                {
                  backgroundColor:
                    title === "Yanlış Yaptığın Sorular"
                      ? theme.colors.primaryContainer
                      : theme.colors.surfaceVariant,
                },
              ]}
            >
              <IconSymbol
                name={
                  title === "Yanlış Yaptığın Sorular"
                    ? "star.fill"
                    : "questionmark.folder"
                }
                size={36}
                color={
                  title === "Yanlış Yaptığın Sorular"
                    ? theme.colors.primary
                    : theme.colors.onSurfaceVariant
                }
              />
            </View>
            <Text variant="titleMedium" style={styles.emptyTitle}>
              {title === "Yanlış Yaptığın Sorular"
                ? "Harika! 🎉"
                : "Henüz işaretlenmemiş"}
            </Text>
            <Text variant="bodyMedium" style={styles.emptyMessage}>
              {emptyMessage}
            </Text>
            {title === "Yanlış Yaptığın Sorular" && (
              <Text variant="bodySmall" style={styles.emptySubMessage}>
                Doğru cevaplarınla devam et!
              </Text>
            )}
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.carouselContainer}>
      <View style={styles.carouselHeader}>
        <Text variant="titleMedium" style={styles.carouselTitle}>
          {title}
        </Text>
        <Button
          mode="text"
          compact
          onPress={onSeeMore}
          contentStyle={styles.seeMoreButtonContent}
        >
          Daha fazla
        </Button>
      </View>

      <FlatList
        data={questions.slice(0, 10)}
        renderItem={({ item }) => (
          <QuestionCard
            question={item}
            onPress={() => onQuestionPress(item)}
            showBookmarkChip={showBookmarkChip}
          />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContent}
        ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  carouselContainer: {
    marginBottom: 24,
  },
  carouselHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  carouselTitle: {
    fontFamily: "Poppins_700Bold",
  },
  seeMoreButtonContent: {
    height: 32,
  },
  carouselContent: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  cardSeparator: {
    width: 12,
  },
  emptyCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  emptyCardContent: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: "Poppins_700Bold",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyMessage: {
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 20,
    marginBottom: 4,
  },
  emptySubMessage: {
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    opacity: 0.6,
    fontSize: 12,
    fontStyle: "italic",
  },
});
