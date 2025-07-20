import React from "react";
import { StyleSheet, View } from "react-native";
import { Chip, Text } from "react-native-paper";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useAppTheme, additionalColors } from "@/constants/PaperTheme";
import { useColorScheme } from "@/hooks/useColorScheme";

interface DifficultyBadgeProps {
  difficulty: "Kolay" | "Orta" | "Zor";
  size?: "small" | "medium" | "large";
}

export function DifficultyBadge({
  difficulty,
  size = "medium",
}: DifficultyBadgeProps) {
  const theme = useAppTheme();
  const colorScheme = useColorScheme();

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case "Kolay":
        return {
          color: colorScheme === "dark" ? "#4caf50" : "#2e7d32",
          backgroundColor: colorScheme === "dark" ? "#4caf5020" : "#2e7d3215",
          icon: "star.fill",
          textColor: colorScheme === "dark" ? "#4caf50" : "#2e7d32",
        };
      case "Orta":
        return {
          color: colorScheme === "dark" ? "#ffa726" : "#f57c00",
          backgroundColor: colorScheme === "dark" ? "#ffa72620" : "#f57c0015",
          icon: "shield.fill",
          textColor: colorScheme === "dark" ? "#ffa726" : "#f57c00",
        };
      case "Zor":
        return {
          color: theme.colors.error,
          backgroundColor: colorScheme === "dark" ? "#f4433620" : "#d32f2f15",
          icon: "flame.fill",
          textColor: theme.colors.error,
        };
      default:
        return {
          color: theme.colors.primary,
          backgroundColor: theme.colors.primaryContainer,
          icon: "star.fill",
          textColor: theme.colors.primary,
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case "small":
        return {
          height: 22,
          paddingHorizontal: 8,
          fontSize: 10,
          iconSize: 12,
          borderRadius: 11,
        };
      case "large":
        return {
          height: 32,
          paddingHorizontal: 12,
          fontSize: 13,
          iconSize: 16,
          borderRadius: 16,
        };
      default: // medium
        return {
          height: 26,
          paddingHorizontal: 10,
          fontSize: 11,
          iconSize: 14,
          borderRadius: 13,
        };
    }
  };

  const config = getDifficultyConfig(difficulty);
  const sizeConfig = getSizeConfig();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          height: sizeConfig.height,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          borderRadius: sizeConfig.borderRadius,
          borderWidth: 1,
          borderColor: config.color + "30",
        },
      ]}
    >
      <IconSymbol
        name={config.icon as any}
        size={sizeConfig.iconSize}
        color={config.color}
        style={styles.icon}
      />
      <Text
        variant="labelSmall"
        style={[
          styles.text,
          {
            color: config.textColor,
            fontSize: sizeConfig.fontSize,
            fontFamily: "Poppins_600SemiBold",
          },
        ]}
      >
        {difficulty}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: "600",
    lineHeight: undefined,
  },
});
