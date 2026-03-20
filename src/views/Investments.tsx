import React, { useState } from 'react';
import { useFinanceStore } from '../store';
import { Card, Button, Input, Label, cn } from '../components/ui';
import Decimal from 'decimal.js';
import { TrendingUp, TrendingDown, Plus, Minus, Activity, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '../utils';

export function Investments() {
  const { investments, addInvestment, updateInvestmentValue } = useFinanceStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInv, setNewInv] = useState({ assetName: '', description: '', initialInvestment: '', currentValue: '', purchaseDate: new Date().toISOString().split('T')[0] });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInv.assetName || !newInv.description || !newInv.initialInvestment || !newInv.currentValue) return;

    addInvestment({
      assetName: newInv.assetName,
      description: newInv.description,
      initialInvestment: newInv.initialInvestment,
      currentValue: newInv.currentValue,
      purchaseDate: new Date(newInv.purchaseDate).toISOString()
    });

    setNewInv({ assetName: '', description: '', initialInvestment: '', currentValue: '', purchaseDate: new Date().toISOString().split('T')[0] });
    setShowAddForm(false);
  };

  const totalInvested = investments.reduce((acc, inv) => acc.plus(new Decimal(inv.initialInvestment)), new Decimal(0));
  const totalCurrentValue = investments.reduce((acc, inv) => acc.plus(new Decimal(inv.currentValue)), new Decimal(0));
  const netProfit = totalCurrentValue.minus(totalInvested);
  const overallROI = totalInvested.isZero() ? new Decimal(0) : netProfit.dividedBy(totalInvested).times(100);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-emerald-500 tracking-tight">Emprendimientos e Inversiones</h2>
          <p className="text-slate-600 mt-1">Sigue el rendimiento de tus negocios y proyectos</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
          {showAddForm ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancelar' : 'Nuevo Proyecto'}
        </Button>
      </header>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col justify-center">
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Capital Total Invertido</p>
          <p className="text-3xl font-bold text-charcoal-900 font-mono drop-shadow-sm">{formatCurrency(totalInvested)}</p>
        </Card>

        <Card className="flex flex-col justify-center">
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Valor Actual del Portafolio</p>
          <p className="text-3xl font-bold text-charcoal-900 font-mono drop-shadow-sm">{formatCurrency(totalCurrentValue)}</p>
        </Card>

        <Card className="flex flex-col justify-center">
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Beneficio Neto / ROI</p>
          <div className="flex items-end gap-3">
            <p className={cn(
              "text-3xl font-bold font-mono drop-shadow-sm",
              netProfit.isPositive() ? "text-emerald-600" : netProfit.isNegative() ? "text-rose-600" : "text-charcoal-900"
            )}>
              {netProfit.isPositive() ? '+' : ''}{formatCurrency(netProfit)}
            </p>
            <p className={cn(
              "text-lg font-bold mb-1 drop-shadow-sm",
              overallROI.isPositive() ? "text-emerald-600" : overallROI.isNegative() ? "text-rose-600" : "text-slate-500"
            )}>
              ({overallROI.isPositive() ? '+' : ''}{overallROI.toNumber().toFixed(2)}%)
            </p>
          </div>
        </Card>
      </div>

      {showAddForm && (
        <Card className="mb-6 border-emerald-500/30">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="assetName">Nombre del Proyecto</Label>
              <Input id="assetName" value={newInv.assetName} onChange={e => setNewInv({ ...newInv, assetName: e.target.value })} placeholder="Ej. Startup X" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input id="description" value={newInv.description} onChange={e => setNewInv({ ...newInv, description: e.target.value })} placeholder="Ej. Tecnología" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="initialInvestment">Capital Invertido ($)</Label>
              <Input id="initialInvestment" type="number" step="1" value={newInv.initialInvestment} onChange={e => setNewInv({ ...newInv, initialInvestment: e.target.value })} placeholder="0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentValue">Valuación Actual ($)</Label>
              <Input id="currentValue" type="number" step="1" value={newInv.currentValue} onChange={e => setNewInv({ ...newInv, currentValue: e.target.value })} placeholder="0" required />
            </div>
            <Button type="submit" className="w-full">Agregar Proyecto</Button>
          </form>
        </Card>
      )}

      {/* Asset List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-emerald-500 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-500" />
          Proyectos y Negocios
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {investments.map(inv => {
            const initial = new Decimal(inv.initialInvestment);
            const current = new Decimal(inv.currentValue);
            const profit = current.minus(initial);
            const roi = initial.isZero() ? new Decimal(0) : profit.dividedBy(initial).times(100);

            const isProfitable = profit.isPositive();
            const isLoss = profit.isNegative();

            return (
              <div key={inv.id} className="p-4 md:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between neu-button rounded-3xl group gap-4 md:gap-6">

                {/* Mobile Top Row / Desktop Left Side */}
                <div className="flex justify-between items-start md:items-center w-full md:w-auto md:flex-1">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={cn(
                      "w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center font-bold text-lg md:text-xl neu-inset drop-shadow-sm shrink-0",
                      isProfitable ? "text-emerald-600" :
                        isLoss ? "text-rose-600" :
                          "text-slate-500"
                    )}>
                      {inv.assetName.substring(0, 1)}
                    </div>
                    <div>
                      <h4 className="text-base md:text-lg font-bold text-charcoal-900 drop-shadow-sm leading-tight md:leading-normal">{inv.assetName}</h4>
                      <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5 md:mt-1">{inv.description} <span className="hidden md:inline">• {format(new Date(inv.purchaseDate), 'MMM yyyy', { locale: es })}</span></p>
                    </div>
                  </div>

                  {/* Mobile Only: Current Value & ROI aligned right */}
                  <div className="md:hidden text-right pl-2">
                    <p className="font-mono font-bold text-base text-charcoal-900 drop-shadow-sm leading-tight">{formatCurrency(current)}</p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      {isProfitable ? <TrendingUp className="w-3 h-3 text-emerald-600 drop-shadow-sm" /> :
                        isLoss ? <TrendingDown className="w-3 h-3 text-rose-600 drop-shadow-sm" /> :
                          <Activity className="w-3 h-3 text-slate-400 drop-shadow-sm" />}
                      <p className={cn(
                        "font-mono font-bold text-[10px] drop-shadow-sm",
                        isProfitable ? "text-emerald-600" : isLoss ? "text-rose-600" : "text-slate-500"
                      )}>
                        {roi.toNumber().toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Desktop Details (Hidden on mobile) */}
                <div className="hidden md:flex flex-1 justify-between items-center w-full neu-inset p-4 rounded-2xl gap-4">
                  <div className="text-center px-2">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Invertido</p>
                    <p className="font-mono font-bold text-charcoal-900 drop-shadow-sm">{formatCurrency(initial)}</p>
                  </div>

                  <div className="text-center px-2 border-x border-white/20">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Actual</p>
                    <p className="font-mono font-bold text-charcoal-900 drop-shadow-sm">{formatCurrency(current)}</p>
                  </div>

                  <div className="text-center px-2">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">ROI</p>
                    <div className="flex items-center gap-2 justify-center">
                      {isProfitable ? <TrendingUp className="w-5 h-5 text-emerald-600 drop-shadow-sm" /> :
                        isLoss ? <TrendingDown className="w-5 h-5 text-rose-600 drop-shadow-sm" /> :
                          <Activity className="w-5 h-5 text-slate-400 drop-shadow-sm" />}
                      <p className={cn(
                        "font-mono font-bold text-lg drop-shadow-sm",
                        isProfitable ? "text-emerald-600" : isLoss ? "text-rose-600" : "text-slate-500"
                      )}>
                        {isProfitable ? '+' : ''}{roi.toNumber().toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick update input */}
                <div className="hidden xl:flex items-center ml-0 xl:ml-6 mt-4 xl:mt-0 w-full xl:w-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <Input
                    type="number"
                    step="1"
                    placeholder="Act. Valor ($)"
                    className="w-full xl:w-32 h-10 text-sm font-bold bg-white/50 focus:bg-white"
                    onBlur={(e) => {
                      if (e.target.value && e.target.value !== inv.currentValue) {
                        updateInvestmentValue(inv.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement;
                        if (target.value && target.value !== inv.currentValue) {
                          updateInvestmentValue(inv.id, target.value);
                          target.value = '';
                          target.blur();
                        }
                      }
                    }}
                  />
                </div>
              </div>
            );
          })}

          {investments.length === 0 && (
            <div className="text-center py-12 rounded-3xl neu-inset">
              <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 font-bold uppercase tracking-wider text-sm mb-6">Sin inversiones rastreadas aún.</p>
              <Button onClick={() => setShowAddForm(true)}>Agrega tu primer activo</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
