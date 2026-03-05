import React, { useState } from 'react';
import { useFinanceStore } from '../store';
import { Card, Button, Input, Label, cn } from '../components/ui';
import { Plus, Minus, Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Decimal from 'decimal.js';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '../utils';

export function Transactions() {
  const { transactions, addTransaction } = useFinanceStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTx, setNewTx] = useState({ type: 'expense' as 'income' | 'expense', amount: '', category: '', date: new Date().toISOString().split('T')[0], notes: '' });
  const [filter, setFilter] = useState('all');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.amount || !newTx.category) return;

    addTransaction({
      type: newTx.type,
      amount: newTx.amount,
      category: newTx.category,
      date: new Date(newTx.date).toISOString(),
      notes: newTx.notes
    });

    setNewTx({ type: 'expense', amount: '', category: '', date: new Date().toISOString().split('T')[0], notes: '' });
    setShowAddForm(false);
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncome = transactions.filter(tx => tx.type === 'income').reduce((acc, tx) => acc.plus(new Decimal(tx.amount)), new Decimal(0));
  const totalExpense = transactions.filter(tx => tx.type === 'expense').reduce((acc, tx) => acc.plus(new Decimal(tx.amount)), new Decimal(0));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-emerald-500 tracking-tight">Transacciones</h2>
          <p className="text-slate-600 mt-1">Gestiona tus ingresos y gastos</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
          {showAddForm ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancelar' : 'Nueva Entrada'}
        </Button>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl neu-inset flex items-center justify-center">
            <ArrowUpRight className="w-7 h-7 text-emerald-500 drop-shadow-sm" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Ingresos Totales</p>
            <p className="text-3xl font-bold text-charcoal-900 font-mono drop-shadow-sm">{formatCurrency(totalIncome)}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl neu-inset flex items-center justify-center">
            <ArrowDownRight className="w-7 h-7 text-rose-500 drop-shadow-sm" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Gastos Totales</p>
            <p className="text-3xl font-bold text-charcoal-900 font-mono drop-shadow-sm">{formatCurrency(totalExpense)}</p>
          </div>
        </Card>
      </div>

      {showAddForm && (
        <Card className="mb-6 border-emerald-500/30">
          <form onSubmit={handleAdd} className="space-y-6">
            <div className="flex gap-4 mb-4 p-1 neu-inset rounded-2xl">
              <button
                type="button"
                className={cn("flex-1 py-3 rounded-xl text-sm font-bold transition-all", newTx.type === 'expense' ? "neu-button bg-rose-50/50 text-rose-600" : "bg-transparent text-slate-500 hover:text-charcoal-900")}
                onClick={() => setNewTx({ ...newTx, type: 'expense' })}
              >
                Gasto
              </button>
              <button
                type="button"
                className={cn("flex-1 py-3 rounded-xl text-sm font-bold transition-all", newTx.type === 'income' ? "neu-button bg-emerald-50/50 text-emerald-600" : "bg-transparent text-slate-500 hover:text-charcoal-900")}
                onClick={() => setNewTx({ ...newTx, type: 'income' })}
              >
                Ingreso
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto ($)</Label>
                <Input id="amount" type="number" step="1" value={newTx.amount} onChange={e => setNewTx({ ...newTx, amount: e.target.value })} placeholder="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Input id="category" value={newTx.category} onChange={e => setNewTx({ ...newTx, category: e.target.value })} placeholder="Ej. Supermercado, Salario" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" type="date" value={newTx.date} onChange={e => setNewTx({ ...newTx, date: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas (Opcional)</Label>
                <Input id="notes" value={newTx.notes} onChange={e => setNewTx({ ...newTx, notes: e.target.value })} placeholder="Agrega una nota..." />
              </div>
            </div>
            <div className="pt-4">
              <Button type="submit" className="w-full">Guardar Transacción</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filters & List */}
      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b border-white/40 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/20">
          <div className="flex flex-wrap justify-center gap-2 p-1 neu-inset rounded-2xl w-full md:w-auto">
            <button onClick={() => setFilter('all')} className={cn("px-4 py-1.5 text-xs font-bold rounded-xl transition-all", filter === 'all' ? "neu-button text-emerald-600" : "text-slate-500")}>Todo</button>
            <button onClick={() => setFilter('income')} className={cn("px-4 py-1.5 text-xs font-bold rounded-xl transition-all", filter === 'income' ? "neu-button text-emerald-600" : "text-slate-500")}>Ingresos</button>
            <button onClick={() => setFilter('expense')} className={cn("px-4 py-1.5 text-xs font-bold rounded-xl transition-all", filter === 'expense' ? "neu-button text-rose-500" : "text-slate-500")}>Gastos</button>
          </div>
          <div className="relative w-full md:w-auto">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input className="pl-10 h-10 text-sm w-full md:w-64 border-none" placeholder="Buscar transacciones..." />
          </div>
        </div>

        <div className="p-4 space-y-3">
          {filteredTransactions.map(tx => (
            <div key={tx.id} className="p-4 neu-button flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center neu-inset",
                  tx.type === 'income' ? "text-emerald-500" : "text-rose-500"
                )}>
                  {tx.type === 'income' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                </div>
                <div>
                  <p className="font-bold text-charcoal-900 drop-shadow-sm text-lg">{tx.category}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                    <span>{format(new Date(tx.date), "dd 'de' MMM, yyyy", { locale: es })}</span>
                    {tx.notes && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span className="truncate max-w-[200px]">{tx.notes}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <p className={cn(
                "font-mono font-bold text-xl drop-shadow-sm",
                tx.type === 'income' ? "text-emerald-600" : "text-rose-600"
              )}>
                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
              </p>
            </div>
          ))}

          {filteredTransactions.length === 0 && (
            <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-wider text-sm rounded-2xl neu-inset">
              No se encontraron transacciones.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
