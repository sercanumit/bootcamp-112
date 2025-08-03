import { Alert } from 'react-native';

// Firebase Auth - Expo uyumlu
let auth: any = null;
let firestore: any = null;
let FirebaseAuthTypes: any = null;

// Firebase'i güvenli şekilde yükle
const loadFirebase = () => {
  try {
    // Sadece auth'u dene, firestore'u sonra ekleriz
    const firebaseAuth = require('@react-native-firebase/auth');
    auth = firebaseAuth.default;
    console.log('✅ Firebase Auth yüklendi');
    
    // Firestore'u ayrı dene
    try {
      const firebaseFirestore = require('@react-native-firebase/firestore');
      firestore = firebaseFirestore.default;
      console.log('✅ Firebase Firestore yüklendi');
    } catch (firestoreError: any) {
      console.log('⚠️ Firestore yüklenemedi:', firestoreError.message);
      // Mock firestore
      firestore = () => ({
        collection: () => ({
          where: () => ({
            get: () => Promise.resolve({ forEach: () => {} }),
          }),
          add: () => Promise.reject(new Error('Firestore not available')),
          doc: () => ({
            update: () => Promise.reject(new Error('Firestore not available')),
            delete: () => Promise.reject(new Error('Firestore not available')),
          }),
        }),
      });
    }
    
    FirebaseAuthTypes = firebaseAuth.FirebaseAuthTypes;
    return true;
  } catch (error: any) {
    console.log('⚠️ Firebase yüklenemedi (Expo Go ile çalışmaz):', error.message);
    
    // Mock functions for Expo Go
    auth = () => ({
      currentUser: null,
      createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase not available in Expo Go')),
      signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase not available in Expo Go')),
      signOut: () => Promise.reject(new Error('Firebase not available in Expo Go')),
      onAuthStateChanged: () => () => {},
    });
    firestore = () => ({
      collection: () => ({
        where: () => ({
          get: () => Promise.resolve({ forEach: () => {} }),
        }),
        add: () => Promise.reject(new Error('Firebase not available in Expo Go')),
        doc: () => ({
          update: () => Promise.reject(new Error('Firebase not available in Expo Go')),
          delete: () => Promise.reject(new Error('Firebase not available in Expo Go')),
        }),
      }),
    });
    return false;
  }
};

// Firebase'i yükle
loadFirebase();

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface TaskData {
  id: string;
  user_uid: string;
  title: string;
  description: string;
  task_type: 'study' | 'practice' | 'review' | 'exam' | 'flashcard' | 'custom';
  priority: 'low' | 'medium' | 'high';
  estimated_duration: number;
  actual_duration?: number;
  is_completed: boolean;
  completed_at?: Date;
  subject?: string;
  topic?: string;
  due_date: Date;
  created_at: Date;
  updated_at: Date;
}

export class FirebaseAuthService {
  // Firebase Auth instance
  private auth = auth();

  // Mevcut kullanıcıyı al
  getCurrentUser(): FirebaseUser | null {
    try {
      const user = this.auth.currentUser;
      if (!user) return null;

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      };
    } catch (error) {
      console.log('Firebase not available, returning mock user');
      return {
        uid: 'mock-user-id',
        email: 'mock@example.com',
        displayName: 'Mock User',
        photoURL: null,
        emailVerified: true,
      };
    }
  }

  // Email/Password ile kayıt
  async register(email: string, password: string, displayName: string): Promise<FirebaseUser> {
    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
      
      // Display name güncelle
      if (userCredential.user) {
        await userCredential.user.updateProfile({
          displayName: displayName,
        });
      }

      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: displayName,
        photoURL: userCredential.user.photoURL,
        emailVerified: userCredential.user.emailVerified,
      };
    } catch (error: any) {
      console.error('Firebase register error:', error);
      
      let errorMessage = 'Kayıt oluşturulamadı';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Bu e-posta adresi zaten kullanımda';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Şifre çok zayıf';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta adresi';
      }
      
      throw new Error(errorMessage);
    }
  }

  // Email/Password ile giriş
  async login(email: string, password: string): Promise<FirebaseUser> {
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        emailVerified: userCredential.user.emailVerified,
      };
    } catch (error: any) {
      console.error('Firebase login error:', error);
      
      let errorMessage = 'Giriş yapılamadı';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Kullanıcı bulunamadı';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Yanlış şifre';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta adresi';
      }
      
      throw new Error(errorMessage);
    }
  }

  // Çıkış yap
  async logout(): Promise<void> {
    try {
      await this.auth.signOut();
    } catch (error: any) {
      console.error('Firebase logout error:', error);
      throw new Error('Çıkış yapılamadı');
    }
  }

  // ID Token al
  async getIdToken(): Promise<string> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        throw new Error('Kullanıcı oturum açmamış');
      }
      
      const token = await user.getIdToken();
      console.log('🔑 Token eklendi');
      return token;
    } catch (error: any) {
      console.error('Firebase getToken error:', error);
      throw new Error('Token alınamadı');
    }
  }

  // Auth state değişikliklerini dinle
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return this.auth.onAuthStateChanged((user: any) => {
      if (user) {
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
        });
      } else {
        callback(null);
      }
    });
  }
}

