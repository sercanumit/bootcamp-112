import axios from 'axios';
import auth from '@react-native-firebase/auth';

// API Configuration
const API_BASE_URL = 'http://192.168.56.1:8000/api/v1';

// Mock data import
import { mockApiResponses } from './mockData';

// Axios instance oluştur
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 saniye timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Token ekleme
apiClient.interceptors.request.use(
  async (config) => {
    // Debug log
    console.log('🌐 API Request:', config.method?.toUpperCase(), config.url);
    console.log('📦 Request Data:', config.data);
    
    // Firebase'den token al
    try {
      const { firebaseAuth } = await import('./firebase');
      const token = await firebaseAuth.getIdToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Token eklendi');
      }
    } catch (error) {
      // Token alınamadı, devam et
      console.log('Token alınamadı:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Hata yönetimi
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Global hata yönetimi
    console.error('🌐 API Error:', error.message);
    
    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      console.error('❌ Network Error - Backend bağlantısı kurulamadı');
    }
    
    if (error.response?.status === 401) {
      // Token geçersiz, login sayfasına yönlendir
      // TODO: Implement logout logic
    }
    return Promise.reject(error);
  }
);

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// Tasks API
export const tasksAPI = {
  // Günlük görevleri getir
  getDailyTasks: async () => {
    return getDailyTasks();
  },

  // Belirli tarih için görevleri getir
  getTasksByDate: async (date: string) => {
    try {
      const response = await apiClient.get(`/tasks/daily-tasks/?date=${date}`);
      return response.data.data?.tasks || [];
    } catch (error) {
      console.error('Tasks by date error:', error);
      return [];
    }
  },

  // Görev oluştur
  createTask: async (taskData: any) => {
    return createDailyTask(taskData);
  },

  // Görev güncelle
  updateTask: async (taskId: string, taskData: any) => {
    return updateDailyTask(parseInt(taskId), taskData);
  },

  // Görev sil
  deleteTask: async (taskId: string) => {
    return deleteDailyTask(parseInt(taskId));
  },

  // Görev tamamla/iptal et
  toggleTaskCompletion: async (taskId: string, isCompleted: boolean) => {
    try {
      const response = await apiClient.post(`/tasks/daily-tasks/${taskId}/toggle/`, {
        is_completed: isCompleted,
      });
      return response.data;
    } catch (error) {
      console.error('Toggle task error:', error);
      throw error;
    }
  },
};

// API Functions
export const authAPI = {
  // Firebase Token ile giriş
  loginWithToken: async (firebaseToken: string): Promise<ApiResponse<AuthResponse>> => {
    try {
      console.log('🚀 loginWithToken çağrıldı');
      console.log('📤 Token gönderiliyor:', firebaseToken ? 'Token var' : 'Token yok');
      
      const response = await apiClient.post('/auth/firebase-login/', {
        firebase_token: firebaseToken
      });
      
      console.log('✅ Backend response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ loginWithToken hatası:', error);
      throw new Error(error.response?.data?.message || 'Giriş yapılamadı');
    }
  },

  // Login (Legacy - Mock)
  login: async (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.post('/auth/login', credentials);
      // return response.data;
      
      // Mock response for testing
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      return mockApiResponses.login;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Giriş yapılamadı');
    }
  },

  // Register
  register: async (userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.post('/auth/register', userData);
      // return response.data;
      
      // Mock response for testing
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      return mockApiResponses.register;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Kayıt oluşturulamadı');
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
};

// Kullanıcı profil bilgilerini al
export const getUserProfile = async (): Promise<{
  success: boolean;
  data?: {
    success: boolean;
    data: {
      name: string;
      email: string;
      target_profession?: string;
      department?: string;
      grade?: string;
      created_at?: string;
      onboarding_completed?: boolean;
    };
  };
  message?: string;
}> => {
  try {
    const response = await apiClient.get('/auth/profile/');
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error('❌ getUserProfile hatası:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Profil bilgileri alınamadı',
    };
  }
};

