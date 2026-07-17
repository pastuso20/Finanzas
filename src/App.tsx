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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      handleTabChange(customEvent.detail);
    };
    window.addEventListener('navigate', handleNavigate);
    return () => window.removeEventListener('navigate', handleNavigate);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gold-500 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-emerald-500 font-bold animate-pulse">Sincronizando con Prestige Finance...</p>
        </div>
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
