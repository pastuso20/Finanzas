import { create } from 'zustand';
import { Transaction, Loan, Investment, Debt, NetWorthDataPoint } from './types';
import Decimal from 'decimal.js';
import { subMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from './supabase';

interface FinanceState {
  userName: string;
  initialBalance: string;
  transactions: Transaction[];
  loans: Loan[];
  investments: Investment[];
  debts: Debt[];
  isLoading: boolean;
  userId: string | null;

  // Actions
  fetchData: () => Promise<void>;
  setUserName: (name: string) => Promise<void>;
  setInitialBalance: (amount: string) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  addLoan: (loan: Omit<Loan, 'id'>) => Promise<void>;
  addInvestment: (inv: Omit<Investment, 'id'>) => Promise<void>;
  updateInvestmentValue: (id: string, newValue: string) => Promise<void>;
  addDebt: (debt: Omit<Debt, 'id'>) => Promise<void>;
  toggleDebtStatus: (id: string) => Promise<void>;
  updateDebtAmount: (id: string, newAmount: string) => Promise<void>;
  updateTransactionAmount: (id: string, newAmount: string) => Promise<void>;
  updateLoanPrincipal: (id: string, newPrincipal: string) => Promise<void>;
  clearAllData: () => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  userName: 'David Aite',
  initialBalance: '0',
  transactions: [],
  loans: [],
  investments: [],
  debts: [],
  isLoading: true,
  userId: null,

  fetchData: async () => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        set({ isLoading: false, userId: null });
        return;
      }

      set({ userId: user.id });

      const [
        { data: profile, error: profileError },
        { data: txs },
        { data: lns },
        { data: invs },
        { data: dbts }
      ] = await Promise.all([
        supabase.from('profile').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('loans').select('*').eq('user_id', user.id).order('due_date', { ascending: true }),
        supabase.from('investments').select('*').eq('user_id', user.id).order('purchase_date', { ascending: false }),
        supabase.from('debts').select('*').eq('user_id', user.id).order('due_date', { ascending: true })
      ]);

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      if (profile) {
        set({ userName: profile.user_name, initialBalance: profile.initial_balance.toString() });
      } else {
        // Create initial profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profile')
          .insert({ id: user.id, user_name: 'David Aite', initial_balance: 0 })
          .select()
          .maybeSingle();

        if (createError) {
          console.error('Error creating profile:', createError);
        } else if (newProfile) {
          set({ userName: newProfile.user_name, initialBalance: newProfile.initial_balance.toString() });
        }
      }

      set({
        transactions: txs || [],
        loans: lns || [],
        investments: invs || [],
        debts: dbts || [],
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      set({ isLoading: false });
    }
  },

  setUserName: async (name) => {
    const { userId } = get();
    if (userId) {
      const { error } = await supabase.from('profile').update({ user_name: name }).eq('id', userId);
      if (!error) set({ userName: name });
    }
  },

  setInitialBalance: async (amount) => {
    const { userId } = get();
    if (userId) {
      const { error } = await supabase.from('profile').update({ initial_balance: parseFloat(amount) }).eq('id', userId);
      if (!error) set({ initialBalance: amount });
    }
  },

  addTransaction: async (tx) => {
    const { userId } = get();
    if (!userId) return;
    const { data, error } = await supabase.from('transactions').insert({
      user_id: userId,
      type: tx.type,
      amount: parseFloat(tx.amount),
      category: tx.category,
      date: tx.date,
      notes: tx.notes
    }).select().maybeSingle();
    if (!error && data) set((state) => ({ transactions: [data, ...state.transactions] }));
  },

  addLoan: async (loan) => {
    const { userId } = get();
    if (!userId) return;
    const { data, error } = await supabase.from('loans').insert({
      user_id: userId,
      borrower: loan.borrower,
      principal: parseFloat(loan.principal),
      interest_rate: parseFloat(loan.interestRate),
      due_date: loan.dueDate,
      start_date: loan.startDate,
      status: loan.status
    }).select().maybeSingle();
    if (!error && data) set((state) => ({ loans: [data, ...state.loans] }));
  },

  addInvestment: async (inv) => {
    const { userId } = get();
    if (!userId) return;
    const { data, error } = await supabase.from('investments').insert({
      user_id: userId,
      asset_name: inv.assetName,
      description: inv.description,
      initial_investment: parseFloat(inv.initialInvestment),
      current_value: parseFloat(inv.currentValue),
      purchase_date: inv.purchaseDate
    }).select().maybeSingle();
    if (!error && data) set((state) => ({ investments: [data, ...state.investments] }));
  },

  updateInvestmentValue: async (id, newValue) => {
    const { userId } = get();
    if (!userId) return;
    const { error } = await supabase.from('investments').update({ current_value: parseFloat(newValue) }).eq('id', id).eq('user_id', userId);
    if (!error) set((state) => ({
      investments: state.investments.map(inv => inv.id === id ? { ...inv, currentValue: newValue } : inv)
    }));
  },

  addDebt: async (debt) => {
    const { userId } = get();
    if (!userId) return;
    const { data, error } = await supabase.from('debts').insert({
      user_id: userId,
      creditor: debt.creditor,
      amount: parseFloat(debt.amount),
      due_date: debt.dueDate,
      status: debt.status,
      notes: debt.notes
    }).select().maybeSingle();
    if (!error && data) set((state) => ({ debts: [data, ...state.debts] }));
  },

  toggleDebtStatus: async (id) => {
    const { debts, userId } = get();
    if (!userId) return;
    const debt = debts.find(d => d.id === id);
    if (!debt) return;
    const newStatus = debt.status === 'pending' ? 'paid' : 'pending';
    const { error } = await supabase.from('debts').update({ status: newStatus }).eq('id', id).eq('user_id', userId);
    if (!error) set((state) => ({
      debts: state.debts.map(d => d.id === id ? { ...d, status: newStatus } : d)
    }));
  },

  updateDebtAmount: async (id, newAmount) => {
    const { userId } = get();
    if (!userId) return;
    const { error } = await supabase.from('debts').update({ amount: parseFloat(newAmount) }).eq('id', id).eq('user_id', userId);
    if (!error) set((state) => ({
      debts: state.debts.map(d => d.id === id ? { ...d, amount: newAmount } : d)
    }));
  },

  updateTransactionAmount: async (id, newAmount) => {
    const { userId } = get();
    if (!userId) return;
    const { error } = await supabase.from('transactions').update({ amount: parseFloat(newAmount) }).eq('id', id).eq('user_id', userId);
    if (!error) set((state) => ({
      transactions: state.transactions.map(t => t.id === id ? { ...t, amount: newAmount } : t)
    }));
  },

  updateLoanPrincipal: async (id, newPrincipal) => {
    const { userId } = get();
    if (!userId) return;
    const { error } = await supabase.from('loans').update({ principal: parseFloat(newPrincipal) }).eq('id', id).eq('user_id', userId);
    if (!error) set((state) => ({
      loans: state.loans.map(l => l.id === id ? { ...l, principal: newPrincipal } : l)
    }));
  },

  clearAllData: async () => {
    const { userId } = get();
    if (!userId) return;
    await Promise.all([
      supabase.from('transactions').delete().eq('user_id', userId),
      supabase.from('loans').delete().eq('user_id', userId),
      supabase.from('investments').delete().eq('user_id', userId),
      supabase.from('debts').delete().eq('user_id', userId)
    ]);
    set({ transactions: [], loans: [], investments: [], debts: [] });
  },

  deleteTransaction: async (id) => {
    const { userId } = get();
    if (!userId) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', userId);
    if (!error) set((state) => ({ transactions: state.transactions.filter(t => t.id !== id) }));
  },

  deleteLoan: async (id) => {
    const { userId } = get();
    if (!userId) return;
    const { error } = await supabase.from('loans').delete().eq('id', id).eq('user_id', userId);
    if (!error) set((state) => ({ loans: state.loans.filter(l => l.id !== id) }));
  },

  deleteInvestment: async (id) => {
    const { userId } = get();
    if (!userId) return;
    const { error } = await supabase.from('investments').delete().eq('id', id).eq('user_id', userId);
    if (!error) set((state) => ({ investments: state.investments.filter(inv => inv.id !== id) }));
  },

  deleteDebt: async (id) => {
    const { userId } = get();
    if (!userId) return;
    const { error } = await supabase.from('debts').delete().eq('id', id).eq('user_id', userId);
    if (!error) set((state) => ({ debts: state.debts.filter(d => d.id !== id) }));
  }
}));
