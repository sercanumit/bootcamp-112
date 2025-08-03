import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useAppTheme } from "@/constants/PaperTheme";

interface GoogleButtonProps {
  onPress: () => void;
  title?: string;
}

export function GoogleButton({ onPress, title = "Google ile devam et" }: GoogleButtonProps) {
  const theme = useAppTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: 'white',
          borderColor: 'rgba(0,0,0,0.1)',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <IconSymbol
          name="globe"
          size={20}
          color="#4285F4"
        />
        <Text
          style={[
            styles.text,
            {
              color: '#333',
            },
          ]}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  text: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
}); 