import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import type { MD3Theme } from "react-native-paper";

// Özel renkler
const customColors = {
  primary: "#7033ff",
  primaryDark: "#8c5cff",
  success: "#2e7d32",
  successDark: "#4caf50",
  warning: "#f57c00",
  warningDark: "#ffa726",
  danger: "#d32f2f",
  dangerDark: "#f44336",
};

// Light tema
export const customLightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: customColors.primary,
    onPrimary: "#ffffff",
    primaryContainer: "#f3f4ff",
    onPrimaryContainer: "#1a0033",
    secondary: "#6750a4",
    onSecondary: "#ffffff",
    secondaryContainer: "#eaddff",
    onSecondaryContainer: "#21005d",
    tertiary: "#7d5260",
    onTertiary: "#ffffff",
    tertiaryContainer: "#ffd8e4",
    onTertiaryContainer: "#31111d",
    error: customColors.danger,
    onError: "#ffffff",
    errorContainer: "#ffdad6",
    onErrorContainer: "#410002",
    background: "#ffffff",
    onBackground: "#1c1b1f",
    surface: "#ffffff",
    onSurface: "#1c1b1f",
    surfaceVariant: "#f8f9fe",
    onSurfaceVariant: "#424242",
    outline: "#79747e",
    outlineVariant: "#c4c7c5",
    shadow: "#000000",
    scrim: "#000000",
    inverseSurface: "#313033",
    inverseOnSurface: "#f4eff4",
    inversePrimary: "#d0bcff",
    elevation: {
      level0: "transparent",
      level1: "rgb(247, 243, 249)",
      level2: "rgb(243, 237, 246)",
      level3: "rgb(238, 232, 244)",
      level4: "rgb(236, 230, 243)",
      level5: "rgb(233, 227, 241)",
    },
    surfaceDisabled: "rgba(28, 27, 31, 0.12)",
    onSurfaceDisabled: "rgba(28, 27, 31, 0.38)",
    backdrop: "rgba(50, 47, 55, 0.4)",
  },
  // Özel fontlar
  fonts: {
    ...MD3LightTheme.fonts,
    default: {
      ...MD3LightTheme.fonts.default,
      fontFamily: "Poppins_400Regular",
    },
    displaySmall: {
      ...MD3LightTheme.fonts.displaySmall,
      fontFamily: "Poppins_700Bold",
    },
    displayMedium: {
      ...MD3LightTheme.fonts.displayMedium,
      fontFamily: "Poppins_700Bold",
    },
    displayLarge: {
      ...MD3LightTheme.fonts.displayLarge,
      fontFamily: "Poppins_700Bold",
    },
    headlineSmall: {
      ...MD3LightTheme.fonts.headlineSmall,
      fontFamily: "Poppins_600SemiBold",
    },
    headlineMedium: {
      ...MD3LightTheme.fonts.headlineMedium,
      fontFamily: "Poppins_600SemiBold",
    },
    headlineLarge: {
      ...MD3LightTheme.fonts.headlineLarge,
      fontFamily: "Poppins_700Bold",
    },
    titleSmall: {
      ...MD3LightTheme.fonts.titleSmall,
      fontFamily: "Poppins_600SemiBold",
    },
    titleMedium: {
      ...MD3LightTheme.fonts.titleMedium,
      fontFamily: "Poppins_600SemiBold",
    },
    titleLarge: {
      ...MD3LightTheme.fonts.titleLarge,
      fontFamily: "Poppins_600SemiBold",
    },
    bodySmall: {
      ...MD3LightTheme.fonts.bodySmall,
      fontFamily: "Poppins_400Regular",
    },
    bodyMedium: {
      ...MD3LightTheme.fonts.bodyMedium,
      fontFamily: "Poppins_400Regular",
    },
    bodyLarge: {
      ...MD3LightTheme.fonts.bodyLarge,
      fontFamily: "Poppins_400Regular",
    },
    labelSmall: {
      ...MD3LightTheme.fonts.labelSmall,
      fontFamily: "Poppins_400Regular",
    },
    labelMedium: {
      ...MD3LightTheme.fonts.labelMedium,
      fontFamily: "Poppins_600SemiBold",
    },
    labelLarge: {
      ...MD3LightTheme.fonts.labelLarge,
      fontFamily: "Poppins_600SemiBold",
    },
  },
};