export class FirebaseTaskService {
  private db = firestore();

  // Kullanıcının görevlerini getir
  async getUserTasks(userUid: string, startDate?: Date, endDate?: Date): Promise<TaskData[]> {
    try {
      let query = this.db.collection('daily_tasks').where('user_uid', '==', userUid);
      
      if (startDate && endDate) {
        query = query.where('due_date', '>=', startDate).where('due_date', '<=', endDate);
      }
      
      const snapshot = await query.get();
      const tasks: TaskData[] = [];
      
      snapshot.forEach((doc: any) => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          ...data,
          due_date: data.due_date?.toDate() || new Date(),
          created_at: data.created_at?.toDate() || new Date(),
          updated_at: data.updated_at?.toDate() || new Date(),
          completed_at: data.completed_at?.toDate(),
        });
      });
      
      return tasks;
    } catch (error) {
      console.error('Firebase getTasks error:', error);
      // Mock data for Expo Go
      return [
        {
          id: '1',
          user_uid: userUid,
          title: 'Matematik Çalışması',
          description: 'Türev konusunu tekrar et',
          task_type: 'study',
          priority: 'high',
          estimated_duration: 60,
          is_completed: true,
          completed_at: new Date(),
          due_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          user_uid: userUid,
          title: 'Fizik Soruları',
          description: 'Newton yasaları ile ilgili 10 soru çöz',
          task_type: 'practice',
          priority: 'medium',
          estimated_duration: 45,
          is_completed: false,
          due_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
    }
  }

  // Belirli bir tarih için görevleri getir
  async getTasksByDate(userUid: string, date: Date): Promise<TaskData[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return this.getUserTasks(userUid, startOfDay, endOfDay);
  }

  // Görev tamamla/iptal et
  async toggleTaskCompletion(taskId: string, isCompleted: boolean): Promise<void> {
    try {
      const updateData: any = {
        is_completed: isCompleted,
        updated_at: new Date(),
      };
      
      if (isCompleted) {
        updateData.completed_at = new Date();
      } else {
        updateData.completed_at = null;
      }
      
      await this.db.collection('daily_tasks').doc(taskId).update(updateData);
    } catch (error) {
      console.error('Firebase toggleTask error:', error);
      console.log('Mock task toggle:', taskId, isCompleted);
    }
  }

  // Yeni görev ekle
  async addTask(task: Omit<TaskData, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const docRef = await this.db.collection('daily_tasks').add({
        ...task,
        created_at: new Date(),
        updated_at: new Date(),
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Firebase addTask error:', error);
      console.log('Mock task add:', task.title);
      return 'mock-task-id';
    }
  }

  // Görev sil
  async deleteTask(taskId: string): Promise<void> {
    try {
      await this.db.collection('daily_tasks').doc(taskId).delete();
    } catch (error) {
      console.error('Firebase deleteTask error:', error);
      console.log('Mock task delete:', taskId);
    }
  }

  // Günlük istatistikleri getir
  async getDailyStats(userUid: string, date: Date): Promise<{
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
  }> {
    const tasks = await this.getTasksByDate(userUid, date);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.is_completed).length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    return {
      totalTasks,
      completedTasks,
      completionRate,
    };
  }
}

// Singleton instances
export const firebaseAuth = new FirebaseAuthService();
export const firebaseTasks = new FirebaseTaskService(); 