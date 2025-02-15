
import TelegramBot from 'node-telegram-bot-api';
import { analyzeCrypto } from './openai';

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is required');
}

const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
  try {
    const response = await analyzeCrypto(msg.text, '');
    await bot.sendMessage(msg.chat.id, response);
  } catch (error) {
    console.error('Telegram bot error:', error);
    await bot.sendMessage(msg.chat.id, 'Sorry, I encountered an error processing your request.');
  }
});

export function startTelegramBot() {
  console.log('Telegram bot started');
}
