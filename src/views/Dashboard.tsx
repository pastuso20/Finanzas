import React from 'react';
import { useFinanceStore } from '../store';
import { Card, cn } from '../components/ui';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, DollarSign, Activity } from 'lucide-react';
import { format, isBefore, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency, safeDate } from '../utils';
import {
  selectCashBalance,
  selectNetWorth,
  selectActiveInvestmentsValue,
  selectTotalSavings,
  selectActiveLoansPrincipal,
  selectPendingDebts,
} from '../selectors';

// Constantes de ejemplo ajustadas a COP
const mockNetWorthData = [
  { name: 'Ene', value: 45000000 },
  { name: 'Feb', value: 48000000 },
  { name: 'Mar', value: 46500000 },
  { name: 'Abr', value: 51000000 },
  { name: 'May', value: 55000000 },
  { name: 'Jun', value: 58500000 },
  { name: 'Jul', value: 62000000 },
];

export function Dashboard() {
  const initialBalance = useFinanceStore(state => state.initialBalance);
  const transactions = useFinanceStore(state => state.transactions);
  const loans = useFinanceStore(state => state.loans);
  const investments = useFinanceStore(state => state.investments);
  const debts = useFinanceStore(state => state.debts);
  const savings = useFinanceStore(state => state.savings);

  const snapshot = {
    initialBalance,
    transactions,
    loans,
    investments,
    debts,
    savings,
  };

  const totalInvestments = selectActiveInvestmentsValue(snapshot.investments);
  const totalSavings = selectTotalSavings(snapshot.savings);
  const totalLoans = selectActiveLoansPrincipal(snapshot.loans);
  const totalDebts = selectPendingDebts(snapshot.debts);
  const cashBalance = selectCashBalance(snapshot);
  const netWorth = selectNetWorth(snapshot);

  const today = new Date();
  const thirtyDaysFromNow = addDays(today, 30);
  const expiringLoans = loans.filter(l => {
    const due = safeDate(l.dueDate);
    return l.status === 'active' && due != null && isBefore(due, thirtyDaysFromNow);
  });

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 pb-20 md:pb-0" translate="no">
      {/* Refined Header - Expert UI */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
        <div className="flex flex-col">
          <h2 className="text-3xl md:text-5xl font-bold text-emerald-900 tracking-tight font-serif"><span>Resumen General</span></h2>
          <p className="text-slate-400 text-sm md:text-base mt-2"><span>Tu centro de comando financiero</span></p>
        </div>

        {/* Patrimonio Neto - Mobile Premium UI */}
        <div className="w-full md:w-auto bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-emerald-900/5 p-5 md:p-10 flex flex-col md:items-end relative overflow-hidden group notranslate">
          <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-emerald-50/50 rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16 transition-transform group-hover:scale-110" />
          <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.3em] mb-2 relative"><span>PATRIMONIO NETO TOTAL</span></p>
          <div className="flex flex-col md:items-end relative">
            <h3 className="text-3xl md:text-5xl font-bold text-emerald-900 font-mono tracking-tighter">
              <span>{formatCurrency(netWorth)}</span>
            </h3>
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-xs mt-3 md:mt-4 w-fit font-bold border border-emerald-100/50">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12.5% este mes</span>
            </div>
          </div>
        </div>
      </header>

      {/* Metric Cards - Optimized for Mobile Expert UI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 notranslate">
        <Card className="flex items-center gap-4 md:gap-5 p-4 md:p-8 border-none shadow-sm bg-white hover:shadow-md transition-shadow">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-emerald-700" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest"><span>ACTIVOS LÍQUIDOS</span></p>
            <p className="text-xl md:text-3xl font-bold text-emerald-900 font-mono tracking-tighter"><span>{formatCurrency(cashBalance)}</span></p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 md:gap-5 p-4 md:p-8 border-none shadow-sm bg-white hover:shadow-md transition-shadow">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 md:w-8 md:h-8 text-emerald-700" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest"><span>INVERSIONES</span></p>
            <p className="text-xl md:text-3xl font-bold text-emerald-900 font-mono tracking-tighter"><span>{formatCurrency(totalInvestments)}</span></p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 md:gap-5 p-4 md:p-8 border-none shadow-sm bg-white hover:shadow-md transition-shadow">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-rose-500" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest"><span>DEUDAS TOTALES</span></p>
            <p className="text-xl md:text-3xl font-bold text-rose-600 font-mono tracking-tighter"><span>{formatCurrency(totalDebts)}</span></p>
          </div>
        </Card>
      </div>

      {/* Main Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <Card className="lg:col-span-2 h-[300px] md:h-[400px] flex flex-col">
          <div className="mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-bold text-emerald-500"><span>Evolución del Patrimonio</span></h3>
            <p className="text-xs md:text-sm text-slate-500 font-medium"><span>Rendimiento en los últimos 7 meses</span></p>
          </div>
          <div className="flex-1 w-full min-h-[250px] md:min-h-[300px] relative mobile-chart">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={mockNetWorthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#004f39" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#004f39" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,79,57,0.1)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#596556"
                  tick={{ fill: '#596556', fontSize: 10, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#596556"
                  tick={{ fill: '#596556', fontSize: 10, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value / 1000000}M`}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,79,57,0.2)', borderRadius: '12px', color: '#151613', fontWeight: 500, fontSize: 12 }}
                  itemStyle={{ color: '#004f39', fontWeight: 600 }}
                  formatter={(value: number) => [formatCurrency(value), 'Patrimonio Neto']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#004f39"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  activeDot={{ r: 5, fill: '#004f39', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Side Panel: Alerts & Recent Activity */}
        <div className="space-y-6 md:space-y-8">
          <Card>
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <div className="p-2 neu-inset rounded-xl">
                <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-emerald-500 drop-shadow-sm"><span>Alertas de Préstamos</span></h3>
            </div>

            <div className="notranslate">
              {expiringLoans.length > 0 ? (
                <div className="space-y-3 md:space-y-4">
                  {expiringLoans.map(loan => (
                    <div key={loan.id} className="p-3 md:p-4 rounded-2xl neu-inset">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-charcoal-900 drop-shadow-sm text-sm md:text-base"><span>{loan.borrower}</span></p>
                        <p className="text-rose-500 font-mono text-xs md:text-sm font-bold"><span>{formatCurrency(loan.principal)}</span></p>
                      </div>
                      <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mt-2">
                        <span>Vence: {safeDate(loan.dueDate) ? format(safeDate(loan.dueDate)!, "dd 'de' MMM, yyyy", { locale: es }) : 'Sin fecha'}</span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs md:text-sm text-slate-500 font-medium italic py-4"><span>Sin préstamos por vencer pronto.</span></p>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-base md:text-lg font-bold text-emerald-500 mb-4 md:mb-6 drop-shadow-sm"><span>Transacciones Recientes</span></h3>
            <div className="space-y-3 md:space-y-4 notranslate">
              {snapshot.transactions.length > 0 ? (
                snapshot.transactions.slice(0, 4).map(tx => (
                  <div key={tx.id} className="flex justify-between items-center neu-inset p-3 rounded-2xl transition-transform hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center bg-white/40 shadow-sm border border-white/50",
                        tx.type === 'income' ? "text-emerald-500" : "text-rose-500"
                      )}>
                        {tx.type === 'income' ? <TrendingUp className="w-4 h-4 md:w-5 md:h-5" /> : <TrendingDown className="w-4 h-4 md:w-5 md:h-5" />}
                      </div>
                      <div>
                        <p className="text-xs md:text-sm font-bold text-charcoal-900 drop-shadow-sm"><span>{tx.category}</span></p>
                        <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5"><span>{safeDate(tx.date) ? format(safeDate(tx.date)!, "dd 'de' MMM", { locale: es }) : '—'}</span></p>
                      </div>
                    </div>
                    <p className={cn(
                      "font-mono text-xs md:text-sm font-bold drop-shadow-sm",
                      tx.type === 'income' ? "text-emerald-600" : "text-rose-600"
                    )}>
                      <span>{tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}</span>
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs md:text-sm text-slate-500 font-medium italic py-4"><span>Sin actividad reciente.</span></p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