// Dark tema
export const customDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: customColors.primaryDark,
    onPrimary: "#37005d",
    primaryContainer: "#5d41a9",
    onPrimaryContainer: "#eaddff",
    secondary: "#ccc2dc",
    onSecondary: "#332d41",
    secondaryContainer: "#4a4458",
    onSecondaryContainer: "#e8def8",
    tertiary: "#efb8c8",
    onTertiary: "#492532",
    tertiaryContainer: "#633b48",
    onTertiaryContainer: "#ffd8e4",
    error: customColors.dangerDark,
    onError: "#690005",
    errorContainer: "#93000a",
    onErrorContainer: "#ffdad6",
    background: "#121212",
    onBackground: "#e6e1e5",
    surface: "#121212",
    onSurface: "#e6e1e5",
    surfaceVariant: "#1a1a1a",
    onSurfaceVariant: "#cac4d0",
    outline: "#938f99",
    outlineVariant: "#49454f",
    shadow: "#000000",
    scrim: "#000000",
    inverseSurface: "#e6e1e5",
    inverseOnSurface: "#313033",
    inversePrimary: customColors.primary,
    elevation: {
      level0: "transparent",
      level1: "rgb(22, 22, 22)",
      level2: "rgb(28, 28, 28)",
      level3: "rgb(33, 33, 33)",
      level4: "rgb(34, 34, 34)",
      level5: "rgb(37, 37, 37)",
    },
    surfaceDisabled: "rgba(230, 225, 229, 0.12)",
    onSurfaceDisabled: "rgba(230, 225, 229, 0.38)",
    backdrop: "rgba(50, 47, 55, 0.4)",
  },
  // Özel fontlar
  fonts: {
    ...MD3DarkTheme.fonts,
    default: {
      ...MD3DarkTheme.fonts.default,
      fontFamily: "Poppins_400Regular",
    },
    displaySmall: {
      ...MD3DarkTheme.fonts.displaySmall,
      fontFamily: "Poppins_700Bold",
    },
    displayMedium: {
      ...MD3DarkTheme.fonts.displayMedium,
      fontFamily: "Poppins_700Bold",
    },
    displayLarge: {
      ...MD3DarkTheme.fonts.displayLarge,
      fontFamily: "Poppins_700Bold",
    },
    headlineSmall: {
      ...MD3DarkTheme.fonts.headlineSmall,
      fontFamily: "Poppins_600SemiBold",
    },
    headlineMedium: {
      ...MD3DarkTheme.fonts.headlineMedium,
      fontFamily: "Poppins_600SemiBold",
    },
    headlineLarge: {
      ...MD3DarkTheme.fonts.headlineLarge,
      fontFamily: "Poppins_700Bold",
    },
    titleSmall: {
      ...MD3DarkTheme.fonts.titleSmall,
      fontFamily: "Poppins_600SemiBold",
    },
    titleMedium: {
      ...MD3DarkTheme.fonts.titleMedium,
      fontFamily: "Poppins_600SemiBold",
    },
    titleLarge: {
      ...MD3DarkTheme.fonts.titleLarge,
      fontFamily: "Poppins_600SemiBold",
    },
    bodySmall: {
      ...MD3DarkTheme.fonts.bodySmall,
      fontFamily: "Poppins_400Regular",
    },
    bodyMedium: {
      ...MD3DarkTheme.fonts.bodyMedium,
      fontFamily: "Poppins_400Regular",
    },
    bodyLarge: {
      ...MD3DarkTheme.fonts.bodyLarge,
      fontFamily: "Poppins_400Regular",
    },
    labelSmall: {
      ...MD3DarkTheme.fonts.labelSmall,
      fontFamily: "Poppins_400Regular",
    },
    labelMedium: {
      ...MD3DarkTheme.fonts.labelMedium,
      fontFamily: "Poppins_600SemiBold",
    },
    labelLarge: {
      ...MD3DarkTheme.fonts.labelLarge,
      fontFamily: "Poppins_600SemiBold",
    },
  },
};

// Tema türü tanımı (TypeScript için)
export type AppTheme = typeof customLightTheme;

// Özel useAppTheme hook'u
export { useTheme as useAppTheme } from "react-native-paper";

// Ek özel renkler
export const additionalColors = {
  success: customColors.success,
  successDark: customColors.successDark,
  warning: customColors.warning,
  warningDark: customColors.warningDark,
  // Gradient renkler
  backgroundGradient: {
    light: ["#f8f9fe", "#f3f4ff"],
    dark: ["#0a0a0a", "#1a1a1a"],
  },
};
