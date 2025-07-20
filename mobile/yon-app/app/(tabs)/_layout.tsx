import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { PaperBottomNavigation } from "@/components/ui/BottomNavigation";
import { useAppTheme } from "@/constants/PaperTheme";

export default function TabLayout() {
  const theme = useAppTheme();

  return (
    <Tabs
      tabBar={(props) => <PaperBottomNavigation {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Keşfet",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="magnifyingglass" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="question-box"
        options={{
          title: "Soru Kutum",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="questionmark.folder" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Analiz",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={24}
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
            <IconSymbol size={24} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
