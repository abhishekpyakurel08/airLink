import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  onAddComputer: () => void;
}

export const HomeScreen: React.FC<Props> = ({ onAddComputer }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>📡 AIRLINK</Text>
      <Text style={styles.subLogo}>Real-Time Remote Control</Text>

      <View style={styles.card}>
        <Text style={styles.statusText}>No computer connected</Text>
        <Text style={styles.descText}>
          Pair your phone with the AirLink Chrome Extension to control your browser in real-time.
        </Text>

        <TouchableOpacity style={styles.addBtn} onPress={onAddComputer}>
          <Text style={styles.addBtnText}>+ Add Computer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#38bdf8',
    letterSpacing: 2
  },
  subLogo: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 40
  },
  card: {
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  statusText: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8
  },
  descText: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18
  },
  addBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center'
  },
  addBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
