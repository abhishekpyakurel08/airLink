import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QRScannerScreen } from './src/screens/QRScannerScreen';
import { RemoteDashboardScreen } from './src/screens/RemoteDashboardScreen';
import { mobileWS } from './src/services/wsClient';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isPaired, setIsPaired] = useState(false);

  useEffect(() => {
    checkPairingState();
  }, []);

  const checkPairingState = async () => {
    try {
      const pairId = await AsyncStorage.getItem('airlink_pair_id');
      const pairSecret = await AsyncStorage.getItem('airlink_pair_secret');
      let mobileDeviceId = await AsyncStorage.getItem('airlink_mobile_device_id');
      const serverUrl = (await AsyncStorage.getItem('airlink_server_url')) || 'ws://localhost:3000/ws';

      if (!mobileDeviceId) {
        mobileDeviceId = 'mob_' + Math.random().toString(36).substring(2, 10);
        await AsyncStorage.setItem('airlink_mobile_device_id', mobileDeviceId);
      }

      if (pairId && pairSecret) {
        setIsPaired(true);
        mobileWS.connect(serverUrl, pairId, mobileDeviceId, pairSecret);
      } else {
        setIsPaired(false);
      }
    } catch (err) {
      console.error('[App] Error checking pairing state:', err);
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
      {isPaired ? (
        <RemoteDashboardScreen onUnpair={() => setIsPaired(false)} />
      ) : (
        <QRScannerScreen onPairSuccess={() => setIsPaired(true)} />
      )}
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