// Dashboard API
export interface DashboardData {
  stats: {
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    accuracy: number;
  };
  dailyQuestion: {
    id: string;
    question: string;
    options: string[];
    subject: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  missingTopics: string[];
}

export const dashboardAPI = {
  // Dashboard verilerini getir
  getDashboard: async (): Promise<ApiResponse<DashboardData>> => {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.get('/dashboard');
      // return response.data;
      
      // Mock response for testing
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      return mockApiResponses.dashboard;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Dashboard verileri alınamadı');
    }
  },

  // Günlük soru cevapla
  answerDailyQuestion: async (questionId: string, answer: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post('/dashboard/daily-question', {
        questionId,
        answer,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Cevap gönderilemedi');
    }
  },
};

// Questions API
export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export const questionsAPI = {
  // Konuya göre sorular getir
  getQuestionsBySubject: async (subject: string, limit: number = 10): Promise<ApiResponse<Question[]>> => {
    try {
      const response = await apiClient.get(`/questions/subject/${subject}?limit=${limit}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Sorular alınamadı');
    }
  },

  // Zorluk seviyesine göre sorular getir
  getQuestionsByDifficulty: async (difficulty: string, limit: number = 10): Promise<ApiResponse<Question[]>> => {
    try {
      const response = await apiClient.get(`/questions/difficulty/${difficulty}?limit=${limit}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Sorular alınamadı');
    }
  },

  // Soru cevapla
  answerQuestion: async (questionId: string, answer: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.post('/questions/answer', {
        questionId,
        answer,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Cevap gönderilemedi');
    }
  },
}; 

// Firebase'den dersleri al
export const getSubjects = async (): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  message?: string;
}> => {
  try {
    const response = await apiClient.get('/exams/firebase/subjects/');
    return {
      success: true,
      data: response.data.data, // Firebase response'u farklı
    };
  } catch (error: any) {
    console.error('❌ getSubjects hatası:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Dersler alınamadı',
    };
  }
};

// Firebase'den konuları al
export const getTopicsBySubject = async (subjectName: string): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    name: string;
    subject_id: string;
  }>;
  message?: string;
}> => {
  try {
    const response = await apiClient.get(`/exams/firebase/subjects/${encodeURIComponent(subjectName)}/topics/`);
    return {
      success: true,
      data: response.data.data, // Firebase response'u farklı
    };
  } catch (error: any) {
    console.error('❌ getTopicsBySubject hatası:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Konular alınamadı',
    };
  }
};

// Günlük veri yönetimi
export const getDailyData = async (): Promise<{
  success: boolean;
  data?: {
    dailyData: {
      studyHours: number;
      totalQuestions: number;
    };
    goals: {
      studyHoursGoal: number;
      totalQuestionsGoal: number;
    };
    hasData: boolean; // Veri olup olmadığını belirtir
  };
  message?: string;
}> => {
  try {
    const response = await apiClient.get('/auth/daily-data/');
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error('❌ getDailyData hatası:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Günlük veri alınamadı',
    };
  }
};

export const saveDailyData = async (data: {
  studyHours: number;
  totalQuestions: number;
}): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    const response = await apiClient.post('/auth/daily-data/save/', data);
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('❌ saveDailyData hatası:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Günlük veri kaydedilemedi',
    };
  }
};

export const saveDailyGoals = async (data: {
  studyHoursGoal: number;
  totalQuestionsGoal: number;
}): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    const response = await apiClient.post('/auth/daily-goals/save/', data);
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('❌ saveDailyGoals hatası:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Hedefler kaydedilemedi',
    };
  }
}; 

export const saveUserProfile = async (data: {
  target_profession?: string;
  exam_type?: string;
  grade?: string;
  onboarding_completed?: boolean;
}): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    const response = await apiClient.post('/auth/profile/update/', data);
    return {
      success: true,
      message: response.data.message || 'Profil güncellendi',
    };
  } catch (error: any) {
    console.error('❌ saveUserProfile hatası:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Profil güncellenemedi',
    };
  }
}; 

// Tasks API Functions
export const getDailyTasks = async (): Promise<{
  success: boolean;
  data?: {
    tasks: Array<{
      id: number;
      title: string;
      description: string;
      task_type: string;
      priority: 'low' | 'medium' | 'high';
      estimated_duration: number;
      actual_duration?: number;
      is_completed: boolean;
      completed_at?: string;
      subject: string;
      topic: string;
      progress_percentage: number;
      created_at: string;
    }>;
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
  };
  message?: string;
}> => {
  try {
    const response = await apiClient.get('/tasks/daily-tasks/');
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error('❌ getDailyTasks hatası:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Görevler alınamadı',
    };
  }
};

