declare namespace chrome {
  export namespace runtime {
    export interface MessageSender {
      id?: string;
      tab?: any;
    }
    export const onMessage: {
      addListener(
        callback: (
          message: any,
          sender: MessageSender,
          sendResponse: (response?: any) => void
        ) => void
      ): void;
    };
    export function sendMessage(message: any): Promise<any>;
  }

  export namespace storage {
    export interface StorageArea {
      get(keys?: string | string[] | object): Promise<Record<string, any>>;
      set(items: Record<string, any>): Promise<void>;
      remove(keys: string | string[]): Promise<void>;
    }
    export const local: StorageArea;
  }

  export namespace tabs {
    export interface Tab {
      id?: number;
      title?: string;
      url?: string;
      favIconUrl?: string;
      active?: boolean;
      pinned?: boolean;
      windowId?: number;
      index?: number;
    }
    export function query(queryInfo: object): Promise<Tab[]>;
    export function update(tabId: number, updateProperties: object): Promise<Tab>;
    export function remove(tabIds: number | number[]): Promise<void>;
    export function create(createProperties: object): Promise<Tab>;
    export function reload(tabId?: number): Promise<void>;
    export function duplicate(tabId: number): Promise<Tab>;
  }

  export namespace scripting {
    export interface ScriptInjection {
      target: { tabId: number };
      func: (...args: any[]) => void;
      args?: any[];
    }
    export function executeScript(injection: ScriptInjection): Promise<any>;
  }
}
