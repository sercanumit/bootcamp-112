import { View, type ViewProps } from "react-native";
import { Surface } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";

import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAppTheme } from "@/constants/PaperTheme";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  gradient?: boolean;
  surface?: boolean; // Paper Surface kullanmak için
  elevation?: 0 | 1 | 2 | 3 | 4 | 5; // Paper Surface elevation
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  gradient = false,
  surface = false,
  elevation = 0,
  children,
  ...otherProps
}: ThemedViewProps) {
  const colorScheme = useColorScheme();
  const theme = useAppTheme();
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );

  if (gradient) {
    const gradientColors = Colors[colorScheme ?? "light"].backgroundGradient;
    return (
      <LinearGradient
        colors={gradientColors as [string, string, ...string[]]}
        style={[style]}
        {...otherProps}
      >
        {children}
      </LinearGradient>
    );
  }

  if (surface) {
    return (
      <Surface
        style={[
          {
            backgroundColor: lightColor || darkColor || theme.colors.surface,
          },
          style,
        ]}
        elevation={elevation}
      >
        <View {...otherProps}>{children}</View>
      </Surface>
    );
  }

  return (
    <View
      style={[{ backgroundColor: backgroundColor as string }, style]}
      {...otherProps}
    >
      {children}
    </View>
  );
}