export const getTasksByDate = async (date: string): Promise<{
  success: boolean;
  data?: {
    tasks: Array<{
      id: number;
      title: string;
      description: string;
      task_type: string;
      priority: 'low' | 'medium' | 'high';
      estimated_duration: number;
      actual_duration?: number;
      is_completed: boolean;
      completed_at?: string;
      subject: string;
      topic: string;
      progress_percentage: number;
      created_at: string;
    }>;
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    date: string;
  };
  message?: string;
}> => {
  try {
    const response = await apiClient.get(`/tasks/daily-tasks/by-date/?date=${date}`);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error('❌ getTasksByDate hatası:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Görevler alınamadı',
    };
  }
};

export const createDailyTask = async (data: {
  title: string;
  description?: string;
  task_type?: string;
  priority?: 'low' | 'medium' | 'high';
  estimated_duration?: number;
  subject?: string;
  topic?: string;
}): Promise<{
  success: boolean;
  data?: {
    id: number;
    title: string;
    task_type: string;
    priority: string;
    estimated_duration: number;
    is_completed: boolean;
  };
  message?: string;
}> => {
  try {
    const response = await apiClient.post('/tasks/daily-tasks/create/', data);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('❌ createDailyTask hatası:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Görev oluşturulamadı',
    };
  }
};

export const updateDailyTask = async (taskId: number, data: {
  title?: string;
  description?: string;
  task_type?: string;
  priority?: 'low' | 'medium' | 'high';
  estimated_duration?: number;
  actual_duration?: number;
  is_completed?: boolean;
}): Promise<{
  success: boolean;
  data?: any;
  message?: string;
}> => {
  try {
    const response = await apiClient.put(`/tasks/daily-tasks/${taskId}/update/`, data);
    return response.data;
  } catch (error) {
    console.error('Update daily task error:', error);
    return {
      success: false,
      message: 'Görev güncellenemedi',
    };
  }
};

export const deleteDailyTask = async (taskId: number): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    const response = await apiClient.delete(`/tasks/daily-tasks/${taskId}/delete/`);
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('❌ deleteDailyTask hatası:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Görev silinemedi',
    };
  }
};

// ==================== BİLDİRİM SİSTEMİ API'LERİ ====================

// Notification types
export interface NotificationType {
  id: number;
  firebase_uid: string;
  notification_type: string;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  priority: string;
  created_at: string;
  read_at?: string;
  icon?: string;
  priority_color?: string;
  time_ago?: string;
}

export interface NotificationPreview {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: string;
  is_read: boolean;
  time_ago: string;
  data?: any;
  icon?: string;
}

export interface NotificationStats {
  unread_count: number;
  total_count: number;
  read_count: number;
}

export interface NotificationSettings {
  firebase_uid: string;
  push_enabled: boolean;
  email_enabled: boolean;
  daily_reminders: boolean;
  weekly_reports: boolean;
  achievement_notifications: boolean;
  study_reminders: boolean;
  exam_reminders: boolean;
}

