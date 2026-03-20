import { create } from 'zustand';
import { Transaction, Loan, Investment, Debt, NetWorthDataPoint } from './types';
import Decimal from 'decimal.js';
import { subMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface FinanceState {
  userName: string;
  initialBalance: string;
  transactions: Transaction[];
  loans: Loan[];
  investments: Investment[];
  debts: Debt[];

  // Actions
  setUserName: (name: string) => void;
  setInitialBalance: (amount: string) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  addLoan: (loan: Omit<Loan, 'id'>) => void;
  addInvestment: (inv: Omit<Investment, 'id'>) => void;
  updateInvestmentValue: (id: string, newValue: string) => void;
  addDebt: (debt: Omit<Debt, 'id'>) => void;
  toggleDebtStatus: (id: string) => void;
  updateDebtAmount: (id: string, newAmount: string) => void;
  updateTransactionAmount: (id: string, newAmount: string) => void;
  updateLoanPrincipal: (id: string, newPrincipal: string) => void;
  clearAllData: () => void;
  deleteTransaction: (id: string) => void;
  deleteLoan: (id: string) => void;
  deleteInvestment: (id: string) => void;
  deleteDebt: (id: string) => void;
}

// Generate some initial mock data for the dashboard
const generateMockNetWorth = (): NetWorthDataPoint[] => {
  const data: NetWorthDataPoint[] = [];
  let currentVal = 50000000;
  for (let i = 6; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    data.push({
      date: format(date, 'MMM yyyy', { locale: es }),
      value: currentVal
    });
    currentVal += Math.random() * 5000000 - 1000000; // Random fluctuation
  }
  return data;
};

export const useFinanceStore = create<FinanceState>((set) => ({
  userName: 'David Aite',
  initialBalance: '25000000',
  transactions: [
    { id: '1', type: 'income', amount: '8500000', category: 'Salario', date: new Date().toISOString(), notes: 'Salario mensual' },
    { id: '2', type: 'expense', amount: '120500', category: 'Restaurante', date: new Date().toISOString(), notes: 'Cena en restaurante' },
  ],
  loans: [
    { id: '1', borrower: 'Alice Gómez', principal: '5000000', interestRate: '5.0', startDate: subMonths(new Date(), 2).toISOString(), dueDate: new Date(Date.now() + 86400000 * 15).toISOString(), status: 'active' }
  ],
  investments: [
    { id: '1', assetName: 'Inversión en Startup', description: 'Tecnología agrícola', initialInvestment: '15000000', currentValue: '18500000', purchaseDate: subMonths(new Date(), 12).toISOString() },
    { id: '2', assetName: 'Restaurante Local', description: 'Participación 10%', initialInvestment: '25000000', currentValue: '24100000', purchaseDate: subMonths(new Date(), 6).toISOString() },
  ],
  debts: [
    { id: '1', creditor: 'Banco Nacional', amount: '2500000', dueDate: subMonths(new Date(), -1).toISOString(), status: 'pending', notes: 'Préstamo personal' },
    { id: '2', creditor: 'Tarjeta de Crédito', amount: '850000', dueDate: subMonths(new Date(), -2).toISOString(), status: 'paid', notes: 'Pago de equipo' }
  ],

  setUserName: (name) => set({ userName: name }),
  setInitialBalance: (amount) => set({ initialBalance: amount }),

  addTransaction: (tx) => set((state) => ({
    transactions: [...state.transactions, { ...tx, id: Math.random().toString(36).substring(7) }]
  })),

  addLoan: (loan) => set((state) => ({
    loans: [...state.loans, { ...loan, id: Math.random().toString(36).substring(7) }]
  })),

  addInvestment: (inv) => set((state) => ({
    investments: [...state.investments, { ...inv, id: Math.random().toString(36).substring(7) }]
  })),

  updateInvestmentValue: (id, newValue) => set((state) => ({
    investments: state.investments.map(inv => inv.id === id ? { ...inv, currentValue: newValue } : inv)
  })),

  addDebt: (debt) => set((state) => ({
    debts: [...state.debts, { ...debt, id: Math.random().toString(36).substring(7) }]
  })),

  toggleDebtStatus: (id) => set((state) => ({
    debts: state.debts.map(debt => debt.id === id ? { ...debt, status: debt.status === 'pending' ? 'paid' : 'pending' } : debt)
  })),

  updateDebtAmount: (id, newAmount) => set((state) => ({
    debts: state.debts.map(debt => debt.id === id ? { ...debt, amount: newAmount } : debt)
  })),

  updateTransactionAmount: (id, newAmount) => set((state) => ({
    transactions: state.transactions.map(t => t.id === id ? { ...t, amount: newAmount } : t)
  })),

  updateLoanPrincipal: (id, newPrincipal) => set((state) => ({
    loans: state.loans.map(l => l.id === id ? { ...l, principal: newPrincipal } : l)
  })),

  clearAllData: () => set({
    transactions: [],
    loans: [],
    investments: [],
    debts: []
  }),

  deleteTransaction: (id) => set((state) => ({
    transactions: state.transactions.filter(t => t.id !== id)
  })),

  deleteLoan: (id) => set((state) => ({
    loans: state.loans.filter(l => l.id !== id)
  })),

  deleteInvestment: (id) => set((state) => ({
    investments: state.investments.filter(inv => inv.id !== id)
  })),

  deleteDebt: (id) => set((state) => ({
    debts: state.debts.filter(d => d.id !== id)
  }))
}));
