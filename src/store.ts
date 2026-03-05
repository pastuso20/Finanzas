import { create } from 'zustand';
import { Transaction, Loan, Investment, NetWorthDataPoint } from './types';
import Decimal from 'decimal.js';
import { subMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface FinanceState {
  transactions: Transaction[];
  loans: Loan[];
  investments: Investment[];

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  addLoan: (loan: Omit<Loan, 'id'>) => void;
  addInvestment: (inv: Omit<Investment, 'id'>) => void;
  updateInvestmentValue: (id: string, newValue: string) => void;
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
  transactions: [
    { id: '1', type: 'income', amount: '8500000', category: 'Salario', date: new Date().toISOString(), notes: 'Salario mensual' },
    { id: '2', type: 'expense', amount: '120500', category: 'Restaurante', date: new Date().toISOString(), notes: 'Cena en restaurante' },
  ],
  loans: [
    { id: '1', borrower: 'Alice Gómez', principal: '5000000', interestRate: '5.0', startDate: subMonths(new Date(), 2).toISOString(), dueDate: new Date(Date.now() + 86400000 * 15).toISOString(), status: 'active' }
  ],
  investments: [
    { id: '1', assetName: 'Apple Inc.', symbol: 'AAPL', initialInvestment: '15000000', currentValue: '18500000', purchaseDate: subMonths(new Date(), 12).toISOString() },
    { id: '2', assetName: 'S&P 500 ETF', symbol: 'VOO', initialInvestment: '25000000', currentValue: '24100000', purchaseDate: subMonths(new Date(), 6).toISOString() },
    { id: '3', assetName: 'Bitcoin', symbol: 'BTC', initialInvestment: '5000000', currentValue: '5500000', purchaseDate: subMonths(new Date(), 1).toISOString() }
  ],

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
  }))
}));
