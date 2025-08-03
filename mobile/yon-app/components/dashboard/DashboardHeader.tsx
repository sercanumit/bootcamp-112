import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { notificationsAPI } from '@/services/api';
import { NotificationPreviewModal } from './NotificationPreviewModal';

interface DashboardHeaderProps {
  userName?: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const theme = useTheme();
  const { user } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);

  useEffect(() => {
    loadNotificationCount();
    
    // Her 30 saniyede bir güncelle (BottomNavigation ile aynı)
    const interval = setInterval(loadNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotificationCount = async () => {
    try {
      const response = await notificationsAPI.getNotificationStats();
      if (response.success && response.data) {
        setNotificationCount(response.data.unread_count || 0);
      }
    } catch (error) {
      console.error('Bildirim sayısı alınamadı:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  const handleNotificationPress = () => {
    console.log('🎯 Profile logo tıklandı!');
    console.log('🎯 Notification count:', notificationCount);
    console.log('🎯 Modal visible olacak:', true);
    setNotificationModalVisible(true);
    // Bildirim sayısını hemen sıfırla
    setNotificationCount(0);
  };

  return (
    <View style={styles.container}>
      {/* Greeting */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>
          {getGreeting()}, {userName || user?.displayName || 'Kullanıcı'}!
        </Text>
      </View>

      {/* Profile Picture with Notification Badge */}
      <TouchableOpacity 
        style={styles.profileContainer}
        onPress={handleNotificationPress}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Avatar.Image
            size={50}
            source={require('@/assets/images/profile/profile.jpg')}
            style={styles.avatar}
          />
          {notificationCount > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
              <Text style={[styles.badgeText, { color: theme.colors.onError }]}>
                {notificationCount > 99 ? '99+' : notificationCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Notification Modal */}
      <NotificationPreviewModal
        visible={notificationModalVisible}
        onClose={async () => {
          setNotificationModalVisible(false);
          // Tüm bildirimleri okundu olarak işaretle
          try {
            await notificationsAPI.markAllNotificationsAsRead();
            setNotificationCount(0);
          } catch (error) {
            console.error('Bildirimler okundu olarak işaretlenemedi:', error);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins_600SemiBold',
  },
  profileContainer: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});
