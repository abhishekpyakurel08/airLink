import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { wsClient } from '../services/wsClient';

export const KeyboardRemote: React.FC = () => {
  const [textInput, setTextInput] = useState('');

  const sendKeyPress = (key: string) => {
    wsClient.sendMessage({
      type: 'KEY_PRESS',
      key
    });
  };

  const sendTextType = () => {
    if (!textInput) return;
    wsClient.sendMessage({
      type: 'KEY_TYPE',
      text: textInput
    });
    setTextInput('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⌨️ Keyboard Remote</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type text to send to active web input..."
          placeholderTextColor="#64748b"
          value={textInput}
          onChangeText={setTextInput}
          onSubmitEditing={sendTextType}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendTextType}>
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.keyRow}>
        <TouchableOpacity style={styles.keyBtn} onPress={() => sendKeyPress('Escape')}>
          <Text style={styles.keyText}>ESC</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.keyBtn} onPress={() => sendKeyPress('Tab')}>
          <Text style={styles.keyText}>TAB</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.keyBtn} onPress={() => sendKeyPress('Control')}>
          <Text style={styles.keyText}>CTRL</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.keyBtn} onPress={() => sendKeyPress('Alt')}>
          <Text style={styles.keyText}>ALT</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.keyBtn} onPress={() => sendKeyPress('Shift')}>
          <Text style={styles.keyText}>SHIFT</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.keyRow}>
        <TouchableOpacity style={[styles.keyBtn, styles.wideBtn]} onPress={() => sendKeyPress('Backspace')}>
          <Text style={styles.keyText}>⌫ Backspace</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.keyBtn, styles.spaceBtn]} onPress={() => sendKeyPress('Space')}>
          <Text style={styles.keyText}>SPACE</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.keyBtn, styles.primaryKeyBtn]} onPress={() => sendKeyPress('Enter')}>
          <Text style={[styles.keyText, styles.primaryKeyText]}>↵ ENTER</Text>
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
    marginBottom: 10,
    textAlign: 'center'
  },
  inputRow: {
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
    fontSize: 13
  },
  sendBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8
  },
  sendBtnText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  keyRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8
  },
  keyBtn: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  wideBtn: {
    flex: 1.2
  },
  spaceBtn: {
    flex: 2,
    backgroundColor: '#0f172a'
  },
  primaryKeyBtn: {
    flex: 1.5,
    backgroundColor: '#0284c7'
  },
  keyText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '600'
  },
  primaryKeyText: {
    fontWeight: 'bold'
  }
});
