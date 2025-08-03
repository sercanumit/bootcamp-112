import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { dashboardAPI, DashboardData } from '@/services/api';

interface UseDashboardReturn {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  answerDailyQuestion: (questionId: string, answer: string) => Promise<void>;
}

export function useDashboard(): UseDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await dashboardAPI.getDashboard();
      
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'Veriler alınamadı');
      }
    } catch (error: any) {
      setError(error.message || 'Bir hata oluştu');
      Alert.alert('Hata', error.message || 'Dashboard verileri alınamadı');
    } finally {
      setIsLoading(false);
    }
  };

  const answerDailyQuestion = async (questionId: string, answer: string) => {
    try {
      const response = await dashboardAPI.answerDailyQuestion(questionId, answer);
      
      if (response.success) {
        // Refresh dashboard data after answering
        await fetchDashboard();
        Alert.alert('Başarılı', 'Cevabınız kaydedildi!');
      } else {
        Alert.alert('Hata', response.message || 'Cevap gönderilemedi');
      }
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Cevap gönderilemedi');
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchDashboard,
    answerDailyQuestion,
  };
} 