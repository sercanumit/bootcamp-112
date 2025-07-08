import { StyleSheet, View, Image } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export function DashboardHeader() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContent}>
        <View style={styles.profileSection}>
          <View style={[styles.avatarContainer, { borderColor: colors.tint }]}>
            <Image
              source={{ uri: "https://via.placeholder.com/60" }}
              style={styles.avatar}
            />
          </View>
          <View style={styles.profileInfo}>
            <ThemedText type="title" style={styles.name}>
              Ahmet Yılmaz
            </ThemedText>
            <ThemedText style={[styles.classInfo, { color: colors.tint }]}>
              12. Sınıf • Hedef: Tıp Fakültesi
            </ThemedText>
          </View>
        </View>
        <View style={styles.notificationContainer}>
          <IconSymbol name="house.fill" size={24} color={colors.icon} />
        </View>
      </View>
      <View style={[styles.motivationCard, { backgroundColor: colors.tint }]}>
        <ThemedText style={styles.motivationText}>
          "Bugün dün yapamadığının yapılacağı gün!"
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 50,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    padding: 2,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
  },
  profileInfo: {
    marginLeft: 15,
    flex: 1,
  },
  name: {
    fontSize: 22,
    marginBottom: 4,
    lineHeight: 28,
  },
  classInfo: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  notificationContainer: {
    padding: 8,
  },
  motivationCard: {
    borderRadius: 16,
    padding: 15,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  motivationText: {
    color: "#fff",
    fontSize: 13,
    lineHeight: 20,
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
  },
});
