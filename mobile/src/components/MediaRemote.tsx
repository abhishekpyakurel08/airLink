import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { mobileWS } from '../services/wsClient';
import { MessageType } from '@airlink/shared';

export const MediaRemote: React.FC = () => {
  const [volume, setVolume] = useState<number>(80);

  const sendMediaCmd = (type: MessageType) => {
    mobileWS.sendMessage({ type });
  };

  const changeVolume = (delta: number) => {
    const newVol = Math.max(0, Math.min(100, volume + delta));
    setVolume(newVol);
    mobileWS.sendMessage({
      type: MessageType.VOLUME_SET,
      volume: newVol
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎵 Media Remote</Text>

      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.btn} onPress={() => sendMediaCmd(MessageType.MEDIA_PREV)}>
          <Text style={styles.btnText}>⏮️ Prev</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.primaryBtn]} onPress={() => sendMediaCmd(MessageType.MEDIA_PLAY_PAUSE)}>
          <Text style={[styles.btnText, styles.primaryBtnText]}>⏯️ Play/Pause</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={() => sendMediaCmd(MessageType.MEDIA_NEXT)}>
          <Text style={styles.btnText}>⏭️ Next</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.volumeContainer}>
        <Text style={styles.volumeLabel}>Volume: {volume}%</Text>
        <View style={styles.volumeButtonsRow}>
          <TouchableOpacity style={styles.volBtn} onPress={() => changeVolume(-10)}>
            <Text style={styles.volBtnText}>🔉 -10%</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.volBtn} onPress={() => sendMediaCmd(MessageType.MEDIA_MUTE)}>
            <Text style={styles.volBtnText}>🔇 Mute</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.volBtn} onPress={() => changeVolume(+10)}>
            <Text style={styles.volBtnText}>🔊 +10%</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#38bdf8',
    marginBottom: 16
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20
  },
  btn: {
    backgroundColor: '#334155',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10
  },
  primaryBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    paddingHorizontal: 20
  },
  btnText: {
    color: '#f8fafc',
    fontWeight: '600',
    fontSize: 14
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  volumeContainer: {
    width: '100%',
    alignItems: 'center'
  },
  volumeLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8
  },
  volumeButtonsRow: {
    flexDirection: 'row',
    gap: 10
  },
  volBtn: {
    backgroundColor: '#0f172a',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  volBtnText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '600'
  }
});
