import { config } from './config.js';
import { TelegramService } from './telegram.js';
import { fetchFeeds } from './rss.js';
import { RSS_CONFIG } from './constants.js';
import { sleep } from './utils.js';

const telegramService = new TelegramService(config.TELEGRAM_BOT_TOKEN, config.CHAT_USERNAME);

export async function startBot() {
    while (true) {
        const newEntries = await fetchFeeds(config.RSS_FEEDS);
        
        for (const entry of newEntries) {
            await telegramService.sendEntry(entry);
            await sleep(RSS_CONFIG.MESSAGE_DELAY);
        }
        
        await sleep(RSS_CONFIG.FETCH_INTERVAL);
    }
}