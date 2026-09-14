export * from './schemas/commands';
export * from './schemas/auth';
export * from './schemas/pairing';
export * from './schemas/shortcuts';

export interface TabInfo {
  id: number;
  title: string;
  url: string;
  favIconUrl?: string;
  active: boolean;
  pinned?: boolean;
}
