import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { wsClient } from '../services/wsClient';

export const ShortcutsController: React.FC = () => {
  const executePreset = (presetId: string) => {
    wsClient.sendMessage({
      type: 'EXECUTE_SHORTCUT',
      payload: { presetId }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚡ Browser Shortcuts & Workspaces</Text>

      <View style={styles.presetRow}>
        <TouchableOpacity style={[styles.presetCard, { backgroundColor: '#1e3a8a' }]} onPress={() => executePreset('work_mode')}>
          <Text style={styles.presetIcon}>💼</Text>
          <Text style={styles.presetTitle}>Work Mode</Text>

          <Text style={styles.presetSub}>Opens GitHub, Slack & Gmail</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.presetCard, { backgroundColor: '#581c87' }]} onPress={() => executePreset('study_mode')}>
          <Text style={styles.presetIcon}>📚</Text>
          <Text style={styles.presetTitle}>Study Mode</Text>

          <Text style={styles.presetSub}>Opens Notion, Lofi & Docs</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginVertical: 10
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#38bdf8',
    marginBottom: 12,
    textAlign: 'center'
  },
  presetRow: {
    flexDirection: 'row',
    gap: 12
  },
  presetCard: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  presetIcon: {
    fontSize: 24,
    marginBottom: 6
  },
  presetTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4
  },
  presetSub: {
    color: '#94a3b8',
    fontSize: 10,
    textAlign: 'center'
  }
});
