import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

interface ProfileMenuProps {
  onSettingsPress: () => void;
  onGoalsPress: () => void;
  onHelpPress: () => void;
  onLogoutPress: () => void;
}

export function ProfileMenu({
  onSettingsPress,
  onGoalsPress,
  onHelpPress,
  onLogoutPress,
}: ProfileMenuProps) {
  const theme = useTheme();

  const menuItems: MenuItem[] = [
    {
      id: 'settings',
      title: 'Ayarlar',
      subtitle: 'Uygulama ayarlarını düzenle',
      icon: 'settings-outline',
      onPress: onSettingsPress,
    },
    {
      id: 'goals',
      title: 'Hedefler',
      subtitle: 'Günlük hedeflerinizi yönetin',
      icon: 'flag-outline',
      onPress: onGoalsPress,
    },
    {
      id: 'help',
      title: 'Yardım',
      subtitle: 'Sık sorulan sorular ve destek',
      icon: 'help-circle-outline',
      onPress: onHelpPress,
    },
    {
      id: 'logout',
      title: 'Çıkış Yap',
      subtitle: 'Hesabınızdan güvenli çıkış',
      icon: 'log-out-outline',
      onPress: onLogoutPress,
    },
  ];

  return (
    <View style={styles.container}>
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.menuItem,
            { backgroundColor: theme.colors.surface },
            item.id === 'logout' && styles.logoutItem,
          ]}
          onPress={item.onPress}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemContent}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
              <Ionicons
                name={item.icon}
                size={20}
                color={item.id === 'logout' ? theme.colors.error : theme.colors.primary}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.menuTitle, { color: theme.colors.onSurface }]}>
                {item.title}
              </Text>
              <Text style={[styles.menuSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                {item.subtitle}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  menuItem: {
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logoutItem: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ffebee',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
}); 