import Parser from 'rss-parser';
import { RSS_CONFIG } from './constants.js';
import { sleep } from './utils.js';

const parser = new Parser();
const latestEntries = new Map();

export async function fetchFeeds(feeds) {
    const newEntries = [];
    
    for (const feedUrl of feeds) {
        try {
            const feed = await parser.parseURL(feedUrl);
            
            if (!latestEntries.has(feedUrl)) {
                latestEntries.set(feedUrl, new Set());
            }
            
            for (const entry of feed.items) {
                if (!latestEntries.get(feedUrl).has(entry.link)) {
                    latestEntries.get(feedUrl).add(entry.link);
                    newEntries.push(entry);
                }
            }
        } catch (error) {
            console.error(`Error fetching feed ${feedUrl}: ${error.message}`);
        }
    }
    
    return newEntries;
}