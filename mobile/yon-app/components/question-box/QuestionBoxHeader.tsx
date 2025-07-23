import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

export function QuestionBoxHeader() {
  return (
    <View style={styles.header}>
      <Text variant="headlineMedium" style={styles.headerTitle}>
        Soru Kutum
      </Text>
      <Text variant="bodyMedium" style={styles.headerSubtitle}>
        Yanlış yaptığın ve işaretlediğin soruları takip et
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontFamily: "Poppins_700Bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: "Poppins_400Regular",
    opacity: 0.7,
  },
});
