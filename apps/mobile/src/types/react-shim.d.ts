declare namespace React {
  export type FC<P = {}> = (props: P) => any;
  export type ComponentType<P = {}> = any;
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prev: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useRef<T>(initialValue: T): { current: T };
}

declare module 'react' {
  export = React;
}

declare module 'react-native' {
  export const View: any;
  export const Text: any;
  export const TouchableOpacity: any;
  export const TextInput: any;
  export const FlatList: any;
  export const ScrollView: any;
  export const StyleSheet: any;
  export const PanResponder: any;
  export const ActivityIndicator: any;
}

declare module 'expo-status-bar' {
  export const StatusBar: any;
}

declare module 'expo-camera' {
  export const CameraView: any;
  export const useCameraPermissions: any;
}

declare module '@react-native-async-storage/async-storage' {
  const AsyncStorage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    multiRemove(keys: string[]): Promise<void>;
  };
  export default AsyncStorage;
}
