import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, StyleSheet } from 'react-native';
import { wsClient } from '../services/wsClient';
import { TabInfo } from '@airlink/shared';

export const TabManager: React.FC = () => {
  const [tabs, setTabs] = useState<TabInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const removeListener = wsClient.addMessageListener((msg) => {
      if (msg.type === 'TAB_LIST_RESPONSE') {
        setTabs(msg.data || []);
      }
    });

    refreshTabs();
    return () => removeListener();
  }, []);

  const refreshTabs = () => {
    wsClient.sendMessage({ type: 'TAB_LIST_REQUEST' });
  };

  const sendTabAction = (type: string, tabId?: number, extra?: any) => {
    wsClient.sendMessage({
      type,
      payload: { tabId, ...extra }
    });
    setTimeout(refreshTabs, 500);
  };

  const filteredTabs = tabs.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌐 Smart Tab Manager ({tabs.length})</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tabs (e.g. GitHub, ChatGPT)..."
          placeholderTextColor="#64748b"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.newTabBtn} onPress={() => sendTabAction('TAB_NEW', undefined, { url: 'https://google.com' })}>
          <Text style={styles.newTabBtnText}>+ New Tab</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionNavRow}>
        <TouchableOpacity style={styles.navActionBtn} onPress={() => sendTabAction('TAB_PREVIOUS')}>
          <Text style={styles.navActionText}>◀ Prev Tab</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navActionBtn} onPress={() => sendTabAction('TAB_RELOAD')}>
          <Text style={styles.navActionText}>🔄 Reload</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navActionBtn} onPress={() => sendTabAction('TAB_NEXT')}>
          <Text style={styles.navActionText}>Next Tab ▶</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredTabs}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.tabItem, item.active && styles.activeTabItem]}>
            <TouchableOpacity style={styles.tabInfo} onPress={() => sendTabAction('TAB_ACTIVATE', item.id)}>
              <Text style={styles.tabTitle} numberOfLines={1}>
                {item.active ? '🟢 ' : ''}{item.title}
              </Text>
              <Text style={styles.tabUrl} numberOfLines={1}>
                {item.url}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={() => sendTabAction('TAB_CLOSE', item.id)}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    maxHeight: 420
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#38bdf8',
    marginBottom: 10,
    textAlign: 'center'
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13
  },
  newTabBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 8
  },
  newTabBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12
  },
  actionNavRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10
  },
  navActionBtn: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center'
  },
  navActionText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: 'bold'
  },
  list: {
    width: '100%'
  },
  tabItem: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  activeTabItem: {
    borderColor: '#38bdf8',
    borderWidth: 1
  },
  tabInfo: {
    flex: 1,
    marginRight: 8
  },
  tabTitle: {
    color: '#f8fafc',
    fontWeight: '600',
    fontSize: 13
  },
  tabUrl: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2
  },
  closeBtn: {
    padding: 6
  },
  closeBtnText: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 15
  }
});
