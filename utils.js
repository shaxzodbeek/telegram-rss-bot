import { decode } from 'html-entities';

export async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatMessage(entry, channelLink) {
    const title = decode(entry.title);
    const summary = decode(entry.contentSnippet || '').substring(0, 300) + '...';
    const link = entry.link;

    return `*⚡️⚡️⚡️ ${title}*\n\n${summary}\n\nMaqolani to'liq o'qish: [Manbaa](${link})\n\n*Bizning kanalimiz* [A'zo bo'lish](${channelLink})`;
}