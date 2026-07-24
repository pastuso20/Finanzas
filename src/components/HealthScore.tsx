import React from 'react';
import { useFinanceStore } from '../store';
import { selectCashBalance, selectNetWorth, selectPendingDebts } from '../selectors';
import { HeartPulse } from 'lucide-react';

export const HealthScore: React.FC = () => {
  const state = useFinanceStore();
  
  // Calculate Score
  let score = 50; // Base score
  
  const cashBalance = selectCashBalance(state).toNumber();
  const totalDebts = selectPendingDebts(state.debts).toNumber();
  
  // 1. Debt-to-Cash ratio (just a simple proxy for debt-to-income without income history)
  if (cashBalance > 0) {
    const debtRatio = totalDebts / cashBalance;
    if (debtRatio === 0) score += 20;
    else if (debtRatio < 0.3) score += 15;
    else if (debtRatio < 0.6) score += 5;
    else if (debtRatio > 1) score -= 10;
  } else if (totalDebts > 0) {
    score -= 20;
  }

  // 2. Savings consistency
  const totalSavings = state.savings.reduce((acc, s) => acc + Number(s.currentAmount), 0);
  if (totalSavings > 0) {
    if (totalSavings > cashBalance * 0.5) score += 20;
    else score += 10;
  }
  
  // 3. Activity (has transactions)
  if (state.transactions.length > 10) score += 10;

  // Clamp score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Determine color and status
  let colorClass = "text-rose-500";
  let bgClass = "bg-rose-500/10";
  let borderClass = "border-rose-500/20";
  let status = "Necesita Atención";

  if (score >= 80) {
    colorClass = "text-emerald-500";
    bgClass = "bg-emerald-500/10";
    borderClass = "border-emerald-500/20";
    status = "Excelente";
  } else if (score >= 60) {
    colorClass = "text-amber-500";
    bgClass = "bg-amber-500/10";
    borderClass = "border-amber-500/20";
    status = "Regular";
  }

  return (
    <div className={`p-4 md:p-6 rounded-2xl border ${borderClass} ${bgClass} flex items-center justify-between`}>
      <div className="flex items-center gap-3 md:gap-4">
        <div className={`p-3 rounded-full bg-white shadow-sm ${colorClass}`}>
          <HeartPulse size={24} />
        </div>
        <div>
          <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider mb-0.5">Salud Financiera</p>
          <p className={`text-lg md:text-xl font-bold ${colorClass}`}>{status}</p>
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-4xl md:text-5xl font-black ${colorClass}`}>{score}</span>
        <span className="text-sm font-bold text-slate-400">/100</span>
      </div>
    </div>
  );
};
