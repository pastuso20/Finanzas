import { supabase } from '../supabase';

/**
 * Service to handle database operations for the Telegram Bot.
 * Note: These run on the backend with elevated privileges (or anon key), 
 * so we explicitly filter by user_id.
 */

export interface TransactionData {
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  notes?: string;
}

export interface DebtData {
  userId: string;
  creditor: string;
  amount: number;
  dueDate: string;
  notes?: string;
}

export const FinanceService = {
  /**
   * Retrieves a user by their Telegram Chat ID
   */
  async getUserByTelegramId(chatId: string) {
    const { data, error } = await supabase
      .from('profile')
      .select('id, user_name, initial_balance')
      .eq('telegram_chat_id', chatId.toString())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      console.error('Error fetching user by telegram ID:', error);
      return null;
    }
    return data;
  },

  /**
   * Links a Telegram Chat ID to a user account using a link code
   */
  async linkAccount(chatId: string, linkCode: string) {
    // 1. Find user by link code
    const { data: profile, error: findError } = await supabase
      .from('profile')
      .select('id')
      .eq('telegram_link_code', linkCode)
      .single();

    if (findError || !profile) {
      return { success: false, message: 'Código inválido o expirado.' };
    }

    // 2. Update user with chat ID and clear link code
    const { error: updateError } = await supabase
      .from('profile')
      .update({
        telegram_chat_id: chatId.toString(),
        telegram_link_code: null
      })
      .eq('id', profile.id);

    if (updateError) {
      console.error('Error linking account:', updateError);
      return { success: false, message: 'Error al vincular la cuenta. Intenta de nuevo.' };
    }

    return { success: true, message: '¡Cuenta vinculada exitosamente! Ya puedes empezar a registrar movimientos.' };
  },

  /**
   * Unlinks a Telegram Chat ID from a user account
   */
  async unlinkAccount(chatId: string) {
    const { error } = await supabase
      .from('profile')
      .update({ telegram_chat_id: null })
      .eq('telegram_chat_id', chatId.toString());

    if (error) {
      return false;
    }
    return true;
  },

  /**
   * Adds a new transaction for the user
   */
  async addTransaction(data: TransactionData) {
    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: data.userId,
        type: data.type,
        amount: data.amount,
        category: data.category,
        notes: data.notes
      });

    if (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
    return true;
  },

  /**
   * Adds a new debt for the user
   */
  async addDebt(data: DebtData) {
    const { error } = await supabase
      .from('debts')
      .insert({
        user_id: data.userId,
        creditor: data.creditor,
        amount: data.amount,
        due_date: data.dueDate,
        notes: data.notes
      });

    if (error) {
      console.error('Error adding debt:', error);
      throw error;
    }
    return true;
  },

  /**
   * Gets the recent transactions or summaries for the user based on a query
   */
  async getTransactionsSummary(userId: string) {
    const [
      { data: profile },
      { data: txs },
      { data: dbts },
      { data: invs },
      { data: svgs },
      { data: lns }
    ] = await Promise.all([
      supabase.from('profile').select('initial_balance').eq('id', userId).single(),
      supabase.from('transactions').select('type, amount').eq('user_id', userId),
      supabase.from('debts').select('amount, status').eq('user_id', userId),
      supabase.from('investments').select('current_value, status').eq('user_id', userId),
      supabase.from('savings').select('current_amount').eq('user_id', userId),
      supabase.from('loans').select('principal, status').eq('user_id', userId)
    ]);

    let initialBalance = Number(profile?.initial_balance || 0);
    let totalIncome = 0;
    let totalExpense = 0;
    
    (txs || []).forEach(t => {
      if (t.type === 'income') totalIncome += Number(t.amount);
      if (t.type === 'expense') totalExpense += Number(t.amount);
    });

    let totalDebts = 0;
    (dbts || []).forEach(d => {
      if (d.status === 'pending') totalDebts += Number(d.amount);
    });

    let totalInvestments = 0;
    (invs || []).forEach(i => {
      if (i.status === 'active') totalInvestments += Number(i.current_value);
    });

    let totalSavings = 0;
    (svgs || []).forEach(s => {
      totalSavings += Number(s.current_amount);
    });
    
    let totalLoansOut = 0;
    (lns || []).forEach(l => {
      if (l.status === 'active') totalLoansOut += Number(l.principal);
    });

    const liquidAssets = initialBalance + totalIncome - totalExpense;
    const netWorth = liquidAssets + totalInvestments - totalDebts + totalSavings + totalLoansOut;

    return { 
      activos_liquidos: liquidAssets,
      ingresos_totales_historicos: totalIncome,
      gastos_totales_historicos: totalExpense,
      deudas_totales: totalDebts,
      inversiones_totales: totalInvestments,
      ahorros_totales: totalSavings,
      prestamos_por_cobrar: totalLoansOut,
      patrimonio_neto: netWorth
    };
  },

  /**
   * Gets user categories from past transactions
   */
  async getUserCategories(userId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('category')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    const categories = new Set(data.map(t => t.category));
    return Array.from(categories);
  }
};
