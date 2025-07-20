import { StyleSheet, type TextProps } from "react-native";
import { Text } from "react-native-paper";

import { useThemeColor } from "@/hooks/useThemeColor";
import { useAppTheme } from "@/constants/PaperTheme";

export type ThemedTextProps = Omit<TextProps, "children"> & {
  children?: React.ReactNode;
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
  variant?:
    | "displayLarge"
    | "displayMedium"
    | "displaySmall"
    | "headlineLarge"
    | "headlineMedium"
    | "headlineSmall"
    | "titleLarge"
    | "titleMedium"
    | "titleSmall"
    | "labelLarge"
    | "labelMedium"
    | "labelSmall"
    | "bodyLarge"
    | "bodyMedium"
    | "bodySmall";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  variant,
  children,
  ...rest
}: ThemedTextProps) {
  const theme = useAppTheme();
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  // Eğer variant belirtildiyse Paper'ın Text bileşenini kullan
  if (variant) {
    return (
      <Text
        variant={variant}
        style={[
          { color: lightColor || darkColor || theme.colors.onSurface },
          style,
        ]}
        {...rest}
      >
        {children}
      </Text>
    );
  }

  // Geleneksel tip sistemini koruyalım
  return (
    <Text
      style={[
        { color: color as string },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: "Poppins_400Regular",
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 40,
    fontFamily: "Poppins_700Bold",
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 32,
    fontFamily: "Poppins_700Bold",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4",
  },
});
