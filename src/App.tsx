import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { Transactions } from './views/Transactions';
import { Loans } from './views/Loans';
import { Investments } from './views/Investments';
import { Debts } from './views/Debts';
import { Settings } from './views/Settings';
import { useFinanceStore } from './store';
import { supabase } from './supabase';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { fetchData, isLoading } = useFinanceStore();

  useEffect(() => {
    const initApp = async () => {
      // New fixed credentials
      const fixedEmail = 'admin@prestige.finance';
      const fixedPassword = 'Prestige2024!';

      const { data: { user } } = await supabase.auth.getUser();
      
      // If there's a user but it's not the one we want, sign out
      if (user && user.email !== fixedEmail) {
        await supabase.auth.signOut();
        window.location.reload(); // Reload to start fresh with the new user
        return;
      }

      if (!user) {
        // Try to sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: fixedEmail,
          password: fixedPassword,
        });

        if (signInError) {
          // If user doesn't exist, sign up
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

  if (!isLoading && !useFinanceStore.getState().userId) {
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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard key="dashboard" />;
      case 'transactions':
        return <Transactions key="transactions" />;
      case 'loans':
        return <Loans key="loans" />;
      case 'investments':
        return <Investments key="investments" />;
      case 'debts':
        return <Debts key="debts" />;
      case 'settings':
        return <Settings key="settings" />;
      default:
        return <Dashboard key="dashboard" />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}
