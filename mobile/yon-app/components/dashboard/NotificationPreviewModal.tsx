import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { notificationsAPI, NotificationPreview } from '@/services/api';
import { QuickSolutionResultModal } from '@/components/ui/QuickSolutionResultModal';

const { width, height } = Dimensions.get('window');

interface NotificationPreviewModalProps {
  visible: boolean;
  onClose: () => void;
}

export function NotificationPreviewModal({ visible, onClose }: NotificationPreviewModalProps) {
  const theme = useTheme();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationPreview[]>([]);
  const [stats, setStats] = useState({ unread_count: 0, total_count: 0 });
  const [selectedSolutionId, setSelectedSolutionId] = useState<number | undefined>(undefined);
  const [quickSolutionModalVisible, setQuickSolutionModalVisible] = useState(false);

  console.log('🎯 NotificationPreviewModal render edildi, visible:', visible);

  useEffect(() => {
    if (visible) {
      console.log('🎯 Modal açılıyor, bildirimler yükleniyor...');
      loadNotifications();
      loadStats();
    }
  }, [visible]);

  const loadNotifications = async () => {
    try {
      console.log('🎯 Bildirimler yükleniyor...');
      const response = await notificationsAPI.getNotifications();
      console.log('🎯 Bildirimler response:', response);
      if (response.success && response.data) {
        // NotificationType'ı NotificationPreview'a çevir
        const previewNotifications: NotificationPreview[] = response.data.slice(0, 3).map(notification => ({
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.notification_type,
          priority: notification.priority,
          is_read: notification.is_read,
          time_ago: notification.time_ago || 'Az önce',
          data: notification.data
        }));
        console.log('🎯 Preview notifications:', previewNotifications);
        setNotifications(previewNotifications);
      } else {
        console.log('❌ Bildirimler yüklenemedi:', response.message);
      }
    } catch (error) {
      console.error('❌ Bildirimler yüklenirken hata:', error);
    }
  };

  const loadStats = async () => {
    try {
      console.log('🎯 Bildirim istatistikleri yükleniyor...');
      const response = await notificationsAPI.getNotificationStats();
      console.log('🎯 Stats response:', response);
      if (response.success && response.data) {
        setStats({
          unread_count: response.data.unread_count || 0,
          total_count: response.data.total_count || 0
        });
        console.log('🎯 Stats güncellendi:', response.data);
      } else {
        console.log('❌ İstatistikler yüklenemedi:', response.message);
      }
    } catch (error) {
      console.error('❌ Bildirim istatistikleri yüklenirken hata:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const response = await notificationsAPI.markNotificationAsRead(notificationId);
      if (response.success) {
        loadNotifications();
        loadStats();
      }
    } catch (error) {
      console.error('Bildirim okundu olarak işaretlenemedi:', error);
    }
  };

  const handleNotificationPress = (notification: NotificationPreview) => {
    console.log('🎯 Bildirim tıklandı:', notification);
    
    // Quick Solution bildirimi ise
    if (notification.type === 'quick_solution' && notification.data?.solution_id) {
      console.log('🎯 Quick Solution bildirimi tıklandı, ID:', notification.data.solution_id);
      setSelectedSolutionId(notification.data.solution_id);
      setQuickSolutionModalVisible(true);
      // onClose() kaldırıldı - modal açık kalmalı
      return;
    }
    
    // Diğer bildirimler için
    switch (notification.type) {
      case 'question-box':
        router.push('/(tabs)/question-box');
        break;
      case 'progress':
        router.push('/(tabs)/progress');
        break;
      case 'notifications':
        router.push('/(tabs)/profile');
        break;
      default:
        // TODO: Tasks sayfasına git
        router.push('/(tabs)');
        break;
    }
    onClose();
  };

  const handleViewAll = () => {
    console.log('🎯 Tümünü Gör butonuna basıldı');
    router.push('/(tabs)/profile');
    onClose();
  };

  const handleClose = () => {
    console.log('🎯 Modal kapatılıyor');
    onClose();
  };

  console.log('🎯 Modal render ediliyor, visible:', visible);
  console.log('🎯 Notifications count:', notifications.length);
  console.log('🎯 Stats:', stats);
  console.log('🎯 Modal container render ediliyor...');

  if (!visible) {
    console.log('🎯 Modal görünür değil, return null');
    return null;
  }

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.glassContainer}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Bildirimler</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Notifications List */}
            {notifications.length > 0 ? (
              <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {notifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    style={styles.notificationCard}
                    onPress={() => handleNotificationPress(notification)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.notificationHeader}>
                      <View style={styles.notificationIcon}>
                        <Ionicons 
                          name={notification.icon as any || 'notifications-outline'} 
                          size={20} 
                          color="#666" 
                        />
                      </View>
                      <View style={styles.notificationContent}>
                        <Text style={styles.notificationTitle} numberOfLines={1}>
                          {notification.title}
                        </Text>
                        <Text style={styles.notificationMessage} numberOfLines={2}>
                          {notification.message}
                        </Text>
                        <Text style={styles.notificationTime}>
                          {notification.time_ago}
                        </Text>
                      </View>
                      {!notification.is_read && (
                        <View style={styles.unreadDot} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="notifications-outline" size={48} color="#999" />
                <Text style={styles.emptyStateTitle}>Bildirim Yok</Text>
                <Text style={styles.emptyStateMessage}>
                  Henüz bildiriminiz bulunmuyor
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      
      <QuickSolutionResultModal
        visible={quickSolutionModalVisible}
        onClose={() => {
          setQuickSolutionModalVisible(false);
          setSelectedSolutionId(undefined);
        }}
        solutionId={selectedSolutionId}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    height: 400,
    backgroundColor: 'transparent',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  glassContainer: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  notificationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff6b6b',
    marginLeft: 10,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
  },
  emptyStateMessage: {
    color: '#999',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
}); 