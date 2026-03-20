import React, { useState } from 'react';
import { useFinanceStore } from '../store';
import { LayoutDashboard, Wallet, HandCoins, TrendingUp, Settings, LogOut, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';
import { cn } from './ui';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { userName } = useFinanceStore();

  const navItems = [
    { id: 'dashboard', label: 'Panel Principal', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transacciones', icon: Wallet },
    { id: 'loans', label: 'Préstamos', icon: HandCoins },
    { id: 'investments', label: 'Inversiones', icon: TrendingUp },
    { id: 'debts', label: 'Deudas', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#f9fafb] text-charcoal-900 flex flex-col md:flex-row overflow-hidden">

      {/* Mobile Header (Refined UI/UX) */}
      <div className="md:hidden flex items-center justify-between p-6 z-30 relative shrink-0 bg-white/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="avatar-gold-border">
            <img
              src="/logo.png"
              alt={userName}
              className="w-12 h-12 object-cover"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-emerald-900 text-lg tracking-tight leading-none">{userName}</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Finance</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveTab('settings')}
            className="p-2.5 rounded-full bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-emerald-600 transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button className="p-2.5 rounded-full bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-rose-600 transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar Island Wrap (Hidden on mobile) */}
      <div className="hidden md:flex py-6 pl-6 pr-2 flex-col z-20 relative transition-all duration-500 shrink-0">
        <aside className={cn(
          "glass-panel h-full rounded-[2rem] flex flex-col justify-between transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] relative border border-emerald-500/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
          isCollapsed ? "w-24 py-8 px-4" : "w-72 py-8 px-6"
        )}>
          {/* Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3.5 top-12 neu-button text-emerald-500 p-2 rounded-full z-30 flex items-center justify-center"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          <div>
            <div className={cn("flex items-center mb-10", isCollapsed ? "justify-center" : "gap-3 px-2")}>
              <div className="videogame-coin-wrap shrink-0">
                <img
                  src="/logo.png"
                  alt="David Aite"
                  className={cn(
                    "object-contain videogame-coin",
                    isCollapsed ? "w-12 h-12" : "w-16 h-16"
                  )}
                  style={{ filter: 'contrast(1.1) saturate(1.1) drop-shadow(0 5px 10px rgba(0,0,0,0.1))' }}
                />
              </div>
              <div className={cn(
                "transition-all duration-500 origin-left whitespace-nowrap overflow-hidden flex flex-col justify-center",
                isCollapsed ? "max-w-0 opacity-0 scale-x-0" : "max-w-[200px] opacity-100 scale-x-100"
              )}>
                <h1 className="font-bold text-emerald-500 text-xl tracking-tight leading-none pt-1">
                  {userName}
                </h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Finance</p>
              </div>
            </div>

            <nav className="space-y-3 relative">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    title={isCollapsed ? item.label : undefined}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center rounded-2xl transition-all duration-300 font-bold group relative overflow-hidden",
                      isCollapsed ? "justify-center p-3" : "py-3 px-4",
                      isActive
                        ? "neu-button-primary"
                        : "text-slate-500 hover:neu-button hover:text-emerald-500"
                    )}
                  >
                    <Icon className={cn("inline-block shrink-0 transition-transform duration-300 drop-shadow-sm",
                      isCollapsed ? "w-6 h-6" : "w-5 h-5",
                      isActive ? "text-gold-500 scale-110" : "text-emerald-500/70 group-hover:text-emerald-500"
                    )} />

                    <span className={cn(
                      "transition-all duration-500 whitespace-nowrap overflow-hidden flex-1 text-left line-clamp-1",
                      isCollapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[200px] opacity-100 ml-3"
                    )}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setActiveTab('settings')}
              title={isCollapsed ? "Configuración" : undefined}
              className={cn(
                "w-full flex items-center rounded-2xl transition-all duration-300 font-bold group",
                isCollapsed ? "justify-center p-3" : "py-3 px-4",
                activeTab === 'settings'
                  ? "neu-button-primary"
                  : "text-slate-500 hover:neu-button hover:text-emerald-500"
              )}
            >
              <Settings className={cn(
                "shrink-0 transition-all duration-300 drop-shadow-sm",
                isCollapsed ? "w-6 h-6" : "w-5 h-5",
                activeTab === 'settings' ? "text-gold-500 scale-110" : "text-emerald-500/70 group-hover:text-emerald-500"
              )} />
              <span className={cn(
                "transition-all duration-500 whitespace-nowrap overflow-hidden flex-1 text-left",
                isCollapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[200px] opacity-100 ml-3"
              )}>
                Configuración
              </span>
            </button>
            <button
              title={isCollapsed ? "Cerrar Sesión" : undefined}
              className={cn(
                "w-full flex items-center rounded-2xl text-slate-500 hover:neu-button hover:text-rose-500 transition-all font-bold group",
                isCollapsed ? "justify-center p-3" : "py-3 px-4"
              )}
            >
              <LogOut className={cn("shrink-0 transition-all duration-300 text-emerald-500/70 group-hover:text-rose-500", isCollapsed ? "w-6 h-6" : "w-5 h-5 group-hover:-translate-x-1")} />
              <span className={cn(
                "transition-all duration-500 whitespace-nowrap overflow-hidden flex-1 text-left",
                isCollapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[200px] opacity-100 ml-3"
              )}>
                Cerrar Sesión
              </span>
            </button>
          </div>
        </aside>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative md:py-6 md:pr-6 md:pl-2 px-0 md:px-4 pb-28 min-h-0 md:min-h-screen transition-all duration-500 z-10 w-full">
        {/* Decorative background elements */}
        <div className="absolute top-[5%] left-[10%] md:top-[10%] md:left-[20%] w-[60%] h-[60%] md:w-[40%] md:h-[40%] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[0%] md:right-[10%] w-[50%] md:w-[40%] h-[50%] md:h-[40%] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />

        <div className="glass-card-mobile-transparent glass-card md:h-full rounded-none md:rounded-[2.5rem] px-4 py-2 md:p-8 relative z-10 overflow-y-visible md:overflow-y-auto min-h-[calc(100vh-8rem)] md:min-h-0">
          <div className="max-w-6xl mx-auto pb-6 md:pb-10">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (Refined) */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-white/90 backdrop-blur-lg border border-slate-100 shadow-2xl rounded-[2.5rem] p-2 flex justify-between items-center relative overflow-hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-14 rounded-2xl transition-all duration-300 relative z-10",
                  isActive ? "text-emerald-800" : "text-slate-400"
                )}
              >
                <Icon className={cn("w-6 h-6 transition-transform duration-300", isActive ? "scale-110" : "")} />
                {isActive && (
                  <>
                    <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">
                      {item.label.split(' ')[0]}
                    </span>
                    <div className="bottom-nav-indicator" />
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
