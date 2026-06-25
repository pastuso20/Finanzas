import React, { useState } from 'react';
import { useFinanceStore } from '../store';
import { Card, Button, Input, Label, cn } from '../components/ui';
import { Plus, CreditCard, Calendar, AlertCircle, CheckCircle2, History } from 'lucide-react';
import Decimal from 'decimal.js';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency, safeDate, sumDecimal } from '../utils';
import { PageShell } from '../components/views/PageShell';
import { SummaryMetrics, metricCurrency } from '../components/views/SummaryMetrics';
import { Debt } from '../types';

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
  const totalPending = sumDecimal(pendingDebts, d => d.amount);

  return (
    <PageShell
      title="Deudas"
      subtitle="Controla tus compromisos financieros"
      addLabel="Nueva Deuda"
      showAddForm={showAddForm}
      onToggleAddForm={() => setShowAddForm(!showAddForm)}
    >
      <SummaryMetrics
        sectionTitle="RESUMEN DE DEUDAS"
        metrics={[
          {
            label: 'Total Pendiente de Pago',
            mobileLabel: 'TOTAL PENDIENTE',
            value: metricCurrency(totalPending),
            valueClassName: 'text-rose-600',
          },
          {
            label: 'Deudas Pendientes',
            value: pendingDebts.length,
            icon: AlertCircle,
            iconClassName: 'text-rose-500',
          },
          {
            label: 'Deudas Pagadas',
            value: paidDebts.length,
            icon: CheckCircle2,
            iconClassName: 'text-emerald-500',
          },
        ]}
      />

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
    </PageShell>
  );
}

function DebtCard({ debt, onToggle }: { debt: Debt; onToggle: (id: string) => void }) {
  const isPaid = debt.status === 'paid';
  const dueDateObj = safeDate(debt.dueDate);
  const isOverdue = !isPaid && dueDateObj ? new Date() > dueDateObj : false;

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
              <span>{isPaid ? 'Pagado el ' : 'Vence '}{dueDateObj ? format(dueDateObj, "dd 'de' MMM, yyyy", { locale: es }) : 'Sin fecha'}</span>
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
