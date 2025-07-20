// Fallback for using MaterialIcons Community on Android and web.

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<
  SymbolViewProps["name"],
  ComponentProps<typeof MaterialCommunityIcons>["name"]
>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons Community mappings here.
 * - see Material Icons Community in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code-tags",
  "chevron.right": "chevron-right",
  "star.fill": "star",
  "flame.fill": "fire",
  "shield.fill": "shield",
  magnifyingglass: "magnify",
  dumbbell: "dumbbell",
  "chart.bar.fill": "chart-bar",
  "person.fill": "account",
  "questionmark.folder": "file-question-outline",
  "chart.line.uptrend.xyaxis": "chart-line",
} as const;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons Community on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons Community.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <MaterialCommunityIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}
