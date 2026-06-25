import Decimal from 'decimal.js';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatCurrency(value: number | string | Decimal) {
  const amount = typeof value === 'object' && value instanceof Decimal 
    ? value.toNumber() 
    : typeof value === 'string' 
      ? parseFloat(value) 
      : value;
      
  return amount.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function calcLoanInterest(principal: string | Decimal, interestRate: string | Decimal): Decimal {
  const p = principal instanceof Decimal ? principal : new Decimal(principal || '0');
  const r = interestRate instanceof Decimal ? interestRate : new Decimal(interestRate || '0');
  return p.times(r.dividedBy(100));
}

export function calcLoanTotalRepayment(principal: string | Decimal, interestRate: string | Decimal): Decimal {
  const p = principal instanceof Decimal ? principal : new Decimal(principal || '0');
  return p.plus(calcLoanInterest(p, interestRate));
}

export function getCashBalance(initialBalance: string, transactions: { type: string; amount: string }[]): Decimal {
  return transactions.reduce((acc, tx) => {
    return tx.type === 'income' ? acc.plus(new Decimal(tx.amount)) : acc.minus(new Decimal(tx.amount));
  }, new Decimal(initialBalance || '0'));
}

export function calcInvestmentCurrentValue(
  productPricePerUnit: string | Decimal,
  totalProductQuantity: string | Decimal
): Decimal {
  const price = productPricePerUnit instanceof Decimal ? productPricePerUnit : new Decimal(productPricePerUnit || '0');
  const qty = totalProductQuantity instanceof Decimal ? totalProductQuantity : new Decimal(totalProductQuantity || '0');
  return price.times(qty);
}

export function calcInvestmentProfit(initialInvestment: string | Decimal, currentValue: string | Decimal): Decimal {
  const initial = initialInvestment instanceof Decimal ? initialInvestment : new Decimal(initialInvestment || '0');
  const current = currentValue instanceof Decimal ? currentValue : new Decimal(currentValue || '0');
  return current.minus(initial);
}

export function calcInvestmentROI(initialInvestment: string | Decimal, currentValue: string | Decimal): Decimal {
  const initial = initialInvestment instanceof Decimal ? initialInvestment : new Decimal(initialInvestment || '0');
  if (initial.isZero()) return new Decimal(0);
  return calcInvestmentProfit(initial, currentValue).dividedBy(initial).times(100);
}

/** Returns a valid Date or null */
export function safeDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isValid(d) ? d : null;
}

export function toDateInput(value: string): string {
  return safeDate(value)?.toISOString().split('T')[0] ?? '';
}

export function formatMonthYear(value: string | null | undefined): string | null {
  const d = safeDate(value);
  return d ? format(d, 'MMM yyyy', { locale: es }) : null;
}

export function sumDecimal<T>(items: T[], pick: (item: T) => string | Decimal): Decimal {
  return items.reduce((acc, item) => {
    const v = pick(item);
    return acc.plus(v instanceof Decimal ? v : new Decimal(v || '0'));
  }, new Decimal(0));
}
