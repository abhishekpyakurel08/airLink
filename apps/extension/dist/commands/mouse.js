export async function handleMouseCommand(type, payload) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id)
        return;
    switch (type) {
        case 'MOUSE_MOVE':
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (dx, dy) => {
                    window.scrollBy({ left: dx, top: dy, behavior: 'auto' });
                },
                args: [payload.dx || 0, payload.dy || 0]
            });
            break;
        case 'MOUSE_CLICK':
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const el = document.activeElement;
                    if (el && el.click)
                        el.click();
                }
            });
            break;
        case 'SCROLL_UP':
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => window.scrollBy({ top: -200, behavior: 'smooth' })
            });
            break;
        case 'SCROLL_DOWN':
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => window.scrollBy({ top: 200, behavior: 'smooth' })
            });
            break;
    }
}
