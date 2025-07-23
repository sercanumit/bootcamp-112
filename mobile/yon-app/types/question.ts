export interface Question {
  id: string;
  subject: string;
  topic: string;
  difficulty: "Kolay" | "Orta" | "Zor";
  questionText: string;
  isWrong: boolean;
  isBookmarked: boolean;
}

export const SUBJECTS = [
  "Tümü",
  "Matematik",
  "Fizik",
  "Kimya",
  "Biyoloji",
  "Türkçe",
];
