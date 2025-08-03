import { StyleSheet, View } from "react-native";
import { Text, Card, Button } from "react-native-paper";
import { ThemedView } from "@/components/ThemedView";
import { useAppTheme } from "@/constants/PaperTheme";
import { PieChart } from "react-native-gifted-charts";
import { IconSymbol } from "@/components/ui/IconSymbol";

interface DashboardStatsProps {
  stats?: {
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    accuracy: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const theme = useAppTheme();

  // Default values if stats not provided
  const correctAnswers = stats?.correctAnswers ?? 973;
  const wrongAnswers = stats?.wrongAnswers ?? 274;
  const totalQuestions = stats?.totalQuestions ?? (correctAnswers + wrongAnswers);
  const correctPercentage = stats?.accuracy ?? Math.round((correctAnswers / totalQuestions) * 100);

  const pieData = [
    {
      value: correctAnswers,
      color: theme.colors.primary,
      gradientCenterColor: theme.colors.primary,
      showGradient: true,
    },
    {
      value: wrongAnswers,
      color: theme.colors.secondary,
      gradientCenterColor: theme.colors.secondary,
      showGradient: true,
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <Text variant="titleLarge" style={styles.sectionTitle}>
        Başarı İstatistikleri
      </Text>

      <View style={styles.statsLayout}>
        {/* Sol: Chart ve Doğru/Yanlış */}
        <View style={styles.leftSection}>
          {/* Chart */}
          <View style={styles.chartContainer}>
            <PieChart
              data={pieData}
              donut
              radius={64}
              innerRadius={32}
              innerCircleColor={theme.colors.surface}
              isAnimated={false}
              centerLabelComponent={() => (
                <Text
                  variant="labelMedium"
                  style={[styles.centerText, { color: theme.colors.primary }]}
                >
                  {correctPercentage}%
                </Text>
              )}
            />
          </View>

          {/* Alt: Doğru/Yanlış */}
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: theme.colors.primary },
                ]}
              />
              <Text
                variant="bodySmall"
                style={[styles.legendText, { color: theme.colors.onSurface }]}
              >
                {correctAnswers.toString()} Doğru
              </Text>
            </View>

            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: theme.colors.secondary },
                ]}
              />
              <Text
                variant="bodySmall"
                style={[
                  styles.legendText,
                  {
                    color: theme.colors.onSurface,
                    fontFamily: undefined, // Use default font for Turkish character support
                  },
                ]}
              >
                {wrongAnswers.toString()} Yanlış
              </Text>
            </View>
          </View>
        </View>

        {/* Sağ: Toplam veri kartları */}
        <View style={styles.rightSection}>
          <View style={styles.cardsContainer}>
            {/* Toplam Soru */}
            <Card
              style={[
                styles.dataCard,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <Card.Content style={styles.cardContent}>
                <IconSymbol
                  name="paperplane.fill"
                  size={16}
                  color={theme.colors.primary}
                  style={styles.cardIcon}
                />
                <View style={styles.cardInfo}>
                  <Text
                    variant="labelSmall"
                    style={[
                      styles.cardLabel,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Toplam Soru
                  </Text>
                  <Text
                    variant="titleSmall"
                    style={[
                      styles.cardValue,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {totalQuestions.toLocaleString("tr-TR")}
                  </Text>
                </View>
              </Card.Content>
            </Card>

            {/* Çalışma Süresi */}
            <Card
              style={[
                styles.dataCard,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <Card.Content style={styles.cardContent}>
                <IconSymbol
                  name="star.fill"
                  size={16}
                  color={theme.colors.secondary}
                  style={styles.cardIcon}
                />
                <View style={styles.cardInfo}>
                  <Text
                    variant="labelSmall"
                    style={[
                      styles.cardLabel,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Çalışma
                  </Text>
                  <Text
                    variant="titleSmall"
                    style={[
                      styles.cardValue,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    4.2 saat
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    marginBottom: 12,
    fontFamily: "Poppins_700Bold",
  },
  statsLayout: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(112, 51, 255, 0.02)",
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  leftSection: {
    alignItems: "center",
  },
  chartContainer: {
    marginBottom: 12,
  },
  centerText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 19,
  },
  chartLegend: {
    alignItems: "center",
    gap: 2,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 0,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    lineHeight: 16,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  rightSection: {
    flex: 1,
    justifyContent: "space-between",
  },
  cardsContainer: {
    gap: 8,
  },
  dataCard: {
    borderRadius: 12,
    elevation: 0,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cardIcon: {
    marginRight: 8,
  },
  cardInfo: {
    flex: 1,
  },
  cardLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cardValue: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
  },
});
