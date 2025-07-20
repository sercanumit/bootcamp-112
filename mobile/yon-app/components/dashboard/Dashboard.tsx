import { ScrollView, StyleSheet } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { SpeedDial } from "@/components/ui/SpeedDial";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardStats } from "./DashboardStats";
import { DailyQuestion } from "./DailyQuestion";
import { MissingTopics } from "./MissingTopics";

export function Dashboard() {
  return (
    <ThemedView style={styles.container} gradient>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <DashboardHeader />
        <DashboardStats />
        <MissingTopics />
        <DailyQuestion />
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
