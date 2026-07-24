import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import path from 'path';
import { FinanceService } from './services/financeService.js';
import { NlpService } from './nlp.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is missing');
}

// Check if we are running in a serverless environment (like Vercel)
const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

// Use polling only in local development. In production, we'll use webhooks.
export const bot = new TelegramBot(token, isProduction ? {} : { polling: true });

// State for conversation contexts if needed (e.g. pending ambiguous transactions)
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
const userHistory = new Map<number, ChatMessage[]>();

function pushHistory(chatId: number, role: 'user' | 'assistant', content: string) {
  const history = userHistory.get(chatId) || [];
  history.push({ role, content });
  if (history.length > 10) history.shift(); // Keep last 10 messages
  userHistory.set(chatId, history);
}

async function sendMessageAndRemember(chatId: number | string, text: string, options?: any) {
  pushHistory(Number(chatId), 'assistant', text);
  return bot.sendMessage(chatId, text, options);
}

export async function processTelegramUpdate(update: any) {
  if (!update.message) return;
  const msg = update.message;
  const chatId = msg.chat.id;
  const text = msg.text || '';

  // Record user message in history
  pushHistory(chatId, 'user', text);

  // Handle commands
  if (text.startsWith('/start')) {
    await sendMessageAndRemember(chatId, '¡Bienvenido a Prestige Finance! 🚀\n\nPara empezar, necesitas vincular tu cuenta. Ve a la aplicación web, genera un Código de Vinculación y envíalo aquí con el comando:\n`/link TUCÓDIGO`', { parse_mode: 'Markdown' });
    return;
  }

  const linkMatch = text.match(/^\/link\s*(.+)?/);
  if (linkMatch) {
    const linkCode = linkMatch[1];
    if (!linkCode) {
      await sendMessageAndRemember(chatId, 'Por favor, provee un código de vinculación. Ejemplo: `/link 123456`', { parse_mode: 'Markdown' });
      return;
    }
    const result = await FinanceService.linkAccount(chatId.toString(), linkCode.trim());
    await sendMessageAndRemember(chatId, result.message);
    return;
  }

  // Ignore other commands
  if (text.startsWith('/')) return;

  // Indicate processing
  await bot.sendChatAction(chatId, 'typing');

  // Check if user is linked
  const user = await FinanceService.getUserByTelegramId(chatId.toString());
  if (!user) {
    await sendMessageAndRemember(chatId, 'Tu cuenta no está vinculada. Por favor, usa el comando `/link TUCÓDIGO` con el código generado en la web.', { parse_mode: 'Markdown' });
    return;
  }

  // Handle simple greetings directly
  const lowerText = text.toLowerCase().trim();
  const greetings = ['hola', 'hola bot', 'saludos', 'buenas', 'buenos dias', 'buenos días', 'buenas tardes', 'buenas noches', 'hello', 'hi'];
  if (greetings.includes(lowerText)) {
    const name = user.user_name || 'amigo';
    await sendMessageAndRemember(chatId, `¡Hola, ${name}! 👋\n\n¿En qué te puedo ayudar hoy con tus finanzas?`);
    return;
  }

  // Get user categories and savings for context
  const categories = await FinanceService.getUserCategories(user.id);
  const savings = await FinanceService.getUserSavings(user.id);

  // Process with NLP
  const history = userHistory.get(chatId) || [];
  const nlpResult = await NlpService.processMessage(text, categories, savings, null, history);

  if (nlpResult.intent === 'record_transaction' && nlpResult.transaction) {
    if (!nlpResult.transaction.amount || !nlpResult.transaction.category) {
      await sendMessageAndRemember(chatId, 'Me falta información para registrar este movimiento. Por favor, indícame el monto y la categoría (ejemplo: "Gasté $50 en comida" o "Ingresó $1000 de sueldo").');
      return;
    }
    try {
      await FinanceService.addTransaction({
        userId: user.id,
        ...nlpResult.transaction
      });

      const icon = nlpResult.transaction.type === 'income' ? '📈' : '📉';
      const typeStr = nlpResult.transaction.type === 'income' ? 'Ingreso' : 'Gasto';
      const summary = `✅ *Movimiento Registrado*\n\nTipo: ${typeStr} ${icon}\nMonto: $${nlpResult.transaction.amount}\nCategoría: ${nlpResult.transaction.category}\n${nlpResult.transaction.notes ? `Notas: ${nlpResult.transaction.notes}` : ''}`;
      
      await sendMessageAndRemember(chatId, summary, { parse_mode: 'Markdown' });
    } catch (error) {
      await sendMessageAndRemember(chatId, '❌ Ocurrió un error al intentar guardar el movimiento.');
    }
  } else if (nlpResult.intent === 'record_debt' && nlpResult.debt) {
    if (!nlpResult.debt.dueDate) {
      await sendMessageAndRemember(chatId, 'Por favor, indícame la fecha límite para pagar esta deuda (ejemplo: "para el 30 de julio" o "para el viernes").');
      return;
    }
    try {
      await FinanceService.addDebt({
        userId: user.id,
        creditor: nlpResult.debt.creditor,
        amount: nlpResult.debt.amount,
        dueDate: nlpResult.debt.dueDate as string,
        notes: nlpResult.debt.notes
      });

      const summary = `✅ *Deuda Registrada*\n\nAcreedor: ${nlpResult.debt.creditor}\nMonto: $${nlpResult.debt.amount}\nFecha Límite: ${new Date(nlpResult.debt.dueDate as string).toLocaleDateString()}\n${nlpResult.debt.notes ? `Notas: ${nlpResult.debt.notes}` : ''}`;
      
      await sendMessageAndRemember(chatId, summary, { parse_mode: 'Markdown' });
    } catch (error) {
      await sendMessageAndRemember(chatId, '❌ Ocurrió un error al intentar guardar la deuda.');
    }
  } else if (nlpResult.intent === 'record_loan' && nlpResult.loan) {
    if (!nlpResult.loan.dueDate) {
      await sendMessageAndRemember(chatId, 'Por favor, indícame la fecha límite para que te paguen este préstamo (ejemplo: "para el 30 de julio" o "para el viernes").');
      return;
    }
    try {
      await FinanceService.addLoan({
        userId: user.id,
        borrower: nlpResult.loan.borrower,
        principal: nlpResult.loan.principal,
        dueDate: nlpResult.loan.dueDate as string,
        interestRate: nlpResult.loan.interestRate || 0
      });

      const summary = `✅ *Préstamo Registrado*\n\nPrestatario: ${nlpResult.loan.borrower}\nMonto: $${nlpResult.loan.principal}\nFecha Límite: ${new Date(nlpResult.loan.dueDate as string).toLocaleDateString()}`;
      await sendMessageAndRemember(chatId, summary, { parse_mode: 'Markdown' });
    } catch (error) {
      await sendMessageAndRemember(chatId, '❌ Ocurrió un error al intentar guardar el préstamo.');
    }
  } else if (nlpResult.intent === 'record_investment' && nlpResult.investment) {
    if (!nlpResult.investment.assetName || !nlpResult.investment.initialInvestment) {
      await sendMessageAndRemember(chatId, 'Para registrar la inversión necesito el nombre del activo y el monto inicial (ejemplo: "Invertí $500 en acciones de Apple").');
      return;
    }
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
      await sendMessageAndRemember(chatId, summary, { parse_mode: 'Markdown' });
    } catch (error) {
      await sendMessageAndRemember(chatId, '❌ Ocurrió un error al intentar guardar la inversión.');
    }
  } else if (nlpResult.intent === 'record_saving' && nlpResult.saving) {
    if (!nlpResult.saving.name || !nlpResult.saving.amount) {
      await sendMessageAndRemember(chatId, 'Para registrar tu ahorro necesito saber la cantidad y el nombre de la meta (ejemplo: "Ahorré $100 para mi viaje").');
      return;
    }
    try {
      // Check if there is an existing saving with the exact name/category
      const existing = savings.find(s => s.name.toLowerCase() === nlpResult.saving?.name.toLowerCase());
      
      if (existing) {
        await FinanceService.addAmountToSaving(existing.id, nlpResult.saving.amount);
        await sendMessageAndRemember(chatId, `✅ *Ahorro Actualizado*\n\nAgregaste $${nlpResult.saving.amount} a tu meta: ${existing.name}`, { parse_mode: 'Markdown' });
      } else {
        await FinanceService.addSaving({
          userId: user.id,
          name: nlpResult.saving.name,
          category: nlpResult.saving.category,
          amount: nlpResult.saving.amount
        });
        await sendMessageAndRemember(chatId, `✅ *Nuevo Ahorro Registrado*\n\nMeta: ${nlpResult.saving.name}\nCategoría: ${nlpResult.saving.category}\nMonto Inicial: $${nlpResult.saving.amount}`, { parse_mode: 'Markdown' });
      }
    } catch (error) {
      await sendMessageAndRemember(chatId, '❌ Ocurrió un error al intentar guardar el ahorro.');
    }
  } else if (nlpResult.intent === 'pay_debt' && nlpResult.debt) {
    if (!nlpResult.debt.creditor) {
      await sendMessageAndRemember(chatId, 'Por favor indícame a quién le pagaste la deuda (ejemplo: "Ya pagué la deuda a Juan").');
      return;
    }
    try {
      const result = await FinanceService.markDebtAsPaid(user.id, nlpResult.debt.creditor);
      await sendMessageAndRemember(chatId, result.message, { parse_mode: 'Markdown' });
    } catch (error) {
      await sendMessageAndRemember(chatId, '❌ Ocurrió un error al procesar el pago de la deuda.');
    }
  } else if (nlpResult.intent === 'query') {
    const summaryContext = await FinanceService.getTransactionsSummary(user.id);
    const answer = await NlpService.answerQuery(text, summaryContext);
    await sendMessageAndRemember(chatId, answer);
  } else if (nlpResult.intent === 'ambiguous') {
    await sendMessageAndRemember(chatId, nlpResult.missingInfoMessage || 'No estoy seguro de todos los detalles de este movimiento. ¿Podrías ser más específico con el monto y la categoría?');
  } else {
    await sendMessageAndRemember(chatId, 'No entendí tu solicitud. Puedes decirme cosas como "Gasté $15 en comida" o "¿Cuánto he gastado este mes?".');
  }
}

export function initBot() {
  if (!isProduction) {
    console.log('Telegram Bot initialized via long polling (local dev)...');
    bot.on('message', async (msg) => {
      try {
        await processTelegramUpdate({ message: msg });
      } catch (err) {
        console.error('Error processing message in local mode:', err);
      }
    });
  }
}
