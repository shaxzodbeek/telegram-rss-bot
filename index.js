import TelegramBot from 'node-telegram-bot-api';
import Parser from 'rss-parser';

const TELEGRAM_BOT_TOKEN = '7702872525:AAGOqiiHYODfObE9YLaWY2sDvPxXRzvmWCc';
const CHAT_USERNAME = '@yangiliklar25_7';

const RSS_FEEDS = [
  'https://kun.uz/news/rss',
  'https://www.gazeta.uz/oz/rss/',
  'https://www.spot.uz/oz/rss/',
  'https://uz24.uz/uz/articles.rss',
];

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
const parser = new Parser();
const latestEntries = new Map();

async function sendMessage(entry) {
  const title = entry.title;
  const summary = entry.contentSnippet?.slice(0, 300) + '...' || '';
  const link = entry.link;
  const channelLink = 'https://t.me/yangiliklar25_7';

  const message = `
⚡️⚡️⚡️ ${title}

${summary}

Maqolani to'liq o'qish: [Manbaa](${link})

*Bizning kanalimiz* [A'zo bo'lish](${channelLink})
  `.trim();

  try {
    if (entry.enclosure?.url) {
      await bot.sendPhoto(CHAT_USERNAME, entry.enclosure.url, {
        caption: message,
        parse_mode: 'Markdown'
      });
    } else {
      await bot.sendMessage(CHAT_USERNAME, message, {
        parse_mode: 'Markdown'
      });
    }
    console.log(`Sent: ${title}`);
  } catch (error) {
    if (error.message.includes('Too Many Requests')) {
      const retryAfter = parseInt(error.message.match(/\d+/)[0]) || 60;
      console.log(`Rate limit hit. Waiting ${retryAfter} seconds...`);
      await new Promise(resolve => setTimeout(resolve, (retryAfter + 1) * 1000));
    } else {
      console.error(`Error sending message:`, error.message);
    }
  }
}

async function fetchAndSendNews() {
  for (const feedUrl of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      
      if (!latestEntries.has(feedUrl)) {
        latestEntries.set(feedUrl, new Set());
      }
      
      const entries = feed.items.reverse();
      for (const entry of entries) {
        if (!latestEntries.get(feedUrl).has(entry.link)) {
          await sendMessage(entry);
          latestEntries.get(feedUrl).add(entry.link);
          
          // Keep only last 100 entries
          if (latestEntries.get(feedUrl).size > 200) {
            const values = Array.from(latestEntries.get(feedUrl));
            latestEntries.set(feedUrl, new Set(values.slice(-200)));
          }
          
          // Wait 3 seconds between messages
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    } catch (error) {
      console.error(`Error fetching feed ${feedUrl}:`, error.message);
    }
  }
}

async function main() {
  while (true) {
    await fetchAndSendNews();
    // Wait 5 minutes before next check
    await new Promise(resolve => setTimeout(resolve, 300000));
  }
}

main().catch(console.error);
