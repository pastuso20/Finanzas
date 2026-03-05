export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: string; // Storing as string to use with decimal.js
  category: string;
  date: string; // ISO string
  notes?: string;
}

export interface Loan {
  id: string;
  borrower: string;
  principal: string;
  interestRate: string; // Annual percentage
  dueDate: string;
  startDate: string;
  status: 'active' | 'paid' | 'overdue';
}

export interface Investment {
  id: string;
  assetName: string;
  symbol: string;
  initialInvestment: string;
  currentValue: string;
  purchaseDate: string;
}

export interface NetWorthDataPoint {
  date: string;
  value: number;
}
