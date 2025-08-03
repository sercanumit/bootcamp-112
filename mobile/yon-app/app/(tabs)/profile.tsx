import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import {
  Text,
  Avatar,
  Card,
  List,
  Divider,
  IconButton,
  Button,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/constants/PaperTheme';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile, saveUserProfile } from '@/services/api';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { NotificationPreviewModal } from '@/components/dashboard/NotificationPreviewModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface UserProfile {
  name: string;
  email: string;
  grade?: string;
  department?: string;
  target_profession?: string;
  created_at?: string;
  onboarding_completed?: boolean;
}

export default function ProfileScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();
      if (response.success && response.data) {
        setProfile(response.data.data);
      } else {
        console.error('Profil yüklenirken hata:', response.message);
      }
    } catch (error) {
      console.error('Profil yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Çıkış hatası:', error);
              Alert.alert('Hata', 'Çıkış yapılırken hata oluştu');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Bilinmiyor';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const menuItems = [
    {
      title: 'Hedefler',
      icon: 'flag' as const,
      onPress: () => {
        // TODO: Hedefler sayfasına git
        Alert.alert('Bilgi', 'Hedefler sayfası yakında eklenecek');
      },
    },
    {
      title: 'Bildirimler',
      icon: 'notifications' as const,
      onPress: () => {
        // Bildirimler bölümünü aç
        setShowNotifications(true);
      },
    },
    {
      title: 'Yardım',
      icon: 'help-circle' as const,
      onPress: () => {
        // TODO: Yardım sayfasına git
        Alert.alert('Bilgi', 'Yardım sayfası yakında eklenecek');
      },
    },
    {
      title: 'Ayarlar',
      icon: 'settings' as const,
      onPress: () => {
        // TODO: Ayarlar sayfasına git
        Alert.alert('Bilgi', 'Ayarlar sayfası yakında eklenecek');
      },
    },
  ];

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
            Profil yükleniyor...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
      >
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.headerGradient}>
            {/* Arka Plan L Şekilleri */}
            <View style={styles.backgroundLShapes}>
              {/* L Shape 1 - Largest, Dark Green */}
              <View style={styles.lShape1}>
                <View style={styles.lShapeHorizontal1} />
                <View style={styles.lShapeVertical1} />
              </View>
              
              {/* L Shape 2 - Dark Olive Green */}
              <View style={styles.lShape2}>
                <View style={styles.lShapeHorizontal2} />
                <View style={styles.lShapeVertical2} />
              </View>
              
              {/* L Shape 3 - Saddle Brown */}
              <View style={styles.lShape3}>
                <View style={styles.lShapeHorizontal3} />
                <View style={styles.lShapeVertical3} />
              </View>
              
              {/* L Shape 4 - Dark Orange */}
              <View style={styles.lShape4}>
                <View style={styles.lShapeHorizontal4} />
                <View style={styles.lShapeVertical4} />
              </View>
              
              {/* L Shape 5 - Smallest, Chocolate */}
              <View style={styles.lShape5}>
                <View style={styles.lShapeHorizontal5} />
                <View style={styles.lShapeVertical5} />
              </View>
            </View>

            <View style={styles.headerContent}>
              <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                  <Avatar.Image
                    size={90}
                    source={{ uri: "https://picsum.photos/200" }}
                    style={styles.avatar}
                  />
                  <View style={[styles.onlineIndicator, { backgroundColor: '#4CAF50' }]} />
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.userName}>
                    {profile?.name || user?.displayName || 'Kullanıcı'}
                  </Text>
                  <Text style={styles.userEmail}>
                    {profile?.email || user?.email || 'email@example.com'}
                  </Text>
                  <View style={styles.statusContainer}>
                    <View style={[styles.statusDot, { backgroundColor: profile?.onboarding_completed ? '#4CAF50' : '#FF9800' }]} />
                    <Text style={styles.userStatus}>
                      {profile?.onboarding_completed ? 'Aktif Kullanıcı' : 'Yeni Kullanıcı'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Profile Details Card */}
        <Card style={styles.profileCard}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Profil Bilgileri
            </Text>
            
            <View style={styles.detailRow}>
              <Ionicons name="school" size={16} color={theme.colors.primary} />
              <Text style={[styles.detailLabel, { color: theme.colors.onSurface }]}>
                Sınıf:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.onSurfaceVariant }]}>
                {profile?.grade || 'Belirtilmemiş'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="library" size={16} color={theme.colors.primary} />
              <Text style={[styles.detailLabel, { color: theme.colors.onSurface }]}>
                Bölüm:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.onSurfaceVariant }]}>
                {profile?.department || 'Belirtilmemiş'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="flag" size={16} color={theme.colors.primary} />
              <Text style={[styles.detailLabel, { color: theme.colors.onSurface }]}>
                Hedef Meslek:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.onSurfaceVariant }]}>
                {profile?.target_profession || 'Belirtilmemiş'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={16} color={theme.colors.primary} />
              <Text style={[styles.detailLabel, { color: theme.colors.onSurface }]}>
                Kayıt Tarihi:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.onSurfaceVariant }]}>
                {formatDate(profile?.created_at || '')}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Menu Items */}
        <Card style={styles.menuCard}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Menü
            </Text>
            
            {menuItems.map((item, index) => (
              <React.Fragment key={item.title}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name={item.icon} size={20} color={theme.colors.primary} />
                    <Text style={[styles.menuItemText, { color: theme.colors.onSurface }]}>
                      {item.title}
            </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.onSurfaceVariant} />
                </TouchableOpacity>
                {index < menuItems.length - 1 && (
                  <Divider style={styles.divider} />
                )}
              </React.Fragment>
            ))}
          </Card.Content>
        </Card>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={[styles.logoutButton, { borderColor: theme.colors.error }]}
            labelStyle={[styles.logoutButtonLabel, { color: theme.colors.error }]}
            icon="logout"
          >
            Çıkış Yap
          </Button>
        </View>
      </ScrollView>

      {/* Bildirimler Modal */}
      <NotificationPreviewModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
  },
  headerContainer: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  headerContent: {
    zIndex: 2,
    position: 'relative',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: '#333333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#666666',
    marginBottom: 8,
  },
  userStatus: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#888888',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  profileCard: {
    margin: 16,
    marginTop: 8,
  },
  menuCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    marginLeft: 8,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    marginLeft: 12,
  },
  divider: {
    marginVertical: 4,
  },
  logoutContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  logoutButton: {
    borderRadius: 12,
  },
  logoutButtonLabel: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
  },
  lShapeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lShape: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: 200,
    height: 200,
    backgroundColor: 'rgba(255,140,0,0.8)',
    borderWidth: 3,
    borderColor: 'white',
    borderRadius: 20,
    zIndex: 1,
  },
  lShapeLines: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: 200,
    height: 200,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  line1: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: 60,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 2,
  },
  line2: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    width: 60,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 2,
  },
  line3: {
    position: 'absolute',
    top: '40%',
    left: '10%',
    width: 60,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 2,
  },
  line4: {
    position: 'absolute',
    top: '50%',
    left: '10%',
    width: 60,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 2,
  },
  line5: {
    position: 'absolute',
    top: '60%',
    left: '10%',
    width: 60,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 2,
  },
  whiteDots: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: 200,
    height: 200,
    zIndex: 3,
  },
  dot1: {
    position: 'absolute',
    top: '25%',
    left: '15%',
    width: 8,
    height: 8,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  dot2: {
    position: 'absolute',
    top: '45%',
    left: '15%',
    width: 8,
    height: 8,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  dot3: {
    position: 'absolute',
    top: '65%',
    left: '15%',
    width: 8,
    height: 8,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  greenBase: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#228B22',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: -1,
  },
  backgroundLShapes: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '50%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  lShape1: {
    position: 'absolute',
    bottom: 40,
    right: 30,
    width: 140,
    height: 100,
  },
  lShape2: {
    position: 'absolute',
    bottom: 60,
    right: 50,
    width: 110,
    height: 80,
  },
  lShape3: {
    position: 'absolute',
    bottom: 80,
    right: 70,
    width: 90,
    height: 60,
  },
  lShape4: {
    position: 'absolute',
    bottom: 100,
    right: 90,
    width: 70,
    height: 40,
  },
  lShape5: {
    position: 'absolute',
    bottom: 120,
    right: 110,
    width: 50,
    height: 25,
  },
  lShapeHorizontal1: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 16,
    backgroundColor: '#228B22',
    borderRadius: 8,
  },
  lShapeVertical1: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: '100%',
    backgroundColor: '#228B22',
    borderRadius: 8,
  },
  lShapeHorizontal2: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 14,
    backgroundColor: '#556B2F',
    borderRadius: 7,
  },
  lShapeVertical2: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: '100%',
    backgroundColor: '#556B2F',
    borderRadius: 7,
  },
  lShapeHorizontal3: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 12,
    backgroundColor: '#8B4513',
    borderRadius: 6,
  },
  lShapeVertical3: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: '100%',
    backgroundColor: '#8B4513',
    borderRadius: 6,
  },
  lShapeHorizontal4: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 10,
    backgroundColor: '#FF8C00',
    borderRadius: 5,
  },
  lShapeVertical4: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: '100%',
    backgroundColor: '#FF8C00',
    borderRadius: 5,
  },
  lShapeHorizontal5: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 8,
    backgroundColor: '#D2691E',
    borderRadius: 4,
  },
  lShapeVertical5: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 8,
    height: '100%',
    backgroundColor: '#D2691E',
    borderRadius: 4,
  },

});
