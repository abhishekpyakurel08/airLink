import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { wsClient } from '../services/wsClient';
import { Touchpad } from '../components/Touchpad';
import { KeyboardRemote } from '../components/KeyboardRemote';
import { TabManager } from '../components/TabManager';
import { ShortcutsController } from '../components/ShortcutsController';

interface Props {
  onDisconnect: () => void;
}

export const RemoteScreen: React.FC<Props> = ({ onDisconnect }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'touchpad' | 'keyboard' | 'tabs' | 'shortcuts'>('touchpad');

  useEffect(() => {
    const removeListener = wsClient.addStatusListener((conn) => {
      setIsConnected(conn);
    });
    return () => removeListener();
  }, []);

  const handleUnpair = async () => {
    wsClient.disconnect();
    await AsyncStorage.multiRemove(['airlink_sessionId', 'airlink_paired']);
    onDisconnect();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>MacBook</Text>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: isConnected ? '#22c55e' : '#ef4444' }]} />
          <Text style={styles.statusText}>{isConnected ? 'Connected ●' : 'Disconnected (Reconnecting...)'}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.navRow}>
        <TouchableOpacity style={[styles.navBtn, activeTab === 'touchpad' && styles.activeNavBtn]} onPress={() => setActiveTab('touchpad')}>
          <Text style={styles.navText}>🖱️ Touchpad</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navBtn, activeTab === 'keyboard' && styles.activeNavBtn]} onPress={() => setActiveTab('keyboard')}>
          <Text style={styles.navText}>⌨️ Keys</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navBtn, activeTab === 'tabs' && styles.activeNavBtn]} onPress={() => setActiveTab('tabs')}>
          <Text style={styles.navText}>🌐 Tabs</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navBtn, activeTab === 'shortcuts' && styles.activeNavBtn]} onPress={() => setActiveTab('shortcuts')}>
          <Text style={styles.navText}>⚡ Presets</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'touchpad' && <Touchpad />}
        {activeTab === 'keyboard' && <KeyboardRemote />}
        {activeTab === 'tabs' && <TabManager />}
        {activeTab === 'shortcuts' && <ShortcutsController />}

        <TouchableOpacity style={styles.unpairBtn} onPress={handleUnpair}>
          <Text style={styles.unpairText}>⚙️ Disconnect & Unpair</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#38bdf8'
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },
  statusText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600'
  },
  navRow: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 6
  },
  navBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center'
  },
  activeNavBtn: {
    backgroundColor: '#0284c7'
  },
  navText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: 'bold'
  },
  content: {
    padding: 16
  },
  unpairBtn: {
    marginTop: 16,
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  unpairText: {
    color: '#ef4444',
    fontWeight: 'bold'
  }
});
