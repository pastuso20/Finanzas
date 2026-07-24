import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '../store';
import { Card, cn } from '../components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, DollarSign, Activity, Filter, PieChart as PieChartIcon, HandCoins, MessageCircle, Send, ArrowRight } from 'lucide-react';
import { CardSpotlight } from '../components/ui/card-spotlight';
import { HealthScore } from '../components/HealthScore';
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
  { name: 'Ago', value: 64000000 },
  { name: 'Sep', value: 66500000 },
  { name: 'Oct', value: 68000000 },
  { name: 'Nov', value: 72000000 },
  { name: 'Dic', value: 75000000 },
];

export function Dashboard() {
  const initialBalance = useFinanceStore(state => state.initialBalance);
  const transactions = useFinanceStore(state => state.transactions);
  const loans = useFinanceStore(state => state.loans);
  const investments = useFinanceStore(state => state.investments);
  const debts = useFinanceStore(state => state.debts);
  const savings = useFinanceStore(state => state.savings);
  const userName = useFinanceStore(state => state.userName);

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

  const expenseData = useMemo(() => {
    const expenses = transactions.filter(tx => tx.type === 'expense');
    const map = new Map<string, number>();
    expenses.forEach(tx => {
      const current = map.get(tx.category) || 0;
      map.set(tx.category, current + Number(tx.amount));
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const COLORS = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#f59e0b', // amber
    '#10b981', // emerald
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
    '#6366f1', // indigo
    '#84cc16'  // lime
  ];

  const [chartFilter, setChartFilter] = useState<'year' | 'month' | 'day'>('month');

  const filteredChartData = useMemo(() => {
    const map = new Map<string, { name: string, value: number, timestamp: number }>();

    transactions.forEach(tx => {
      const txDate = safeDate(tx.date);
      if (!txDate) return;

      let key = '';
      let name = '';
      
      if (chartFilter === 'year') {
        key = format(txDate, 'yyyy');
        name = key;
      } else if (chartFilter === 'month') {
        key = format(txDate, 'yyyy-MM');
        name = format(txDate, 'MMM yyyy', { locale: es });
      } else if (chartFilter === 'day') {
        key = format(txDate, 'yyyy-MM-dd');
        const dayName = format(txDate, 'EEEE', { locale: es });
        name = dayName.charAt(0).toUpperCase() + dayName.slice(1) + format(txDate, ' dd MMM', { locale: es });
      }

      const amount = Number(tx.amount) || 0;
      const net = tx.type === 'income' ? amount : -amount;
      
      if (!map.has(key)) {
        map.set(key, { name, value: net, timestamp: txDate.getTime() });
      } else {
        const existing = map.get(key)!;
        existing.value += net;
      }
    });

    const data = Array.from(map.values())
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(item => ({ name: item.name, value: item.value }));
      
    if (data.length === 0) {
      return [{ name: 'Sin datos', value: 0 }];
    }
    
    return data;
  }, [chartFilter, transactions]);

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 pb-20 md:pb-0" translate="no">
      {/* Refined Header - Expert UI */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-start gap-6 md:gap-0">
        <div className="flex flex-col w-full md:max-w-md lg:max-w-xl">
          <h2 className="text-3xl md:text-5xl font-bold text-emerald-900 tracking-tight font-serif"><span>Resumen General</span></h2>
          <p className="text-slate-400 text-sm md:text-base mt-2"><span>Tu centro de comando financiero</span></p>

          {/* Smart Contextual Banner */}
          {!useFinanceStore(state => state.telegramChatId) && (
            <CardSpotlight 
              className="w-full mt-6 rounded-[1.5rem] shadow-[0_8px_30px_rgb(34,158,217,0.15)] border border-[#2AABEE]/20 p-6 flex flex-col xl:flex-row items-center justify-between text-slate-800 overflow-hidden relative cursor-pointer bg-white"
              color="#f0f9ff"
            >
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#2AABEE]/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-[#2AABEE]/5 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 flex-1 pr-4 mb-4 xl:mb-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-[#2AABEE]/10 p-1.5 rounded-lg">
                    <Send className="w-4 h-4 text-[#229ED9]" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-slate-900">Registro Rápido</h3>
                </div>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-1">
                  ¿Quieres registrar gastos en 3 segundos? Vincula nuestro bot de Telegram.
                </p>
              </div>
              <div className="relative z-10 w-full xl:w-auto shrink-0">
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'settings' }))}
                  className="flex items-center justify-center w-full xl:w-auto px-5 py-2.5 bg-[#229ED9] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-center"
                >
                  Vincular Bot
                </button>
              </div>
            </CardSpotlight>
          )}

          {/* Health Score - Moved here to balance layout */}
          <div className="mt-6">
            <HealthScore />
          </div>
        </div>

        {/* Patrimonio Neto */}
        <div className="flex flex-col gap-4 w-full md:w-auto">
          {/* Patrimonio Neto - Mobile Premium UI */}
        <div className="w-full md:w-auto bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-emerald-900/5 p-6 md:p-10 flex flex-col md:items-end justify-center relative overflow-hidden group notranslate min-h-[220px] md:min-h-[240px]">
          <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-emerald-50/50 rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16 transition-transform group-hover:scale-110" />
          
          <div className="flex flex-col md:items-end relative w-full h-full justify-center">
            <p className="text-sm md:text-base text-slate-500 font-medium mb-3 md:mb-4">
              Hola, <span className="font-bold text-emerald-800">{userName || 'Usuario'}</span> 👋
            </p>
            <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.3em] mb-2 relative"><span>PATRIMONIO NETO TOTAL</span></p>
            <h3 className="text-3xl md:text-5xl font-bold text-emerald-900 font-mono tracking-tighter">
              <span>{formatCurrency(netWorth)}</span>
            </h3>
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-xs mt-3 md:mt-4 w-fit font-bold border border-emerald-100/50">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12.5% este mes</span>
            </div>
          </div>
        </div>
        </div>
      </header>

      {/* Metric Cards - Optimized for Mobile Expert UI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 notranslate">
        <Card className="flex items-center gap-3 md:gap-4 p-4 md:p-6 border-none shadow-sm bg-white hover:shadow-md transition-shadow">
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5 md:w-7 md:h-7 text-emerald-700" />
          </div>
          <div className="flex flex-col gap-0.5 md:gap-1 w-full">
            <p className="text-[10px] md:text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-tight"><span>ACTIVOS LÍQUIDOS</span></p>
            <p className="text-base md:text-lg xl:text-xl font-bold text-emerald-900 font-mono tracking-tighter"><span>{formatCurrency(cashBalance)}</span></p>
          </div>
        </Card>

        <Card className="flex items-center gap-3 md:gap-4 p-4 md:p-6 border-none shadow-sm bg-white hover:shadow-md transition-shadow">
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 md:w-7 md:h-7 text-emerald-700" />
          </div>
          <div className="flex flex-col gap-0.5 md:gap-1 w-full">
            <p className="text-[10px] md:text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-tight"><span>INVERSIONES</span></p>
            <p className="text-base md:text-lg xl:text-xl font-bold text-emerald-900 font-mono tracking-tighter"><span>{formatCurrency(totalInvestments)}</span></p>
          </div>
        </Card>

        <Card className="flex items-center gap-3 md:gap-4 p-4 md:p-6 border-none shadow-sm bg-white hover:shadow-md transition-shadow">
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 md:w-7 md:h-7 text-rose-500" />
          </div>
          <div className="flex flex-col gap-0.5 md:gap-1 w-full">
            <p className="text-[10px] md:text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-tight"><span>DEUDAS TOTALES</span></p>
            <p className="text-base md:text-lg xl:text-xl font-bold text-rose-600 font-mono tracking-tighter"><span>{formatCurrency(totalDebts)}</span></p>
          </div>
        </Card>

        <Card className="flex items-center gap-3 md:gap-4 p-4 md:p-6 border-none shadow-sm bg-white hover:shadow-md transition-shadow">
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
            <HandCoins className="w-5 h-5 md:w-7 md:h-7 text-sky-500" />
          </div>
          <div className="flex flex-col gap-0.5 md:gap-1 w-full">
            <p className="text-[10px] md:text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-tight"><span>PRÉSTAMOS</span></p>
            <p className="text-base md:text-lg xl:text-xl font-bold text-sky-600 font-mono tracking-tighter"><span>{formatCurrency(totalLoans)}</span></p>
          </div>
        </Card>
      </div>



      {/* Main Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <Card className="h-[300px] md:h-[400px] flex flex-col">
          <div className="mb-4 md:mb-6 flex justify-between items-start">
            <div>
              <h3 className="text-base md:text-lg font-bold text-emerald-500"><span>Ganancia Neta en el Tiempo</span></h3>
              <p className="text-xs md:text-sm text-slate-500 font-medium"><span>Análisis de tus ingresos y gastos</span></p>
            </div>
            
            <div className="flex items-center gap-2 bg-emerald-50/50 p-1 rounded-xl border border-emerald-100">
              <Filter className="w-4 h-4 text-emerald-600 ml-2" />
              <select
                value={chartFilter}
                onChange={(e) => setChartFilter(e.target.value as 'year' | 'month' | 'day')}
                className="bg-transparent border-none text-xs font-bold text-emerald-700 focus:ring-0 cursor-pointer p-1 pr-6 outline-none"
              >
                <option value="year">Por Año</option>
                <option value="month">Por Mes</option>
                <option value="day">Por Día</option>
              </select>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-[250px] md:min-h-[300px] relative mobile-chart">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={filteredChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#004f39" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#004f39" stopOpacity={0.4} />
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
                  tickFormatter={(value) => {
                    const isNeg = value < 0;
                    const absVal = Math.abs(value);
                    return (isNeg ? '-' : '') + `$${(absVal / 1000).toFixed(0)}k`;
                  }}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,79,57,0.2)', borderRadius: '12px', color: '#151613', fontWeight: 500, fontSize: 12 }}
                  itemStyle={{ color: '#004f39', fontWeight: 600 }}
                  cursor={{ fill: 'rgba(0,79,57,0.05)' }}
                  formatter={(value: number) => [formatCurrency(value), 'Ganancia Neta']}
                />
                <Bar
                  dataKey="value"
                  fill="url(#barGradient)"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

          {/* Transacciones Recientes (Solo Escritorio) */}
          <div className="hidden lg:block">
            <Card>
              <h3 className="text-base md:text-lg font-bold text-emerald-500 mb-4 md:mb-6 drop-shadow-sm"><span>Transacciones Recientes</span></h3>
              <div className="space-y-3 md:space-y-4 notranslate">
                {snapshot.transactions.length > 0 ? (
                  snapshot.transactions.slice(0, 4).map(tx => {
                    const isSaving = tx.category === 'Ahorro';
                    return (
                      <div key={tx.id} className="flex justify-between items-center neu-inset p-3 rounded-2xl transition-transform hover:-translate-y-1 hover:shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center bg-white/40 shadow-sm border border-white/50",
                            isSaving ? "text-blue-500" : (tx.type === 'income' ? "text-emerald-500" : "text-rose-500")
                          )}>
                            {isSaving ? <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-blue-500" /> : (tx.type === 'income' ? <TrendingUp className="w-4 h-4 md:w-5 md:h-5" /> : <TrendingDown className="w-4 h-4 md:w-5 md:h-5" />)}
                          </div>
                          <div>
                            <p className="text-xs md:text-sm font-bold text-charcoal-900 drop-shadow-sm"><span>{tx.category}</span></p>
                            <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5"><span>{safeDate(tx.date) ? format(safeDate(tx.date)!, "dd 'de' MMM", { locale: es }) : '—'}</span></p>
                          </div>
                        </div>
                        <p className={cn(
                          "font-mono text-xs md:text-sm font-bold drop-shadow-sm",
                          isSaving ? "text-blue-600" : (tx.type === 'income' ? "text-emerald-600" : "text-rose-600")
                        )}>
                          <span>{tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}</span>
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs md:text-sm text-slate-500 font-medium italic py-4"><span>Sin actividad reciente.</span></p>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Side Panel: Distribution */}
        <div className="space-y-6 md:space-y-8">
          <Card className="flex flex-col h-[300px] md:h-[400px]">
            <div className="flex items-center gap-2 mb-2 md:mb-4">
              <div className="p-2 neu-inset rounded-xl">
                <PieChartIcon className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-emerald-500 drop-shadow-sm"><span>Distribución de Gastos</span></h3>
            </div>

            <div className="flex-1 w-full relative -mt-2">
              {expenseData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="42%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,79,57,0.2)', borderRadius: '12px', color: '#151613', fontWeight: 500, fontSize: 12 }}
                      itemStyle={{ color: '#004f39', fontWeight: 600 }}
                      formatter={(value: number) => [formatCurrency(value), 'Gastado']}
                    />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ bottom: 30 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs md:text-sm text-slate-500 font-medium italic py-4"><span>No hay gastos registrados.</span></p>
              )}
            </div>
          </Card>

          {/* Transacciones Recientes (Solo Móvil) */}
          <div className="block lg:hidden">
            <Card>
              <h3 className="text-base md:text-lg font-bold text-emerald-500 mb-4 md:mb-6 drop-shadow-sm"><span>Transacciones Recientes</span></h3>
              <div className="space-y-3 md:space-y-4 notranslate">
                {snapshot.transactions.length > 0 ? (
                  snapshot.transactions.slice(0, 4).map(tx => {
                    const isSaving = tx.category === 'Ahorro';
                    return (
                      <div key={tx.id} className="flex justify-between items-center neu-inset p-3 rounded-2xl transition-transform hover:-translate-y-1 hover:shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center bg-white/40 shadow-sm border border-white/50",
                            isSaving ? "text-blue-500" : (tx.type === 'income' ? "text-emerald-500" : "text-rose-500")
                          )}>
                            {isSaving ? <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-blue-500" /> : (tx.type === 'income' ? <TrendingUp className="w-4 h-4 md:w-5 md:h-5" /> : <TrendingDown className="w-4 h-4 md:w-5 md:h-5" />)}
                          </div>
                          <div>
                            <p className="text-xs md:text-sm font-bold text-charcoal-900 drop-shadow-sm"><span>{tx.category}</span></p>
                            <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5"><span>{safeDate(tx.date) ? format(safeDate(tx.date)!, "dd 'de' MMM", { locale: es }) : '—'}</span></p>
                          </div>
                        </div>
                        <p className={cn(
                          "font-mono text-xs md:text-sm font-bold drop-shadow-sm",
                          isSaving ? "text-blue-600" : (tx.type === 'income' ? "text-emerald-600" : "text-rose-600")
                        )}>
                          <span>{tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}</span>
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs md:text-sm text-slate-500 font-medium italic py-4"><span>Sin actividad reciente.</span></p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
