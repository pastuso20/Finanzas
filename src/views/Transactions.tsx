import React, { useState } from 'react';
import { useFinanceStore } from '../store';
import { Card, Button, Input, Label, cn } from '../components/ui';
import { Plus, Minus, Search, ArrowUpRight, ArrowDownRight, Wallet, Filter, X } from 'lucide-react';
import Decimal from 'decimal.js';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '../utils';

export function Transactions() {
  const { transactions, addTransaction } = useFinanceStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTx, setNewTx] = useState({ type: 'expense' as 'income' | 'expense', amount: '', category: '', date: new Date().toISOString().split('T')[0], notes: '' });
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.amount || !newTx.category) return;

    try {
      await addTransaction({
        type: newTx.type,
        amount: newTx.amount,
        category: newTx.category,
        date: new Date(newTx.date).toISOString(),
        notes: newTx.notes
      });

      // Clear form and close it in the next tick to ensure state is updated
      setNewTx({ type: 'expense', amount: '', category: '', date: new Date().toISOString().split('T')[0], notes: '' });
      setTimeout(() => {
        setShowAddForm(false);
      }, 0);
    } catch (error) {
      console.error('Error handling add transaction:', error);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesFilter = filter === 'all' || tx.type === filter;
    const matchesSearch = tx.category.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (tx.notes && tx.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncome = transactions.filter(tx => tx.type === 'income').reduce((acc, tx) => acc.plus(new Decimal(tx.amount)), new Decimal(0));
  const totalExpense = transactions.filter(tx => tx.type === 'expense').reduce((acc, tx) => acc.plus(new Decimal(tx.amount)), new Decimal(0));

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0" translate="no">
      {/* Mobile Title Section - Redesigned to avoid overlap */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div className="flex flex-col">
          <h2 className="text-4xl md:text-5xl font-bold text-emerald-900 tracking-tight font-serif"><span>Transacciones</span></h2>
          <p className="text-slate-400 text-sm md:text-base mt-2"><span>Gestiona tus ingresos y gastos</span></p>
        </div>
        
        {/* New Entry Button - Full width on mobile, better hierarchy */}
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="md:hidden w-full flex items-center justify-center gap-3 bg-emerald-900 text-white py-4 rounded-3xl shadow-xl shadow-emerald-900/20 active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5 text-accent-gold" />
          <span className="font-bold text-sm tracking-wide">Nueva Entrada</span>
        </button>

        {/* Desktop New Entry Button */}
        <Button onClick={() => setShowAddForm(!showAddForm)} className="hidden md:flex gap-2 rounded-2xl px-8 h-12">
          {showAddForm ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm ? 'Cancelar' : 'Nueva Entrada'}</span>
        </Button>
      </div>

      {/* Totals Section - Mobile Refined Expert UI */}
      <div className="md:hidden pt-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1"><span>TOTALES</span></p>
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex overflow-hidden">
          <div className="flex-1 p-6 flex flex-col gap-1 border-r border-slate-50">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest"><span>INGRESOS</span></p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <p className="text-xl font-bold text-emerald-900 font-mono tracking-tighter"><span>{formatCurrency(totalIncome)}</span></p>
            </div>
          </div>
          <div className="flex-1 p-6 flex flex-col gap-1">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest"><span>GASTOS</span></p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-rose-50 flex items-center justify-center">
                <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <p className="text-xl font-bold text-emerald-900 font-mono tracking-tighter"><span>{formatCurrency(totalExpense)}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Summary Cards */}
      <div className="hidden md:grid grid-cols-2 gap-6">
        <Card className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl neu-inset flex items-center justify-center">
            <ArrowUpRight className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider"><span>Ingresos Totales</span></p>
            <p className="text-3xl font-bold text-charcoal-900 font-mono"><span>{formatCurrency(totalIncome)}</span></p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl neu-inset flex items-center justify-center">
            <ArrowDownRight className="w-7 h-7 text-rose-500" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider"><span>Gastos Totales</span></p>
            <p className="text-3xl font-bold text-charcoal-900 font-mono"><span>{formatCurrency(totalExpense)}</span></p>
          </div>
        </Card>
      </div>

      {/* Search Bar - Mobile Expert UI */}
      <div className="relative group md:hidden">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar transacciones..."
          className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-100/50 border-none text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-900/10 transition-all outline-none"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Tabs - Mobile Refined */}
      <div className="flex items-center justify-between gap-1 p-1 bg-slate-100/50 rounded-2xl md:hidden">
        <button 
          onClick={() => setFilter('all')}
          className={cn("flex-1 py-3 rounded-xl text-xs font-bold transition-all", filter === 'all' ? "tab-active" : "text-slate-400")}
        >
          <span>Todo</span>
        </button>
        <button 
          onClick={() => setFilter('income')}
          className={cn("flex-1 py-3 rounded-xl text-xs font-bold transition-all", filter === 'income' ? "tab-active" : "text-slate-400")}
        >
          <span>Ingresos</span>
        </button>
        <button 
          onClick={() => setFilter('expense')}
          className={cn("flex-1 py-3 rounded-xl text-xs font-bold transition-all", filter === 'expense' ? "tab-active" : "text-slate-400")}
        >
          <span>Gastos</span>
        </button>
      </div>

      {/* Add Form Overlay/Card */}
      {showAddForm && (
        <Card className="border-emerald-900/10 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleAdd} className="space-y-6">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                className={cn("flex-1 py-3 rounded-xl text-xs font-bold transition-all", newTx.type === 'expense' ? "bg-white text-rose-600 shadow-sm" : "text-slate-400")}
                onClick={() => setNewTx({ ...newTx, type: 'expense' })}
              >
                <span>Gasto</span>
              </button>
              <button
                type="button"
                className={cn("flex-1 py-3 rounded-xl text-xs font-bold transition-all", newTx.type === 'income' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400")}
                onClick={() => setNewTx({ ...newTx, type: 'income' })}
              >
                <span>Ingreso</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="amount" className="ml-1"><span>Monto ($)</span></Label>
                <Input id="amount" type="number" value={newTx.amount} onChange={e => setNewTx({ ...newTx, amount: e.target.value })} placeholder="0.00" className="rounded-2xl" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category" className="ml-1"><span>Categoría</span></Label>
                <Input id="category" value={newTx.category} onChange={e => setNewTx({ ...newTx, category: e.target.value })} placeholder="Ej. Alimentación" className="rounded-2xl" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date" className="ml-1"><span>Fecha</span></Label>
                <Input id="date" type="date" value={newTx.date} onChange={e => setNewTx({ ...newTx, date: e.target.value })} className="rounded-2xl" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes" className="ml-1"><span>Notas (Opcional)</span></Label>
                <Input id="notes" value={newTx.notes} onChange={e => setNewTx({ ...newTx, notes: e.target.value })} placeholder="Detalles..." className="rounded-2xl" />
              </div>
            </div>
            <div className="pt-2">
              <Button type="submit" className="w-full h-14 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold">
                <span>Guardar Transacción</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Transaction List */}
      <div className="space-y-4 notranslate">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map(tx => (
            <div key={tx.id} className="bg-white p-4 rounded-3xl border border-slate-50 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  tx.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
                )}>
                  {tx.type === 'income' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                </div>
                <div>
                  <p className="font-bold text-emerald-900 text-base"><span>{tx.category}</span></p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    <span>{format(new Date(tx.date), "dd 'de' MMM, yyyy", { locale: es })}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  "font-mono font-bold text-lg",
                  tx.type === 'income' ? "text-emerald-700" : "text-rose-600"
                )}>
                  <span>{tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}</span>
                </p>
                {tx.notes && <p className="text-[9px] text-slate-400 mt-0.5 italic max-w-[100px] truncate"><span>{tx.notes}</span></p>}
              </div>
            </div>
          ))
        ) : (
          <div key="empty-state" className="py-20 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Wallet className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-emerald-900 font-bold text-xl mb-2"><span>No hay registros</span></h3>
            <p className="text-slate-400 text-sm max-w-[200px] mx-auto">
              <span>Agrega tu primera transacción presionando "Nueva Entrada"</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
