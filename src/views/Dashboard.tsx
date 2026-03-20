import React from 'react';
import { useFinanceStore } from '../store';
import { Card, cn } from '../components/ui';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, DollarSign, Activity } from 'lucide-react';
import Decimal from 'decimal.js';
import { format, isBefore, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '../utils';

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
  const { transactions, loans, investments, debts, initialBalance } = useFinanceStore();

  const totalInvestments = investments.reduce((acc, inv) => acc.plus(new Decimal(inv.currentValue)), new Decimal(0));
  const totalLoans = loans.filter(l => l.status === 'active').reduce((acc, loan) => acc.plus(new Decimal(loan.principal)), new Decimal(0));
  const totalDebts = debts.filter(d => d.status === 'pending').reduce((acc, d) => acc.plus(new Decimal(d.amount)), new Decimal(0));

  const cashBalance = transactions.reduce((acc, tx) => {
    return tx.type === 'income' ? acc.plus(new Decimal(tx.amount)) : acc.minus(new Decimal(tx.amount));
  }, new Decimal(initialBalance || '0'));

  const netWorth = totalInvestments.plus(totalLoans).plus(cashBalance).minus(totalDebts);

  const today = new Date();
  const thirtyDaysFromNow = addDays(today, 30);
  const expiringLoans = loans.filter(l =>
    l.status === 'active' &&
    isBefore(new Date(l.dueDate), thirtyDaysFromNow)
  );

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 pb-20 md:pb-0" translate="no">
      {/* Refined Header - Expert UI */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-0">
        <div className="flex flex-col">
          <h2 className="text-4xl md:text-5xl font-bold text-emerald-900 tracking-tight font-serif"><span>Resumen General</span></h2>
          <p className="text-slate-400 text-sm md:text-base mt-2"><span>Tu centro de comando financiero</span></p>
        </div>
        
        {/* Patrimonio Neto - Mobile Premium UI */}
        <div className="w-full md:w-auto bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-emerald-900/5 p-8 md:p-10 flex flex-col md:items-end relative overflow-hidden group notranslate">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.3em] mb-2 relative"><span>PATRIMONIO NETO TOTAL</span></p>
          <div className="flex flex-col md:items-end relative">
            <h3 className="text-4xl md:text-5xl font-bold text-emerald-900 font-mono tracking-tighter">
              <span>{formatCurrency(netWorth)}</span>
            </h3>
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full text-[10px] md:text-xs mt-4 w-fit font-bold border border-emerald-100/50">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12.5% este mes</span>
            </div>
          </div>
        </div>
      </header>

      {/* Metric Cards - Optimized for Mobile Expert UI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 notranslate">
        <Card className="flex items-center gap-5 p-6 md:p-8 border-none shadow-sm bg-white hover:shadow-md transition-shadow">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center shrink-0">
            <DollarSign className="w-7 h-7 md:w-8 md:h-8 text-emerald-700" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest"><span>ACTIVOS LÍQUIDOS</span></p>
            <p className="text-2xl md:text-3xl font-bold text-emerald-900 font-mono tracking-tighter"><span>{formatCurrency(cashBalance)}</span></p>
          </div>
        </Card>

        <Card className="flex items-center gap-5 p-6 md:p-8 border-none shadow-sm bg-white hover:shadow-md transition-shadow">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center shrink-0">
            <Activity className="w-7 h-7 md:w-8 md:h-8 text-emerald-700" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest"><span>INVERSIONES</span></p>
            <p className="text-2xl md:text-3xl font-bold text-emerald-900 font-mono tracking-tighter"><span>{formatCurrency(totalInvestments)}</span></p>
          </div>
        </Card>

        <Card className="flex items-center gap-5 p-6 md:p-8 border-none shadow-sm bg-white hover:shadow-md transition-shadow">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center shrink-0">
            <AlertCircle className="w-7 h-7 md:w-8 md:h-8 text-rose-500" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest"><span>DEUDAS TOTALES</span></p>
            <p className="text-2xl md:text-3xl font-bold text-rose-600 font-mono tracking-tighter"><span>{formatCurrency(totalDebts)}</span></p>
          </div>
        </Card>
      </div>

      {/* Main Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 h-[400px] flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-emerald-500"><span>Evolución del Patrimonio</span></h3>
            <p className="text-sm text-slate-500 font-medium"><span>Rendimiento en los últimos 7 meses</span></p>
          </div>
          <div className="flex-1 w-full min-h-[300px] relative">
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
                  tick={{ fill: '#596556', fontSize: 12, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#596556"
                  tick={{ fill: '#596556', fontSize: 12, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value / 1000000}M`}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,79,57,0.2)', borderRadius: '12px', color: '#151613', fontWeight: 500 }}
                  itemStyle={{ color: '#004f39', fontWeight: 600 }}
                  formatter={(value: number) => [formatCurrency(value), 'Patrimonio Neto']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#004f39"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  activeDot={{ r: 6, fill: '#004f39', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Side Panel: Alerts & Recent Activity */}
        <div className="space-y-8">
          <Card>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 neu-inset rounded-xl">
                <AlertCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-emerald-500 drop-shadow-sm"><span>Alertas de Préstamos</span></h3>
            </div>

            <div className="notranslate">
              {expiringLoans.length > 0 ? (
                <div className="space-y-4">
                  {expiringLoans.map(loan => (
                    <div key={loan.id} className="p-4 rounded-2xl neu-inset">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-charcoal-900 drop-shadow-sm"><span>{loan.borrower}</span></p>
                        <p className="text-rose-500 font-mono text-sm font-bold"><span>{formatCurrency(loan.principal)}</span></p>
                      </div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-2">
                        <span>Vence: {format(new Date(loan.dueDate), "dd 'de' MMM, yyyy", { locale: es })}</span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 font-medium italic py-4"><span>Sin préstamos por vencer pronto.</span></p>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-emerald-500 mb-6 drop-shadow-sm"><span>Transacciones Recientes</span></h3>
            <div className="space-y-4 notranslate">
              {transactions.length > 0 ? (
                transactions.slice(0, 4).map(tx => (
                  <div key={tx.id} className="flex justify-between items-center neu-inset p-3 rounded-2xl transition-transform hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center bg-white/40 shadow-sm border border-white/50",
                        tx.type === 'income' ? "text-emerald-500" : "text-rose-500"
                      )}>
                        {tx.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-charcoal-900 drop-shadow-sm"><span>{tx.category}</span></p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5"><span>{format(new Date(tx.date), "dd 'de' MMM", { locale: es })}</span></p>
                      </div>
                    </div>
                    <p className={cn(
                      "font-mono text-sm font-bold drop-shadow-sm",
                      tx.type === 'income' ? "text-emerald-600" : "text-rose-600"
                    )}>
                      <span>{tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}</span>
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 font-medium italic py-4"><span>Sin actividad reciente.</span></p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
