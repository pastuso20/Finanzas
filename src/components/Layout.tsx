import React, { useState } from 'react';
import { useFinanceStore } from '../store';
import { supabase } from '../supabase';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from './ui';
import { NAV_ITEMS, SETTINGS_NAV } from '../config/navigation';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const userName = useFinanceStore(state => state.userName);
  const setUserId = useFinanceStore(state => state.setUserId);
  const SettingsIcon = SETTINGS_NAV.icon;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserId(null);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] text-charcoal-900 flex flex-col md:flex-row md:items-start" translate="no">

      {/* Mobile Header (Refined UI/UX) */}
      <div className="md:hidden flex items-center justify-between p-6 z-30 relative shrink-0 bg-white/50 backdrop-blur-md">
        <div className="flex items-center justify-center">
          <img
            src="/logo.png"
            alt={userName || 'User'}
            className="w-24 h-24 object-contain"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('settings')}
            className="p-2.5 rounded-full bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-emerald-600 transition-all"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
          <button onClick={handleLogout} className="p-2.5 rounded-full bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-rose-600 transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar Island Wrap (Hidden on mobile) */}
      <div className="hidden md:flex py-6 pl-6 pr-2 flex-col z-20 sticky top-0 h-screen shrink-0 self-start">
        <aside className={cn(
          "glass-panel h-[calc(100vh-3rem)] rounded-[2rem] flex flex-col transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] relative border border-emerald-500/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden",
          isCollapsed ? "w-24 py-6 px-4" : "w-72 py-6 px-6"
        )}>
          {/* Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3.5 top-10 neu-button text-emerald-500 p-2 rounded-full z-30 flex items-center justify-center"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          <div className="shrink-0 mt-8">
            <div className={cn("flex items-center mb-6", isCollapsed ? "justify-center" : "justify-center")}>
              <div className={cn(
                "relative flex items-center justify-center",
                isCollapsed ? "w-16 h-16" : "w-24 h-24"
              )}>
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="object-contain origin-center"
                  style={{
                    '--tw-scale-x': '120%',
                    '--tw-scale-y': '120%',
                    '--tw-scale-z': '120%',
                    transform: 'scaleX(120%) scaleY(120%) scaleZ(120%)',
                    marginBottom: '3rem'
                  } as React.CSSProperties}
                />
              </div>
            </div>

            <nav className="space-y-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    title={isCollapsed ? item.label : undefined}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center rounded-2xl transition-colors duration-300 font-bold group relative overflow-hidden",
                      isCollapsed ? "justify-center h-11 p-0" : "h-11 py-0 px-4",
                      isActive
                        ? "neu-button-primary"
                        : "text-slate-500 hover:neu-button hover:text-emerald-500"
                    )}
                  >
                    <Icon className={cn("inline-block shrink-0 drop-shadow-sm",
                      isCollapsed ? "w-5 h-5" : "w-5 h-5",
                      isActive ? "text-gold-500" : "text-emerald-500/70 group-hover:text-emerald-500"
                    )} />

                    <span className={cn(
                      "transition-all duration-500 whitespace-nowrap overflow-hidden flex-1 text-left line-clamp-1",
                      isCollapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[200px] opacity-100 ml-3"
                    )}>
                      <span>{item.label}</span>
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="flex gap-3 justify-center mt-auto pt-4">
              <button
                onClick={() => setActiveTab(SETTINGS_NAV.id)}
                className="p-2.5 rounded-full bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-emerald-600 transition-all"
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
              <button onClick={handleLogout} className="p-2.5 rounded-full bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-rose-600 transition-all">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

        </aside>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 relative md:py-6 md:pr-6 md:pl-2 px-0 md:px-4 pb-28 transition-all duration-500 z-10 w-full">
        {/* Decorative background elements */}
        <div className="absolute top-[5%] left-[10%] md:top-[10%] md:left-[20%] w-[60%] h-[60%] md:w-[40%] md:h-[40%] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[0%] md:right-[10%] w-[50%] md:w-[40%] h-[50%] md:h-[40%] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />

        <div className="glass-card-mobile-transparent glass-card rounded-none md:rounded-[2.5rem] px-4 py-2 md:p-8 relative z-10 min-h-[calc(100vh-8rem)] md:min-h-[calc(100vh-3rem)]">
          <div className="max-w-6xl mx-auto pb-6 md:pb-10 notranslate">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (All 6 items) */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 safe-bottom">
        <div className="bg-white/90 backdrop-blur-lg border border-slate-100 shadow-2xl rounded-[2.5rem] p-2 flex justify-between items-center relative overflow-hidden">
          {NAV_ITEMS.map((item) => {
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
                <Icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "scale-110" : "")} />
                {isActive && (
                  <>
                    <span className="text-[9px] font-bold mt-1 tracking-wider uppercase">
                      <span>{item.mobileLabel ?? item.label.split(' ')[0]}</span>
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
