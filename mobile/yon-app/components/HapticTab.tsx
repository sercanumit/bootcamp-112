import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        // Haptic feedback for both iOS and Android
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else if (Platform.OS === 'android') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        props.onPressIn?.(ev);
      }}
      onPress={(ev) => {
        // Additional haptic feedback on press
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        props.onPress?.(ev);
      }}
    />
  );
}
