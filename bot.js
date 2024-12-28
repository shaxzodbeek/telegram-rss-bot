import TelegramBot from 'node-telegram-bot-api';
import Parser from 'rss-parser';
import { config } from './config.js';
import { sleep, formatMessage } from './utils.js';

const parser = new Parser();
const bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: true });
const latestEntries = new Map();

async function sendMessage(entry) {
    try {
        const message = formatMessage(entry, 'https://t.me/yangiliklar25_7');
        const imageUrl = entry.enclosure?.url || entry.image?.url;
        
        if (imageUrl) {
            await bot.sendPhoto(config.CHAT_USERNAME, imageUrl, {
                caption: message,
                parse_mode: 'Markdown'
            });
        } else {
            await bot.sendMessage(config.CHAT_USERNAME, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        }
        console.log(`Sent: ${entry.title}`);
    } catch (error) {
        if (error.message.includes('Too Many Requests')) {
            const retryAfter = parseInt(error.parameters.retry_after || 30);
            console.log(`Rate limit hit. Waiting ${retryAfter} seconds...`);
            await sleep(retryAfter * 1000);
            return sendMessage(entry);
        }
        console.error(`Error sending message: ${error.message}`);
    }
}

async function fetchAndSendNews() {
    for (const feedUrl of config.RSS_FEEDS) {
        try {
            const feed = await parser.parseURL(feedUrl);
            
            if (!latestEntries.has(feedUrl)) {
                latestEntries.set(feedUrl, new Set());
            }
            
            for (const entry of feed.items) {
                if (!latestEntries.get(feedUrl).has(entry.link)) {
                    latestEntries.get(feedUrl).add(entry.link);
                    await sendMessage(entry);
                    await sleep(3000);
                }
            }
        } catch (error) {
            console.error(`Error fetching feed ${feedUrl}: ${error.message}`);
        }
    }
}

export async function startBot() {
    while (true) {
        await fetchAndSendNews();
        await sleep(300000);
    }
}