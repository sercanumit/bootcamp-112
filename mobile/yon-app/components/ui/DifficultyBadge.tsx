import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

interface DifficultyBadgeProps {
  difficulty: "Kolay" | "Orta" | "Zor";
  size?: "small" | "medium" | "large";
}

export function DifficultyBadge({
  difficulty,
  size = "medium",
}: DifficultyBadgeProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Kolay":
        return colors.success;
      case "Orta":
        return colors.warning;
      case "Zor":
        return colors.error;
      default:
        return colors.tint;
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "Kolay":
        return "star.fill";
      case "Orta":
        return "shield.fill";
      case "Zor":
        return "flame.fill";
      default:
        return "star.fill";
    }
  };

  const sizeStyles = {
    small: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      iconSize: 12,
      fontSize: 9,
      minWidth: 60,
    },
    medium: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      iconSize: 14,
      fontSize: 10,
      minWidth: 70,
    },
    large: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      iconSize: 16,
      fontSize: 12,
      minWidth: 80,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: getDifficultyColor(difficulty),
          paddingHorizontal: currentSize.paddingHorizontal,
          paddingVertical: currentSize.paddingVertical,
          borderRadius: currentSize.borderRadius,
          minWidth: currentSize.minWidth,
        },
      ]}
    >
      <IconSymbol
        name={getDifficultyIcon(difficulty)}
        size={currentSize.iconSize}
        color="#fff"
      />
      <ThemedText
        style={[
          styles.text,
          {
            fontSize: currentSize.fontSize,
          },
        ]}
      >
        {difficulty}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  text: {
    color: "#fff",
    lineHeight: 14,
    fontFamily: "Poppins_600SemiBold",
  },
});
