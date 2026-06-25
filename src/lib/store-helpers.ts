import { supabase } from '../supabase';
import { Transaction } from '../types';
import { mapTransactionRow } from './mappers';

type TxInsert = Omit<Transaction, 'id'>;

export function parseMoney(value: string): number {
  return parseFloat(value);
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
