import { supabase } from '../supabase';
import { Transaction } from '../types';
import { mapTransactionRow } from './mappers';

type TxInsert = Omit<Transaction, 'id'>;

export function parseMoney(value: string | number): number {
  if (typeof value === 'number') return Math.abs(value);
  let cleaned = value.toString().trim();
  // If it's a typical Colombian format like 10.000 or 1.500.000
  if (cleaned.includes('.') && !cleaned.includes(',')) {
    // If there's only one dot and exactly 3 digits after it, it might be a thousands separator
    const parts = cleaned.split('.');
    if (parts.length > 1 && parts[parts.length - 1].length === 3) {
      cleaned = cleaned.replace(/\./g, '');
    }
  } else if (cleaned.includes('.') && cleaned.includes(',')) {
    // e.g., 1.500,50 -> 1500.50
    cleaned = cleaned.replace(/\./g, '').replace(/,/g, '.');
  } else if (cleaned.includes(',')) {
    // e.g., 1500,50 -> 1500.50
    cleaned = cleaned.replace(/,/g, '.');
  }
  return Math.abs(parseFloat(cleaned) || 0);
}

export async function insertTransaction(
  userId: string,
  tx: TxInsert
): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type: tx.type,
      amount: parseMoney(tx.amount),
      category: tx.category,
      date: tx.date,
      notes: tx.notes,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error inserting transaction:', error.message);
    return null;
  }

  return data ? mapTransactionRow(data) : null;
}

export function prependTransaction(
  transactions: Transaction[],
  tx: Transaction
): Transaction[] {
  return [tx, ...transactions];
}
