export async function handleShortcutsCommand(type, payload) {
    if (type === 'EXECUTE_SHORTCUT') {
        const presetId = payload?.presetId;
        if (presetId === 'work_mode') {
            await chrome.tabs.create({ url: 'https://github.com' });
            await chrome.tabs.create({ url: 'https://slack.com' });
            await chrome.tabs.create({ url: 'https://mail.google.com' });
        }
        else if (presetId === 'study_mode') {
            await chrome.tabs.create({ url: 'https://notion.so' });
            await chrome.tabs.create({ url: 'https://youtube.com/results?search_query=study+music+lofi' });
            await chrome.tabs.create({ url: 'https://docs.google.com' });
        }
    }
}
