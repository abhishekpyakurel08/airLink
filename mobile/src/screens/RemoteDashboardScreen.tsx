import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mobileWS } from '../services/wsClient';
import { MediaRemote } from '../components/MediaRemote';
import { TabManager } from '../components/TabManager';
import { Touchpad } from '../components/Touchpad';
import { ClipboardShare } from '../components/ClipboardShare';

interface Props {
  onUnpair: () => void;
}

export const RemoteDashboardScreen: React.FC<Props> = ({ onUnpair }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isPeerOnline, setIsPeerOnline] = useState(false);
  const [activeTab, setActiveTab] = useState<'media' | 'tabs' | 'touchpad' | 'clipboard'>('media');

  useEffect(() => {
    const removeListener = mobileWS.addStatusListener((conn, peer) => {
      setIsConnected(conn);
      setIsPeerOnline(peer);
    });

    return () => removeListener();
  }, []);

  const handleUnpair = async () => {
    mobileWS.disconnect();
    await AsyncStorage.multiRemove(['airlink_pair_id', 'airlink_pair_secret']);
    onUnpair();
  };

  return (
    <View style={styles.container}>
      {/* Header & Status Indicator */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📡 airLink Remote</Text>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isPeerOnline ? '#22c55e' : isConnected ? '#f59e0b' : '#ef4444' }
            ]}
          />
          <Text style={styles.statusText}>
            {isPeerOnline
              ? 'Desktop Connected'
              : isConnected
              ? 'Waiting for Chrome Extension'
              : 'Server Offline'}
          </Text>
        </View>
      </View>

      {/* Control Category Selector Tabs */}
      <View style={styles.navTabs}>
        <TouchableOpacity
          style={[styles.navTab, activeTab === 'media' && styles.activeNavTab]}
          onPress={() => setActiveTab('media')}
        >
          <Text style={styles.navTabText}>🎵 Media</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTab, activeTab === 'tabs' && styles.activeNavTab]}
          onPress={() => setActiveTab('tabs')}
        >
          <Text style={styles.navTabText}>🌐 Tabs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTab, activeTab === 'touchpad' && styles.activeNavTab]}
          onPress={() => setActiveTab('touchpad')}
        >
          <Text style={styles.navTabText}>🖱️ Mouse</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTab, activeTab === 'clipboard' && styles.activeNavTab]}
          onPress={() => setActiveTab('clipboard')}
        >
          <Text style={styles.navTabText}>📋 Clip</Text>
        </TouchableOpacity>
      </View>

      {/* Main Control View */}
      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'media' && <MediaRemote />}
        {activeTab === 'tabs' && <TabManager />}
        {activeTab === 'touchpad' && <Touchpad />}
        {activeTab === 'clipboard' && <ClipboardShare />}

        <TouchableOpacity style={styles.unpairBtn} onPress={handleUnpair}>
          <Text style={styles.unpairBtnText}>⚙️ Unpair Desktop Device</Text>
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
    paddingBottom: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#38bdf8'
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8
  },
  statusText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600'
  },
  navTabs: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6
  },
  navTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center'
  },
  activeNavTab: {
    backgroundColor: '#0284c7'
  },
  navTabText: {
    color: '#f8fafc',
    fontWeight: '600',
    fontSize: 13
  },
  content: {
    padding: 16
  },
  unpairBtn: {
    marginTop: 20,
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  unpairBtnText: {
    color: '#ef4444',
    fontWeight: 'bold'
  }
});
