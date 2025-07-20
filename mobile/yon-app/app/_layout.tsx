import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PaperProvider, adaptNavigationTheme } from "react-native-paper";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { customLightTheme, customDarkTheme } from "@/constants/PaperTheme";

// Suppress setLayoutAnimationEnabledExperimental warnings in New Architecture
if (__DEV__) {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (
      args[0] &&
      typeof args[0] === "string" &&
      args[0].includes("setLayoutAnimationEnabledExperimental")
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!loaded) {
    return null;
  }

  // Paper temasını seç
  const paperTheme =
    colorScheme === "dark" ? customDarkTheme : customLightTheme;

  // React Navigation temasını Paper teması ile uyumlu hale getir
  const { LightTheme: NavigationLightTheme, DarkTheme: NavigationDarkTheme } =
    adaptNavigationTheme({
      reactNavigationLight: DefaultTheme,
      reactNavigationDark: DarkTheme,
      materialLight: customLightTheme,
      materialDark: customDarkTheme,
    });

  const navigationTheme =
    colorScheme === "dark" ? NavigationDarkTheme : NavigationLightTheme;

  return (
    <>
      <StatusBar style="auto" />
      <PaperProvider theme={paperTheme}>
        <ThemeProvider value={navigationTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </PaperProvider>
    </>
  );
}
