import auth, { GoogleAuthProvider, signInWithCredential } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Google Sign-In konfigürasyonu
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: 'directionapp-ec3b6.apps.googleusercontent.com',
    offlineAccess: true,
  });
};

// Google ile giriş yap
export const signInWithGoogle = async () => {
  try {
    console.log('🚀 Google ile giriş başlatılıyor...');
    
    // Google Sign-In ile kullanıcı bilgilerini al
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const { accessToken } = await GoogleSignin.getTokens();
    
    console.log('✅ Google Sign-In başarılı, accessToken alındı');
    
    // Firebase Auth ile giriş yap
    const googleCredential = GoogleAuthProvider.credential(accessToken);
    const userCredential = await signInWithCredential(auth(), googleCredential);
    
    console.log('✅ Firebase Auth başarılı:', userCredential.user.email);
    
    return {
      success: true,
      user: userCredential.user,
      idToken: await userCredential.user.getIdToken(),
    };
  } catch (error: any) {
    console.error('❌ Google giriş hatası:', error);
    
    if (error.code === 'SIGN_IN_CANCELLED') {
      return {
        success: false,
        error: 'Giriş iptal edildi',
      };
    }
    
    if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      return {
        success: false,
        error: 'Google Play Services mevcut değil',
      };
    }
    
    return {
      success: false,
      error: error.message || 'Google ile giriş yapılamadı',
    };
  }
};

// Google'dan çıkış yap
export const signOutFromGoogle = async () => {
  try {
    await GoogleSignin.signOut();
    await auth().signOut();
    console.log('✅ Google ve Firebase çıkış başarılı');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Google çıkış hatası:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}; 