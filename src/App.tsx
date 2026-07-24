import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { useFinanceStore } from './store';
import { supabase } from './supabase';
import { VIEW_BY_TAB, isAppTab, type AppTab } from './config/navigation';
import Login from './views/Login';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const { fetchData, isLoading } = useFinanceStore();
  const userId = useFinanceStore(state => state.userId);

  const handleTabChange = (tab: string) => {
    if (isAppTab(tab)) setActiveTab(tab);
  };

  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    fetchData();
    // Asegurar que el loader se muestre por al menos 3 segundos
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [fetchData]);

  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      handleTabChange(customEvent.detail);
    };
    window.addEventListener('navigate', handleNavigate);
    return () => window.removeEventListener('navigate', handleNavigate);
  }, []);

  if (isLoading || showLoader) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="relative mb-8 mt-4">
          {/* Animated loading ring */}
          <div className="absolute -inset-3 md:-inset-4 border-4 border-slate-100 border-t-[#229ED9] rounded-full animate-spin shadow-lg"></div>
          
          {/* Inner Video */}
          <video 
            src="/loader.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full shadow-[0_0_30px_rgba(34,158,217,0.4)] relative z-10"
          />
        </div>
        <p className="text-emerald-800 font-bold animate-pulse text-sm md:text-base mt-2">Sincronizando con Prestige Finance...</p>
      </div>
    );
  }

  if (!isLoading && !userId) {
    return <Login />;
  }

  const ActiveView = VIEW_BY_TAB[activeTab];

  return (
    <Layout activeTab={activeTab} setActiveTab={handleTabChange}>
      <ActiveView key={activeTab} />
    </Layout>
  );
}
