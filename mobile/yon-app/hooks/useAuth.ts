import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { firebaseAuth, FirebaseUser } from '@/services/firebase';
import { authAPI, LoginRequest, RegisterRequest, AuthResponse } from '@/services/api';
// import { signInWithGoogle, signOutFromGoogle } from '@/services/googleAuth';

interface UseAuthReturn {
  user: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is authenticated on app start
  useEffect(() => {
    checkAuthStatus();
    
    // Listen to auth state changes
    const unsubscribe = firebaseAuth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });

    return unsubscribe;
  }, []);

  const checkAuthStatus = async () => {
    try {
      const currentUser = firebaseAuth.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      
      // Firebase ile giriş yap
      const firebaseUser = await firebaseAuth.login(credentials.email, credentials.password);
      
      // Kısa bir bekleme süresi ekle (token'ın hazır olması için)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Backend'e token gönder ve kullanıcı bilgilerini al
      const token = await firebaseAuth.getIdToken();
      console.log('✅ Token alındı:', token ? 'Token var' : 'Token yok');
      
      const response = await authAPI.loginWithToken(token);
      
      if (response.success) {
        setUser(firebaseUser);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Hata', response.message || 'Giriş yapılamadı');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Hata', error.message || 'Giriş yapılamadı');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true);
      
      // Firebase ile kayıt yap
      const firebaseUser = await firebaseAuth.register(userData.email, userData.password, userData.name);
      
      // Kısa bir bekleme süresi ekle (token'ın hazır olması için)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Backend'e token gönder ve kullanıcı bilgilerini al
      const token = await firebaseAuth.getIdToken();
      console.log('✅ Token alındı:', token ? 'Token var' : 'Token yok');
      
      const response = await authAPI.loginWithToken(token);
      
      if (response.success) {
        setUser(firebaseUser);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Hata', response.message || 'Kayıt oluşturulamadı');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      Alert.alert('Hata', error.message || 'Kayıt oluşturulamadı');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    Alert.alert('Google Auth', 'Google ile giriş özelliği development build gerektiriyor. Şimdilik sadece email/şifre ile giriş yapabilirsiniz.');
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Firebase'den çıkış yap
      await firebaseAuth.logout();
      
      // Backend'e logout isteği gönder
      await authAPI.logout();
      
      // User state'ini temizle
      setUser(null);
      
      // Login sayfasına yönlendir
      router.replace('/(auth)/login');
      
    } catch (error) {
      console.error('Logout error:', error);
      // Hata olsa bile login sayfasına yönlendir
      setUser(null);
      router.replace('/(auth)/login');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    loginWithGoogle,
    logout,
  };
} 