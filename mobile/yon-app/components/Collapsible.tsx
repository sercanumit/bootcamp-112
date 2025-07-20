import { PropsWithChildren, useState } from "react";
import { StyleSheet } from "react-native";
import { List, IconButton, Divider } from "react-native-paper";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useAppTheme } from "@/constants/PaperTheme";

export function Collapsible({
  children,
  title,
}: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useAppTheme();

  return (
    <ThemedView surface elevation={1} style={styles.container}>
      <List.Accordion
        title={title}
        expanded={isOpen}
        onPress={() => setIsOpen(!isOpen)}
        titleStyle={[styles.titleStyle, { color: theme.colors.onSurface }]}
        style={styles.accordion}
        left={(props) => (
          <IconSymbol
            name="chevron.right"
            size={18}
            color={theme.colors.onSurface}
            style={{
              transform: [{ rotate: isOpen ? "90deg" : "0deg" }],
              marginLeft: 8,
            }}
          />
        )}
      >
        <Divider />
        <ThemedView style={styles.content}>{children}</ThemedView>
      </List.Accordion>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginVertical: 4,
  },
  accordion: {
    backgroundColor: "transparent",
  },
  titleStyle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
  },
  content: {
    padding: 16,
    paddingTop: 8,
  },
});
