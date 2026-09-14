export async function handleKeyboardCommand(type: string, payload: any) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;

  if (type === 'KEY_PRESS') {
    const key = payload.key;
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (k) => {
        const active = document.activeElement as HTMLElement | null;
        if (k === 'Enter') {
          if (active && (active as HTMLInputElement).form) {
            (active as HTMLInputElement).form?.requestSubmit();
          } else if (active) {
            active.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
          }
        } else if (k === 'Backspace') {
          if (active && ('value' in active)) {
            const input = active as HTMLInputElement;
            input.value = input.value.slice(0, -1);
          }
        } else if (k === 'Space') {
          if (active && ('value' in active)) {
            const input = active as HTMLInputElement;
            input.value += ' ';
          }
        } else if (k === 'Escape') {
          if (active) active.blur();
        }
      },
      args: [key]
    });
  } else if (type === 'KEY_TYPE') {
    const text = payload.text;
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (txt) => {
        const active = document.activeElement as HTMLInputElement | null;
        if (active && ('value' in active)) {
          active.value += txt;
          active.dispatchEvent(new Event('input', { bubbles: true }));
        }
      },
      args: [text]
    });
  }
}
