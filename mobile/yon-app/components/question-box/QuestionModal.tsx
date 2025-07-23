import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import {
  Modal,
  Portal,
  Text,
  Button,
  IconButton,
  Divider,
} from "react-native-paper";
import { useAppTheme } from "@/constants/PaperTheme";
import { Question } from "@/types";

interface QuestionModalProps {
  visible: boolean;
  question: Question | null;
  onDismiss: () => void;
}

export function QuestionModal({
  visible,
  question,
  onDismiss,
}: QuestionModalProps) {
  const theme = useAppTheme();

  if (!question) return null;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modalContainer,
          {
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        {/* Simple Header */}
        <View style={styles.simpleHeader}>
          <Text variant="titleLarge" style={styles.headerTitle}>
            Soru
          </Text>
          <IconButton
            icon="close"
            size={24}
            onPress={onDismiss}
            style={styles.closeButton}
            iconColor={theme.colors.onSurfaceVariant}
          />
        </View>

        <Divider
          style={[styles.divider, { backgroundColor: theme.colors.outline }]}
        />

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Question Text */}
          <View style={styles.questionContainer}>
            <Text
              variant="bodyLarge"
              style={[styles.questionText, { color: theme.colors.onSurface }]}
            >
              {question.questionText}
            </Text>
          </View>
        </ScrollView>

        {/* Fixed Action Buttons */}
        <View style={styles.actionButtons}>
          <View style={styles.primaryButtons}>
            <Button
              mode="contained"
              onPress={() => {
                console.log("Soruyu çöz:", question.id);
                onDismiss();
              }}
              style={[styles.actionButton, styles.solveButton]}
              contentStyle={styles.primaryButtonContent}
              labelStyle={styles.primaryButtonLabel}
              icon="play-circle"
            >
              Soruyu Çöz
            </Button>
            <Button
              mode="outlined"
              onPress={() => {
                console.log("Yapay zekaya sor:", question.id);
                onDismiss();
              }}
              style={[styles.actionButton, styles.aiButton]}
              contentStyle={styles.secondaryButtonContent}
              labelStyle={styles.secondaryButtonLabel}
              icon="star-four-points"
            >
              AI Yardım
            </Button>
          </View>
          <Button
            mode="text"
            onPress={onDismiss}
            style={styles.cancelButton}
            contentStyle={styles.cancelButtonContent}
            labelStyle={styles.cancelButtonLabel}
          >
            Kapat
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    margin: 20,
    borderRadius: 12,
    maxHeight: "88%",
    minHeight: 450,
    elevation: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  simpleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    lineHeight: 24,
  },
  closeButton: {
    margin: 0,
  },
  divider: {
    marginHorizontal: 20,
    height: 1,
  },
  questionContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  questionText: {
    fontFamily: "Poppins_400Regular",
    lineHeight: 26,
    fontSize: 16,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 5,
  },
  primaryButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    elevation: 0,
  },
  cancelButton: {
    borderRadius: 8,
    alignSelf: "center",
    minWidth: 80,
  },
  aiButton: {
    borderWidth: 1,
    borderRadius: 10,
  },
  solveButton: {
    elevation: 1,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  primaryButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  secondaryButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  buttonContent: {
    paddingVertical: 4,
  },
  cancelButtonContent: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  primaryButtonLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    letterSpacing: 0,
  },
  secondaryButtonLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    letterSpacing: 0,
  },
  buttonLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
  },
  cancelButtonLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    letterSpacing: 0,
  },
});
