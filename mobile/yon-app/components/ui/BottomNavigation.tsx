import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { notificationsAPI } from '@/services/api';

const { width } = Dimensions.get('window');

interface BottomNavigationProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export function PaperBottomNavigation({ state, descriptors, navigation }: BottomNavigationProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [notificationCount, setNotificationCount] = useState(0);
  const translateY = useRef(new Animated.Value(0)).current;
  const activeTabIndex = state.index;

  // Bildirim sayısını al
  useEffect(() => {
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

    loadNotificationCount();
    
    // Her 30 saniyede bir güncelle
    const interval = setInterval(loadNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Tabbar'ı gizle/göster fonksiyonu - dışarıdan çağrılabilir
  const hideTabBar = () => {
    Animated.spring(translateY, {
      toValue: 100,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const showTabBar = () => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  // Global fonksiyonları window'a ekle (test için)
  useEffect(() => {
    (global as any).hideTabBar = hideTabBar;
    (global as any).showTabBar = showTabBar;
  }, []);

  // Seçili tab için bükülmüş menü path'i oluştur
  const createCurvedMenuPath = (index: number) => {
    const tabWidth = width / state.routes.length;
    const centerX = index * tabWidth + tabWidth / 2;
    const circleRadius = 25;
    const curveHeight = 30; // Daha derin dalga
    
    return `
      M 0 0
      L ${centerX - circleRadius - 20} 0
      Q ${centerX - circleRadius - 10} 0, ${centerX - circleRadius} ${curveHeight}
      Q ${centerX - circleRadius + 5} ${curveHeight + 5}, ${centerX - circleRadius + 10} ${curveHeight + 8}
      Q ${centerX - circleRadius + 15} ${curveHeight + 10}, ${centerX - circleRadius + 20} ${curveHeight + 10}
      Q ${centerX - circleRadius + 25} ${curveHeight + 10}, ${centerX - circleRadius + 30} ${curveHeight + 8}
      Q ${centerX - circleRadius + 35} ${curveHeight + 5}, ${centerX - circleRadius + 40} ${curveHeight}
      Q ${centerX - circleRadius + 50} 0, ${centerX + circleRadius + 20} 0
      L ${width} 0
      L ${width} 80
      L 0 80
      Z
    `;
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          transform: [{ translateY }],
          paddingBottom: insets.bottom,
        }
      ]}
    >
      
      {/* Beyaz dalga - alt kısımda */}
      <Svg width={width} height={80} style={styles.curveContainer}>
        <Path
          d={createCurvedMenuPath(activeTabIndex)}
          fill="#ffffff" // Beyaz dalga
          stroke="none"
        />
      </Svg>
      
      {/* Seçili tab için beyaz daire */}
      <Svg width={width} height={80} style={styles.circleContainer}>
        <Circle
          x={width / state.routes.length * activeTabIndex + width / state.routes.length / 2}
          y={15} // Yukarı alındı
          r={20}
          fill="#ffffff" // Beyaz daire
          stroke="#e5e7eb" // Hafif gri sınır
          strokeWidth={1} // Sınır kalınlığı
        />
      </Svg>
      
      {/* Tab items */}
      <View style={styles.tabsContainer}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
              activeOpacity={0.8}
            >
              <View style={styles.tabContent}>
                {/* Icon */}
                <View style={styles.iconContainer}>
                  {options.tabBarIcon({ 
                    color: '#8b5cf6', // Mor renk
                    size: 24
                  })}
                </View>
                
                {/* Label */}
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: '#8b5cf6', // Mor renk
                    },
                  ]}
                >
                  {label}
                </Text>
                
                {/* Bildirim badge'i - sadece profil sekmesinde */}
                {route.name === 'profile' && notificationCount > 0 && (
                  <View style={[styles.badge, { backgroundColor: '#ef4444' }]}>
                    <Text style={[styles.badgeText, { color: '#ffffff' }]}>
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 80,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  curveContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  circleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 3,
  },
  tabsContainer: {
    flexDirection: 'row',
    flex: 1,
    paddingHorizontal: 8,
    zIndex: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabContent: {
    alignItems: 'center',
    position: 'relative',
    paddingVertical: 8,
    borderRadius: 12,
    minHeight: 50,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    marginLeft: -5, // Sola kaydırmak için negatif değer
    marginTop: 10, // Daha da aşağı çekmek için
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
});
