import React, { useState } from 'react';
import { useFinanceStore } from '../store';
import { Card, Button, Input, Label, cn } from '../components/ui';
import { Plus, Minus, CreditCard, Calendar, AlertCircle, CheckCircle2, History } from 'lucide-react';
import Decimal from 'decimal.js';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '../utils';

export function Debts() {
  const { debts, addDebt, toggleDebtStatus } = useFinanceStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDebt, setNewDebt] = useState({ creditor: '', amount: '', dueDate: '', notes: '' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDebt.creditor || !newDebt.amount || !newDebt.dueDate) return;

    addDebt({
      creditor: newDebt.creditor,
      amount: newDebt.amount,
      dueDate: new Date(newDebt.dueDate).toISOString(),
      status: 'pending',
      notes: newDebt.notes
    });

    setNewDebt({ creditor: '', amount: '', dueDate: '', notes: '' });
    setShowAddForm(false);
  };

  const pendingDebts = debts.filter(d => d.status === 'pending');
  const paidDebts = debts.filter(d => d.status === 'paid');
  const totalPending = pendingDebts.reduce((acc, d) => acc.plus(new Decimal(d.amount)), new Decimal(0));

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div className="flex flex-col">
          <h2 className="text-4xl md:text-5xl font-bold text-emerald-900 tracking-tight font-serif">Deudas</h2>
          <p className="text-slate-400 text-sm md:text-base mt-2">Controla tus compromisos financieros</p>
        </div>
        
        {/* New Debt Button - Mobile Highlighted */}
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="md:hidden w-full flex items-center justify-center gap-3 bg-emerald-900 text-white py-4 rounded-3xl shadow-xl shadow-emerald-900/20 active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5 text-accent-gold" />
          <span className="font-bold text-sm tracking-wide">Nueva Deuda</span>
        </button>

        {/* Desktop New Debt Button */}
        <Button onClick={() => setShowAddForm(!showAddForm)} className="hidden md:flex gap-2 rounded-2xl px-8 h-12">
          {showAddForm ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancelar' : 'Nueva Deuda'}
        </Button>
      </header>

      {/* Summary Cards - Mobile Expert UI */}
      <div className="md:hidden pt-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">RESUMEN DE DEUDAS</p>
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
          <div className="p-6 flex justify-between items-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">TOTAL PENDIENTE</p>
            <p className="text-xl font-bold text-rose-600 font-mono tracking-tighter">{formatCurrency(totalPending)}</p>
          </div>
          <div className="p-6 flex justify-between items-center bg-slate-50/30">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ESTADO</p>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-xs font-bold text-emerald-900">{pendingDebts.length} Pend.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-emerald-900">{paidDebts.length} Pag.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Summary Cards */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col justify-center bg-white border-none shadow-sm">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">Total Pendiente de Pago</p>
          <p className="text-3xl font-bold text-rose-600 font-mono">{formatCurrency(totalPending)}</p>
        </Card>

        <Card className="flex flex-col justify-center bg-white border-none shadow-sm">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">Deudas Pendientes</p>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-rose-500" />
            <p className="text-3xl font-bold text-emerald-900 font-mono">{pendingDebts.length}</p>
          </div>
        </Card>

        <Card className="flex flex-col justify-center bg-white border-none shadow-sm">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">Deudas Pagadas</p>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <p className="text-3xl font-bold text-emerald-900 font-mono">{paidDebts.length}</p>
          </div>
        </Card>
      </div>

      {showAddForm && (
        <Card className="mb-6 border-emerald-500/30">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="creditor">Acreedor / Entidad</Label>
              <Input id="creditor" value={newDebt.creditor} onChange={e => setNewDebt({ ...newDebt, creditor: e.target.value })} placeholder="Ej. Banco, Amigo..." required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Monto ($)</Label>
              <Input id="amount" type="number" step="1" value={newDebt.amount} onChange={e => setNewDebt({ ...newDebt, amount: e.target.value })} placeholder="0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Fecha de Pago</Label>
              <Input id="dueDate" type="date" value={newDebt.dueDate} onChange={e => setNewDebt({ ...newDebt, dueDate: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (Opcional)</Label>
              <Input id="notes" value={newDebt.notes} onChange={e => setNewDebt({ ...newDebt, notes: e.target.value })} placeholder="Ej. Cuota 1/12" />
            </div>
            <Button type="submit" className="w-full">Agregar Deuda</Button>
          </form>
        </Card>
      )}

      {/* Debts List */}
      <div className="space-y-6">
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-emerald-500 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Deudas Pendientes
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {pendingDebts.map(debt => (
              <DebtCard key={debt.id} debt={debt} onToggle={toggleDebtStatus} />
            ))}
            {pendingDebts.length === 0 && (
              <p className="text-slate-500 text-sm italic py-4">No tienes deudas pendientes. ¡Excelente!</p>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-bold text-slate-400 flex items-center gap-2">
            <History className="w-5 h-5" />
            Historial de Pagos
          </h3>
          <div className="grid grid-cols-1 gap-4 opacity-75">
            {paidDebts.map(debt => (
              <DebtCard key={debt.id} debt={debt} onToggle={toggleDebtStatus} />
            ))}
            {paidDebts.length === 0 && (
              <p className="text-slate-500 text-sm italic py-4">No hay historial de pagos.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function DebtCard({ debt, onToggle }: { debt: any, onToggle: (id: string) => void }) {
  const isPaid = debt.status === 'paid';
  const isOverdue = !isPaid && new Date() > new Date(debt.dueDate);

  return (
    <Card className={cn(
      "p-6 transition-all duration-300",
      isPaid ? "bg-slate-50/50 grayscale-[0.5]" : "hover:border-emerald-500/30"
    )}>
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-start gap-4 flex-1">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 neu-inset",
            isPaid ? "text-slate-400" : isOverdue ? "text-rose-500" : "text-emerald-500"
          )}>
            <CreditCard className="w-7 h-7" />
          </div>
          <div>
            <h4 className={cn("text-lg font-bold text-charcoal-900", isPaid && "line-through")}>{debt.creditor}</h4>
            <div className="flex items-center gap-2 text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">
              <Calendar className="w-4 h-4" />
              <span>{isPaid ? 'Pagado el ' : 'Vence '}{format(new Date(debt.dueDate), "dd 'de' MMM, yyyy", { locale: es })}</span>
            </div>
            {debt.notes && <p className="text-xs text-slate-400 mt-2">{debt.notes}</p>}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Monto</p>
            <p className={cn(
              "font-mono text-xl font-bold",
              isPaid ? "text-slate-400" : "text-charcoal-900"
            )}>
              {formatCurrency(new Decimal(debt.amount))}
            </p>
          </div>

          <Button
            onClick={() => onToggle(debt.id)}
            variant={isPaid ? "outline" : "primary"}
            className={cn(
              "w-full sm:w-auto gap-2",
              !isPaid && "bg-emerald-600 hover:bg-emerald-700"
            )}
          >
            {isPaid ? <Plus className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            {isPaid ? 'Marcar como Pendiente' : 'Marcar como Pagado'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
