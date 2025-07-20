import React from "react";
import { StyleSheet, View, TouchableOpacity, Pressable } from "react-native";
import { BottomNavigation, Badge, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/constants/PaperTheme";
import { IconSymbol } from "@/components/ui/IconSymbol";

interface CustomBottomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

interface TabRoute {
  key: string;
  title: string;
  icon: string;
  iconFocused?: string;
  badge?: boolean;
  badgeCount?: number;
}

export function PaperBottomNavigation({
  state,
  descriptors,
  navigation,
}: CustomBottomTabBarProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  // Tab rotalarını state'den al
  const routes: TabRoute[] = state.routes.map((route: any, index: number) => ({
    key: route.key,
    title: descriptors[route.key]?.options?.title || route.name,
    icon: getIconForRoute(route.name),
    badge: route.name === "profile", // Sadece profile'da badge göster
  }));

  function getIconForRoute(routeName: string) {
    switch (routeName) {
      case "index":
        return "house.fill";
      case "explore":
        return "magnifyingglass";
      case "question-box":
        return "questionmark.folder";
      case "progress":
        return "chart.line.uptrend.xyaxis";
      case "profile":
        return "person.fill";
      default:
        return "house.fill";
    }
  }

  const renderTab = (route: any, index: number) => {
    const isFocused = state.index === index;
    const tabRoute = routes[index];

    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    const onLongPress = () => {
      navigation.emit({
        type: "tabLongPress",
        target: route.key,
      });
    };

    return (
      <Pressable
        key={route.key}
        onPress={onPress}
        onLongPress={onLongPress}
        style={[
          styles.tabButton,
          isFocused && {
            backgroundColor: theme.colors.primary + "12",
          },
        ]}
        android_ripple={{
          color: theme.colors.primary + "20",
          borderless: true,
        }}
      >
        <View style={styles.tabContent}>
          <View style={styles.iconContainer}>
            <IconSymbol
              name={tabRoute.icon as any}
              size={24}
              color={
                isFocused ? theme.colors.primary : theme.colors.onSurfaceVariant
              }
            />
            {tabRoute.badge && (
              <Badge
                visible={true}
                size={8}
                style={[styles.badge, { backgroundColor: theme.colors.error }]}
              />
            )}
          </View>
          <Text
            variant="labelSmall"
            style={[
              styles.labelText,
              {
                color: isFocused
                  ? theme.colors.primary
                  : theme.colors.onSurfaceVariant,
              },
            ]}
          >
            {tabRoute.title}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          paddingBottom: insets.bottom,
          borderTopColor: theme.colors.outline + "30",
        },
      ]}
    >
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) =>
          renderTab(route, index)
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 0.5,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  tabBar: {
    flexDirection: "row",
    height: 64,
    paddingVertical: 4,
  },
  tabButton: {
    flex: 1,
    borderRadius: 20,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  tabContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  iconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
  },
  labelText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 10,
    textAlign: "center",
  },
});
