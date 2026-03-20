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
          <p className="text-emerald-500 font-bold animate-pulse">Cargando tus finanzas...</p>
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
