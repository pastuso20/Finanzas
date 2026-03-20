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

  fetchData: async () => {
    set({ isLoading: true });
    try {
      const [
        { data: profile },
        { data: txs },
        { data: lns },
        { data: invs },
        { data: dbts }
      ] = await Promise.all([
        supabase.from('profile').select('*').single(),
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('loans').select('*').order('due_date', { ascending: true }),
        supabase.from('investments').select('*').order('purchase_date', { ascending: false }),
        supabase.from('debts').select('*').order('due_date', { ascending: true })
      ]);

      if (profile) {
        set({ userName: profile.user_name, initialBalance: profile.initial_balance.toString() });
      } else {
        // Create initial profile if it doesn't exist
        await supabase.from('profile').insert({ user_name: 'David Aite', initial_balance: 0 });
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
    const { data, error } = await supabase.from('profile').update({ user_name: name }).eq('id', (await supabase.from('profile').select('id').single()).data?.id);
    if (!error) set({ userName: name });
  },

  setInitialBalance: async (amount) => {
    const { data, error } = await supabase.from('profile').update({ initial_balance: parseFloat(amount) }).eq('id', (await supabase.from('profile').select('id').single()).data?.id);
    if (!error) set({ initialBalance: amount });
  },

  addTransaction: async (tx) => {
    const { data, error } = await supabase.from('transactions').insert({
      type: tx.type,
      amount: parseFloat(tx.amount),
      category: tx.category,
      date: tx.date,
      notes: tx.notes
    }).select().single();
    if (!error && data) set((state) => ({ transactions: [data, ...state.transactions] }));
  },

  addLoan: async (loan) => {
    const { data, error } = await supabase.from('loans').insert({
      borrower: loan.borrower,
      principal: parseFloat(loan.principal),
      interest_rate: parseFloat(loan.interestRate),
      due_date: loan.dueDate,
      start_date: loan.startDate,
      status: loan.status
    }).select().single();
    if (!error && data) set((state) => ({ loans: [data, ...state.loans] }));
  },

  addInvestment: async (inv) => {
    const { data, error } = await supabase.from('investments').insert({
      asset_name: inv.assetName,
      description: inv.description,
      initial_investment: parseFloat(inv.initialInvestment),
      current_value: parseFloat(inv.currentValue),
      purchase_date: inv.purchaseDate
    }).select().single();
    if (!error && data) set((state) => ({ investments: [data, ...state.investments] }));
  },

  updateInvestmentValue: async (id, newValue) => {
    const { error } = await supabase.from('investments').update({ current_value: parseFloat(newValue) }).eq('id', id);
    if (!error) set((state) => ({
      investments: state.investments.map(inv => inv.id === id ? { ...inv, currentValue: newValue } : inv)
    }));
  },

  addDebt: async (debt) => {
    const { data, error } = await supabase.from('debts').insert({
      creditor: debt.creditor,
      amount: parseFloat(debt.amount),
      due_date: debt.dueDate,
      status: debt.status,
      notes: debt.notes
    }).select().single();
    if (!error && data) set((state) => ({ debts: [data, ...state.debts] }));
  },

  toggleDebtStatus: async (id) => {
    const debt = get().debts.find(d => d.id === id);
    if (!debt) return;
    const newStatus = debt.status === 'pending' ? 'paid' : 'pending';
    const { error } = await supabase.from('debts').update({ status: newStatus }).eq('id', id);
    if (!error) set((state) => ({
      debts: state.debts.map(d => d.id === id ? { ...d, status: newStatus } : d)
    }));
  },

  updateDebtAmount: async (id, newAmount) => {
    const { error } = await supabase.from('debts').update({ amount: parseFloat(newAmount) }).eq('id', id);
    if (!error) set((state) => ({
      debts: state.debts.map(d => d.id === id ? { ...d, amount: newAmount } : d)
    }));
  },

  updateTransactionAmount: async (id, newAmount) => {
    const { error } = await supabase.from('transactions').update({ amount: parseFloat(newAmount) }).eq('id', id);
    if (!error) set((state) => ({
      transactions: state.transactions.map(t => t.id === id ? { ...t, amount: newAmount } : t)
    }));
  },

  updateLoanPrincipal: async (id, newPrincipal) => {
    const { error } = await supabase.from('loans').update({ principal: parseFloat(newPrincipal) }).eq('id', id);
    if (!error) set((state) => ({
      loans: state.loans.map(l => l.id === id ? { ...l, principal: newPrincipal } : l)
    }));
  },

  clearAllData: async () => {
    await Promise.all([
      supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('loans').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('investments').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('debts').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    ]);
    set({ transactions: [], loans: [], investments: [], debts: [] });
  },

  deleteTransaction: async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) set((state) => ({ transactions: state.transactions.filter(t => t.id !== id) }));
  },

  deleteLoan: async (id) => {
    const { error } = await supabase.from('loans').delete().eq('id', id);
    if (!error) set((state) => ({ loans: state.loans.filter(l => l.id !== id) }));
  },

  deleteInvestment: async (id) => {
    const { error } = await supabase.from('investments').delete().eq('id', id);
    if (!error) set((state) => ({ investments: state.investments.filter(inv => inv.id !== id) }));
  },

  deleteDebt: async (id) => {
    const { error } = await supabase.from('debts').delete().eq('id', id);
    if (!error) set((state) => ({ debts: state.debts.filter(d => d.id !== id) }));
  }
}));
