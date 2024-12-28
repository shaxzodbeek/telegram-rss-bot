import { startBot } from './bot.js';
import { startHealthServer } from './health.js';

// Start health check server for Render
startHealthServer();

// Start the bot
startBot().catch(console.error);