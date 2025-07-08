import { StyleSheet, Text, type TextProps } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <Text
      style={[
        { color },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
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
