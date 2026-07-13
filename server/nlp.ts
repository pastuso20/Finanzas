import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface NlpResult {
  intent: 'record_transaction' | 'record_debt' | 'record_loan' | 'record_investment' | 'record_saving' | 'pay_debt' | 'query' | 'unknown' | 'ambiguous';
  transaction?: {
    amount: number;
    category: string;
    type: 'income' | 'expense';
    notes?: string;
  };
  debt?: {
    amount: number;
    creditor: string;
    dueDate?: string;
    notes?: string;
  };
  loan?: {
    borrower: string;
    principal: number;
    dueDate?: string;
    interestRate?: number;
  };
  investment?: {
    assetName: string;
    initialInvestment: number;
    pricePerUnit?: number;
    quantity?: number;
    description?: string;
  };
  saving?: {
    name: string;
    category: string;
    amount: number;
  };
  missingInfoMessage?: string; // If ambiguous, what to ask the user
  queryResponse?: string; // If query, a response to send back, or instructions for the DB
}

export const NlpService = {
  async processMessage(message: string, existingCategories: string[], existingSavings: any[] = [], balanceContext: any = null): Promise<NlpResult> {
    const prompt = `
      You are a financial assistant bot. Analyze the user's message.
      Existing transaction categories: ${existingCategories.join(', ')}.
      Existing savings goals: ${JSON.stringify(existingSavings.map(s => ({ id: s.id, name: s.name, category: s.category }))) }.
      Current context if it's a query: ${balanceContext ? JSON.stringify(balanceContext) : 'None'}.

      Determine the user's intent from these options: "record_transaction", "record_debt", "record_loan", "record_investment", "record_saving", "pay_debt", "query", "ambiguous", "unknown".
      
      RULES FOR INTENTS:
      - "record_transaction": Records an income or expense. Requires amount and category.
      - "record_debt": The user owes money. Requires amount, creditor, and dueDate. (e.g. "Le debo $100 a Juan para el viernes")
      - "record_loan": The user lent money to someone. Requires amount (principal), borrower, and dueDate. (e.g. "Le presté 50 a Pedro")
      - "record_investment": The user invested money. Requires assetName, initialInvestment, pricePerUnit, quantity, and description. (e.g. "Invertí en Apple")
      - "record_saving": The user saved money. Requires amount, name (meta name), and category. If adding to an existing goal, match the name/category. (e.g. "Ahorré 100 para mi viaje")
      - "pay_debt": The user paid off an existing debt. Requires the creditor name. (e.g. "Ya pague la deuda a sistecredito")
      - "query": Asking about balance or stats.
      
      CRITICAL RULE FOR AMBIGUOUS: 
      If the user wants to record a loan but didn't provide a due date, set intent to "ambiguous" and ask for the due date in missingInfoMessage.
      If the user wants to record a debt but didn't provide a due date, set intent to "ambiguous" and ask for the due date in missingInfoMessage.
      If the user wants to record an investment but didn't provide ALL of (assetName, initialInvestment, pricePerUnit, quantity, description), set intent to "ambiguous" and ask for the missing ones in missingInfoMessage.
      If the user wants to record a saving but didn't provide name or category (and it doesn't clearly match an existing one), set intent to "ambiguous" and ask for the name/category or if it belongs to an existing goal.
      If the user wants to pay a debt but didn't mention the creditor, set intent to "ambiguous" and ask who they paid.

      Respond ONLY with a JSON object in this format (no markdown code blocks, just raw JSON):
      {
        "intent": "intent_type",
        "transaction": { "amount": 0, "category": "", "type": "income", "notes": "" },
        "debt": { "amount": 0, "creditor": "", "dueDate": "", "notes": "" },
        "loan": { "principal": 0, "borrower": "", "dueDate": "ISO Date", "interestRate": 0 },
        "investment": { "assetName": "", "initialInvestment": 0, "pricePerUnit": 0, "quantity": 0, "description": "" },
        "saving": { "amount": 0, "name": "", "category": "" },
        "missingInfoMessage": "Message asking for the REQUIRED missing fields (only if intent is ambiguous)",
        "queryResponse": "string (only if intent is query - answer their question based on context)"
      }
      (Omit the properties that are not relevant to the chosen intent)

      Message: "${message}"
    `;

    try {
      const response = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' }
      });

      let responseText = response.choices[0]?.message?.content || '{}';
      
      const parsed = JSON.parse(responseText);
      return parsed as NlpResult;
    } catch (error) {
      console.error('Groq API Error:', error);
      return { intent: 'unknown' };
    }
  },

  async answerQuery(message: string, summaryContext: any): Promise<string> {
    const prompt = `
      You are a helpful financial assistant on Telegram. The user asked a question.
      User's question: "${message}"
      Context data (from their database): ${JSON.stringify(summaryContext)}
      
      Provide a concise, friendly, and clear answer to the user based ONLY on the context data provided. 
      Use emojis. Format the numbers nicely.
    `;

    try {
      const response = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile'
      });

      return response.choices[0]?.message?.content || 'Lo siento, no pude procesar tu consulta en este momento.';
    } catch (error) {
      console.error('Groq API Error:', error);
      return 'Ocurrió un error al procesar tu consulta.';
    }
  }
};
