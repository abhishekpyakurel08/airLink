import React, { useRef } from 'react';
import { View, Text, PanResponder, StyleSheet, TouchableOpacity } from 'react-native';
import { mobileWS } from '../services/wsClient';
import { MessageType } from '@airlink/shared';

export const Touchpad: React.FC = () => {
  const lastX = useRef<number>(0);
  const lastY = useRef<number>(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        lastX.current = evt.nativeEvent.pageX;
        lastY.current = evt.nativeEvent.pageY;
      },
      onPanResponderMove: (evt) => {
        const dx = evt.nativeEvent.pageX - lastX.current;
        const dy = evt.nativeEvent.pageY - lastY.current;

        lastX.current = evt.nativeEvent.pageX;
        lastY.current = evt.nativeEvent.pageY;

        mobileWS.sendMessage({
          type: MessageType.TOUCHPAD_MOVE,
          dx: Math.round(dx * 1.5),
          dy: Math.round(dy * 1.5)
        });
      }
    })
  ).current;

  const sendClick = (button: 'left' | 'right') => {
    mobileWS.sendMessage({
      type: MessageType.TOUCHPAD_CLICK,
      button
    });
  };

  const sendScroll = (deltaY: number) => {
    mobileWS.sendMessage({
      type: MessageType.TOUCHPAD_SCROLL,
      deltaY
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🖱️ Remote Trackpad</Text>

      <View style={styles.touchArea} {...panResponder.panHandlers}>
        <Text style={styles.touchHint}>Drag finger here to scroll page & move cursor</Text>
      </View>

      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.clickBtn} onPress={() => sendClick('left')}>
          <Text style={styles.btnText}>Left Click</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.scrollBtn} onPress={() => sendScroll(-150)}>
          <Text style={styles.btnText}>⬆️ Scroll Up</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.scrollBtn} onPress={() => sendScroll(150)}>
          <Text style={styles.btnText}>⬇️ Scroll Down</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.clickBtn} onPress={() => sendClick('right')}>
          <Text style={styles.btnText}>Right Click</Text>
        </TouchableOpacity>
      </View>
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
  touchArea: {
    height: 180,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#334155',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  touchHint: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center'
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between'
  },
  clickBtn: {
    flex: 1,
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  scrollBtn: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  btnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  }
});
