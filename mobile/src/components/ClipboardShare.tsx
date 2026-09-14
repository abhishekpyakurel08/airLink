import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { mobileWS } from '../services/wsClient';
import { MessageType } from '@airlink/shared';

export const ClipboardShare: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [sentStatus, setSentStatus] = useState<boolean>(false);

  const sendToClipboard = () => {
    if (!text.trim()) return;
    mobileWS.sendMessage({
      type: MessageType.CLIPBOARD_SEND,
      text
    });
    setSentStatus(true);
    setTimeout(() => setSentStatus(false), 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 Remote Clipboard & Quick Send</Text>

      <TextInput
        style={styles.input}
        placeholder="Type text or paste URL to send to desktop..."
        placeholderTextColor="#64748b"
        multiline
        numberOfLines={3}
        value={text}
        onChangeText={setText}
      />

      <TouchableOpacity style={styles.sendBtn} onPress={sendToClipboard}>
        <Text style={styles.sendBtnText}>{sentStatus ? '✅ Sent to Desktop!' : '🚀 Send to Clipboard'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginVertical: 10
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#38bdf8',
    marginBottom: 12
  },
  input: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 12
  },
  sendBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  sendBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  }
});
