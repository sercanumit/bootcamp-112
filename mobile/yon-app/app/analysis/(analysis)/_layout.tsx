import { Stack } from 'expo-router';
import { useAppTheme } from '@/constants/PaperTheme';

export default function AnalysisLayout() {
  const theme = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false, // Header'ı gizle
      }}
    >
      <Stack.Screen
        name="topic-map"
        options={{
          title: 'Konu Haritası',
        }}
      />
      <Stack.Screen
        name="exam-analysis"
        options={{
          title: 'Deneme Analizi',
        }}
      />
      <Stack.Screen
        name="missing-parts"
        options={{
          title: 'Eksik Kısımlar',
        }}
      />
    </Stack>
  );
} 