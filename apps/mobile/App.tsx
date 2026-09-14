import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HomeScreen } from './src/screens/HomeScreen';
import { ScannerScreen } from './src/screens/ScannerScreen';
import { RemoteScreen } from './src/screens/RemoteScreen';
import { wsClient } from './src/services/wsClient';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<'home' | 'scanner' | 'remote'>('home');

  useEffect(() => {
    checkPairing();
  }, []);

  const checkPairing = async () => {
    try {
      const isPaired = await AsyncStorage.getItem('airlink_paired');
      const sessionId = await AsyncStorage.getItem('airlink_sessionId');
      const phoneDeviceId = await AsyncStorage.getItem('airlink_phoneDeviceId');

      if (isPaired === 'true' && sessionId && phoneDeviceId) {
        wsClient.connect('ws://localhost:3000/ws', phoneDeviceId, sessionId);
        setScreen('remote');
      } else {
        setScreen('home');
      }
    } catch (err) {
      console.error('[App] Error checking pairing:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {screen === 'home' && <HomeScreen onAddComputer={() => setScreen('scanner')} />}
      {screen === 'scanner' && (
        <ScannerScreen
          onPairSuccess={() => setScreen('remote')}
          onCancel={() => setScreen('home')}
        />
      )}
      {screen === 'remote' && <RemoteScreen onDisconnect={() => setScreen('home')} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
