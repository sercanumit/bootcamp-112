import { SymbolView, SymbolViewProps, SymbolWeight } from "expo-symbols";
import { StyleProp, ViewStyle, TextStyle } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Platform } from "react-native";

// iOS'ta da material community icons kullanılabilir
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
  "bell.fill": "bell",
  "calendar": "calendar",
} as const;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = "regular",
}: {
  name: SymbolViewProps["name"];
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle | TextStyle>;
  weight?: SymbolWeight;
}) {
  // iOS'ta SF Symbols kullan
  if (Platform.OS === "ios") {
    return (
      <SymbolView
        weight={weight}
        tintColor={color}
        resizeMode="scaleAspectFit"
        name={name}
        style={[
          {
            width: size,
            height: size,
          },
          style as StyleProp<ViewStyle>,
        ]}
      />
    );
  }

  // Diğer platformlarda Material Community Icons
  return (
    <MaterialCommunityIcons
      name={MAPPING[name as keyof typeof MAPPING] || "help"}
      size={size}
      color={color}
      style={style as StyleProp<TextStyle>}
    />
  );
}
