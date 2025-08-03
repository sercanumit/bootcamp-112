import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import { useAppTheme } from '@/constants/PaperTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TopicMapScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 20 + insets.bottom }}
      >
        <View style={styles.header}>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Konuları görsel olarak keşfedin ve ilerlemenizi takip edin
          </Text>
        </View>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              Geliştirme Aşamasında
            </Text>
            <Text style={[styles.cardText, { color: theme.colors.onSurfaceVariant }]}>
              Konu haritası özelliği yakında kullanıma açılacak. Bu sayede konularınızı görsel olarak keşfedebilecek ve ilerlemenizi takip edebileceksiniz.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
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
  header: {
    padding: 16,
  },
  title: {
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.8,
  },
  card: {
    margin: 16,
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 