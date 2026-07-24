import { create } from 'zustand';
import { Transaction, Loan, Investment, Debt, Saving } from './types';
import Decimal from 'decimal.js';
import { supabase } from './supabase';
import { getCashBalance, calcLoanTotalRepayment, calcInvestmentCurrentValue } from './utils';
import {
  mapTransactionRow,
  mapLoanRow,
  mapInvestmentRow,
  mapDebtRow,
  mapSavingRow,
} from './lib/mappers';
import { insertTransaction, prependTransaction, parseMoney } from './lib/store-helpers';

interface FinanceState {
  userName: string;
  initialBalance: string;
  transactions: Transaction[];
  loans: Loan[];
  investments: Investment[];
  debts: Debt[];
  savings: Saving[];
  isLoading: boolean;
  userId: string | null;
  telegramChatId: number | null;

  // Actions
  fetchData: () => Promise<void>;
  setUserId: (id: string | null) => void;
  setUserName: (name: string) => Promise<void>;
  setInitialBalance: (amount: string) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  addLoan: (loan: Omit<Loan, 'id'>) => Promise<boolean>;
  markLoanAsPaid: (id: string) => Promise<void>;
  updateLoan: (id: string, updates: Partial<Omit<Loan, 'id'>>) => Promise<void>;
  addInvestment: (inv: Omit<Investment, 'id' | 'currentValue' | 'status'>) => Promise<boolean>;
  markInvestmentAsCompleted: (id: string) => Promise<void>;
  updateInvestmentPrice: (id: string, newPrice: string) => Promise<void>;
  addDebt: (debt: Omit<Debt, 'id'>) => Promise<void>;
  addSaving: (saving: Omit<Saving, 'id'>) => Promise<void>;
  updateSavingAmount: (id: string, newAmount: string) => Promise<void>;
  toggleDebtStatus: (id: string) => Promise<void>;
  updateDebtAmount: (id: string, newAmount: string) => Promise<void>;
  updateTransactionAmount: (id: string, newAmount: string) => Promise<void>;
  clearAllData: () => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  deleteSaving: (id: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  userName: 'David Aite',
  initialBalance: '0',
  transactions: [],
  loans: [],
  investments: [],
  debts: [],
  savings: [],
  isLoading: true,
  userId: null,
  telegramChatId: null,

  setUserId: (id) => {
    set({ userId: id });
  },

  fetchData: async () => {
    set({ isLoading: true });
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.warn('No authenticated user found');
        set({ isLoading: false, userId: null });
        return;
      }

      const currentUserId = user.id;
      set({ userId: currentUserId });

      // Queries for data - RLS will handle filtering by user_id
      const [
        { data: profile, error: profileError },
        { data: txs, error: txsError },
        { data: lns, error: lnsError },
        { data: invs, error: invsError },
        { data: dbts, error: dbtsError },
        { data: svgs, error: svgsError }
      ] = await Promise.all([
        supabase.from('profile').select('*').maybeSingle(),
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('loans').select('*').order('due_date', { ascending: true }),
        supabase.from('investments').select('*').order('purchase_date', { ascending: false }),
        supabase.from('debts').select('*').order('due_date', { ascending: true }),
        supabase.from('savings').select('*').order('start_date', { ascending: false })
      ]);

      // Detailed logging for debugging
      if (profileError) console.error('Supabase Profile Error:', profileError.message);
      if (txsError) console.error('Supabase Transactions Error:', txsError.message);
      if (lnsError) console.error('Supabase Loans Error:', lnsError.message);
      if (invsError) console.error('Supabase Investments Error:', invsError.message);
      if (dbtsError) console.error('Supabase Debts Error:', dbtsError.message);
      if (svgsError) console.error('Supabase Savings Error:', svgsError.message);

      if (profile) {
        set({ userName: profile.user_name, initialBalance: profile.initial_balance.toString(), telegramChatId: profile.telegram_chat_id || null });
      } else if (!profileError) {
        // Auto-create profile if it doesn't exist and there was no fetch error
        console.log('Profile not found, creating one for user:', currentUserId);
        const meta = user.user_metadata || {};
        
        const { data: newProfile, error: createError } = await supabase
          .from('profile')
          .upsert({ 
             id: currentUserId, 
             user_name: meta.user_name || 'User', 
             initial_balance: meta.initial_balance || 0
          })
          .select()
          .maybeSingle();

        if (createError) {
          console.error('Error auto-creating profile:', createError.message);
        } else if (newProfile) {
          set({ userName: newProfile.user_name, initialBalance: newProfile.initial_balance.toString(), telegramChatId: newProfile.telegram_chat_id || null });
        }
      }

      const mappedTxs = (txs || []).map(mapTransactionRow);
      const mappedLoans = (lns || []).map(mapLoanRow);
      const mappedInvestments = (invs || []).map(mapInvestmentRow);
      const mappedDebts = (dbts || []).map(mapDebtRow);
      const mappedSavings = (svgs || []).map(mapSavingRow);

      set({
        transactions: mappedTxs,
        loans: mappedLoans,
        investments: mappedInvestments,
        debts: mappedDebts,
        savings: mappedSavings,
        isLoading: false
      });
    } catch (error) {
      console.error('Unexpected error in fetchData:', error);
      set({ isLoading: false });
    }
  },

  setUserName: async (name) => {
    const { userId } = get();
    if (!userId) {
      throw new Error('No authenticated user found');
    }
    const { error } = await supabase.from('profile').update({ user_name: name }).eq('id', userId);
    if (error) {
      console.error('Error updating user name:', error.message);
      throw new Error(error.message);
    } else {
      set({ userName: name });
    }
  },

  setInitialBalance: async (amount) => {
    const { userId } = get();
    if (!userId) {
      throw new Error('No authenticated user found');
    }
    const { error } = await supabase.from('profile').update({ initial_balance: parseMoney(amount) }).eq('id', userId);
    if (error) {
      console.error('Error updating initial balance:', error.message);
      throw new Error(error.message);
    } else {
      set({ initialBalance: amount });
    }
  },

  addTransaction: async (tx) => {
    const { userId } = get();
    if (!userId) {
      console.error('Cannot add transaction: No authenticated user');
      return;
    }

    const { data, error } = await supabase.from('transactions').insert({
      user_id: userId,
      type: tx.type,
      amount: parseMoney(tx.amount),
      category: tx.category,
      date: tx.date,
      notes: tx.notes
    }).select().maybeSingle();

    if (error) {
      console.error('Supabase Error adding transaction:', error.message);
      return;
    }

    if (data) {
      const mapped = mapTransactionRow(data);
      set((state) => ({
        transactions: [mapped, ...(state.transactions || [])]
      }));
    }
  },

  addLoan: async (loan) => {
    const { userId, transactions, initialBalance } = get();
    if (!userId) {
      console.error('Cannot add loan: No authenticated user');
      return false;
    }

    const principal = new Decimal(loan.principal || '0');
    const cash = getCashBalance(initialBalance, transactions);
    if (cash.lessThan(principal)) {
      console.error('Insufficient cash for loan');
      return false;
    }

    const { data, error } = await supabase.from('loans').insert({
      user_id: userId,
      borrower: loan.borrower,
      principal: parseMoney(loan.principal),
      interest_rate: parseMoney(loan.interestRate),
      due_date: loan.dueDate,
      start_date: loan.startDate,
      status: loan.status
    }).select().maybeSingle();

    if (error) {
      console.error('Error adding loan:', error.message);
      return false;
    }

    if (!data) return false;

    const tx = await insertTransaction(userId, {
      type: 'expense',
      amount: loan.principal,
      category: 'Préstamo',
      date: loan.startDate,
      notes: `Préstamo a ${loan.borrower}`,
    });

    if (!tx) {
      await supabase.from('loans').delete().eq('id', data.id);
      return false;
    }

    const mapped = mapLoanRow(data);

    set((state) => ({
      loans: [mapped, ...(state.loans || [])],
      transactions: prependTransaction(state.transactions || [], tx),
    }));

    return true;
  },

  markLoanAsPaid: async (id) => {
    const { userId, loans } = get();
    if (!userId) return;

    const loan = loans.find(l => l.id === id);
    if (!loan || loan.status === 'paid') return;

    const totalRepayment = calcLoanTotalRepayment(loan.principal, loan.interestRate);

    const { error: statusError } = await supabase.from('loans').update({ status: 'paid' }).eq('id', id);
    if (statusError) {
      console.error('Error marking loan as paid:', statusError.message);
      return;
    }

    const tx = await insertTransaction(userId, {
      type: 'income',
      amount: totalRepayment.toString(),
      category: 'Cobro Préstamo',
      date: new Date().toISOString(),
      notes: `Cobro de ${loan.borrower} (capital + interés)`,
    });

    if (!tx) {
      await supabase.from('loans').update({ status: loan.status }).eq('id', id);
      return;
    }

    set((state) => ({
      loans: (state.loans || []).map(l => l.id === id ? { ...l, status: 'paid' as const } : l),
      transactions: prependTransaction(state.transactions || [], tx),
    }));
  },

  updateLoan: async (id, updates) => {
    const { userId, loans, transactions, initialBalance } = get();
    if (!userId) return;

    const loan = loans.find(l => l.id === id);
    if (!loan) return;

    const dbUpdates: Record<string, unknown> = {};
    if (updates.borrower !== undefined) dbUpdates.borrower = updates.borrower;
    if (updates.interestRate !== undefined) dbUpdates.interest_rate = parseMoney(updates.interestRate);
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.principal !== undefined) dbUpdates.principal = parseMoney(updates.principal);

    if (Object.keys(dbUpdates).length === 0) return;

    if (updates.principal !== undefined && loan.status === 'active') {
      const oldPrincipal = new Decimal(loan.principal);
      const newPrincipal = new Decimal(updates.principal);
      const diff = newPrincipal.minus(oldPrincipal);

      if (!diff.isZero()) {
        const cash = getCashBalance(initialBalance, transactions);
        if (diff.isPositive() && cash.lessThan(diff)) {
          console.error('Insufficient cash to increase loan principal');
          return;
        }

        const tx = await insertTransaction(userId, {
          type: diff.isPositive() ? 'expense' : 'income',
          amount: diff.abs().toString(),
          category: 'Préstamo',
          date: new Date().toISOString(),
          notes: diff.isPositive()
            ? `Aumento préstamo a ${updates.borrower ?? loan.borrower}`
            : `Reducción préstamo a ${updates.borrower ?? loan.borrower}`,
        });

        if (!tx) {
          console.error('Error adjusting cash for loan update');
          return;
        }

        set((state) => ({
          transactions: prependTransaction(state.transactions || [], tx),
        }));
      }
    }

    const { error } = await supabase.from('loans').update(dbUpdates).eq('id', id);
    if (error) {
      console.error('Error updating loan:', error.message);
      return;
    }

    set((state) => ({
      loans: (state.loans || []).map(l => l.id === id ? { ...l, ...updates } : l),
    }));
  },

  addInvestment: async (inv) => {
    const { userId, transactions, initialBalance } = get();
    if (!userId) {
      console.error('Cannot add investment: No authenticated user');
      return false;
    }

    const capital = new Decimal(inv.initialInvestment || '0');
    const cash = getCashBalance(initialBalance, transactions);
    if (cash.lessThan(capital)) {
      console.error('Insufficient cash for investment');
      return false;
    }

    const currentValue = calcInvestmentCurrentValue(inv.productPricePerUnit, inv.totalProductQuantity);

    const { data, error } = await supabase.from('investments').insert({
      user_id: userId,
      asset_name: inv.assetName,
      description: inv.description,
      initial_investment: parseMoney(inv.initialInvestment),
      product_price_per_unit: parseMoney(inv.productPricePerUnit),
      total_product_quantity: parseMoney(inv.totalProductQuantity),
      current_value: currentValue.toNumber(),
      purchase_date: inv.purchaseDate,
      status: 'active',
    }).select().maybeSingle();

    if (error) {
      console.error('Error adding investment:', error.message);
      return false;
    }

    if (!data) return false;

    const tx = await insertTransaction(userId, {
      type: 'expense',
      amount: inv.initialInvestment,
      category: 'Inversión',
      date: inv.purchaseDate,
      notes: `Inversión en ${inv.assetName}`,
    });

    if (!tx) {
      await supabase.from('investments').delete().eq('id', data.id);
      return false;
    }

    const mapped = mapInvestmentRow(data);

    set((state) => ({
      investments: [mapped, ...(state.investments || [])],
      transactions: prependTransaction(state.transactions || [], tx),
    }));

    return true;
  },

  markInvestmentAsCompleted: async (id) => {
    const { userId, investments } = get();
    if (!userId) return;

    const inv = investments.find(i => i.id === id);
    if (!inv || inv.status === 'completed') return;

    const returnAmount = new Decimal(inv.currentValue || '0');

    const { error: statusError } = await supabase.from('investments').update({ status: 'completed' }).eq('id', id);
    if (statusError) {
      console.error('Error marking investment as completed:', statusError.message);
      return;
    }

    const tx = await insertTransaction(userId, {
      type: 'income',
      amount: returnAmount.toString(),
      category: 'Retorno Inversión',
      date: new Date().toISOString(),
      notes: `Cierre de inversión en ${inv.assetName}`,
    });

    if (!tx) {
      await supabase.from('investments').update({ status: inv.status }).eq('id', id);
      return;
    }

    set((state) => ({
      investments: (state.investments || []).map(i =>
        i.id === id ? { ...i, status: 'completed' as const } : i
      ),
      transactions: prependTransaction(state.transactions || [], tx),
    }));
  },

  updateInvestmentPrice: async (id, newPrice) => {
    const { userId, investments } = get();
    if (!userId) return;

    const inv = investments.find(i => i.id === id);
    if (!inv || inv.status === 'completed') return;

    const currentValue = calcInvestmentCurrentValue(newPrice, inv.totalProductQuantity);

    const { error } = await supabase.from('investments').update({
      product_price_per_unit: parseMoney(newPrice),
      current_value: currentValue.toNumber(),
    }).eq('id', id);

    if (error) {
      console.error('Error updating investment price:', error.message);
    } else {
      set((state) => ({
        investments: (state.investments || []).map(i =>
          i.id === id
            ? { ...i, productPricePerUnit: String(newPrice), currentValue: currentValue.toString() }
            : i
        )
      }));
    }
  },

  addDebt: async (debt) => {
    const { userId } = get();
    if (!userId) {
      console.error('Cannot add debt: No authenticated user');
      return;
    }
    const { data, error } = await supabase.from('debts').insert({
      user_id: userId,
      creditor: debt.creditor,
      amount: parseMoney(debt.amount),
      due_date: debt.dueDate,
      status: debt.status,
      notes: debt.notes
    }).select().maybeSingle();

    if (error) {
      console.error('Error adding debt:', error.message);
    } else if (data) {
      set((state) => ({ debts: [mapDebtRow(data), ...(state.debts || [])] }));
    }
  },

  addSaving: async (saving) => {
    const { userId, transactions, initialBalance } = get();
    if (!userId) {
      console.error('Cannot add saving: No authenticated user');
      return;
    }

    const amount = new Decimal(saving.currentAmount || '0');
    const cash = getCashBalance(initialBalance, transactions);
    if (amount.isPositive() && cash.lessThan(amount)) {
      console.error('Insufficient cash for saving');
      return;
    }

    const { data, error } = await supabase.from('savings').insert({
      user_id: userId,
      name: saving.name,
      category: saving.category,
      current_amount: parseMoney(saving.currentAmount),
      goal_amount: parseMoney(saving.goalAmount || '0'),
      start_date: saving.startDate,
      notes: saving.notes
    }).select().maybeSingle();

    if (error) {
      console.error('Error adding saving:', error.message);
      return;
    }

    if (!data) return;

    if (amount.isPositive()) {
      const tx = await insertTransaction(userId, {
        type: 'expense',
        amount: saving.currentAmount,
        category: 'Ahorro',
        date: saving.startDate || new Date().toISOString(),
        notes: `Aporte a ahorro: ${saving.name}`,
      });

      if (!tx) {
        await supabase.from('savings').delete().eq('id', data.id);
        return;
      }

      set((state) => ({
        savings: [mapSavingRow(data), ...(state.savings || [])],
        transactions: prependTransaction(state.transactions || [], tx),
      }));
    } else {
      set((state) => ({
        savings: [mapSavingRow(data), ...(state.savings || [])]
      }));
    }
  },

  updateSavingAmount: async (id, newAmount) => {
    const { userId, savings, transactions, initialBalance } = get();
    if (!userId) return;

    const saving = savings.find(s => s.id === id);
    if (!saving) return;

    const oldAmountDec = new Decimal(saving.currentAmount || '0');
    const newAmountDec = new Decimal(newAmount || '0');
    const diff = newAmountDec.minus(oldAmountDec);

    if (!diff.isZero()) {
      const cash = getCashBalance(initialBalance, transactions);
      if (diff.isPositive() && cash.lessThan(diff)) {
        console.error('Insufficient cash to increase saving');
        return;
      }

      const tx = await insertTransaction(userId, {
        type: diff.isPositive() ? 'expense' : 'income',
        amount: diff.abs().toString(),
        category: 'Ahorro',
        date: new Date().toISOString(),
        notes: diff.isPositive()
          ? `Aporte a ahorro: ${saving.name}`
          : `Retiro de ahorro: ${saving.name}`,
      });

      if (!tx) {
        console.error('Error adjusting cash for saving update');
        return;
      }

      set((state) => ({
        transactions: prependTransaction(state.transactions || [], tx),
      }));
    }

    const { error } = await supabase.from('savings').update({ current_amount: parseMoney(newAmount) }).eq('id', id);
    if (error) {
      console.error('Error updating saving amount:', error.message);
    } else {
      set((state) => ({
        savings: (state.savings || []).map(s => s.id === id ? { ...s, currentAmount: String(newAmount) } : s)
      }));
    }
  },

  toggleDebtStatus: async (id) => {
    const { debts, userId } = get();
    if (!userId) return;
    const debt = (debts || []).find(d => d.id === id);
    if (!debt) return;
    const newStatus = debt.status === 'pending' ? 'paid' : 'pending';
    
    const { error: statusError } = await supabase.from('debts').update({ status: newStatus }).eq('id', id);
    if (statusError) {
      console.error('Error toggling debt status:', statusError.message);
      return;
    }

    // Create transaction when marking debt as paid (expense) or pending (income to reverse)
    if (newStatus === 'paid') {
      const tx = await insertTransaction(userId, {
        type: 'expense',
        amount: debt.amount,
        category: 'Pago Deuda',
        date: new Date().toISOString(),
        notes: `Pago de deuda a ${debt.creditor}`,
      });

      if (!tx) {
        await supabase.from('debts').update({ status: debt.status }).eq('id', id);
        return;
      }

      set((state) => ({
        debts: (state.debts || []).map(d => d.id === id ? { ...d, status: newStatus } : d),
        transactions: prependTransaction(state.transactions || [], tx),
      }));
    } else {
      // When marking as pending again, create income transaction to reverse the payment
      const tx = await insertTransaction(userId, {
        type: 'income',
        amount: debt.amount,
        category: 'Reversión Pago Deuda',
        date: new Date().toISOString(),
        notes: `Reversión de pago de deuda a ${debt.creditor}`,
      });

      if (!tx) {
        await supabase.from('debts').update({ status: debt.status }).eq('id', id);
        return;
      }

      set((state) => ({
        debts: (state.debts || []).map(d => d.id === id ? { ...d, status: newStatus } : d),
        transactions: prependTransaction(state.transactions || [], tx),
      }));
    }
  },

  updateDebtAmount: async (id, newAmount) => {
    const { userId } = get();
    if (!userId) return;
    const { error } = await supabase.from('debts').update({ amount: parseMoney(newAmount) }).eq('id', id);
    if (error) {
      console.error('Error updating debt amount:', error.message);
    } else {
      set((state) => ({
        debts: (state.debts || []).map(d => d.id === id ? { ...d, amount: newAmount } : d)
      }));
    }
  },

  updateTransactionAmount: async (id, newAmount) => {
    const { userId } = get();
    if (!userId) return;
    const { error } = await supabase.from('transactions').update({ amount: parseMoney(newAmount) }).eq('id', id);
    if (error) {
      console.error('Error updating transaction amount:', error.message);
    } else {
      set((state) => ({
        transactions: (state.transactions || []).map(t => t.id === id ? { ...t, amount: newAmount } : t)
      }));
    }
  },

  deleteLoan: async (id) => {
    const { userId, loans } = get();
    if (!userId) return;

    const loan = loans.find(l => l.id === id);
    if (!loan) return;

    if (loan.status === 'active') {
      const tx = await insertTransaction(userId, {
        type: 'income',
        amount: loan.principal,
        category: 'Préstamo',
        date: new Date().toISOString(),
        notes: `Cancelación préstamo a ${loan.borrower}`,
      });

      if (!tx) return;

      set((state) => ({
        transactions: prependTransaction(state.transactions || [], tx),
      }));
    }

    const { error } = await supabase.from('loans').delete().eq('id', id);
    if (error) {
      console.error('Error deleting loan:', error.message);
    } else {
      set((state) => ({ loans: state.loans.filter(l => l.id !== id) }));
    }
  },

  clearAllData: async () => {
    const { userId } = get();
    if (!userId) return;
    const results = await Promise.all([
      supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('loans').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('investments').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('debts').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('savings').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    ]);

    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      console.error('Some errors occurred while clearing data:', errors.map(e => e.error?.message));
    }

    set({ transactions: [], loans: [], investments: [], debts: [], savings: [] });
  },

  deleteTransaction: async (id) => {
    const { userId } = get();
    if (!userId) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) {
      console.error('Error deleting transaction:', error.message);
    } else {
      set((state) => ({ transactions: state.transactions.filter(t => t.id !== id) }));
    }
  },

  deleteInvestment: async (id) => {
    const { userId } = get();
    if (!userId) return;
    const { error } = await supabase.from('investments').delete().eq('id', id);
    if (error) {
      console.error('Error deleting investment:', error.message);
    } else {
      set((state) => ({ investments: state.investments.filter(inv => inv.id !== id) }));
    }
  },

  deleteDebt: async (id) => {
    const { userId } = get();
    if (!userId) return;
    const { error } = await supabase.from('debts').delete().eq('id', id);
    if (error) {
      console.error('Error deleting debt:', error.message);
    } else {
      set((state) => ({ debts: state.debts.filter(d => d.id !== id) }));
    }
  },

  deleteSaving: async (id) => {
    const { userId, savings } = get();
    if (!userId) return;

    const saving = savings.find(s => s.id === id);
    if (!saving) return;

    const amountDec = new Decimal(saving.currentAmount || '0');

    if (amountDec.isPositive()) {
      const tx = await insertTransaction(userId, {
        type: 'income',
        amount: saving.currentAmount,
        category: 'Ahorro',
        date: new Date().toISOString(),
        notes: `Retiro por eliminación de ahorro: ${saving.name}`,
      });

      if (!tx) return;

      set((state) => ({
        transactions: prependTransaction(state.transactions || [], tx),
      }));
    }

    const { error } = await supabase.from('savings').delete().eq('id', id);
    if (error) {
      console.error('Error deleting saving:', error.message);
    } else {
      set((state) => ({ savings: state.savings.filter(s => s.id !== id) }));
    }
  }
}));
