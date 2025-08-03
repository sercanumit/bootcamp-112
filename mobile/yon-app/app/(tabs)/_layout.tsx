import { Tabs } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { PaperBottomNavigation } from "@/components/ui/BottomNavigation";
import { useAppTheme } from "@/constants/PaperTheme";

export default function TabLayout() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      tabBar={(props) => <PaperBottomNavigation {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          height: 80 + insets.bottom,
          backgroundColor: 'transparent', // Şeffaf arka plan
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          paddingBottom: insets.bottom,
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={22} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Takvim",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={22} name="calendar" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="question-box"
        options={{
          title: "Soru Kutusu",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={22} name="questionmark.folder" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Analiz",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={22}
              name="chart.line.uptrend.xyaxis"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={22} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
