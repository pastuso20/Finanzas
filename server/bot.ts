import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import path from 'path';
import { FinanceService } from './services/financeService';
import { NlpService } from './nlp';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is missing');
}

// Create a bot that uses 'polling' to fetch new updates
export const bot = new TelegramBot(token, { polling: true });

// State for conversation contexts if needed (e.g. pending ambiguous transactions)
const userStates = new Map<number, any>();

export function initBot() {
  console.log('Telegram Bot initialized via long polling...');

  // Match /start command
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '¡Bienvenido a Prestige Finance! 🚀\n\nPara empezar, necesitas vincular tu cuenta. Ve a la aplicación web, genera un Código de Vinculación y envíalo aquí con el comando:\n`/link TUCÓDIGO`', { parse_mode: 'Markdown' });
  });

  // Match /link command
  bot.onText(/\/link (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const linkCode = match ? match[1] : '';

    if (!linkCode) {
      return bot.sendMessage(chatId, 'Por favor, provee un código de vinculación. Ejemplo: `/link 123456`', { parse_mode: 'Markdown' });
    }

    const result = await FinanceService.linkAccount(chatId.toString(), linkCode.trim());
    bot.sendMessage(chatId, result.message);
  });

  // Listen for any kind of message
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Ignore commands
    if (!text || text.startsWith('/')) return;

    // Check if user is linked
    const user = await FinanceService.getUserByTelegramId(chatId.toString());
    if (!user) {
      return bot.sendMessage(chatId, 'Tu cuenta no está vinculada. Por favor, usa el comando `/link TUCÓDIGO` con el código generado en la web.', { parse_mode: 'Markdown' });
    }

    // Indicate processing
    bot.sendChatAction(chatId, 'typing');

    // Get user categories for context
    const categories = await FinanceService.getUserCategories(user.id);

    // Process with NLP
    const nlpResult = await NlpService.processMessage(text, categories);

    if (nlpResult.intent === 'record_transaction' && nlpResult.transaction) {
      try {
        await FinanceService.addTransaction({
          userId: user.id,
          ...nlpResult.transaction
        });

        const icon = nlpResult.transaction.type === 'income' ? '📈' : '📉';
        const typeStr = nlpResult.transaction.type === 'income' ? 'Ingreso' : 'Gasto';
        const summary = `✅ *Movimiento Registrado*\n\nTipo: ${typeStr} ${icon}\nMonto: $${nlpResult.transaction.amount}\nCategoría: ${nlpResult.transaction.category}\n${nlpResult.transaction.notes ? `Notas: ${nlpResult.transaction.notes}` : ''}`;
        
        bot.sendMessage(chatId, summary, { parse_mode: 'Markdown' });
      } catch (error) {
        bot.sendMessage(chatId, '❌ Ocurrió un error al intentar guardar el movimiento.');
      }
    } else if (nlpResult.intent === 'record_debt' && nlpResult.debt) {
      try {
        const dueDate = nlpResult.debt.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // Default 30 days
        await FinanceService.addDebt({
          userId: user.id,
          creditor: nlpResult.debt.creditor,
          amount: nlpResult.debt.amount,
          dueDate: dueDate,
          notes: nlpResult.debt.notes
        });

        const summary = `✅ *Deuda Registrada*\n\nAcreedor: ${nlpResult.debt.creditor}\nMonto: $${nlpResult.debt.amount}\n${nlpResult.debt.notes ? `Notas: ${nlpResult.debt.notes}` : ''}`;
        
        bot.sendMessage(chatId, summary, { parse_mode: 'Markdown' });
      } catch (error) {
        bot.sendMessage(chatId, '❌ Ocurrió un error al intentar guardar la deuda.');
      }
    } else if (nlpResult.intent === 'query') {
      const summaryContext = await FinanceService.getTransactionsSummary(user.id);
      const answer = await NlpService.answerQuery(text, summaryContext);
      bot.sendMessage(chatId, answer);
    } else if (nlpResult.intent === 'ambiguous') {
      bot.sendMessage(chatId, nlpResult.missingInfoMessage || 'No estoy seguro de todos los detalles de este movimiento. ¿Podrías ser más específico con el monto y la categoría?');
    } else {
      bot.sendMessage(chatId, 'No entendí tu solicitud. Puedes decirme cosas como "Gasté $15 en comida" o "¿Cuánto he gastado este mes?".');
    }
  });
}
