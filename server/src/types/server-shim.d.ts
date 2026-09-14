declare module 'express' {
  const express: any;
  export default express;
  export const Router: any;
}

declare module 'cors' {
  const cors: any;
  export default cors;
}

declare module 'cookie-parser' {
  const cookieParser: any;
  export default cookieParser;
}

declare module 'morgan' {
  const morgan: any;
  export default morgan;
}

declare module 'dotenv' {
  const dotenv: any;
  export default dotenv;
}

declare module 'mongoose' {
  const mongoose: any;
  export default mongoose;
  export const Schema: any;
}

declare module 'ioredis' {
  class Redis {
    constructor(options?: any);
    on(event: string, callback: (...args: any[]) => void): this;
    connect(): Promise<void>;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ...args: any[]): Promise<any>;
    del(key: string): Promise<number>;
  }
  export default Redis;
}

declare module 'uuid' {
  export const v4: () => string;
}

declare module 'ws' {
  export class WebSocketServer {
    constructor(options: any);
    on(event: string, callback: (ws: any) => void): void;
  }
  class WebSocket {
    static CONNECTING: number;
    static OPEN: number;
    readyState: number;
    send(data: string): void;
    close(): void;
    on(event: string, callback: (...args: any[]) => void): void;
  }
  export default WebSocket;
}

declare module 'http' {
  export interface Server {}
  const http: any;
  export default http;
}

declare var process: {
  env: Record<string, string | undefined>;
};
