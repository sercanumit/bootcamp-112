import React, { useEffect } from "react";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PaperProvider, adaptNavigationTheme } from "react-native-paper";
import "react-native-reanimated";
import "../firebase.config";
import { useColorScheme } from "@/hooks/useColorScheme";
import { customLightTheme, customDarkTheme } from "@/constants/PaperTheme";
import { useAuth } from "@/hooks/useAuth";
import { getUserProfile } from "@/services/api";

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
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  const { user } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    async function checkOnboarding() {
      console.log("🔍 Onboarding check başladı");
      console.log("👤 User:", user ? "var" : "yok");
      console.log("📍 Segments:", segments);
      console.log("📍 Current segment:", segments[0]);

      if (user) {
        console.log("✅ Onboarding kontrolü yapılıyor...");
        try {
          const profile = await getUserProfile();
          console.log(
            "📋 Full profile response:",
            JSON.stringify(profile, null, 2)
          );

          // Yeni kullanıcı kontrolü - created_at bugün ise ve onboarding tamamlanmamışsa onboarding aç
          // Çift nested yapı: profile.data.data.created_at
          const userData = profile.data?.data;
          const hasOnboardingData =
            userData?.target_profession && userData?.grade;
          const isOnboardingCompleted =
            userData?.onboarding_completed || hasOnboardingData;

          if (userData?.created_at && !isOnboardingCompleted) {
            const createdDate = new Date(userData.created_at);
            const today = new Date();
            // Sadece tarih kısmını karşılaştır (saat farkı olmasın)
            const isNewUser =
              createdDate.toDateString() === today.toDateString();

            console.log("📅 Created date:", createdDate.toDateString());
            console.log("📅 Today:", today.toDateString());
            console.log("🆕 Is new user:", isNewUser);
            console.log("✅ Onboarding completed:", isOnboardingCompleted);
            console.log("📋 Has onboarding data:", hasOnboardingData);

            if (isNewUser) {
              console.log("🚀 Onboarding açılıyor...");
              router.replace("/(auth)/onboarding");
            }
          } else {
            console.log("❌ Onboarding gerekli değil");
            console.log("🔍 User data:", userData);
          }
        } catch (e) {
          console.log("❌ Onboarding check error:", e);
        }
      } else {
        console.log("❌ User yok, onboarding kontrolü yapılmadı");
      }
    }
    checkOnboarding();
  }, [user, segments]);

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
      <StatusBar style="auto" translucent backgroundColor="transparent" />
      <PaperProvider theme={paperTheme}>
        <ThemeProvider value={navigationTheme}>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="analysis" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </PaperProvider>
    </>
  );
}
