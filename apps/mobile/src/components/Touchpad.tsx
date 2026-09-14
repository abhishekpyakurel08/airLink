import React, { useRef } from 'react';
import { View, Text, PanResponder, StyleSheet, TouchableOpacity } from 'react-native';
import { wsClient } from '../services/wsClient';
import { MovementBatcher } from '../utils/movementBatcher';

export const Touchpad: React.FC = () => {
  const lastX = useRef<number>(0);
  const lastY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const touchCount = useRef<number>(1);

  const batcher = useRef(
    new MovementBatcher((dx, dy) => {
      wsClient.sendMessage({
        type: 'MOUSE_MOVE',
        dx,
        dy
      });
    }, 16)
  ).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        touchStartTime.current = Date.now();
        touchCount.current = evt.nativeEvent.touches.length;
        lastX.current = evt.nativeEvent.pageX;
        lastY.current = evt.nativeEvent.pageY;
      },
      onPanResponderMove: (evt) => {
        const touches = evt.nativeEvent.touches.length;

        if (touches === 2) {
          // Two fingers -> Scroll
          const dy = evt.nativeEvent.pageY - lastY.current;
          if (dy < -10) sendScroll('SCROLL_UP');
          else if (dy > 10) sendScroll('SCROLL_DOWN');
        } else {
          // One finger -> Batched Mouse movement
          const dx = evt.nativeEvent.pageX - lastX.current;
          const dy = evt.nativeEvent.pageY - lastY.current;
          batcher.pushDelta(dx * 1.5, dy * 1.5);
        }

        lastX.current = evt.nativeEvent.pageX;
        lastY.current = evt.nativeEvent.pageY;
      },
      onPanResponderRelease: () => {
        batcher.flush();
        const duration = Date.now() - touchStartTime.current;
        if (duration < 200 && touchCount.current === 1) {
          // Tap -> Left click
          sendClick('MOUSE_CLICK');
        } else if (duration > 600) {
          // Long press -> Right click
          sendClick('MOUSE_RIGHT_CLICK');
        }
      }
    })
  ).current;

  const sendClick = (type: 'MOUSE_CLICK' | 'MOUSE_RIGHT_CLICK' | 'MOUSE_DOUBLE_CLICK') => {
    wsClient.sendMessage({ type });
  };

  const sendScroll = (type: 'SCROLL_UP' | 'SCROLL_DOWN') => {
    wsClient.sendMessage({ type });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🖱️ Trackpad (Batched 60fps)</Text>

      <View style={styles.touchpadArea} {...panResponder.panHandlers}>
        <Text style={styles.hint}>
          • Tap = Left Click | • Long Press = Right Click{'\n'}• 2-Fingers = Scroll | • Drag = Move Cursor
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.btn} onPress={() => sendClick('MOUSE_CLICK')}>
          <Text style={styles.btnText}>LEFT CLICK</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={() => sendClick('MOUSE_DOUBLE_CLICK')}>
          <Text style={styles.btnText}>DOUBLE CLICK</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={() => sendClick('MOUSE_RIGHT_CLICK')}>
          <Text style={styles.btnText}>RIGHT CLICK</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.scrollBtn} onPress={() => sendScroll('SCROLL_UP')}>
          <Text style={styles.scrollText}>▲ Scroll Up</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.scrollBtn} onPress={() => sendScroll('SCROLL_DOWN')}>
          <Text style={styles.scrollText}>▼ Scroll Down</Text>
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
  touchpadArea: {
    height: 220,
    backgroundColor: '#0f172a',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#334155',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  hint: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8
  },
  btn: {
    flex: 1,
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  btnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold'
  },
  scrollBtn: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  scrollText: {
    color: '#38bdf8',
    fontWeight: 'bold',
    fontSize: 13
  }
});
