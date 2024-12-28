import TelegramBot from 'node-telegram-bot-api';
import Parser from 'rss-parser';
import { decode } from 'html-entities';

const TELEGRAM_BOT_TOKEN = '7702872525:AAGOqiiHYODfObE9YLaWY2sDvPxXRzvmWCc';
const CHAT_USERNAME = '@yangiliklar25_7';

const RSS_FEEDS = [
    'https://kun.uz/news/rss',
    'https://www.gazeta.uz/oz/rss/',
    'https://www.spot.uz/oz/rss/',
    'https://uz24.uz/uz/articles.rss',
];

const parser = new Parser();
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
const latestEntries = new Map();

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendMessage(entry) {
    const title = decode(entry.title);
    const summary = decode(entry.contentSnippet || '').substring(0, 300) + '...';
    const link = entry.link;
    const channelLink = 'https://t.me/yangiliklar25_7';

    const message = `*⚡️⚡️⚡️ ${title}*\n\n${summary}\n\nMaqolani to'liq o'qish: [Manbaa](${link})\n\n*Bizning kanalimiz* [A'zo bo'lish](${channelLink})`;

    try {
        const imageUrl = entry.enclosure?.url || entry.image?.url;
        
        if (imageUrl) {
            await bot.sendPhoto(CHAT_USERNAME, imageUrl, {
                caption: message,
                parse_mode: 'Markdown'
            });
        } else {
            await bot.sendMessage(CHAT_USERNAME, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        }
        console.log(`Sent: ${title}`);
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
    for (const feedUrl of RSS_FEEDS) {
        try {
            const feed = await parser.parseURL(feedUrl);
            
            if (!latestEntries.has(feedUrl)) {
                latestEntries.set(feedUrl, new Set());
            }
            
            for (const entry of feed.items) {
                if (!latestEntries.get(feedUrl).has(entry.link)) {
                    latestEntries.get(feedUrl).add(entry.link);
                    await sendMessage(entry);
                    await sleep(3000); // 3 second delay between messages
                }
            }
        } catch (error) {
            console.error(`Error fetching feed ${feedUrl}: ${error.message}`);
        }
    }
}

async function main() {
    while (true) {
        await fetchAndSendNews();
        await sleep(300000); // 5 minute delay between feed checks
    }
}

main().catch(console.error);