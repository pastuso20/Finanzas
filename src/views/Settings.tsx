import React, { useState } from 'react';
import { useFinanceStore } from '../store';
import { Card, Button, Input, cn } from '../components/ui';
import { Trash2, AlertTriangle, User, Database, RefreshCw, Check, X, Edit3 } from 'lucide-react';

export function Settings() {
  const { 
    userName,
    setUserName,
    initialBalance,
    setInitialBalance,
    transactions, 
    loans, 
    investments, 
    debts, 
    clearAllData,
    deleteTransaction,
    deleteLoan,
    deleteInvestment,
    deleteDebt,
    updateInvestmentValue,
    updateDebtAmount,
    updateTransactionAmount,
    updateLoanPrincipal
  } = useFinanceStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(userName);
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [newBalance, setNewBalance] = useState(initialBalance);

  const handleClearAll = () => {
    if (window.confirm('¿Estás seguro de que quieres borrar TODOS los datos? Esta acción no se puede deshacer.')) {
      clearAllData();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold text-emerald-500 tracking-tight">Configuración</h2>
        <p className="text-slate-600 mt-1">Gestiona tu perfil y tus datos financieros</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Profile Section */}
        <Card className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <User className="w-6 h-6 text-emerald-500" />
            <h3 className="text-xl font-bold text-charcoal-900">Perfil de Usuario</h3>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 rounded-2xl neu-inset bg-white/50 relative group">
              <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Nombre actual</p>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)} 
                    className="h-9"
                    autoFocus
                  />
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setUserName(newName);
                      setIsEditingName(false);
                    }}
                  >
                    Guardar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setIsEditingName(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold text-charcoal-900">{userName}</p>
                  <button 
                    onClick={() => setIsEditingName(true)}
                    className="text-slate-400 hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl neu-inset bg-white/50 relative group">
              <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Saldo Inicial / Efectivo</p>
              {isEditingBalance ? (
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    value={newBalance} 
                    onChange={e => setNewBalance(e.target.value)} 
                    className="h-9 font-mono"
                    autoFocus
                  />
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setInitialBalance(newBalance);
                      setIsEditingBalance(false);
                    }}
                  >
                    Guardar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setIsEditingBalance(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold text-charcoal-900 font-mono">${Number(initialBalance).toLocaleString()}</p>
                  <button 
                    onClick={() => {
                      setIsEditingBalance(true);
                      setNewBalance(initialBalance);
                    }}
                    className="text-slate-400 hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-[10px] text-slate-400 mt-2 italic">
                * Este valor se utiliza como base para calcular tu patrimonio neto total.
              </p>
            </div>
          </div>
        </Card>

        {/* Data Management Section */}
        <Card className="space-y-6 border-rose-500/20">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Database className="w-6 h-6 text-rose-500" />
            <h3 className="text-xl font-bold text-charcoal-900">Gestión de Datos</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl neu-inset">
              <div>
                <p className="font-bold text-charcoal-900">Limpiar base de datos</p>
                <p className="text-xs text-slate-500">Elimina todos los registros de una vez</p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleClearAll}
                className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Borrar Todo
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Data List */}
      <Card className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6 text-emerald-500" />
            <h3 className="text-xl font-bold text-charcoal-900">Revisión de Datos</h3>
          </div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Total registros: {transactions.length + loans.length + investments.length + debts.length}
          </p>
        </div>

        <div className="space-y-8">
          {/* Emprendimientos Section */}
          <section className="space-y-3">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Emprendimientos ({investments.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {investments.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl neu-inset text-sm">
                  {editingId === inv.id ? (
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <Input 
                        value={editValue} 
                        onChange={e => setEditValue(e.target.value)} 
                        className="h-8 py-0 px-2 text-xs"
                        autoFocus
                      />
                      <button 
                        onClick={() => {
                          updateInvestmentValue(inv.id, editValue);
                          setEditingId(null);
                        }}
                        className="text-emerald-500 hover:text-emerald-600"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-slate-400">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col">
                        <span className="font-bold">{inv.assetName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">${Number(inv.currentValue).toLocaleString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingId(inv.id);
                            setEditValue(inv.currentValue);
                          }}
                          className="text-slate-400 hover:text-emerald-500 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteInvestment(inv.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {investments.length === 0 && <p className="text-xs text-slate-400 italic">No hay registros.</p>}
            </div>
          </section>

          {/* Deudas Section */}
          <section className="space-y-3">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Deudas ({debts.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {debts.map(d => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-xl neu-inset text-sm">
                  {editingId === d.id ? (
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <Input 
                        value={editValue} 
                        onChange={e => setEditValue(e.target.value)} 
                        className="h-8 py-0 px-2 text-xs"
                        autoFocus
                      />
                      <button 
                        onClick={() => {
                          updateDebtAmount(d.id, editValue);
                          setEditingId(null);
                        }}
                        className="text-emerald-500 hover:text-emerald-600"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-slate-400">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col">
                        <span className="font-bold">{d.creditor}</span>
                        <span className="text-[10px] text-slate-400 font-mono">${Number(d.amount).toLocaleString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingId(d.id);
                            setEditValue(d.amount);
                          }}
                          className="text-slate-400 hover:text-emerald-500 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteDebt(d.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {debts.length === 0 && <p className="text-xs text-slate-400 italic">No hay registros.</p>}
            </div>
          </section>

          {/* Préstamos Section */}
          <section className="space-y-3">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Préstamos ({loans.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {loans.map(l => (
                <div key={l.id} className="flex items-center justify-between p-3 rounded-xl neu-inset text-sm">
                  {editingId === l.id ? (
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <Input 
                        value={editValue} 
                        onChange={e => setEditValue(e.target.value)} 
                        className="h-8 py-0 px-2 text-xs"
                        autoFocus
                      />
                      <button 
                        onClick={() => {
                          updateLoanPrincipal(l.id, editValue);
                          setEditingId(null);
                        }}
                        className="text-emerald-500 hover:text-emerald-600"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-slate-400">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col">
                        <span className="font-bold">{l.borrower}</span>
                        <span className="text-[10px] text-slate-400 font-mono">${Number(l.principal).toLocaleString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingId(l.id);
                            setEditValue(l.principal);
                          }}
                          className="text-slate-400 hover:text-emerald-500 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteLoan(l.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {loans.length === 0 && <p className="text-xs text-slate-400 italic">No hay registros.</p>}
            </div>
          </section>

          {/* Transacciones Section */}
          <section className="space-y-3">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Transacciones ({transactions.length})</h4>
            <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
              {transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl neu-inset text-sm">
                  {editingId === t.id ? (
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <Input 
                        value={editValue} 
                        onChange={e => setEditValue(e.target.value)} 
                        className="h-8 py-0 px-2 text-xs"
                        autoFocus
                      />
                      <button 
                        onClick={() => {
                          updateTransactionAmount(t.id, editValue);
                          setEditingId(null);
                        }}
                        className="text-emerald-500 hover:text-emerald-600"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-slate-400">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-4">
                        <span className={cn("font-bold", t.type === 'income' ? "text-emerald-600" : "text-rose-600")}>
                          {t.type === 'income' ? '+' : '-'}
                        </span>
                        <span>{t.category}</span>
                        <span className="text-[10px] text-slate-400 font-mono">${Number(t.amount).toLocaleString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingId(t.id);
                            setEditValue(t.amount);
                          }}
                          className="text-slate-400 hover:text-emerald-500 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteTransaction(t.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {transactions.length === 0 && <p className="text-xs text-slate-400 italic">No hay registros.</p>}
            </div>
          </section>
        </div>
      </Card>
    </div>
  );
}
