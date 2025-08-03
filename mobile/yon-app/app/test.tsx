import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>YÖN App Test Ekranı</Text>
      <Text style={styles.subtext}>Eğer bu ekranı görüyorsanız, uygulama çalışıyor!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fe',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7033ff',
    marginBottom: 16,
  },
  subtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 