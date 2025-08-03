import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Avatar, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ProfileHeaderProps {
  user: {
    name: string;
    email: string;
    grade?: string;
    department?: string;
    target_profession?: string;
  } | null;
  onEditPress?: () => void;
}

export function ProfileHeader({ user, onEditPress }: ProfileHeaderProps) {
  const theme = useTheme();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const userName = user?.name || 'Kullanıcı';
  const userEmail = user?.email || '';
  const userGrade = user?.grade || '';
  const userDepartment = user?.department || '';
  const userTarget = user?.target_profession || '';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={styles.content}>
          <View style={styles.avatarSection}>
            <Avatar.Text
              size={80}
              label={getInitials(userName)}
              style={styles.avatar}
              labelStyle={styles.avatarLabel}
            />
            <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
              <Ionicons name="camera" size={20} color={theme.colors.onPrimary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.colors.onPrimary }]}>
              {userName}
            </Text>
            <Text style={[styles.userEmail, { color: theme.colors.onPrimary }]}>
              {userEmail}
            </Text>
          </View>
        </View>
      </LinearGradient>
      
      <View style={styles.detailsContainer}>
        {userGrade && (
          <View style={styles.detailItem}>
            <Ionicons name="school" size={16} color={theme.colors.primary} />
            <Text style={[styles.detailText, { color: theme.colors.onSurface }]}>
              {userGrade}
            </Text>
          </View>
        )}
        
        {userDepartment && (
          <View style={styles.detailItem}>
            <Ionicons name="library" size={16} color={theme.colors.primary} />
            <Text style={[styles.detailText, { color: theme.colors.onSurface }]}>
              {userDepartment}
            </Text>
          </View>
        )}
        
        {userTarget && (
          <View style={styles.detailItem}>
            <Ionicons name="flag" size={16} color={theme.colors.primary} />
            <Text style={[styles.detailText, { color: theme.colors.onSurface }]}>
              {userTarget}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  gradientBackground: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
  },
  avatarSection: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarLabel: {
    fontSize: 32,
    fontFamily: 'Poppins_700Bold',
    color: 'white',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    opacity: 0.9,
  },
  detailsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -15,
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    marginLeft: 8,
  },
}); 