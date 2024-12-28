# Telegram RSS Bot

Telegram bot that fetches news from multiple RSS feeds and posts them to a Telegram channel.

## Features

- Fetches news from multiple RSS sources
- Posts updates to a Telegram channel
- Handles rate limiting
- Supports images from RSS feeds
- Formats messages with Markdown

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set environment variables:
   - `TELEGRAM_BOT_TOKEN`: Your Telegram bot token
   - `CHAT_USERNAME`: Your Telegram channel username

## Running the Bot

```bash
npm start
```

## Deployment

This bot is configured for deployment on Render.com. See `render.yaml` for configuration details.

## License

MIT