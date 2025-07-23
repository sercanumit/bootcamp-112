import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { Chip } from "react-native-paper";
import { useAppTheme } from "@/constants/PaperTheme";
import { SUBJECTS } from "@/types";

interface SubjectFilterProps {
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
}

export function SubjectFilter({
  selectedSubject,
  onSubjectChange,
}: SubjectFilterProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.filterContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollContent}
      >
        {SUBJECTS.map((subject) => (
          <Chip
            key={subject}
            selected={selectedSubject === subject}
            onPress={() => onSubjectChange(subject)}
            style={[
              styles.filterChip,
              selectedSubject === subject && {
                backgroundColor: theme.colors.primary,
              },
            ]}
            textStyle={[
              styles.filterChipText,
              selectedSubject === subject && {
                color: theme.colors.onPrimary,
              },
            ]}
          >
            {subject}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    paddingVertical: 8,
    marginBottom: 16,
  },
  filterScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    borderRadius: 20,
  },
  filterChipText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
  },
});
