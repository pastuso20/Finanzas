import Decimal from 'decimal.js';
import { Transaction, Loan, Investment, Debt, Saving } from './types';
import { getCashBalance } from './utils';

export interface FinanceSnapshot {
  initialBalance: string;
  transactions: Transaction[];
  loans: Loan[];
  investments: Investment[];
  debts: Debt[];
  savings: Saving[];
}

export function selectCashBalance(state: FinanceSnapshot): Decimal {
  return getCashBalance(state.initialBalance, state.transactions);
}

export function selectActiveInvestmentsValue(investments: Investment[]): Decimal {
  return investments
    .filter(inv => inv.status === 'active')
    .reduce((acc, inv) => acc.plus(new Decimal(inv.currentValue)), new Decimal(0));
}

export function selectTotalSavings(savings: Saving[]): Decimal {
  return savings.reduce((acc, s) => acc.plus(new Decimal(s.currentAmount)), new Decimal(0));
}

export function selectActiveLoansPrincipal(loans: Loan[]): Decimal {
  return loans
    .filter(l => l.status === 'active')
    .reduce((acc, l) => acc.plus(new Decimal(l.principal)), new Decimal(0));
}

export function selectPendingDebts(debts: Debt[]): Decimal {
  return debts
    .filter(d => d.status === 'pending')
    .reduce((acc, d) => acc.plus(new Decimal(d.amount)), new Decimal(0));
}

export function selectNetWorth(state: FinanceSnapshot): Decimal {
  return selectActiveInvestmentsValue(state.investments)
    .plus(selectActiveLoansPrincipal(state.loans))
    .plus(selectCashBalance(state))
    .plus(selectTotalSavings(state.savings))
    .minus(selectPendingDebts(state.debts));
}
