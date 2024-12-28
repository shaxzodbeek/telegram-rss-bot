import TelegramBot from 'node-telegram-bot-api';
import { formatMessage, sleep } from './utils.js';

export class TelegramService {
    constructor(token, chatUsername) {
        this.bot = new TelegramBot(token, { polling: true });
        this.chatUsername = chatUsername;
    }

    async sendEntry(entry) {
        try {
            const message = formatMessage(entry, `https://t.me/${this.chatUsername.replace('@', '')}`);
            const imageUrl = entry.enclosure?.url || entry.image?.url;
            
            if (imageUrl) {
                await this.bot.sendPhoto(this.chatUsername, imageUrl, {
                    caption: message,
                    parse_mode: 'Markdown'
                });
            } else {
                await this.bot.sendMessage(this.chatUsername, message, {
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
                return this.sendEntry(entry);
            }
            console.error(`Error sending message: ${error.message}`);
        }
    }
}