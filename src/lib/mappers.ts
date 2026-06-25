import { Transaction, Loan, Investment, Debt, Saving } from '../types';

/** Coerce Supabase numeric values to string for Decimal.js */
export function strAmount(value: unknown, fallback = '0'): string {
  return String(value ?? fallback);
}

export function mapTransactionRow(r: Record<string, unknown>): Transaction {
  return {
    id: r.id as string,
    type: r.type as Transaction['type'],
    amount: strAmount(r.amount),
    category: r.category as string,
    date: r.date as string,
    notes: r.notes as string | undefined,
  };
}

export function mapLoanRow(r: Record<string, unknown>): Loan {
  return {
    id: r.id as string,
    borrower: r.borrower as string,
    principal: strAmount(r.principal),
    interestRate: strAmount(r.interest_rate),
    startDate: r.start_date as string,
    dueDate: r.due_date as string,
    status: r.status as Loan['status'],
  };
}

export function mapInvestmentRow(r: Record<string, unknown>): Investment {
  return {
    id: r.id as string,
    assetName: r.asset_name as string,
    description: r.description as string,
    initialInvestment: strAmount(r.initial_investment),
    productPricePerUnit: strAmount(r.product_price_per_unit ?? r.current_value),
    totalProductQuantity: strAmount(r.total_product_quantity, '1'),
    currentValue: strAmount(r.current_value),
    purchaseDate: r.purchase_date as string,
    status: r.status === 'completed' ? 'completed' : 'active',
  };
}

export function mapDebtRow(r: Record<string, unknown>): Debt {
  return {
    id: r.id as string,
    creditor: r.creditor as string,
    amount: strAmount(r.amount),
    dueDate: r.due_date as string,
    status: r.status as Debt['status'],
    notes: r.notes as string | undefined,
  };
}

export function mapSavingRow(r: Record<string, unknown>): Saving {
  return {
    id: r.id as string,
    name: r.name as string,
    category: r.category as string,
    currentAmount: strAmount(r.current_amount),
    goalAmount: strAmount(r.goal_amount),
    startDate: r.start_date as string,
    notes: r.notes as string | undefined,
  };
}
