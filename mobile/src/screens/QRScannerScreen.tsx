import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mobileWS } from '../services/wsClient';
import { QRPayloadData, ConfirmPairingResponse } from '@airlink/shared';

interface Props {
  onPairSuccess: () => void;
}

export const QRScannerScreen: React.FC<Props> = ({ onPairSuccess }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState('');
  const [serverUrlInput, setServerUrlInput] = useState('http://localhost:3000');

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>📷 Camera Permission Required</Text>
        <Text style={styles.text}>airLink needs camera access to scan the pairing QR code.</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);
    setErrorMsg(null);

    try {
      const qrData: QRPayloadData = JSON.parse(data);
      await processPairing(qrData.sessionToken, qrData.serverUrl || serverUrlInput);
    } catch (err: any) {
      console.error('[QR Scan Error]', err);
      setErrorMsg('Invalid QR code scanned. Please try again.');
      setLoading(false);
    }
  };

  const handleManualPairing = async () => {
    if (!manualToken.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      await processPairing(manualToken.trim().toUpperCase(), serverUrlInput);
    } catch (err: any) {
      setErrorMsg(err.message || 'Pairing failed');
      setLoading(false);
    }
  };

  const processPairing = async (token: string, backendUrl: string) => {
    let mobileDeviceId = await AsyncStorage.getItem('airlink_mobile_device_id');
    if (!mobileDeviceId) {
      mobileDeviceId = 'mob_' + Math.random().toString(36).substring(2, 10);
      await AsyncStorage.setItem('airlink_mobile_device_id', mobileDeviceId);
    }

    const httpUrl = backendUrl.replace(/^ws/, 'http');
    const resp = await fetch(`${httpUrl}/api/pairing/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionToken: token,
        mobileDeviceId
      })
    });

    if (!resp.ok) {
      const errJson = await resp.json().catch(() => ({}));
      throw new Error(errJson.error || 'Failed to confirm pairing with server');
    }

    const pairData: ConfirmPairingResponse = await resp.json();

    // Persist paired session info
    await AsyncStorage.setItem('airlink_pair_id', pairData.pairId);
    await AsyncStorage.setItem('airlink_pair_secret', pairData.pairSecret);
    await AsyncStorage.setItem('airlink_server_url', backendUrl);

    const wsUrl = backendUrl.replace(/^http/, 'ws') + '/ws';
    await mobileWS.connect(wsUrl, pairData.pairId, mobileDeviceId, pairData.pairSecret);

    setLoading(false);
    onPairSuccess();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📷 Scan Chrome Extension QR</Text>
      <Text style={styles.subtitle}>Open the airLink Chrome Extension popup on your desktop and scan the QR code below.</Text>

      <View style={styles.cameraBox}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr']
          }}
        />
        {loading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#38bdf8" />
            <Text style={styles.overlayText}>Pairing with Desktop...</Text>
          </View>
        )}
      </View>

      {errorMsg && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => setScanned(false)}>
            <Text style={styles.retryText}>Tap to Retry Scan</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.manualContainer}>
        <Text style={styles.manualTitle}>Or enter 6-character Pairing Code:</Text>
        <View style={styles.manualRow}>
          <TextInput
            style={styles.manualInput}
            placeholder="e.g. A1B2C3"
            placeholderTextColor="#64748b"
            value={manualToken}
            onChangeText={setManualToken}
            autoCapitalize="characters"
            maxLength={6}
          />
          <TouchableOpacity style={styles.manualBtn} onPress={handleManualPairing}>
            <Text style={styles.manualBtnText}>Pair</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  centerContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#38bdf8',
    textAlign: 'center',
    marginBottom: 6
  },
  subtitle: {
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14
  },
  cameraBox: {
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#38bdf8',
    position: 'relative'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  overlayText: {
    color: '#38bdf8',
    marginTop: 12,
    fontWeight: 'bold'
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 10
  },
  text: {
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 20
  },
  btn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  errorBox: {
    marginTop: 12,
    alignItems: 'center'
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 6
  },
  retryBtn: {
    padding: 8
  },
  retryText: {
    color: '#38bdf8',
    fontWeight: 'bold'
  },
  manualContainer: {
    marginTop: 24,
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12
  },
  manualTitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 8
  },
  manualRow: {
    flexDirection: 'row',
    gap: 10
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
  }
});
