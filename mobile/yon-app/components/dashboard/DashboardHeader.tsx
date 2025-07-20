import { StyleSheet, View } from "react-native";
import { Text, Avatar, IconButton, Badge, Divider } from "react-native-paper";
import { ThemedView } from "@/components/ThemedView";
import { useAppTheme } from "@/constants/PaperTheme";

export function DashboardHeader() {
  const theme = useAppTheme();

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContent}>
        {/* Profil */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Avatar.Image
              size={48}
              source={{ uri: "https://picsum.photos/20" }}
              style={styles.avatar}
            />
            <Badge
              visible={true}
              style={[
                styles.onlineBadge,
                { backgroundColor: theme.colors.primary },
              ]}
              size={12}
            />
          </View>
          <View style={styles.profileInfo}>
            <Text variant="titleMedium" style={styles.name}>
              Ahmet Yılmaz
            </Text>
            <View style={styles.profileDetails}>
              <Text variant="bodySmall" style={styles.classText}>
                12. Sınıf • Tıp Fakültesi
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <IconButton
            icon="bell-outline"
            mode="contained-tonal"
            size={20}
            onPress={() => {}}
            style={styles.actionButton}
          />
          <IconButton
            icon="cog-outline"
            mode="contained-tonal"
            size={20}
            onPress={() => {}}
            style={styles.actionButton}
          />
        </View>
      </View>

      {/* Motivasyon  */}
      <View style={styles.motivationContainer}>
        <Text variant="bodyMedium" style={styles.motivationText}>
          "Her büyük başarı küçük adımlarla başlar"
        </Text>
      </View>

      <Divider style={styles.divider} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 50,
    gap: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    backgroundColor: "#f0f0f0",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    marginBottom: 4,
    fontWeight: "600",
  },
  profileDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  classText: {
    fontSize: 13,
    opacity: 0.7,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    margin: 0,
  },
  motivationContainer: {
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  motivationText: {
    textAlign: "center",
    fontStyle: "italic",
    opacity: 0.8,
    fontSize: 14,
  },
  divider: {
    marginTop: 8,
    opacity: 0.3,
  },
});
