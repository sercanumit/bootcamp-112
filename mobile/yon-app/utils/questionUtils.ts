import { Question } from "@/types";

export const filterQuestionsBySubject = (
  questions: Question[],
  selectedSubject: string
): Question[] => {
  if (selectedSubject === "Tümü") {
    return questions;
  }
  return questions.filter((q) => q.subject === selectedSubject);
};

export const getWrongQuestions = (questions: Question[]): Question[] => {
  return questions.filter((q) => q.isWrong);
};

export const getBookmarkedQuestions = (questions: Question[]): Question[] => {
  return questions.filter((q) => q.isBookmarked);
};
