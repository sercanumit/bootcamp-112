// Firebase configuration for Expo
// Bu dosyayı Firebase Console'dan alacağınız config ile güncelleyin

export const firebaseConfig = {
  apiKey: "AIzaSyDNSe4iKEx5_O0ULLuwSabuMbPAppC-gIw",
  authDomain: "directionapp-ec3b6.firebaseapp.com",
  projectId: "directionapp-ec3b6",
  storageBucket: "directionapp-ec3b6.firebasestorage.app",
  messagingSenderId: "801736117271",
  appId: "1:801736117271:android:dd99eced8c63594fd86052"
};

// Expo'da Firebase'i başlatma
// Development build gerekli
let app = null;

try {
  const { initializeApp } = require('@react-native-firebase/app');
  app = initializeApp(firebaseConfig);
  console.log(' Firebase başarıyla başlatıldı');
} catch (error) {
  console.log(' Firebase başlatılamadı (Expo Go ile çalışmaz):', error.message);
  console.log(' Development build kullanın: npx expo run:android');
}

export default app; 