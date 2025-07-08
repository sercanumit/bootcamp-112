import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { LinearGradient } from "expo-linear-gradient";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
}

function StatCard({ title, value, subtitle, color }: StatCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
      <ThemedText style={[styles.statTitle, { color: colors.icon }]}>
        {title}
      </ThemedText>
      <ThemedText style={[styles.statValue, { color: color || colors.tint }]}>
        {value}
      </ThemedText>
      {subtitle && (
        <ThemedText style={[styles.statSubtitle, { color: colors.icon }]}>
          {subtitle}
        </ThemedText>
      )}
    </View>
  );
}

export function DashboardStats() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Genel Durum
      </ThemedText>

      <View style={styles.statsGrid}>
        <StatCard title="Toplam Soru" value="1,247" subtitle="Bu hafta +156" />
        <StatCard
          title="Doğru Oranı"
          value="78%"
          subtitle="Hedef: 85%"
          color={colors.success}
        />
        <StatCard
          title="Yanlış Soru"
          value="274"
          subtitle="Bu hafta -12"
          color={colors.error}
        />
        <StatCard
          title="Çalışma Süresi"
          value="4.2h"
          subtitle="Bugün"
          color={colors.warning}
        />
      </View>

      <View
        style={[
          styles.progressCard,
          { backgroundColor: colors.cardBackground },
        ]}
      >
        <View style={styles.progressHeader}>
          <ThemedText type="defaultSemiBold">Bu Hafta İlerleme</ThemedText>
          <ThemedText
            style={[styles.progressPercentage, { color: colors.tint }]}
          >
            65%
          </ThemedText>
        </View>
        <View
          style={[
            styles.progressBarContainer,
            { backgroundColor: colors.icon + "20" },
          ]}
        >
          <LinearGradient
            colors={
              colorScheme === "dark"
                ? ["#8c5cff", "#a673ff"]
                : ["#6a5af9", "#8c4ef8"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBar, { width: "65%" }]}
          />
        </View>
        <ThemedText style={[styles.progressText, { color: colors.icon }]}>
          Hedefine ulaşmak için günde 50 soru daha çözmelisin
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    lineHeight: 28,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    width: "48%",
    padding: 20,
    borderRadius: 14,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  statTitle: {
    fontSize: 9,
    lineHeight: 13,
    fontFamily: "Poppins_400Regular",
    marginBottom: 5,
  },
  statValue: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    marginBottom: 2,
    lineHeight: 28,
  },
  statSubtitle: {
    fontSize: 8,
    lineHeight: 11,
    fontFamily: "Poppins_400Regular",
  },
  progressCard: {
    padding: 20,
    borderRadius: 14,
    marginTop: 0,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  progressPercentage: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    lineHeight: 22,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    marginBottom: 10,
    position: "relative",
    justifyContent: "center",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  progressValueContainer: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 1,
  },
  progressValue: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    lineHeight: 14,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressText: {
    fontSize: 9,
    lineHeight: 14,
    fontFamily: "Poppins_400Regular",
  },
});
