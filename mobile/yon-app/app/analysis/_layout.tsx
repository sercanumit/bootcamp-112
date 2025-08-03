import { Stack } from 'expo-router';
import { useAppTheme } from '@/constants/PaperTheme';

export default function AnalysisLayout() {
  const theme = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="study-data"
        options={{
          title: 'Çalışma Verilerim',
        }}
      />
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
      <Stack.Screen
        name="subject-analysis"
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="mindmap-creator"
        options={{
          title: 'Zihin Haritası Oluşturucu',
        }}
      />
      <Stack.Screen
        name="mindmap-viewer"
        options={{
          title: 'Zihin Haritası Görüntüleyici',
        }}
      />
    </Stack>
  );
} 