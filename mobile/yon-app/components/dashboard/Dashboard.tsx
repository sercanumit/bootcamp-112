import { ScrollView, StyleSheet, RefreshControl } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { SpeedDial } from "@/components/ui/SpeedDial";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardStats } from "./DashboardStats";
import { DailyDataInput } from "./DailyDataInput";
import { DailyQuestion } from "./DailyQuestion";
import { DailyTasks } from "./DailyTasks";
import { useDashboard } from "@/hooks/useDashboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getDailyData } from "@/services/api";
import { useState, useEffect } from "react";

export function Dashboard() {
  const { data, isLoading, error, refetch } = useDashboard();
  const insets = useSafeAreaInsets();
  const [dailyData, setDailyData] = useState<any>(null);
  const [dailyDataLoading, setDailyDataLoading] = useState(true);

  const loadDailyData = async () => {
    try {
      setDailyDataLoading(true);
      const response = await getDailyData();
      if (response.success && response.data) {
        setDailyData(response.data);
      }
    } catch (error) {
      console.error('Günlük veri yüklenirken hata:', error);
    } finally {
      setDailyDataLoading(false);
    }
  };

  useEffect(() => {
    loadDailyData();
  }, []);

  const handleRefresh = () => {
    refetch();
    loadDailyData();
  };

  return (
    <ThemedView style={styles.container} gradient>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: 120 + insets.bottom } // Tab bar için extra padding
        ]}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        <DashboardHeader />
        {data && (
          <>
            <DailyDataInput 
              hasData={dailyData?.hasData || false}
              onDataChange={(data) => {
                console.log('Daily data changed:', data);
                // TODO: Save to Firebase
              }}
            />
            <DailyTasks />
            <DailyQuestion 
              question={data.dailyQuestion}
              onAnswer={(questionId: string, answer: string) => {
                // TODO: Implement answer handling
                console.log('Answer:', { questionId, answer });
              }}
            />
          </>
        )}
      </ScrollView>

      <SpeedDial />
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
