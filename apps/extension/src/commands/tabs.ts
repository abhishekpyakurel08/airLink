import { TabInfo } from '@airlink/shared';

export async function handleTabsCommand(type: string, payload: any): Promise<any> {
  switch (type) {
    case 'TAB_LIST_REQUEST': {
      const tabs = await chrome.tabs.query({});
      const tabInfos: TabInfo[] = tabs.map((t) => ({
        id: t.id || 0,
        title: t.title || 'Untitled Tab',
        url: t.url || '',
        favIconUrl: t.favIconUrl,
        active: t.active || false,
        pinned: t.pinned || false
      }));
      return tabInfos;
    }

    case 'TAB_NEW': {
      const url = payload?.url || 'https://google.com';
      await chrome.tabs.create({ url });
      break;
    }

    case 'TAB_CLOSE': {
      const tabId = payload?.tabId;
      if (tabId) {
        await chrome.tabs.remove(tabId);
      } else {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (activeTab && activeTab.id) {
          await chrome.tabs.remove(activeTab.id);
        }
      }
      break;
    }

    case 'TAB_NEXT': {
      const tabs = await chrome.tabs.query({ currentWindow: true });
      const activeIdx = tabs.findIndex((t) => t.active);
      if (activeIdx !== -1 && tabs.length > 1) {
        const nextIdx = (activeIdx + 1) % tabs.length;
        const nextTab = tabs[nextIdx];
        if (nextTab && nextTab.id) {
          await chrome.tabs.update(nextTab.id, { active: true });
        }
      }
      break;
    }

    case 'TAB_PREVIOUS': {
      const tabs = await chrome.tabs.query({ currentWindow: true });
      const activeIdx = tabs.findIndex((t) => t.active);
      if (activeIdx !== -1 && tabs.length > 1) {
        const prevIdx = (activeIdx - 1 + tabs.length) % tabs.length;
        const prevTab = tabs[prevIdx];
        if (prevTab && prevTab.id) {
          await chrome.tabs.update(prevTab.id, { active: true });
        }
      }
      break;
    }

    case 'TAB_RELOAD': {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTab && activeTab.id) {
        await chrome.tabs.reload(activeTab.id);
      }
      break;
    }

    case 'TAB_ACTIVATE': {
      if (payload?.tabId) {
        await chrome.tabs.update(payload.tabId, { active: true });
      }
      break;
    }

    case 'NAVIGATE_URL': {
      if (payload?.url) {
        if (payload.newTab) {
          await chrome.tabs.create({ url: payload.url });
        } else {
          const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (activeTab && activeTab.id) {
            await chrome.tabs.update(activeTab.id, { url: payload.url });
          } else {
            await chrome.tabs.create({ url: payload.url });
          }
        }
      }
      break;
    }
  }
}
