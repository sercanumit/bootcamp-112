import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, Card, Icon } from "react-native-paper";
import { ThemedView } from "@/components/ThemedView";
import { useAppTheme } from "@/constants/PaperTheme";

export default function PracticeScreen() {
  const theme = useAppTheme();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.centerContainer}>
        <Card style={styles.developmentCard} mode="elevated">
          <Card.Content style={styles.cardContent}>
            <Icon
              source="file-question-outline"
              size={64}
              color={theme.colors.primary}
            />
            <Text variant="headlineMedium" style={styles.title}>
              Soru Kutusu
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Bu bölüm geliştiriliyor
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              Yakında burada işaretlediklerinizi, yanlış yaptığınız ve takip
              ettiğiniz soruları bulabileceksiniz.
            </Text>
          </Card.Content>
        </Card>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  developmentCard: {
    width: "100%",
    maxWidth: 400,
  },
  cardContent: {
    alignItems: "center",
    paddingVertical: 32,
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "Poppins_700Bold",
  },
  subtitle: {
    marginBottom: 16,
    textAlign: "center",
    fontFamily: "Poppins_600SemiBold",
  },
  description: {
    textAlign: "center",
    opacity: 0.8,
    lineHeight: 20,
  },
});
