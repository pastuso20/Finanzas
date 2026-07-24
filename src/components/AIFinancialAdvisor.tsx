import React, { useState } from 'react';
import { Bot, CheckCircle2, AlertTriangle, TrendingUp, RefreshCw, X, Sparkles } from 'lucide-react';
import { useFinanceStore } from '../store';
import { selectCashBalance, selectNetWorth } from '../selectors';
import { cn } from './ui';

export const AIFinancialAdvisor: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<{ achievement: string; warning: string; action_item: string } | null>(null);
  
  const state = useFinanceStore();

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const snapshot = {
        cashBalance: selectCashBalance(state).toNumber(),
        netWorth: selectNetWorth(state).toNumber(),
        transactionsCount: state.transactions.length,
        savingsCount: state.savings.length,
        debtsCount: state.debts.length,
        investmentsCount: state.investments.length,
        recentTransactions: state.transactions.slice(0, 10).map(tx => ({ type: tx.type, amount: tx.amount, category: tx.category })),
        savings: state.savings.map(s => ({ name: s.name, current: s.currentAmount, goal: s.goalAmount })),
        debts: state.debts.map(d => ({ creditor: d.creditor, amount: d.amount }))
      };

      const response = await fetch('http://localhost:3001/api/health-checkup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshot })
      });

      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error('Failed to generate report', error);
      setReport({
        achievement: "Error al conectar con la IA.",
        warning: "Revisa que el servidor backend esté corriendo.",
        action_item: "Intenta de nuevo más tarde."
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleOpen = () => {
    if (!isOpen && !report) {
      handleGenerateReport();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end">
      {/* Tooltip / Modal */}
      {isOpen && (
        <div className="mb-4 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/60 w-[320px] md:w-[380px] overflow-hidden animate-in zoom-in-95 duration-200 origin-bottom-right">
          <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg">
                <img src="/logo-removebg.png" alt="AI Icon" className="w-5 h-5 object-contain" />
              </div>
              <h3 className="font-bold text-slate-800">Tu Asistente Financiero</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-5 bg-slate-50/50">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3 text-emerald-600">
                <RefreshCw size={28} className="animate-spin" />
                <p className="text-sm font-bold animate-pulse text-slate-500">Analizando tus finanzas...</p>
              </div>
            ) : report ? (
              <div className="space-y-4">
                <div className="flex gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="mt-0.5 bg-emerald-50 text-emerald-600 p-2 rounded-xl h-fit"><CheckCircle2 size={18} /></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Lo que haces bien</p>
                    <p className="text-sm font-medium text-slate-700 leading-snug">{report.achievement}</p>
                  </div>
                </div>
                
                <div className="flex gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="mt-0.5 bg-amber-50 text-amber-600 p-2 rounded-xl h-fit"><AlertTriangle size={18} /></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Ojo con esto</p>
                    <p className="text-sm font-medium text-slate-700 leading-snug">{report.warning}</p>
                  </div>
                </div>
                
                <div className="flex gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="mt-0.5 bg-blue-50 text-blue-600 p-2 rounded-xl h-fit"><TrendingUp size={18} /></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Consejo de hoy</p>
                    <p className="text-sm font-medium text-slate-700 leading-snug">{report.action_item}</p>
                  </div>
                </div>
                
                <button 
                  onClick={handleGenerateReport}
                  className="w-full mt-2 py-3 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} /> Actualizar Diagnóstico
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleOpen}
        className="h-14 w-14 md:h-16 md:w-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-[0_8px_30px_rgb(16,185,129,0.3)] flex items-center justify-center transition-transform hover:scale-110 active:scale-95 border-4 border-white"
      >
        <img 
          src="/logo-removebg.png" 
          alt="AI Bot" 
          className={cn("w-8 h-8 object-contain", isOpen ? "rotate-12 transition-transform" : "transition-transform")}
        />
      </button>
    </div>
  );
};
