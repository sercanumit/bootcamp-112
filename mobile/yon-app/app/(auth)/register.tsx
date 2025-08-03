import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Checkbox,
  Divider,
} from "react-native-paper";
import { Link, router } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { useAppTheme } from "@/constants/PaperTheme";
import { useAuth } from "@/hooks/useAuth";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const theme = useAppTheme();
  const { register, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Hata", "Şifreler eşleşmiyor.");
      return;
    }

    if (!acceptTerms) {
      Alert.alert("Hata", "Lütfen kullanım şartlarını kabul edin.");
      return;
    }

    await register({ name, email, password });
  };

  const handleGoogleRegister = () => {
    // TODO: Implement Google registration
    Alert.alert("Google Kayıt", "Google ile kayıt özelliği yakında eklenecek.");
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#f8f9fe', '#f3f4ff', '#e8eaff']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Decorative Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Illustration */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>YÖN</Text>
              </View>
            </View>
            
            <Text style={[styles.title, { color: theme.colors.onBackground }]}>
              Başarı Yolculuğuna Başla! 🚀
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Hesabını oluştur, hedeflerine ulaş!
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={[styles.formTitle, { color: theme.colors.onBackground }]}>
              Hesap Oluştur
            </Text>
            
            <View style={styles.form}>
              <TextInput
                label="Ad Soyad"
                value={name}
                onChangeText={setName}
                mode="outlined"
                autoCapitalize="words"
                style={styles.input}
                contentStyle={styles.inputContent}
              />

              <TextInput
                label="E-posta"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={styles.input}
                contentStyle={styles.inputContent}
              />

              <TextInput
                label="Şifre"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                style={styles.input}
                contentStyle={styles.inputContent}
              />

              <TextInput
                label="Şifre Tekrar"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                secureTextEntry={!showConfirmPassword}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? "eye-off" : "eye"}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                style={styles.input}
                contentStyle={styles.inputContent}
              />

              {/* Terms Checkbox */}
              <View style={styles.termsContainer}>
                <Checkbox
                  status={acceptTerms ? "checked" : "unchecked"}
                  onPress={() => setAcceptTerms(!acceptTerms)}
                  color={theme.colors.primary}
                />
                <Text style={[styles.termsText, { color: theme.colors.onSurfaceVariant }]}>
                  Kullanım şartlarını ve gizlilik politikasını kabul ediyorum
                </Text>
              </View>

              {/* Register Button */}
              <Button
                mode="contained"
                onPress={handleRegister}
                loading={isLoading}
                disabled={isLoading}
                style={styles.registerButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                {isLoading ? "Hesap Oluşturuluyor..." : "Hesap Oluştur"}
              </Button>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <Divider style={styles.divider} />
                <Text style={[styles.dividerText, { color: theme.colors.onSurfaceVariant }]}>
                  veya
                </Text>
                <Divider style={styles.divider} />
              </View>

              {/* Google Button */}
              <GoogleButton 
                onPress={handleGoogleRegister} 
                title="Google ile kayıt ol"
              />

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={[styles.loginText, { color: theme.colors.onSurfaceVariant }]}>
                  Zaten hesabınız var mı?{" "}
                </Text>
                <Text
                  style={[styles.loginLink, { color: theme.colors.primary }]}
                  onPress={() => {
                    router.push('/(auth)/login');
                  }}
                >
                  Giriş yapın
                </Text>
              </View>
            </View>
          </View>


        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  
  // Decorative Elements
  decorativeCircle1: {
    position: 'absolute',
    top: height * 0.1,
    right: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(112, 51, 255, 0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    top: height * 0.3,
    left: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(112, 51, 255, 0.08)',
  },
  decorativeCircle3: {
    position: 'absolute',
    bottom: height * 0.2,
    right: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(112, 51, 255, 0.06)',
  },
  
  // Header
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7033ff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7033ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
  },
  title: {
    fontSize: 32,
    fontFamily: "Poppins_700Bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginBottom: 20,
  },
  
  // Form Card
  formCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 24,
    textAlign: "center",
  },
  form: {
    gap: 16,
  },
  input: {
    borderRadius: 16,
    backgroundColor: '#f8f9fe',
    marginBottom: 0,
  },
  inputContent: {
    fontFamily: "Poppins_400Regular",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  termsText: {
    fontFamily: "Poppins_400Regular",
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  registerButton: {
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#7033ff',
    shadowColor: '#7033ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    height: 52,
  },
  buttonLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  divider: {
    flex: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontFamily: "Poppins_400Regular",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  loginText: {
    fontFamily: "Poppins_400Regular",
  },
  loginLink: {
    fontFamily: "Poppins_600SemiBold",
  },
}); 