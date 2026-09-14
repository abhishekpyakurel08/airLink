"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIVoiceService = void 0;
class AIVoiceService {
    /**
     * Parses natural voice input into structured AirLink remote commands
     */
    static parseVoiceCommand(transcript) {
        const text = transcript.toLowerCase().trim();
        if (text.includes('open chatgpt') || text.includes('chat gpt')) {
            return {
                actionType: 'NAVIGATE_URL',
                payload: { url: 'https://chatgpt.com', newTab: true },
                displayText: 'Opening ChatGPT...'
            };
        }
        if (text.includes('open github') || text.includes('git hub')) {
            return {
                actionType: 'NAVIGATE_URL',
                payload: { url: 'https://github.com', newTab: true },
                displayText: 'Opening GitHub...'
            };
        }
        if (text.includes('study mode')) {
            return {
                actionType: 'EXECUTE_SHORTCUT',
                payload: { presetId: 'study_mode' },
                displayText: 'Activating Study Mode workspace...'
            };
        }
        if (text.includes('work mode') || text.includes('work tabs')) {
            return {
                actionType: 'EXECUTE_SHORTCUT',
                payload: { presetId: 'work_mode' },
                displayText: 'Activating Work Mode workspace...'
            };
        }
        if (text.includes('play') && text.includes('youtube')) {
            const searchQuery = encodeURIComponent(text.replace(/play|on youtube|youtube/gi, '').trim() || 'music');
            return {
                actionType: 'NAVIGATE_URL',
                payload: { url: `https://www.youtube.com/results?search_query=${searchQuery}`, newTab: true },
                displayText: `Searching YouTube for "${searchQuery}"...`
            };
        }
        if (text.includes('pause') || text.includes('stop media')) {
            return {
                actionType: 'MEDIA_PAUSE',
                displayText: 'Pausing media playback...'
            };
        }
        if (text.includes('play') || text.includes('resume')) {
            return {
                actionType: 'MEDIA_PLAY',
                displayText: 'Resuming media playback...'
            };
        }
        if (text.includes('mute') || text.includes('silence')) {
            return {
                actionType: 'MUTE',
                displayText: 'Toggling mute state...'
            };
        }
        if (text.includes('close tab') || text.includes('close current tab')) {
            return {
                actionType: 'TAB_CLOSE',
                displayText: 'Closing current active tab...'
            };
        }
        // Default fallback: search google
        const query = encodeURIComponent(transcript);
        return {
            actionType: 'NAVIGATE_URL',
            payload: { url: `https://www.google.com/search?q=${query}`, newTab: true },
            displayText: `Searching Google for "${transcript}"...`
        };
    }
}
exports.AIVoiceService = AIVoiceService;
