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

    // Handle simple greetings directly
    const lowerText = text.toLowerCase().trim();
    const greetings = ['hola', 'hola bot', 'saludos', 'buenas', 'buenos dias', 'buenos días', 'buenas tardes', 'buenas noches', 'hello', 'hi'];
    if (greetings.includes(lowerText)) {
      const name = user.user_name || 'amigo';
      return bot.sendMessage(chatId, `¡Hola, ${name}! 👋\n\n¿En qué te puedo ayudar hoy con tus finanzas?`);
    }

    // Indicate processing
    bot.sendChatAction(chatId, 'typing');

    // Get user categories and savings for context
    const categories = await FinanceService.getUserCategories(user.id);
    const savings = await FinanceService.getUserSavings(user.id);

    // Process with NLP
    const nlpResult = await NlpService.processMessage(text, categories, savings);

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
        await FinanceService.addDebt({
          userId: user.id,
          creditor: nlpResult.debt.creditor,
          amount: nlpResult.debt.amount,
          dueDate: nlpResult.debt.dueDate as string,
          notes: nlpResult.debt.notes
        });

        const summary = `✅ *Deuda Registrada*\n\nAcreedor: ${nlpResult.debt.creditor}\nMonto: $${nlpResult.debt.amount}\nFecha Límite: ${new Date(nlpResult.debt.dueDate as string).toLocaleDateString()}\n${nlpResult.debt.notes ? `Notas: ${nlpResult.debt.notes}` : ''}`;
        
        bot.sendMessage(chatId, summary, { parse_mode: 'Markdown' });
      } catch (error) {
        bot.sendMessage(chatId, '❌ Ocurrió un error al intentar guardar la deuda.');
      }
    } else if (nlpResult.intent === 'record_loan' && nlpResult.loan) {
      try {
        await FinanceService.addLoan({
          userId: user.id,
          borrower: nlpResult.loan.borrower,
          principal: nlpResult.loan.principal,
          dueDate: nlpResult.loan.dueDate as string,
          interestRate: nlpResult.loan.interestRate || 0
        });

        const summary = `✅ *Préstamo Registrado*\n\nPrestatario: ${nlpResult.loan.borrower}\nMonto: $${nlpResult.loan.principal}\nFecha Límite: ${new Date(nlpResult.loan.dueDate as string).toLocaleDateString()}`;
        bot.sendMessage(chatId, summary, { parse_mode: 'Markdown' });
      } catch (error) {
        bot.sendMessage(chatId, '❌ Ocurrió un error al intentar guardar el préstamo.');
      }
    } else if (nlpResult.intent === 'record_investment' && nlpResult.investment) {
      try {
        await FinanceService.addInvestment({
          userId: user.id,
          assetName: nlpResult.investment.assetName,
          initialInvestment: nlpResult.investment.initialInvestment,
          pricePerUnit: nlpResult.investment.pricePerUnit,
          quantity: nlpResult.investment.quantity,
          description: nlpResult.investment.description
        });

        const summary = `✅ *Inversión Registrada*\n\nActivo: ${nlpResult.investment.assetName}\nMonto Inicial: $${nlpResult.investment.initialInvestment}`;
        bot.sendMessage(chatId, summary, { parse_mode: 'Markdown' });
      } catch (error) {
        bot.sendMessage(chatId, '❌ Ocurrió un error al intentar guardar la inversión.');
      }
    } else if (nlpResult.intent === 'record_saving' && nlpResult.saving) {
      try {
        // Check if there is an existing saving with the exact name/category
        const existing = savings.find(s => s.name.toLowerCase() === nlpResult.saving?.name.toLowerCase());
        
        if (existing) {
          await FinanceService.addAmountToSaving(existing.id, nlpResult.saving.amount);
          bot.sendMessage(chatId, `✅ *Ahorro Actualizado*\n\nAgregaste $${nlpResult.saving.amount} a tu meta: ${existing.name}`, { parse_mode: 'Markdown' });
        } else {
          await FinanceService.addSaving({
            userId: user.id,
            name: nlpResult.saving.name,
            category: nlpResult.saving.category,
            amount: nlpResult.saving.amount
          });
          bot.sendMessage(chatId, `✅ *Nuevo Ahorro Registrado*\n\nMeta: ${nlpResult.saving.name}\nCategoría: ${nlpResult.saving.category}\nMonto Inicial: $${nlpResult.saving.amount}`, { parse_mode: 'Markdown' });
        }
      } catch (error) {
        bot.sendMessage(chatId, '❌ Ocurrió un error al intentar guardar el ahorro.');
      }
    } else if (nlpResult.intent === 'pay_debt' && nlpResult.debt) {
      try {
        const result = await FinanceService.markDebtAsPaid(user.id, nlpResult.debt.creditor);
        bot.sendMessage(chatId, result.message, { parse_mode: 'Markdown' });
      } catch (error) {
        bot.sendMessage(chatId, '❌ Ocurrió un error al procesar el pago de la deuda.');
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
