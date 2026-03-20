import React, { useState } from 'react';
import { useFinanceStore } from '../store';
import { Card, Button, Input, Label, cn } from '../components/ui';
import { Plus, Minus, CreditCard, Calendar, AlertCircle, CheckCircle2, History } from 'lucide-react';
import Decimal from 'decimal.js';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '../utils';

export function Debts() {
  const debts = useFinanceStore(state => state.debts);
  const addDebt = useFinanceStore(state => state.addDebt);
  const toggleDebtStatus = useFinanceStore(state => state.toggleDebtStatus);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDebt, setNewDebt] = useState({ creditor: '', amount: '', dueDate: '', notes: '' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDebt.creditor || !newDebt.amount || !newDebt.dueDate) return;

    try {
      await addDebt({
        creditor: newDebt.creditor,
        amount: newDebt.amount,
        dueDate: new Date(newDebt.dueDate).toISOString(),
        status: 'pending',
        notes: newDebt.notes
      });

      // Reset local state and close form
      setNewDebt({ creditor: '', amount: '', dueDate: '', notes: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding debt:', error);
    }
  };

  const pendingDebts = debts.filter(d => d.status === 'pending');
  const paidDebts = debts.filter(d => d.status === 'paid');
  const totalPending = pendingDebts.reduce((acc, d) => acc.plus(new Decimal(d.amount)), new Decimal(0));

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0" translate="no">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div className="flex flex-col">
          <h2 className="text-4xl md:text-5xl font-bold text-emerald-900 tracking-tight font-serif"><span>Deudas</span></h2>
          <p className="text-slate-400 text-sm md:text-base mt-2"><span>Controla tus compromisos financieros</span></p>
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
          <span>{showAddForm ? 'Cancelar' : 'Nueva Deuda'}</span>
        </Button>
      </header>

      {/* Summary Cards - Mobile Expert UI */}
      <div className="md:hidden pt-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1"><span>RESUMEN DE DEUDAS</span></p>
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
          <div className="p-6 flex justify-between items-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest"><span>TOTAL PENDIENTE</span></p>
            <p className="text-xl font-bold text-rose-600 font-mono tracking-tighter"><span>{formatCurrency(totalPending)}</span></p>
          </div>
          <div className="p-6 flex justify-between items-center bg-slate-50/30">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest"><span>ESTADO</span></p>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-xs font-bold text-emerald-900"><span>{pendingDebts.length} Pend.</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-emerald-900"><span>{paidDebts.length} Pag.</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Summary Cards */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col justify-center bg-white border-none shadow-sm">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2"><span>Total Pendiente de Pago</span></p>
          <p className="text-3xl font-bold text-rose-600 font-mono"><span>{formatCurrency(totalPending)}</span></p>
        </Card>

        <Card className="flex flex-col justify-center bg-white border-none shadow-sm">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2"><span>Deudas Pendientes</span></p>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-rose-500" />
            <p className="text-3xl font-bold text-emerald-900 font-mono"><span>{pendingDebts.length}</span></p>
          </div>
        </Card>

        <Card className="flex flex-col justify-center bg-white border-none shadow-sm">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2"><span>Deudas Pagadas</span></p>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <p className="text-3xl font-bold text-emerald-900 font-mono"><span>{paidDebts.length}</span></p>
          </div>
        </Card>
      </div>

      {showAddForm && (
        <Card className="mb-6 border-emerald-500/30">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="creditor"><span>Acreedor / Entidad</span></Label>
              <Input id="creditor" value={newDebt.creditor} onChange={e => setNewDebt({ ...newDebt, creditor: e.target.value })} placeholder="Ej. Banco, Amigo..." required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount"><span>Monto ($)</span></Label>
              <Input id="amount" type="number" step="1" value={newDebt.amount} onChange={e => setNewDebt({ ...newDebt, amount: e.target.value })} placeholder="0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate"><span>Fecha de Pago</span></Label>
              <Input id="dueDate" type="date" value={newDebt.dueDate} onChange={e => setNewDebt({ ...newDebt, dueDate: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes"><span>Notas (Opcional)</span></Label>
              <Input id="notes" value={newDebt.notes} onChange={e => setNewDebt({ ...newDebt, notes: e.target.value })} placeholder="Ej. Cuota 1/12" />
            </div>
            <Button type="submit" className="w-full"><span>Agregar Deuda</span></Button>
          </form>
        </Card>
      )}

      {/* Debts List */}
      <div className="space-y-6 notranslate">
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-emerald-500 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>Deudas Pendientes</span>
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {pendingDebts.length > 0 ? (
              pendingDebts.map(debt => (
                <DebtCard key={debt.id} debt={debt} onToggle={toggleDebtStatus} />
              ))
            ) : (
              <div key="empty-pending" className="py-4">
                <p className="text-slate-500 text-sm italic"><span>No tienes deudas pendientes. ¡Excelente!</span></p>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-bold text-slate-400 flex items-center gap-2">
            <History className="w-5 h-5" />
            <span>Historial de Pagos</span>
          </h3>
          <div className="grid grid-cols-1 gap-4 opacity-75">
            {paidDebts.length > 0 ? (
              paidDebts.map(debt => (
                <DebtCard key={debt.id} debt={debt} onToggle={toggleDebtStatus} />
              ))
            ) : (
              <div key="empty-paid" className="py-4">
                <p className="text-slate-500 text-sm italic"><span>No hay historial de pagos.</span></p>
              </div>
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
            <h4 className={cn("text-lg font-bold text-charcoal-900", isPaid && "line-through")}><span>{debt.creditor}</span></h4>
            <div className="flex items-center gap-2 text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">
              <Calendar className="w-4 h-4" />
              <span>{isPaid ? 'Pagado el ' : 'Vence '}{format(new Date(debt.dueDate), "dd 'de' MMM, yyyy", { locale: es })}</span>
            </div>
            {debt.notes && <p className="text-xs text-slate-400 mt-2"><span>{debt.notes}</span></p>}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1"><span>Monto</span></p>
            <p className={cn(
              "font-mono text-xl font-bold",
              isPaid ? "text-slate-400" : "text-charcoal-900"
            )}>
              <span>{formatCurrency(new Decimal(debt.amount))}</span>
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
            <span>{isPaid ? 'Marcar como Pendiente' : 'Marcar como Pagado'}</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
