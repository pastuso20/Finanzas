import React, { useState } from 'react';
import { useFinanceStore } from '../store';
import { Card, Button, Input, Label, cn } from '../components/ui';
import { Plus, Minus, Users, Calendar, AlertCircle, CheckCircle2, DollarSign, Edit3, Trash2, History, X, Check } from 'lucide-react';
import Decimal from 'decimal.js';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loan } from '../types';
import { formatCurrency, calcLoanInterest, calcLoanTotalRepayment, getCashBalance, safeDate, toDateInput } from '../utils';

export function Loans() {
  const loans = useFinanceStore(state => state.loans);
  const transactions = useFinanceStore(state => state.transactions);
  const initialBalance = useFinanceStore(state => state.initialBalance);
  const addLoan = useFinanceStore(state => state.addLoan);
  const markLoanAsPaid = useFinanceStore(state => state.markLoanAsPaid);
  const updateLoan = useFinanceStore(state => state.updateLoan);
  const deleteLoan = useFinanceStore(state => state.deleteLoan);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [newLoan, setNewLoan] = useState({
    borrower: '',
    principal: '',
    interestRate: '',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
  });
  const [editLoan, setEditLoan] = useState({
    borrower: '',
    principal: '',
    interestRate: '',
    startDate: '',
    dueDate: '',
  });

  const cashBalance = getCashBalance(initialBalance, transactions);
  const activeLoans = loans.filter(l => l.status === 'active');
  const paidLoans = loans.filter(l => l.status === 'paid');
  const totalLent = activeLoans.reduce((acc, l) => acc.plus(new Decimal(l.principal)), new Decimal(0));
  const totalExpectedReturn = activeLoans.reduce(
    (acc, l) => acc.plus(calcLoanTotalRepayment(l.principal, l.interestRate)),
    new Decimal(0)
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!newLoan.borrower || !newLoan.principal || !newLoan.dueDate) return;

    const principal = new Decimal(newLoan.principal);
    if (cashBalance.lessThan(principal)) {
      setErrorMsg('No tienes suficiente efectivo disponible para este préstamo.');
      return;
    }

    const success = await addLoan({
      borrower: newLoan.borrower,
      principal: newLoan.principal,
      interestRate: newLoan.interestRate || '0',
      startDate: new Date(newLoan.startDate).toISOString(),
      dueDate: new Date(newLoan.dueDate).toISOString(),
      status: 'active',
    });

    if (!success) {
      setErrorMsg('No se pudo registrar el préstamo. Verifica tu saldo disponible.');
      return;
    }

    setNewLoan({ borrower: '', principal: '', interestRate: '', startDate: new Date().toISOString().split('T')[0], dueDate: '' });
    setShowAddForm(false);
  };

  const startEdit = (loan: Loan) => {
    setEditingId(loan.id);
    setEditLoan({
      borrower: loan.borrower,
      principal: loan.principal,
      interestRate: loan.interestRate,
      startDate: toDateInput(loan.startDate),
      dueDate: toDateInput(loan.dueDate),
    });
    setErrorMsg('');
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setErrorMsg('');

    await updateLoan(editingId, {
      borrower: editLoan.borrower,
      principal: editLoan.principal,
      interestRate: editLoan.interestRate || '0',
      startDate: new Date(editLoan.startDate).toISOString(),
      dueDate: new Date(editLoan.dueDate).toISOString(),
    });

    setEditingId(null);
  };

  const handleDelete = async (loan: Loan) => {
    if (!confirm(`¿Eliminar el préstamo de ${loan.borrower}?${loan.status === 'active' ? ' Se devolverá el capital al efectivo.' : ''}`)) return;
    await deleteLoan(loan.id);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0" translate="no">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div className="flex flex-col">
          <h2 className="text-4xl md:text-5xl font-bold text-emerald-900 tracking-tight font-serif"><span>Préstamos</span></h2>
          <p className="text-slate-400 text-sm md:text-base mt-2"><span>El capital prestado se descuenta de tu efectivo</span></p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="md:hidden w-full flex items-center justify-center gap-3 bg-emerald-900 text-white py-4 rounded-3xl shadow-xl shadow-emerald-900/20 active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5 text-accent-gold" />
          <span className="font-bold text-sm tracking-wide">Nuevo Préstamo</span>
        </button>

        <Button onClick={() => setShowAddForm(!showAddForm)} className="hidden md:flex gap-2 rounded-2xl px-8 h-12">
          {showAddForm ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm ? 'Cancelar' : 'Nuevo Préstamo'}</span>
        </Button>
      </header>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold">
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="md:hidden pt-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1"><span>RESUMEN DE PRÉSTAMOS</span></p>
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
          <div className="p-6 flex justify-between items-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest"><span>EFECTIVO DISPONIBLE</span></p>
            <p className="text-xl font-bold text-emerald-900 font-mono tracking-tighter"><span>{formatCurrency(cashBalance)}</span></p>
          </div>
          <div className="p-6 flex justify-between items-center bg-slate-50/30">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest"><span>TOTAL PRESTADO</span></p>
            <p className="text-xl font-bold text-emerald-900 font-mono tracking-tighter"><span>{formatCurrency(totalLent)}</span></p>
          </div>
          <div className="p-6 flex justify-between items-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest"><span>A COBRAR (C+INT)</span></p>
            <p className="text-xl font-bold text-emerald-600 font-mono tracking-tighter"><span>{formatCurrency(totalExpectedReturn)}</span></p>
          </div>
        </div>
      </div>

      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4 bg-white border-none shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
            <DollarSign className="w-7 h-7 text-emerald-700" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest"><span>Efectivo Disponible</span></p>
            <p className="text-3xl font-bold text-emerald-900 font-mono"><span>{formatCurrency(cashBalance)}</span></p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 bg-white border-none shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
            <Users className="w-7 h-7 text-emerald-700" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest"><span>Total Prestado (Activos)</span></p>
            <p className="text-3xl font-bold text-emerald-900 font-mono"><span>{formatCurrency(totalLent)}</span></p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 bg-white border-none shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-emerald-700" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest"><span>Total a Cobrar</span></p>
            <p className="text-3xl font-bold text-emerald-600 font-mono"><span>{formatCurrency(totalExpectedReturn)}</span></p>
          </div>
        </Card>
      </div>

      {showAddForm && (
        <Card className="mb-6 border-emerald-500/30">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="borrower"><span>Nombre del Prestatario</span></Label>
              <Input id="borrower" value={newLoan.borrower} onChange={e => setNewLoan({ ...newLoan, borrower: e.target.value })} placeholder="Ej. Juan Pérez" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="principal"><span>Monto Principal ($)</span></Label>
              <Input id="principal" type="number" step="1" value={newLoan.principal} onChange={e => setNewLoan({ ...newLoan, principal: e.target.value })} placeholder="0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interestRate"><span>Tasa de Interés (%)</span></Label>
              <Input id="interestRate" type="number" step="0.1" value={newLoan.interestRate} onChange={e => setNewLoan({ ...newLoan, interestRate: e.target.value })} placeholder="20" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate"><span>Fecha de Inicio</span></Label>
              <Input id="startDate" type="date" value={newLoan.startDate} onChange={e => setNewLoan({ ...newLoan, startDate: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate"><span>Fecha de Vencimiento</span></Label>
              <Input id="dueDate" type="date" value={newLoan.dueDate} onChange={e => setNewLoan({ ...newLoan, dueDate: e.target.value })} required />
            </div>
            <Button type="submit" className="w-full"><span>Agregar Préstamo</span></Button>
          </form>
          {newLoan.principal && (
            <p className="text-sm text-slate-500 mt-4 font-medium">
              <span>
                Al cobrar recibirás: {formatCurrency(calcLoanTotalRepayment(newLoan.principal, newLoan.interestRate || '0'))}
                {' '}(interés: {formatCurrency(calcLoanInterest(newLoan.principal, newLoan.interestRate || '0'))})
              </span>
            </p>
          )}
        </Card>
      )}

      <div className="space-y-6 notranslate">
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-emerald-500 flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span>Préstamos Activos</span>
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {activeLoans.length > 0 ? (
              activeLoans.map(loan => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  isEditing={editingId === loan.id}
                  editLoan={editLoan}
                  setEditLoan={setEditLoan}
                  onStartEdit={() => startEdit(loan)}
                  onCancelEdit={() => setEditingId(null)}
                  onSaveEdit={handleEdit}
                  onMarkPaid={() => markLoanAsPaid(loan.id)}
                  onDelete={() => handleDelete(loan)}
                />
              ))
            ) : (
              <p className="text-slate-500 text-sm italic py-4"><span>No hay préstamos activos.</span></p>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-bold text-slate-400 flex items-center gap-2">
            <History className="w-5 h-5" />
            <span>Préstamos Cobrados</span>
          </h3>
          <div className="grid grid-cols-1 gap-4 opacity-80">
            {paidLoans.length > 0 ? (
              paidLoans.map(loan => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  isEditing={editingId === loan.id}
                  editLoan={editLoan}
                  setEditLoan={setEditLoan}
                  onStartEdit={() => startEdit(loan)}
                  onCancelEdit={() => setEditingId(null)}
                  onSaveEdit={handleEdit}
                  onDelete={() => handleDelete(loan)}
                />
              ))
            ) : (
              <p className="text-slate-500 text-sm italic py-4"><span>No hay préstamos cobrados.</span></p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function LoanCard({
  loan,
  isEditing,
  editLoan,
  setEditLoan,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onMarkPaid,
  onDelete,
}: {
  loan: Loan;
  isEditing: boolean;
  editLoan: { borrower: string; principal: string; interestRate: string; startDate: string; dueDate: string };
  setEditLoan: React.Dispatch<React.SetStateAction<typeof editLoan>>;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (e: React.FormEvent) => void;
  onMarkPaid?: () => void;
  onDelete: () => void;
}) {
  const isPaid = loan.status === 'paid';
  const principal = new Decimal(loan.principal);
  const rate = new Decimal(loan.interestRate || 0);
  const interest = calcLoanInterest(principal, rate);
  const totalRepayment = calcLoanTotalRepayment(principal, rate);
  const dueDateObj = safeDate(loan.dueDate);
  const isOverdue = !isPaid && dueDateObj ? new Date() > dueDateObj : false;

  if (isEditing) {
    return (
      <Card className="p-6 border-emerald-500/30">
        <form onSubmit={onSaveEdit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          <div className="space-y-2">
            <Label><span>Prestatario</span></Label>
            <Input value={editLoan.borrower} onChange={e => setEditLoan({ ...editLoan, borrower: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label><span>Principal ($)</span></Label>
            <Input type="number" step="1" value={editLoan.principal} onChange={e => setEditLoan({ ...editLoan, principal: e.target.value })} required disabled={isPaid} />
          </div>
          <div className="space-y-2">
            <Label><span>Interés (%)</span></Label>
            <Input type="number" step="0.1" value={editLoan.interestRate} onChange={e => setEditLoan({ ...editLoan, interestRate: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label><span>Inicio</span></Label>
            <Input type="date" value={editLoan.startDate} onChange={e => setEditLoan({ ...editLoan, startDate: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label><span>Vencimiento</span></Label>
            <Input type="date" value={editLoan.dueDate} onChange={e => setEditLoan({ ...editLoan, dueDate: e.target.value })} required />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1 gap-2"><Check className="w-4 h-4" /><span>Guardar</span></Button>
            <Button type="button" variant="outline" onClick={onCancelEdit}><X className="w-4 h-4" /></Button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Card className={cn('p-6 transition-all duration-300', isPaid && 'bg-slate-50/50')}>
      <div className="flex flex-col xl:flex-row justify-between gap-6">
        <div className="flex items-start gap-4 xl:w-1/3">
          <div className={cn(
            'w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 neu-inset',
            isPaid ? 'text-slate-400' : isOverdue ? 'text-rose-500' : 'text-emerald-500'
          )}>
            <Users className="w-7 h-7 drop-shadow-sm" />
          </div>
          <div>
            <h4 className={cn('text-lg font-bold text-charcoal-900 drop-shadow-sm', isPaid && 'line-through')}>
              <span>{loan.borrower}</span>
            </h4>
            <div className="flex items-center gap-2 text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">
              <Calendar className="w-4 h-4" />
              <span>Vence {dueDateObj ? format(dueDateObj, "dd 'de' MMM, yyyy", { locale: es }) : 'Sin fecha'}</span>
            </div>
            {isOverdue && (
              <div className="flex items-center gap-1 text-xs text-rose-500 mt-2 font-bold neu-inset px-3 py-1.5 rounded-xl w-fit">
                <AlertCircle className="w-3 h-3" />
                <span>VENCIDO</span>
              </div>
            )}
            {isPaid && (
              <div className="flex items-center gap-1 text-xs text-emerald-600 mt-2 font-bold neu-inset px-3 py-1.5 rounded-xl w-fit">
                <CheckCircle2 className="w-3 h-3" />
                <span>COBRADO</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-1 justify-between items-stretch sm:items-center neu-inset rounded-2xl p-4 md:p-5 gap-4 sm:gap-0">
          <div className="text-left sm:text-center px-2">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1"><span>Principal</span></p>
            <p className="font-mono font-bold text-charcoal-900 drop-shadow-sm"><span>{formatCurrency(principal)}</span></p>
          </div>
          <div className="text-left sm:text-center px-2 border-y sm:border-y-0 sm:border-x border-white/20 py-2 sm:py-0">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1"><span>Interés ({rate.toNumber()}%)</span></p>
            <p className="font-mono font-bold text-emerald-600 drop-shadow-sm"><span>+{formatCurrency(interest)}</span></p>
          </div>
          <div className="text-left sm:text-right px-2">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1"><span>Total a Recibir</span></p>
            <p className="font-mono text-lg md:text-xl font-bold text-charcoal-900 drop-shadow-sm"><span>{formatCurrency(totalRepayment)}</span></p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 xl:w-auto">
          {!isPaid && onMarkPaid && (
            <Button onClick={onMarkPaid} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              <span>Marcar Cobrado</span>
            </Button>
          )}
          <Button variant="outline" onClick={onStartEdit} className="gap-2">
            <Edit3 className="w-4 h-4" />
            <span>Editar</span>
          </Button>
          <Button variant="outline" onClick={onDelete} className="gap-2 text-rose-500 hover:text-rose-600 border-rose-100">
            <Trash2 className="w-4 h-4" />
            <span>Eliminar</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
