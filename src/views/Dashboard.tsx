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
  const { transactions, loans, investments } = useFinanceStore();

  const totalInvestments = investments.reduce((acc, inv) => acc.plus(new Decimal(inv.currentValue)), new Decimal(0));
  const totalLoans = loans.filter(l => l.status === 'active').reduce((acc, loan) => acc.plus(new Decimal(loan.principal)), new Decimal(0));

  const cashBalance = transactions.reduce((acc, tx) => {
    return tx.type === 'income' ? acc.plus(new Decimal(tx.amount)) : acc.minus(new Decimal(tx.amount));
  }, new Decimal(25000000));

  const netWorth = totalInvestments.plus(totalLoans).plus(cashBalance);

  const today = new Date();
  const thirtyDaysFromNow = addDays(today, 30);
  const expiringLoans = loans.filter(l =>
    l.status === 'active' &&
    isBefore(new Date(l.dueDate), thirtyDaysFromNow)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-0">
        <div className="w-full">
          <h2 className="text-3xl md:text-4xl font-bold text-emerald-500 tracking-tight leading-tight">Resumen General</h2>
          <p className="text-sm md:text-base text-slate-600 mt-1">Tu centro de comando financiero</p>
        </div>
        <div className="text-left md:text-right w-full md:w-auto bg-white/40 md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none border border-white/50 md:border-none shadow-sm md:shadow-none">
          <p className="text-xs md:text-sm text-slate-500 font-bold uppercase tracking-wider">Patrimonio Neto Total</p>
          <h3 className="text-3xl md:text-4xl font-bold text-charcoal-900 mt-1 font-mono">
            {formatCurrency(netWorth)}
          </h3>
          <div className="flex items-center justify-start md:justify-end gap-1 text-emerald-500 text-sm mt-1 font-medium">
            <TrendingUp className="w-4 h-4" />
            <span>+12.5% este mes</span>
          </div>
        </div>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl neu-inset flex items-center justify-center">
            <DollarSign className="w-7 h-7 text-emerald-500 drop-shadow-sm" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Activos Líquidos</p>
            <p className="text-2xl font-bold text-charcoal-900 font-mono drop-shadow-sm">{formatCurrency(cashBalance)}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl neu-inset flex items-center justify-center">
            <Activity className="w-7 h-7 text-emerald-500 drop-shadow-sm" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Inversiones</p>
            <p className="text-2xl font-bold text-charcoal-900 font-mono drop-shadow-sm">{formatCurrency(totalInvestments)}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl neu-inset flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-rose-500 drop-shadow-sm" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Préstamos Activos</p>
            <p className="text-2xl font-bold text-charcoal-900 font-mono drop-shadow-sm">{formatCurrency(totalLoans)}</p>
          </div>
        </Card>
      </div>

      {/* Main Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 h-[400px] flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-emerald-500">Evolución del Patrimonio</h3>
            <p className="text-sm text-slate-500 font-medium">Rendimiento en los últimos 7 meses</p>
          </div>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
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
              <h3 className="text-lg font-bold text-emerald-500 drop-shadow-sm">Alertas de Préstamos</h3>
            </div>

            {expiringLoans.length > 0 ? (
              <div className="space-y-4">
                {expiringLoans.map(loan => (
                  <div key={loan.id} className="p-4 rounded-2xl neu-inset">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-charcoal-900 drop-shadow-sm">{loan.borrower}</p>
                      <p className="text-rose-500 font-mono text-sm font-bold">{formatCurrency(loan.principal)}</p>
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-2">
                      Vence: {format(new Date(loan.dueDate), "dd 'de' MMM, yyyy", { locale: es })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 font-medium italic py-4">Sin préstamos por vencer pronto.</p>
            )}
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-emerald-500 mb-6 drop-shadow-sm">Transacciones Recientes</h3>
            <div className="space-y-4">
              {transactions.slice(0, 4).map(tx => (
                <div key={tx.id} className="flex justify-between items-center neu-inset p-3 rounded-2xl transition-transform hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center bg-white/40 shadow-sm border border-white/50",
                      tx.type === 'income' ? "text-emerald-500" : "text-rose-500"
                    )}>
                      {tx.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-charcoal-900 drop-shadow-sm">{tx.category}</p>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">{format(new Date(tx.date), "dd 'de' MMM", { locale: es })}</p>
                    </div>
                  </div>
                  <p className={cn(
                    "font-mono text-sm font-bold drop-shadow-sm",
                    tx.type === 'income' ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
