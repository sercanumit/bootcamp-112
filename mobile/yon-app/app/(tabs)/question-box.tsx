import React, { useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import {
  QuestionBoxHeader,
  SubjectFilter,
  QuestionCarousel,
  QuestionModal,
} from "@/components/question-box";
import { MOCK_QUESTIONS } from "@/data/mockQuestions";
import { Question } from "@/types";
import {
  filterQuestionsBySubject,
  getWrongQuestions,
  getBookmarkedQuestions,
} from "@/utils/questionUtils";

export default function QuestionBoxScreen() {
  const [selectedSubject, setSelectedSubject] = useState("Tümü");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Filter questions based on selected subject
  const filteredQuestions = filterQuestionsBySubject(
    MOCK_QUESTIONS,
    selectedSubject
  );

  const wrongQuestions = getWrongQuestions(filteredQuestions);
  const bookmarkedQuestions = getBookmarkedQuestions(filteredQuestions);

  const handleQuestionPress = (question: Question) => {
    setSelectedQuestion(question);
    setIsModalVisible(true);
  };

  const handleModalDismiss = () => {
    setIsModalVisible(false);
    setSelectedQuestion(null);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <QuestionBoxHeader />

        {/* Subject Filter */}
        <SubjectFilter
          selectedSubject={selectedSubject}
          onSubjectChange={setSelectedSubject}
        />

        {/* Wrong Questions Carousel */}
        <QuestionCarousel
          title="Yanlış Yaptığın Sorular"
          questions={wrongQuestions}
          onSeeMore={() => console.log("See more wrong questions")}
          emptyMessage="Henüz yanlış yaptığın soru bulunmuyor 🎉"
          showBookmarkChip={true}
          onQuestionPress={handleQuestionPress}
        />

        {/* Bookmarked Questions Carousel */}
        <QuestionCarousel
          title="İşaretlediğin Sorular"
          questions={bookmarkedQuestions}
          onSeeMore={() => console.log("See more bookmarked questions")}
          emptyMessage="Henüz işaretlediğin soru bulunmuyor"
          showBookmarkChip={false}
          onQuestionPress={handleQuestionPress}
        />
      </ScrollView>

      {/* Question Modal */}
      <QuestionModal
        visible={isModalVisible}
        question={selectedQuestion}
        onDismiss={handleModalDismiss}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
});
