import React, { useState } from 'react';
import { useFinanceStore } from '../store';
import { Card, Button, Input, Label, cn } from '../components/ui';
import { Plus, Minus, PiggyBank, Target, TrendingUp } from 'lucide-react';
import Decimal from 'decimal.js';
import { formatCurrency } from '../utils';

export function Savings() {
  const savings = useFinanceStore(state => state.savings);
  const addSaving = useFinanceStore(state => state.addSaving);
  const updateSavingAmount = useFinanceStore(state => state.updateSavingAmount);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSaving, setNewSaving] = useState({
    name: '',
    category: '',
    currentAmount: '',
    goalAmount: '',
    startDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSaving.name || !newSaving.category || !newSaving.currentAmount) return;

    try {
      await addSaving({
        name: newSaving.name,
        category: newSaving.category,
        currentAmount: newSaving.currentAmount,
        goalAmount: newSaving.goalAmount || '0',
        startDate: new Date(newSaving.startDate).toISOString(),
        notes: newSaving.notes,
      });

      setNewSaving({
        name: '',
        category: '',
        currentAmount: '',
        goalAmount: '',
        startDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding saving:', error);
    }
  };

  const totalSaved = savings.reduce((acc, s) => acc.plus(new Decimal(s.currentAmount)), new Decimal(0));
  const totalGoals = savings.reduce((acc, s) => acc.plus(new Decimal(s.goalAmount || '0')), new Decimal(0));
  const withGoals = savings.filter(s => new Decimal(s.goalAmount || '0').greaterThan(0));
  const goalsReached = withGoals.filter(s =>
    new Decimal(s.currentAmount).greaterThanOrEqualTo(new Decimal(s.goalAmount || '0'))
  ).length;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0" translate="no">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div className="flex flex-col">
          <h2 className="text-4xl md:text-5xl font-bold text-emerald-900 tracking-tight font-serif"><span>Ahorros</span></h2>
          <p className="text-slate-400 text-sm md:text-base mt-2"><span>Gestiona tus metas y fondos de ahorro</span></p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="md:hidden w-full flex items-center justify-center gap-3 bg-emerald-900 text-white py-4 rounded-3xl shadow-xl shadow-emerald-900/20 active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5 text-accent-gold" />
          <span className="font-bold text-sm tracking-wide">Nuevo Ahorro</span>
        </button>

        <Button onClick={() => setShowAddForm(!showAddForm)} className="hidden md:flex gap-2 rounded-2xl px-8 h-12">
          {showAddForm ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm ? 'Cancelar' : 'Nuevo Ahorro'}</span>
        </Button>
      </header>

      <div className="md:hidden pt-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1"><span>RESUMEN DE AHORROS</span></p>
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
          <div className="p-6 flex justify-between items-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest"><span>TOTAL AHORRADO</span></p>
            <p className="text-xl font-bold text-emerald-600 font-mono tracking-tighter"><span>{formatCurrency(totalSaved)}</span></p>
          </div>
          <div className="p-6 flex justify-between items-center bg-slate-50/30">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest"><span>METAS ACTIVAS</span></p>
            <p className="text-xl font-bold text-emerald-900 font-mono tracking-tighter"><span>{withGoals.length}</span></p>
          </div>
          <div className="p-6 flex justify-between items-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest"><span>METAS CUMPLIDAS</span></p>
            <p className="text-xl font-bold text-emerald-900 font-mono tracking-tighter"><span>{goalsReached}</span></p>
          </div>
        </div>
      </div>

      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col justify-center bg-white border-none shadow-sm">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2"><span>Total Ahorrado</span></p>
          <p className="text-3xl font-bold text-emerald-600 font-mono"><span>{formatCurrency(totalSaved)}</span></p>
        </Card>

        <Card className="flex flex-col justify-center bg-white border-none shadow-sm">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2"><span>Meta Total</span></p>
          <p className="text-3xl font-bold text-emerald-900 font-mono"><span>{formatCurrency(totalGoals)}</span></p>
        </Card>

        <Card className="flex flex-col justify-center bg-white border-none shadow-sm">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2"><span>Metas Cumplidas</span></p>
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-emerald-500" />
            <p className="text-3xl font-bold text-emerald-900 font-mono"><span>{goalsReached} / {withGoals.length}</span></p>
          </div>
        </Card>
      </div>

      {showAddForm && (
        <Card className="mb-6 border-emerald-500/30">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="name"><span>Nombre</span></Label>
              <Input id="name" value={newSaving.name} onChange={e => setNewSaving({ ...newSaving, name: e.target.value })} placeholder="Ej. Fondo de emergencia" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category"><span>Categoría</span></Label>
              <Input id="category" value={newSaving.category} onChange={e => setNewSaving({ ...newSaving, category: e.target.value })} placeholder="Ej. Cuenta de ahorros" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentAmount"><span>Monto Actual ($)</span></Label>
              <Input id="currentAmount" type="number" step="1" value={newSaving.currentAmount} onChange={e => setNewSaving({ ...newSaving, currentAmount: e.target.value })} placeholder="0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goalAmount"><span>Meta ($)</span></Label>
              <Input id="goalAmount" type="number" step="1" value={newSaving.goalAmount} onChange={e => setNewSaving({ ...newSaving, goalAmount: e.target.value })} placeholder="Opcional" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate"><span>Fecha de Inicio</span></Label>
              <Input id="startDate" type="date" value={newSaving.startDate} onChange={e => setNewSaving({ ...newSaving, startDate: e.target.value })} required />
            </div>
            <Button type="submit" className="w-full"><span>Agregar Ahorro</span></Button>
          </form>
        </Card>
      )}

      <div className="space-y-4 notranslate">
        <h3 className="text-xl font-bold text-emerald-500 mb-4 flex items-center gap-2">
          <PiggyBank className="w-5 h-5 text-emerald-500" />
          <span>Mis Ahorros</span>
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {savings.length > 0 ? (
            savings.map(saving => {
              const current = new Decimal(saving.currentAmount);
              const goal = new Decimal(saving.goalAmount || '0');
              const hasGoal = goal.greaterThan(0);
              const progress = hasGoal ? current.dividedBy(goal).times(100).toNumber() : 0;
              const isComplete = hasGoal && current.greaterThanOrEqualTo(goal);

              return (
                <Card key={saving.id} className="p-6 transition-all duration-300 hover:border-emerald-500/30">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 neu-inset",
                        isComplete ? "text-emerald-600" : "text-emerald-500"
                      )}>
                        <PiggyBank className="w-7 h-7" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-charcoal-900"><span>{saving.name}</span></h4>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1"><span>{saving.category}</span></p>
                        {saving.notes && <p className="text-xs text-slate-400 mt-2"><span>{saving.notes}</span></p>}
                        {hasGoal && (
                          <div className="mt-4">
                            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                              <span>Progreso</span>
                              <span>{Math.min(progress, 100).toFixed(0)}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={cn("h-full rounded-full transition-all", isComplete ? "bg-emerald-500" : "bg-emerald-400")}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                      <div className="text-right sm:text-right">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1"><span>Ahorrado</span></p>
                        <p className="font-mono text-xl font-bold text-emerald-600"><span>{formatCurrency(current)}</span></p>
                        {hasGoal && (
                          <p className="text-xs text-slate-400 font-mono mt-1"><span>Meta: {formatCurrency(goal)}</span></p>
                        )}
                      </div>

                      <Input
                        type="number"
                        step="1"
                        placeholder="Actualizar ($)"
                        className="w-full sm:w-36 h-10 text-sm font-bold"
                        onBlur={(e) => {
                          if (e.target.value && e.target.value !== saving.currentAmount) {
                            updateSavingAmount(saving.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const target = e.target as HTMLInputElement;
                            if (target.value && target.value !== saving.currentAmount) {
                              updateSavingAmount(saving.id, target.value);
                              target.value = '';
                              target.blur();
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-12 rounded-3xl neu-inset">
              <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 font-bold uppercase tracking-wider text-sm mb-6"><span>Sin ahorros registrados aún.</span></p>
              <Button onClick={() => setShowAddForm(true)}><span>Agrega tu primer ahorro</span></Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
