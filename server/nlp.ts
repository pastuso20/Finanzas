import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface NlpResult {
  intent: 'record_transaction' | 'record_debt' | 'query' | 'unknown' | 'ambiguous';
  transaction?: {
    amount: number;
    category: string;
    type: 'income' | 'expense';
    notes?: string;
  };
  debt?: {
    amount: number;
    creditor: string;
    dueDate?: string; // Optional, bot can infer or default it
    notes?: string;
  };
  missingInfoMessage?: string; // If ambiguous, what to ask the user
  queryResponse?: string; // If query, a response to send back, or instructions for the DB
}

export const NlpService = {
  async processMessage(message: string, existingCategories: string[], balanceContext: any = null): Promise<NlpResult> {
    const prompt = `
      You are a financial assistant bot. Analyze the user's message.
      Existing categories the user uses: ${existingCategories.join(', ')}. Try to match these if relevant.
      Current context if it's a query: ${balanceContext ? JSON.stringify(balanceContext) : 'None'}.

      Determine the user's intent from these options: "record_transaction", "record_debt", "query", "ambiguous", "unknown".
      - "record_transaction": The user clearly wants to record an income or expense.
      - "record_debt": The user explicitly says they owe money to someone (e.g. "Le debo $100 a Juan", "Tengo una deuda de 50 con Maria").
      - "query": The user is asking about their balance, spending, etc.
      - "ambiguous": The user wants to record something but is missing critical info.
      - "unknown": Unrelated greeting or chat.

      Respond ONLY with a JSON object in this format (no markdown code blocks, just raw JSON):
      {
        "intent": "intent_type",
        "transaction": {
          "amount": number (positive),
          "category": "string",
          "type": "income" | "expense",
          "notes": "string"
        },
        "debt": {
          "amount": number (positive),
          "creditor": "string (the person they owe)",
          "dueDate": "string (ISO date, if mentioned, otherwise leave empty or null)",
          "notes": "string"
        },
        "missingInfoMessage": "string (only if intent is ambiguous)",
        "queryResponse": "string (only if intent is query - answer their question based on context)"
      }

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