// Bildirim API fonksiyonları
export const notificationsAPI = {
  // Bildirimleri getir
  getNotifications: async (params?: {
    type?: string;
    is_read?: boolean;
    priority?: string;
  }): Promise<{ success: boolean; data?: NotificationType[]; message?: string }> => {
    try {
      const token = await getFirebaseToken();
      const response = await axios.get(`${API_BASE_URL}/notifications/`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      
      // DRF pagination response formatını handle et
      if (response.data && response.data.results) {
        return {
          success: true,
          data: response.data.results
        };
      } else if (response.data && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          message: 'Bildirimler yüklenemedi'
        };
      }
    } catch (error) {
      console.error('Bildirimler alınamadı:', error);
      return { success: false, message: 'Bildirimler yüklenemedi' };
    }
  },

  // Bildirim detayı getir
  getNotificationDetail: async (notificationId: number): Promise<{ success: boolean; data?: NotificationType; message?: string }> => {
    try {
      const token = await getFirebaseToken();
      const response = await axios.get(`${API_BASE_URL}/notifications/${notificationId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Bildirim detayı alınamadı:', error);
      return { success: false, message: 'Bildirim detayı yüklenemedi' };
    }
  },

  // Bildirim işaretleme
  markNotificationAsRead: async (notificationId: number): Promise<{ success: boolean; message?: string }> => {
    try {
      const token = await getFirebaseToken();
      const response = await axios.post(
        `${API_BASE_URL}/notifications/mark-read/${notificationId}/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Bildirim okundu işaretlenemedi:', error);
      return { success: false, message: 'Bildirim işaretlenemedi' };
    }
  },

  // Tüm bildirimleri okundu işaretle
  markAllNotificationsAsRead: async (): Promise<{ success: boolean; message?: string }> => {
    try {
      const token = await getFirebaseToken();
      const response = await axios.post(
        `${API_BASE_URL}/notifications/mark-all-read/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Tüm bildirimler işaretlenemedi:', error);
      return { success: false, message: 'Bildirimler işaretlenemedi' };
    }
  },

  // Bildirim silme
  deleteNotification: async (notificationId: number): Promise<{ success: boolean; message?: string }> => {
    try {
      const token = await getFirebaseToken();
      const response = await axios.delete(
        `${API_BASE_URL}/notifications/delete/${notificationId}/`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Bildirim silinemedi:', error);
      return { success: false, message: 'Bildirim silinemedi' };
    }
  },

  // Tüm bildirimleri sil
  deleteAllNotifications: async (): Promise<{ success: boolean; message?: string }> => {
    try {
      const token = await getFirebaseToken();
      const response = await axios.delete(
        `${API_BASE_URL}/notifications/delete-all/`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Tüm bildirimler silinemedi:', error);
      return { success: false, message: 'Bildirimler silinemedi' };
    }
  },

  // Bildirim istatistikleri
  getNotificationStats: async (): Promise<{ success: boolean; data?: NotificationStats; message?: string }> => {
    try {
      const token = await getFirebaseToken();
      const response = await axios.get(`${API_BASE_URL}/notifications/stats/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Bildirim istatistikleri alınamadı:', error);
      return { success: false, message: 'İstatistikler yüklenemedi' };
    }
  },

  // Bildirim ayarları
  getNotificationSettings: async (): Promise<{ success: boolean; data?: NotificationSettings; message?: string }> => {
    try {
      const token = await getFirebaseToken();
      const response = await axios.get(`${API_BASE_URL}/notifications/settings/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Bildirim ayarları alınamadı:', error);
      return { success: false, message: 'Ayarlar yüklenemedi' };
    }
  },

  // Bildirim ayarlarını güncelle
  updateNotificationSettings: async (settings: Partial<NotificationSettings>): Promise<{ success: boolean; message?: string }> => {
    try {
      const token = await getFirebaseToken();
      const response = await axios.patch(`${API_BASE_URL}/notifications/settings/`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Bildirim ayarları güncellenemedi:', error);
      return { success: false, message: 'Ayarlar güncellenemedi' };
    }
  },
}; 

export const getTaskDetail = async (taskId: number): Promise<{
  success: boolean;
  data?: {
    id: number;
    title: string;
    description: string;
    task_type: string;
    priority: 'low' | 'medium' | 'high';
    estimated_duration: number;
    actual_duration?: number;
    is_completed: boolean;
    completed_at?: string;
    subject: string;
    topic: string;
    progress_percentage: number;
    created_at: string;
    updated_at: string;
  };
  message?: string;
}> => {
  try {
    const response = await apiClient.get(`/tasks/daily-tasks/${taskId}/`);
    return response.data;
  } catch (error) {
    console.error('Task detail error:', error);
    return {
      success: false,
      message: 'Görev detayı alınamadı',
    };
  }
}; 

// Firebase token alma fonksiyonu
const getFirebaseToken = async (): Promise<string> => {
  try {
    const user = auth().currentUser;
    if (user) {
      const token = await user.getIdToken();
      return token;
    }
    return '';
  } catch (error) {
    console.error('Firebase token alma hatası:', error);
    return '';
  }
};

// Quick Solutions API
export interface QuickSolution {
  id: number;
  user: number;
  user_name: string;
  konu: string;
  ders: string;
  mesaj: string;
  fotograf: string;
  vision_text?: string;
  gemini_response?: string;
  is_processed: boolean;
  created_at: string;
  processed_at?: string;
}

export interface QuickSolutionCreate {
  konu: string;
  ders: string;
  mesaj: string;
  fotograf: any; // FormData için
}

// ExamRecord Types
export interface ExamRecord {
  id: number;
  exam_name: string;
  exam_date: string;
  exam_type: 'tyt' | 'ayt' | 'dil' | 'msu';
  exam_type_display: string;
  exam_subject: number;
  exam_subject_name: string;
  exam_topics: number[];
  topics_list: Array<{id: number, name: string}>;
  normal_duration: number;
  student_duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  difficulty_display: string;
  total_questions: number;
  total_marked: number;
  total_correct: number;
  total_wrong: number;
  total_net: number;
  user_email: string;
  created_at: string;
  updated_at: string;
}

export interface ExamRecordCreate {
  exam_name: string;
  exam_date: string;
  exam_type: 'tyt' | 'ayt' | 'dil' | 'msu';
  exam_subject: number;
  exam_topics?: number[];
  normal_duration: number;
  student_duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  total_questions: number;
  total_marked: number;
  total_correct: number;
  total_wrong: number;
}

export interface ExamRecordStats {
  total_exams: number;
  total_questions: number;
  total_correct: number;
  total_wrong: number;
  avg_net: number;
  recent_exams: ExamRecord[];
}

export const quickSolutionsAPI = {
  // Hızlı çözüm oluştur
  createQuickSolution: async (data: QuickSolutionCreate): Promise<ApiResponse<QuickSolution>> => {
    try {
      const formData = new FormData();
      formData.append('konu', data.konu);
      formData.append('ders', data.ders);
      formData.append('mesaj', data.mesaj);
      formData.append('fotograf', data.fotograf);

      const response = await axios.post(`${API_BASE_URL}/quick-solutions/create/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${await getFirebaseToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Hızlı çözüm oluşturma hatası:', error);
      throw error;
    }
  },

  // Kullanıcının hızlı çözümlerini getir
  getQuickSolutions: async (): Promise<ApiResponse<QuickSolution[]>> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/quick-solutions/list/`, {
        headers: {
          'Authorization': `Bearer ${await getFirebaseToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Hızlı çözümler getirme hatası:', error);
      throw error;
    }
  },

  // Belirli bir hızlı çözümü getir
  getQuickSolutionDetail: async (solutionId: number): Promise<ApiResponse<QuickSolution>> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/quick-solutions/detail/${solutionId}/`, {
        headers: {
          'Authorization': `Bearer ${await getFirebaseToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Hızlı çözüm detay getirme hatası:', error);
      throw error;
    }
  },
}; 

export const markNotificationAsRead = async (notificationId: number): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = await getFirebaseToken();
    const response = await axios.post(
      `${API_BASE_URL}/notifications/mark-read/${notificationId}/`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Bildirim okundu işaretlenemedi:', error);
    return { success: false, message: 'Bildirim işaretlenemedi' };
  }
};

export const markAllNotificationsAsRead = async (): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = await getFirebaseToken();
    const response = await axios.post(
      `${API_BASE_URL}/notifications/mark-all-read/`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Tüm bildirimler işaretlenemedi:', error);
    return { success: false, message: 'Bildirimler işaretlenemedi' };
  }
};

