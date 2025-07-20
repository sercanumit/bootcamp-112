import { StyleSheet } from "react-native";
import { FAB, useTheme } from "react-native-paper";
import { useState } from "react";
import { useColorScheme } from "@/hooks/useColorScheme";

interface SpeedDialAction {
  icon: string;
  label: string;
  onPress: () => void;
}

interface SpeedDialProps {
  style?: any;
}

export function SpeedDial({ style }: SpeedDialProps) {
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const theme = useTheme();
  const colorScheme = useColorScheme();

  const fabBackgroundColor =
    colorScheme === "light" ? theme.colors.primary : theme.colors.primary;

  const actions: SpeedDialAction[] = [
    {
      icon: "plus-circle",
      label: "Yeni Soru Ekle",
      onPress: () => {
        console.log("Yeni soru ekleme sayfası");
      },
    },
    {
      icon: "refresh-circle",
      label: "Hızlı Tekrar",
      onPress: () => {
        console.log("Hızlı tekrar sayfası");
      },
    },
    {
      icon: "lightning-bolt-circle",
      label: "Hızlı Soru Çözüm",
      onPress: () => {
        console.log("Hızlı soru çözüm sayfası");
      },
    },
  ];

  const wrappedActions = actions.map((action) => ({
    ...action,
    onPress: () => {
      action.onPress();
      setSpeedDialOpen(false);
    },
  }));

  return (
    <FAB.Group
      open={speedDialOpen}
      visible
      icon={speedDialOpen ? "close" : "plus"}
      actions={wrappedActions}
      onStateChange={({ open }) => setSpeedDialOpen(open)}
      style={[styles.speedDial, style]}
      fabStyle={[styles.speedDialFab, { backgroundColor: fabBackgroundColor }]}
      color="white"
    />
  );
}

const styles = StyleSheet.create({
  speedDial: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: -60,
  },
  speedDialFab: {
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderRadius: 40,
  },
});
