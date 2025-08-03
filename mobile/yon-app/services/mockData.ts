import { DashboardData, Question } from './api';

// Mock Dashboard Data
export const mockDashboardData: DashboardData = {
  stats: {
    totalQuestions: 150,
    correctAnswers: 120,
    wrongAnswers: 30,
    accuracy: 80,
  },
  dailyQuestion: {
    id: 'daily-1',
    question: 'Bir üçgenin iç açıları toplamı kaç derecedir?',
    options: ['90°', '180°', '270°', '360°'],
    subject: 'Matematik',
    difficulty: 'easy',
  },
  missingTopics: [
    'Trigonometri',
    'Türev',
    'İntegral',
    'Logaritma',
  ],
};

// Mock Questions Data
export const mockQuestions: Question[] = [
  {
    id: 'q1',
    question: '2x + 5 = 13 denkleminin çözümü nedir?',
    options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'],
    correctAnswer: 'x = 4',
    explanation: '2x + 5 = 13 → 2x = 8 → x = 4',
    subject: 'Matematik',
    difficulty: 'easy',
    tags: ['denklem', 'cebir'],
  },
  {
    id: 'q2',
    question: 'Hangi element periyodik tabloda "Fe" sembolü ile gösterilir?',
    options: ['Flor', 'Demir', 'Fosfor', 'Fermiyum'],
    correctAnswer: 'Demir',
    explanation: 'Fe sembolü Demir elementini temsil eder.',
    subject: 'Kimya',
    difficulty: 'medium',
    tags: ['periyodik tablo', 'elementler'],
  },
  {
    id: 'q3',
    question: 'Türkiye\'nin başkenti neresidir?',
    options: ['İstanbul', 'Ankara', 'İzmir', 'Bursa'],
    correctAnswer: 'Ankara',
    explanation: 'Türkiye\'nin başkenti 13 Ekim 1923\'ten beri Ankara\'dır.',
    subject: 'Coğrafya',
    difficulty: 'easy',
    tags: ['başkent', 'Türkiye'],
  },
];

// Mock API Responses
export const mockApiResponses = {
  dashboard: {
    success: true,
    data: mockDashboardData,
    message: 'Dashboard verileri başarıyla alındı',
  },
  questions: {
    success: true,
    data: mockQuestions,
    message: 'Sorular başarıyla alındı',
  },
  login: {
    success: true,
    data: {
      token: 'mock-jwt-token',
      user: {
        id: 'user-1',
        name: 'Test Kullanıcı',
        email: 'test@example.com',
      },
    },
    message: 'Giriş başarılı',
  },
  register: {
    success: true,
    data: {
      token: 'mock-jwt-token',
      user: {
        id: 'user-1',
        name: 'Yeni Kullanıcı',
        email: 'new@example.com',
      },
    },
    message: 'Kayıt başarılı',
  },
}; 