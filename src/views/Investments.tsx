import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '../store';
import { Card, Button, Input, Label, cn } from '../components/ui';
import Decimal from 'decimal.js';
import { TrendingUp, TrendingDown, Plus, Minus, Activity, BarChart3, AlertCircle, CheckCircle2, History } from 'lucide-react';
import { Investment } from '../types';
import {
  formatCurrency,
  getCashBalance,
  calcInvestmentCurrentValue,
  calcInvestmentProfit,
  calcInvestmentROI,
  safeDate,
  formatMonthYear,
  sumDecimal,
} from '../utils';

export function Investments() {
  const investments = useFinanceStore(state => state.investments);
  const transactions = useFinanceStore(state => state.transactions);
  const initialBalance = useFinanceStore(state => state.initialBalance);
  const addInvestment = useFinanceStore(state => state.addInvestment);
  const markInvestmentAsCompleted = useFinanceStore(state => state.markInvestmentAsCompleted);
  const updateInvestmentPrice = useFinanceStore(state => state.updateInvestmentPrice);
  const [showAddForm, setShowAddForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [newInv, setNewInv] = useState({
    assetName: '',
    description: '',
    initialInvestment: '',
    productPricePerUnit: '',
    totalProductQuantity: '',
    purchaseDate: new Date().toISOString().split('T')[0],
  });

  const cashBalance = getCashBalance(initialBalance, transactions);

  const previewCurrentValue = useMemo(() => {
    if (!newInv.productPricePerUnit || !newInv.totalProductQuantity) return null;
    return calcInvestmentCurrentValue(newInv.productPricePerUnit, newInv.totalProductQuantity);
  }, [newInv.productPricePerUnit, newInv.totalProductQuantity]);

  const previewROI = useMemo(() => {
    if (!previewCurrentValue || !newInv.initialInvestment) return null;
    return calcInvestmentROI(newInv.initialInvestment, previewCurrentValue);
  }, [previewCurrentValue, newInv.initialInvestment]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (
      !newInv.assetName ||
      !newInv.description ||
      !newInv.initialInvestment ||
      !newInv.productPricePerUnit ||
      !newInv.totalProductQuantity
    ) return;

    const capital = new Decimal(newInv.initialInvestment);
    if (cashBalance.lessThan(capital)) {
      setErrorMsg('No tienes suficiente efectivo disponible para esta inversión.');
      return;
    }

    try {
      const success = await addInvestment({
        assetName: newInv.assetName,
        description: newInv.description,
        initialInvestment: newInv.initialInvestment,
        productPricePerUnit: newInv.productPricePerUnit,
        totalProductQuantity: newInv.totalProductQuantity,
        purchaseDate: new Date(newInv.purchaseDate).toISOString(),
      });

      if (!success) {
        setErrorMsg('No se pudo registrar la inversión. Verifica tu saldo disponible.');
        return;
      }

      setNewInv({
        assetName: '',
        description: '',
        initialInvestment: '',
        productPricePerUnit: '',
        totalProductQuantity: '',
        purchaseDate: new Date().toISOString().split('T')[0],
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding investment:', error);
      setErrorMsg('Ocurrió un error al registrar la inversión.');
    }
  };

  const activeInvestments = investments.filter(inv => inv.status === 'active');
  const completedInvestments = investments.filter(inv => inv.status === 'completed');

  const totalInvested = sumDecimal(activeInvestments, inv => inv.initialInvestment);
  const totalCurrentValue = sumDecimal(activeInvestments, inv => inv.currentValue);
  const netProfit = calcInvestmentProfit(totalInvested, totalCurrentValue);
  const overallROI = calcInvestmentROI(totalInvested, totalCurrentValue);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0" translate="no">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div className="flex flex-col">
          <h2 className="text-4xl md:text-5xl font-bold text-emerald-900 tracking-tight font-serif"><span>Inversiones</span></h2>
          <p className="text-slate-400 text-sm md:text-base mt-2"><span>Sigue el rendimiento de tus proyectos</span></p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="md:hidden w-full flex items-center justify-center gap-3 bg-emerald-900 text-white py-4 rounded-3xl shadow-xl shadow-emerald-900/20 active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5 text-accent-gold" />
          <span className="font-bold text-sm tracking-wide">Nuevo Proyecto</span>
        </button>

        <Button onClick={() => setShowAddForm(!showAddForm)} className="hidden md:flex gap-2 rounded-2xl px-8 h-12">
          {showAddForm ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm ? 'Cancelar' : 'Nuevo Proyecto'}</span>
        </Button>
      </header>

      {/* Summary Metrics - Mobile */}
      <div className="md:hidden pt-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1"><span>RESUMEN DEL PORTAFOLIO</span></p>
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
          <div className="p-6 flex justify-between items-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest"><span>CAPITAL TOTAL</span></p>
            <p className="text-xl font-bold text-emerald-900 font-mono tracking-tighter"><span>{formatCurrency(totalInvested)}</span></p>
          </div>
          <div className="p-6 flex justify-between items-center bg-slate-50/30">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest"><span>VALOR ACTUAL</span></p>
            <p className="text-xl font-bold text-emerald-900 font-mono tracking-tighter"><span>{formatCurrency(totalCurrentValue)}</span></p>
          </div>
          <div className="p-6 flex justify-between items-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest"><span>BENEFICIO / ROI</span></p>
            <div className="text-right">
              <p className={cn("text-xl font-bold font-mono tracking-tighter", netProfit.isPositive() ? "text-emerald-600" : "text-rose-600")}>
                <span>{netProfit.isPositive() ? '+' : ''}{formatCurrency(netProfit)}</span>
              </p>
              <p className={cn("text-[10px] font-bold mt-1", overallROI.isPositive() ? "text-emerald-600" : "text-rose-600")}>
                <span>{overallROI.isPositive() ? '+' : ''}{overallROI.toNumber().toFixed(2)}%</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Summary Metrics */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col justify-center bg-white border-none shadow-sm">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2"><span>Capital Total Invertido</span></p>
          <p className="text-3xl font-bold text-emerald-900 font-mono"><span>{formatCurrency(totalInvested)}</span></p>
        </Card>

        <Card className="flex flex-col justify-center bg-white border-none shadow-sm">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2"><span>Valor Actual del Portafolio</span></p>
          <p className="text-3xl font-bold text-emerald-900 font-mono"><span>{formatCurrency(totalCurrentValue)}</span></p>
        </Card>

        <Card className="flex flex-col justify-center bg-white border-none shadow-sm">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2"><span>Beneficio Neto / ROI</span></p>
          <div className="flex items-end gap-3">
            <p className={cn(
              "text-3xl font-bold font-mono",
              netProfit.isPositive() ? "text-emerald-600" : netProfit.isNegative() ? "text-rose-600" : "text-charcoal-900"
            )}>
              <span>{netProfit.isPositive() ? '+' : ''}{formatCurrency(netProfit)}</span>
            </p>
            <p className={cn(
              "text-lg font-bold mb-1",
              overallROI.isPositive() ? "text-emerald-600" : overallROI.isNegative() ? "text-rose-600" : "text-slate-500"
            )}>
              <span>({overallROI.isPositive() ? '+' : ''}{overallROI.toNumber().toFixed(2)}%)</span>
            </p>
          </div>
        </Card>
      </div>

      {showAddForm && (
        <Card className="mb-6 border-emerald-500/30">
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Saldo disponible: <strong className="text-emerald-900 font-mono">{formatCurrency(cashBalance)}</strong></span>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 text-rose-600 text-sm bg-rose-50 px-4 py-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assetName"><span>Nombre del Proyecto</span></Label>
                <Input id="assetName" value={newInv.assetName} onChange={e => setNewInv({ ...newInv, assetName: e.target.value })} placeholder="Ej. Startup X" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description"><span>Descripción</span></Label>
                <Input id="description" value={newInv.description} onChange={e => setNewInv({ ...newInv, description: e.target.value })} placeholder="Ej. Tecnología" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="initialInvestment"><span>Capital Invertido ($)</span></Label>
                <Input id="initialInvestment" type="number" step="1" min="0" value={newInv.initialInvestment} onChange={e => setNewInv({ ...newInv, initialInvestment: e.target.value })} placeholder="100000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productPricePerUnit"><span>Precio por Unidad ($)</span></Label>
                <Input id="productPricePerUnit" type="number" step="1" min="0" value={newInv.productPricePerUnit} onChange={e => setNewInv({ ...newInv, productPricePerUnit: e.target.value })} placeholder="5000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalProductQuantity"><span>Cantidad Total de Producto</span></Label>
                <Input id="totalProductQuantity" type="number" step="1" min="1" value={newInv.totalProductQuantity} onChange={e => setNewInv({ ...newInv, totalProductQuantity: e.target.value })} placeholder="50" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchaseDate"><span>Fecha</span></Label>
                <Input id="purchaseDate" type="date" value={newInv.purchaseDate} onChange={e => setNewInv({ ...newInv, purchaseDate: e.target.value })} required />
              </div>
            </div>

            {previewCurrentValue && (
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex flex-wrap gap-6 text-sm">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1"><span>Valor del Inventario</span></p>
                  <p className="font-mono font-bold text-emerald-900"><span>{formatCurrency(previewCurrentValue)}</span></p>
                  <p className="text-[10px] text-slate-400 mt-0.5"><span>{newInv.productPricePerUnit} × {newInv.totalProductQuantity} unidades</span></p>
                </div>
                {previewROI && newInv.initialInvestment && (
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1"><span>ROI Estimado</span></p>
                    <p className={cn("font-mono font-bold", previewROI.isPositive() ? "text-emerald-600" : previewROI.isNegative() ? "text-rose-600" : "text-slate-600")}>
                      <span>{previewROI.isPositive() ? '+' : ''}{previewROI.toNumber().toFixed(2)}%</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5"><span>Beneficio: {formatCurrency(calcInvestmentProfit(newInv.initialInvestment, previewCurrentValue))}</span></p>
                  </div>
                )}
              </div>
            )}

            <Button type="submit" className="w-full md:w-auto"><span>Agregar Proyecto</span></Button>
          </form>
        </Card>
      )}

      <div className="space-y-6 notranslate">
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-emerald-500 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            <span>Proyectos Activos</span>
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {activeInvestments.length > 0 ? (
              activeInvestments.map(inv => (
                <InvestmentCard
                  key={inv.id}
                  inv={inv}
                  onMarkCompleted={() => markInvestmentAsCompleted(inv.id)}
                  onUpdatePrice={(price) => updateInvestmentPrice(inv.id, price)}
                />
              ))
            ) : investments.length === 0 ? (
              <div className="text-center py-12 rounded-3xl neu-inset">
                <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-wider text-sm mb-6"><span>Sin inversiones rastreadas aún.</span></p>
                <Button onClick={() => setShowAddForm(true)}><span>Agrega tu primer activo</span></Button>
              </div>
            ) : (
              <p className="text-slate-500 text-sm italic py-4"><span>No hay proyectos activos.</span></p>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-bold text-slate-400 flex items-center gap-2">
            <History className="w-5 h-5" />
            <span>Proyectos Completados</span>
          </h3>

          <div className="grid grid-cols-1 gap-4 opacity-80">
            {completedInvestments.length > 0 ? (
              completedInvestments.map(inv => (
                <InvestmentCard key={inv.id} inv={inv} />
              ))
            ) : (
              <p className="text-slate-500 text-sm italic py-4"><span>No hay proyectos completados.</span></p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function InvestmentCard({
  inv,
  onMarkCompleted,
  onUpdatePrice,
}: {
  inv: Investment;
  onMarkCompleted?: () => void;
  onUpdatePrice?: (price: string) => void;
}) {
  const isCompleted = inv.status === 'completed';
  const initial = new Decimal(inv.initialInvestment);
  const current = new Decimal(inv.currentValue);
  const profit = calcInvestmentProfit(initial, current);
  const roi = calcInvestmentROI(initial, current);
  const qty = new Decimal(inv.totalProductQuantity);
  const price = new Decimal(inv.productPricePerUnit);
  const isProfitable = profit.isPositive();
  const isLoss = profit.isNegative();

  return (
    <div className="p-4 md:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between neu-button rounded-3xl group gap-4 md:gap-6">
      <div className="flex justify-between items-start md:items-center w-full md:w-auto md:flex-1">
        <div className="flex items-center gap-3 md:gap-4">
          <div className={cn(
            "w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center font-bold text-lg md:text-xl neu-inset drop-shadow-sm shrink-0",
            isCompleted ? "text-slate-400" :
              isProfitable ? "text-emerald-600" :
                isLoss ? "text-rose-600" :
                  "text-slate-500"
          )}>
            <span>{inv.assetName.substring(0, 1)}</span>
          </div>
          <div>
            <h4 className="text-base md:text-lg font-bold text-charcoal-900 drop-shadow-sm leading-tight md:leading-normal">
              <span>{inv.assetName}</span>
              {isCompleted && (
                <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 align-middle">Completado</span>
              )}
            </h4>
            <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5 md:mt-1">
              <span>
                {inv.description}
                <span className="hidden md:inline"> • {formatCurrency(price)}/u × {qty.toNumber()} uds</span>
                            {safeDate(inv.purchaseDate) && <span className="hidden md:inline"> • {formatMonthYear(inv.purchaseDate)}</span>}
              </span>
            </p>
          </div>
        </div>

        <div className="md:hidden text-right pl-2">
          <p className="font-mono font-bold text-base text-charcoal-900 drop-shadow-sm leading-tight"><span>{formatCurrency(current)}</span></p>
          <div className="flex items-center justify-end gap-1 mt-0.5">
            {isProfitable ? <TrendingUp className="w-3 h-3 text-emerald-600 drop-shadow-sm" /> :
              isLoss ? <TrendingDown className="w-3 h-3 text-rose-600 drop-shadow-sm" /> :
                <Activity className="w-3 h-3 text-slate-400 drop-shadow-sm" />}
            <p className={cn(
              "font-mono font-bold text-[10px] drop-shadow-sm",
              isProfitable ? "text-emerald-600" : isLoss ? "text-rose-600" : "text-slate-500"
            )}>
              <span>{roi.toNumber().toFixed(2)}%</span>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden md:flex flex-1 justify-between items-center w-full neu-inset p-4 rounded-2xl gap-4">
        <div className="text-center px-2">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1"><span>Invertido</span></p>
          <p className="font-mono font-bold text-charcoal-900 drop-shadow-sm"><span>{formatCurrency(initial)}</span></p>
        </div>

        <div className="text-center px-2 border-x border-white/20">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1"><span>{isCompleted ? 'Retorno' : 'Valor Inventario'}</span></p>
          <p className="font-mono font-bold text-charcoal-900 drop-shadow-sm"><span>{formatCurrency(current)}</span></p>
        </div>

        <div className="text-center px-2">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1"><span>ROI</span></p>
          <div className="flex items-center gap-2 justify-center">
            {isProfitable ? <TrendingUp className="w-5 h-5 text-emerald-600 drop-shadow-sm" /> :
              isLoss ? <TrendingDown className="w-5 h-5 text-rose-600 drop-shadow-sm" /> :
                <Activity className="w-5 h-5 text-slate-400 drop-shadow-sm" />}
            <p className={cn(
              "font-mono font-bold text-lg drop-shadow-sm",
              isProfitable ? "text-emerald-600" : isLoss ? "text-rose-600" : "text-slate-500"
            )}>
              <span>{isProfitable ? '+' : ''}{roi.toNumber().toFixed(2)}%</span>
            </p>
          </div>
        </div>
      </div>

      {!isCompleted && (onMarkCompleted || onUpdatePrice) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          {onMarkCompleted && (
            <Button onClick={onMarkCompleted} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              <span>Marcar Completado</span>
            </Button>
          )}
          {onUpdatePrice && (
            <Input
              type="number"
              step="1"
              placeholder="Precio/u ($)"
              className="w-full sm:w-32 h-10 text-sm font-bold bg-white/50 focus:bg-white md:opacity-0 md:group-hover:opacity-100 transition-opacity"
              onBlur={(e) => {
                if (e.target.value && e.target.value !== inv.productPricePerUnit) {
                  onUpdatePrice(e.target.value);
                  e.target.value = '';
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const target = e.target as HTMLInputElement;
                  if (target.value && target.value !== inv.productPricePerUnit) {
                    onUpdatePrice(target.value);
                    target.value = '';
                    target.blur();
                  }
                }
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
