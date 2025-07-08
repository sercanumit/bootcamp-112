import { View, type ViewProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  gradient?: boolean;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  gradient = false,
  ...otherProps
}: ThemedViewProps) {
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );

  if (gradient) {
    const gradientColors = Colors[colorScheme ?? "light"].backgroundGradient;
    return (
      <LinearGradient
        colors={gradientColors as string[]}
        style={[style]}
        {...otherProps}
      />
    );
  }

  return (
    <View
      style={[{ backgroundColor: backgroundColor as string }, style]}
      {...otherProps}
    />
  );
}
