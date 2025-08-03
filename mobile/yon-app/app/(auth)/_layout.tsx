import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          title: "Giriş Yap",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: "Kayıt Ol",
          headerShown: false,
        }}
      />
    </Stack>
  );
} 