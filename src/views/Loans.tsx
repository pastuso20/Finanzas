import React, { useState } from 'react';
import { useFinanceStore } from '../store';
import { Card, Button, Input, Label, cn } from '../components/ui';
import { Plus, Minus, Users, Calendar, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';
import Decimal from 'decimal.js';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '../utils';

export function Loans() {
  const { loans, addLoan } = useFinanceStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLoan, setNewLoan] = useState({ borrower: '', principal: '', interestRate: '', startDate: new Date().toISOString().split('T')[0], dueDate: '' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoan.borrower || !newLoan.principal || !newLoan.dueDate) return;

    try {
      await addLoan({
        borrower: newLoan.borrower,
        principal: newLoan.principal,
        interestRate: newLoan.interestRate || '0',
        startDate: new Date(newLoan.startDate).toISOString(),
        dueDate: new Date(newLoan.dueDate).toISOString(),
        status: 'active'
      });

      setNewLoan({ borrower: '', principal: '', interestRate: '', startDate: new Date().toISOString().split('T')[0], dueDate: '' });
      setTimeout(() => {
        setShowAddForm(false);
      }, 0);
    } catch (error) {
      console.error('Error adding loan:', error);
    }
  };

  const activeLoans = loans.filter(l => l.status === 'active');
  const totalLent = activeLoans.reduce((acc, l) => acc.plus(new Decimal(l.principal)), new Decimal(0));

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div className="flex flex-col">
          <h2 className="text-4xl md:text-5xl font-bold text-emerald-900 tracking-tight font-serif">Préstamos</h2>
          <p className="text-slate-400 text-sm md:text-base mt-2">Sigue el dinero prestado a terceros</p>
        </div>
        
        {/* New Loan Button - Mobile Highlighted */}
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="md:hidden w-full flex items-center justify-center gap-3 bg-emerald-900 text-white py-4 rounded-3xl shadow-xl shadow-emerald-900/20 active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5 text-accent-gold" />
          <span className="font-bold text-sm tracking-wide">Nuevo Préstamo</span>
        </button>

        {/* Desktop New Loan Button */}
        <Button onClick={() => setShowAddForm(!showAddForm)} className="hidden md:flex gap-2 rounded-2xl px-8 h-12">
          {showAddForm ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancelar' : 'Nuevo Préstamo'}
        </Button>
      </header>

      {/* Summary Cards - Mobile Expert UI */}
      <div className="md:hidden pt-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">RESUMEN DE PRÉSTAMOS</p>
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
          <div className="p-6 flex justify-between items-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">TOTAL PRESTADO</p>
            <p className="text-xl font-bold text-emerald-900 font-mono tracking-tighter">{formatCurrency(totalLent)}</p>
          </div>
          <div className="p-6 flex justify-between items-center bg-slate-50/30">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">PRESTATARIOS</p>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700" />
              <p className="text-lg font-bold text-emerald-900 font-mono tracking-tighter">{activeLoans.length} Activos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Summary Cards */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex items-center gap-4 bg-white border-none shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
            <DollarSign className="w-7 h-7 text-emerald-700" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total Préstamos Activos</p>
            <p className="text-3xl font-bold text-emerald-900 font-mono">{formatCurrency(totalLent)}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 bg-white border-none shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
            <Users className="w-7 h-7 text-emerald-700" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Prestatarios Activos</p>
            <p className="text-3xl font-bold text-emerald-900 font-mono">{activeLoans.length}</p>
          </div>
        </Card>
      </div>

      {showAddForm && (
        <Card className="mb-6 border-emerald-500/30">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="borrower">Nombre del Prestatario</Label>
              <Input id="borrower" value={newLoan.borrower} onChange={e => setNewLoan({ ...newLoan, borrower: e.target.value })} placeholder="Ej. Juan Pérez" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="principal">Monto Principal ($)</Label>
              <Input id="principal" type="number" step="1" value={newLoan.principal} onChange={e => setNewLoan({ ...newLoan, principal: e.target.value })} placeholder="0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interestRate">Tasa de Interés (%)</Label>
              <Input id="interestRate" type="number" step="0.1" value={newLoan.interestRate} onChange={e => setNewLoan({ ...newLoan, interestRate: e.target.value })} placeholder="0.0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
              <Input id="dueDate" type="date" value={newLoan.dueDate} onChange={e => setNewLoan({ ...newLoan, dueDate: e.target.value })} required />
            </div>
            <Button type="submit" className="w-full">Agregar Préstamo</Button>
          </form>
        </Card>
      )}

      {/* Loan List */}
      <div className="space-y-4">
        {loans.length > 0 ? (
          loans.map(loan => {
            const principal = new Decimal(loan.principal);
            const rate = new Decimal(loan.interestRate || 0);
            const daysElapsed = differenceInDays(new Date(), new Date(loan.startDate));
            const daysTotal = differenceInDays(new Date(loan.dueDate), new Date(loan.startDate));

            const interestAccrued = principal.times(rate.dividedBy(100)).times(new Decimal(daysElapsed).dividedBy(365));
            const totalDue = principal.plus(interestAccrued);

            const isOverdue = new Date() > new Date(loan.dueDate) && loan.status === 'active';
            const progress = Math.min(Math.max((daysElapsed / daysTotal) * 100, 0), 100);

            return (
              <Card key={loan.id} className="p-6 relative overflow-hidden group">
                {/* Progress bar background */}
                <div
                  className={cn(
                    "absolute bottom-0 left-0 h-1.5 transition-all duration-500",
                    isOverdue ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" : "bg-emerald-500 shadow-[0_0_10px_rgba(0,79,57,0.5)]"
                  )}
                  style={{ width: `${progress}%` }}
                />

                <div className="flex flex-col xl:flex-row justify-between gap-6">
                  <div className="flex items-start gap-4 xl:w-1/3">
                    <div className={cn(
                      "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 neu-inset",
                      isOverdue ? "text-rose-500" : "text-emerald-500"
                    )}>
                      <Users className="w-7 h-7 drop-shadow-sm" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-charcoal-900 drop-shadow-sm">{loan.borrower}</h4>
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">
                        <Calendar className="w-4 h-4" />
                        <span>Vence {format(new Date(loan.dueDate), "dd 'de' MMM, yyyy", { locale: es })}</span>
                      </div>
                      {isOverdue && (
                        <div className="flex items-center gap-1 text-xs text-rose-500 mt-2 font-bold neu-inset px-3 py-1.5 rounded-xl w-fit">
                          <AlertCircle className="w-3 h-3" />
                          VENCIDO
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row flex-1 justify-between items-stretch sm:items-center neu-inset rounded-2xl p-4 md:p-5 gap-4 sm:gap-0">
                    <div className="text-left sm:text-center px-2 flex sm:flex-col justify-between items-center sm:items-stretch">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0 sm:mb-1">Principal</p>
                      <p className="font-mono font-bold text-charcoal-900 drop-shadow-sm">{formatCurrency(principal)}</p>
                    </div>

                    <div className="text-left sm:text-center px-2 flex sm:flex-col justify-between items-center sm:items-stretch border-y sm:border-y-0 sm:border-x border-white/20 py-2 sm:py-0">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0 sm:mb-1">Interés ({rate.toNumber()}%)</p>
                      <p className="font-mono font-bold text-emerald-600 drop-shadow-sm">+{formatCurrency(interestAccrued)}</p>
                    </div>

                    <div className="text-left sm:text-right px-2 flex sm:flex-col justify-between items-center sm:items-stretch">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0 sm:mb-1">Total a Pagar</p>
                      <p className="font-mono text-lg md:text-xl font-bold text-charcoal-900 drop-shadow-sm">{formatCurrency(totalDue)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end xl:w-36">
                    <Button variant="outline" className="w-full text-xs font-bold gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Marcar Pagado
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div key="empty-loans" className="text-center py-12 rounded-3xl neu-inset">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-wider text-sm">No hay préstamos activos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
