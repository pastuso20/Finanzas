import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { useFinanceStore } from './store';
import { supabase } from './supabase';
import { VIEW_BY_TAB, isAppTab, type AppTab } from './config/navigation';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const { fetchData, isLoading } = useFinanceStore();
  const userId = useFinanceStore(state => state.userId);

  const handleTabChange = (tab: string) => {
    if (isAppTab(tab)) setActiveTab(tab);
  };

  useEffect(() => {
    const initApp = async () => {
      const fixedEmail = 'admin@prestige.finance';
      const fixedPassword = 'Prestige2024!';

      const { data: { user } } = await supabase.auth.getUser();

      if (user && user.email !== fixedEmail) {
        await supabase.auth.signOut();
        window.location.reload();
        return;
      }

      if (!user) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: fixedEmail,
          password: fixedPassword,
        });

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            const { error: signUpError } = await supabase.auth.signUp({
              email: fixedEmail,
              password: fixedPassword,
            });
            if (signUpError) {
              console.error('Error signing up:', signUpError.message);
            }
          } else {
            console.error('Error signing in:', signInError.message);
          }
        }
      }

      await fetchData();
    };

    initApp();
  }, [fetchData]);

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
    return (
      <div className="min-h-screen bg-gold-500 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center border border-emerald-100">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-emerald-900 mb-4">Error de Autenticación</h2>
          <p className="text-slate-600 mb-8">No se pudo establecer una sesión segura. Por favor, verifica tu conexión o intenta recargar la página.</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
          >
            Recargar Aplicación
          </button>
        </div>
      </div>
    );
  }

  const ActiveView = VIEW_BY_TAB[activeTab];

  return (
    <Layout activeTab={activeTab} setActiveTab={handleTabChange}>
      <ActiveView key={activeTab} />
    </Layout>
  );
}
