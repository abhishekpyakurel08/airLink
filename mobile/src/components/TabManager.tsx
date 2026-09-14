import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, StyleSheet } from 'react-native';
import { mobileWS } from '../services/wsClient';
import { MessageType, TabItem, TabListResponseMessage } from '@airlink/shared';

export const TabManager: React.FC = () => {
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [urlInput, setUrlInput] = useState<string>('');

  useEffect(() => {
    const removeListener = mobileWS.addMessageListener((msg) => {
      if (msg.type === MessageType.TAB_LIST_RESPONSE) {
        const res = msg as TabListResponseMessage;
        setTabs(res.tabs || []);
      }
    });

    // Initial request for tab list
    refreshTabs();

    return () => removeListener();
  }, []);

  const refreshTabs = () => {
    mobileWS.sendMessage({ type: MessageType.TAB_LIST_REQUEST });
  };

  const activateTab = (tabId: number) => {
    mobileWS.sendMessage({
      type: MessageType.TAB_ACTIVATE,
      tabId
    });
    refreshTabs();
  };

  const closeTab = (tabId: number) => {
    mobileWS.sendMessage({
      type: MessageType.TAB_CLOSE,
      tabId
    });
    setTabs((prev) => prev.filter((t) => t.id !== tabId));
  };

  const navigateUrl = () => {
    if (!urlInput.trim()) return;
    let target = urlInput.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }

    mobileWS.sendMessage({
      type: MessageType.NAVIGATE_URL,
      url: target,
      newTab: true
    });
    setUrlInput('');
    setTimeout(refreshTabs, 1000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌐 Browser Tabs</Text>

      <View style={styles.urlBox}>
        <TextInput
          style={styles.input}
          placeholder="Open URL (e.g. youtube.com)..."
          placeholderTextColor="#64748b"
          value={urlInput}
          onChangeText={setUrlInput}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.openBtn} onPress={navigateUrl}>
          <Text style={styles.openBtnText}>Open</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.refreshBtn} onPress={refreshTabs}>
        <Text style={styles.refreshBtnText}>🔄 Refresh Tab List</Text>
      </TouchableOpacity>

      {tabs.length === 0 ? (
        <Text style={styles.emptyText}>No tabs available or browser offline</Text>
      ) : (
        <FlatList
          data={tabs}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.tabItem, item.active && styles.activeTabItem]}>
              <TouchableOpacity style={styles.tabInfo} onPress={() => activateTab(item.id)}>
                <Text style={styles.tabTitle} numberOfLines={1}>
                  {item.active ? '🟢 ' : ''}{item.title}
                </Text>
                <Text style={styles.tabUrl} numberOfLines={1}>
                  {item.url}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeBtn} onPress={() => closeTab(item.id)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    maxHeight: 400
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#38bdf8',
    marginBottom: 12
  },
  urlBox: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  input: {
    flex: 1,
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14
  },
  openBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center'
  },
  openBtnText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  refreshBtn: {
    alignSelf: 'flex-start',
    marginBottom: 12
  },
  refreshBtnText: {
    color: '#38bdf8',
    fontSize: 13
  },
  emptyText: {
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10
  },
  list: {
    width: '100%'
  },
  tabItem: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
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
    fontSize: 14
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
    fontSize: 16
  }
});
