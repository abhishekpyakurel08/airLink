import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { wsClient } from '../services/wsClient';

interface Props {
  onPairSuccess: () => void;
  onCancel: () => void;
}

export const ScannerScreen: React.FC<Props> = ({ onPairSuccess, onCancel }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>📷 Camera Permission Required</Text>
        <Text style={styles.sub}>Grant access to scan the AirLink pairing QR code.</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);

    try {
      // Data is airlink://pair/ABC123
      const code = data.split('/').pop() || data;
      await processPairing(code);
    } catch (err: any) {
      setErrorMsg(err.message || 'QR code expired or invalid');
      setLoading(false);
    }
  };

  const handleManualPair = async () => {
    if (!manualCode.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      await processPairing(manualCode.trim().toUpperCase());
    } catch (err: any) {
      setErrorMsg(err.message || 'Pairing failed');
      setLoading(false);
    }
  };

  const processPairing = async (code: string) => {
    let phoneDeviceId = await AsyncStorage.getItem('airlink_phoneDeviceId');
    if (!phoneDeviceId) {
      phoneDeviceId = 'mob_' + Math.random().toString(36).substring(2, 10);
      await AsyncStorage.setItem('airlink_phoneDeviceId', phoneDeviceId);
    }

    const resp = await fetch('http://localhost:3000/api/pairing/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, phoneDeviceId })
    });

    if (!resp.ok) {
      const errJson = await resp.json().catch(() => ({}));
      throw new Error(errJson.error || 'Invalid or expired pairing code');
    }

    const data = await resp.json();
    await AsyncStorage.setItem('airlink_sessionId', data.sessionId);
    await AsyncStorage.setItem('airlink_paired', 'true');

    await wsClient.connect('ws://localhost:3000/ws', phoneDeviceId, data.sessionId);

    setLoading(false);
    onPairSuccess();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Scan QR Code</Text>

      <View style={styles.cameraBox}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        {loading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#38bdf8" />
            <Text style={styles.overlayText}>Pairing in 1s...</Text>
          </View>
        )}
      </View>

      {errorMsg && (
        <TouchableOpacity onPress={() => setScanned(false)}>
          <Text style={styles.errorText}>{errorMsg} (Tap to Retry)</Text>
        </TouchableOpacity>
      )}

      <View style={styles.manualCard}>
        <Text style={styles.manualText}>Or enter 6-char pairing code:</Text>
        <View style={styles.manualRow}>
          <TextInput
            style={styles.manualInput}
            placeholder="ABC123"
            placeholderTextColor="#64748b"
            value={manualCode}
            onChangeText={setManualCode}
            autoCapitalize="characters"
            maxLength={6}
          />
          <TouchableOpacity style={styles.manualBtn} onPress={handleManualPair}>
            <Text style={styles.manualBtnText}>Pair</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 20,
    justifyContent: 'center'
  },
  center: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#38bdf8',
    textAlign: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8
  },
  sub: {
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20
  },
  btn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  cameraBox: {
    height: 260,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#38bdf8'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.85)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  overlayText: {
    color: '#38bdf8',
    fontWeight: 'bold',
    marginTop: 10
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold'
  },
  manualCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginTop: 20
  },
  manualText: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 8
  },
  manualRow: {
    flexDirection: 'row',
    gap: 8
  },
  manualInput: {
    flex: 1,
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontWeight: 'bold',
    letterSpacing: 2
  },
  manualBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 8
  },
  manualBtnText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  cancelBtn: {
    marginTop: 20,
    alignItems: 'center'
  },
  cancelText: {
    color: '#64748b',
    fontWeight: 'bold'
  }
});