export const deleteNotification = async (notificationId: number): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = await getFirebaseToken();
    const response = await axios.delete(
      `${API_BASE_URL}/notifications/delete/${notificationId}/`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Bildirim silinemedi:', error);
    return { success: false, message: 'Bildirim silinemedi' };
  }
};

export const deleteAllNotifications = async (): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = await getFirebaseToken();
    const response = await axios.delete(
      `${API_BASE_URL}/notifications/delete-all/`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Tüm bildirimler silinemedi:', error);
    return { success: false, message: 'Bildirimler silinemedi' };
  }
};

// ExamRecord API
export const examRecordAPI = {
  // Deneme kayıtlarını getir
  getExamRecords: async (): Promise<ApiResponse<ExamRecord[]>> => {
    try {
      const response = await apiClient.get('/exams/exam-records/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Deneme kayıtları alınamadı');
    }
  },

  // Deneme kaydı oluştur
  createExamRecord: async (data: ExamRecordCreate): Promise<ApiResponse<ExamRecord>> => {
    try {
      const response = await apiClient.post('/exams/exam-records/', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Deneme kaydı oluşturulamadı');
    }
  },

  // Deneme kaydını güncelle
  updateExamRecord: async (id: number, data: Partial<ExamRecordCreate>): Promise<ApiResponse<ExamRecord>> => {
    try {
      const response = await apiClient.put(`/exams/exam-records/${id}/`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Deneme kaydı güncellenemedi');
    }
  },

  // Deneme kaydını sil
  deleteExamRecord: async (id: number): Promise<ApiResponse> => {
    try {
      const response = await apiClient.delete(`/exams/exam-records/${id}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Deneme kaydı silinemedi');
    }
  },

  // Deneme istatistiklerini getir
  getExamStats: async (): Promise<ApiResponse<ExamRecordStats>> => {
    try {
      const response = await apiClient.get('/exams/exam-records/stats/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Deneme istatistikleri alınamadı');
    }
  },

  // Derse göre deneme kayıtlarını getir
  getExamRecordsBySubject: async (subjectId: number): Promise<ApiResponse<ExamRecord[]>> => {
    try {
      const response = await apiClient.get(`/exams/exam-records/by_subject/?subject_id=${subjectId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Derse göre deneme kayıtları alınamadı');
    }
  },

  // Deneme türüne göre kayıtları getir
  getExamRecordsByType: async (examType: 'tyt' | 'ayt' | 'dil' | 'msu'): Promise<ApiResponse<ExamRecord[]>> => {
    try {
      const response = await apiClient.get(`/exams/exam-records/by_type/?exam_type=${examType}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Deneme türüne göre kayıtlar alınamadı');
    }
  },

  // Dersleri getir
  getSubjects: async (): Promise<ApiResponse<Array<{id: number, name: string}>>> => {
    try {
      const response = await apiClient.get('/exams/firebase/subjects/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Dersler alınamadı');
    }
  },

  // Konuları getir
  getTopics: async (): Promise<ApiResponse<Array<{id: number, name: string}>>> => {
    try {
      // Geçici olarak test endpoint'ini kullan
      const response = await apiClient.get('/exams/test/topics/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Konular alınamadı');
    }
  },
};

// Analytics API
export const getSubjectTopicAnalysis = async (subjectCode: string): Promise<{
  success: boolean;
  data?: {
    subject: {
      code: string;
      name: string;
    };
    topics: Array<{
      id: string;
      name: string;
      totalQuestions: number;
      correctAnswers: number;
      wrongAnswers: number;
      emptyAnswers: number;
      accuracy: number;
    }>;
    total_topics: number;
  };
  message?: string;
}> => {
  try {
    const response = await apiClient.get(`/analytics/subject-topic-analysis/?subject_code=${subjectCode}`);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error('❌ getSubjectTopicAnalysis hatası:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Konu analizi alınamadı',
    };
  }
};

// Analytics API Types
export interface AnalyticsSummary {
  exam_analysis: {
    total_exams: number;
    average_net: number;
    best_exam?: {
      exam_name: string;
      total_net: number;
      exam_date: string;
    };
    worst_exam?: {
      exam_name: string;
      total_net: number;
      exam_date: string;
    };
    subject_performance: {
      [subject: string]: {
        total_exams: number;
        average_net: number;
        best_net: number;
        worst_net: number;
      };
    };
    best_subject?: string;
    worst_subject?: string;
  };
  task_analysis: {
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    completion_rate: number;
    average_duration: number;
    task_types: {
      [type: string]: number;
    };
  };
  study_analysis: {
    total_study_hours: number;
    streak_days: number;
    average_session_duration: number;
    focus_score: number;
    study_sessions: number;
  };
  topic_analysis: {
    strong_topics: string[];
    weak_topics: string[];
    total_topics_studied: number;
  };
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    priority: number;
  }>;
  progress_summary: {
    overall_score: number;
    improvement_rate: number;
    next_goals: string[];
  };
}

export interface ExamAnalysis {
  total_exams: number;
  average_net: number;
  best_exam?: {
    exam_name: string;
    total_net: number;
    exam_date: string;
  };
  worst_exam?: {
    exam_name: string;
    total_net: number;
    exam_date: string;
  };
  subject_performance: {
    [subject: string]: {
      total_exams: number;
      average_net: number;
      best_net: number;
      worst_net: number;
    };
  };
  best_subject?: string;
  worst_subject?: string;
}

export interface TaskAnalysis {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  completion_rate: number;
  average_duration: number;
  task_types: {
    [type: string]: number;
  };
}

// Analytics API Functions
export const getAnalyticsSummary = async (): Promise<{
  success: boolean;
  data?: AnalyticsSummary;
  message?: string;
}> => {
  try {
    const response = await apiClient.get('/coaching/progress/analytics_summary/');
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error('❌ getAnalyticsSummary hatası:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Analiz özeti alınamadı',
    };
  }
};

export const getExamAnalysis = async (): Promise<{
  success: boolean;
  data?: ExamAnalysis;
  message?: string;
}> => {
  try {
    const response = await apiClient.get('/coaching/progress/exam_analysis/');
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error('❌ getExamAnalysis hatası:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Deneme analizi alınamadı',
    };
  }
};

export const getTaskAnalysis = async (): Promise<{
  success: boolean;
  data?: TaskAnalysis;
  message?: string;
}> => {
  try {
    const response = await apiClient.get('/coaching/progress/task_analysis/');
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error('❌ getTaskAnalysis hatası:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Görev analizi alınamadı',
    };
  }
}; 

// MindMap API Types
export interface MindMapNode {
  id: number;
  label: string;
  icon: string;
  color: string;
  level: number;
  notes?: string;
  position_x: number;
  position_y: number;
  parent_id?: number;
}

export interface MindMapConnection {
  id: number;
  source_id: number;
  target_id: number;
  connection_type: string;
}

export interface MindMap {
  id: number;
  title: string;
  main_topic: string;
  description: string;
  nodes: MindMapNode[];
  connections: MindMapConnection[];
}

export interface MindMapSummary {
  id: number;
  title: string;
  main_topic: string;
  description: string;
  created_at: string;
  updated_at: string;
  node_count: number;
  connection_count: number;
}

// MindMap API Functions
export const createMindMapFromSpeech = async (speechText: string): Promise<{
  success: boolean;
  data?: MindMap;
  message?: string;
}> => {
  try {
    const response = await apiClient.post('/mindmaps/create-from-speech/', {
      speech_text: speechText
    });
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error('❌ createMindMapFromSpeech hatası:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Zihin haritası oluşturulamadı',
    };
  }
};

export const getUserMindMaps = async (): Promise<{
  success: boolean;
  data?: MindMapSummary[];
  message?: string;
}> => {
  try {
    const response = await apiClient.get('/mindmaps/user-mindmaps/');
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error('❌ getUserMindMaps hatası:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Zihin haritaları alınamadı',
    };
  }
};

export const getMindMapDetail = async (mindMapId: number): Promise<{
  success: boolean;
  data?: MindMap;
  message?: string;
}> => {
  try {
    const response = await apiClient.get(`/mindmaps/mindmap/${mindMapId}/`);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error('❌ getMindMapDetail hatası:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Zihin haritası detayı alınamadı',
    };
  }
};

export const expandMindMapNode = async (mindMapId: number, nodeId: number, speechText: string): Promise<{
  success: boolean;
  data?: {
    parent_node_id: number;
    new_nodes: MindMapNode[];
  };
  message?: string;
}> => {
  try {
    const response = await apiClient.post(`/mindmaps/mindmap/${mindMapId}/expand-node/`, {
      node_id: nodeId,
      speech_text: speechText
    });
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error('❌ expandMindMapNode hatası:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Düğüm genişletilemedi',
    };
  }
}; 