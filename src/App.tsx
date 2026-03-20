import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { Transactions } from './views/Transactions';
import { Loans } from './views/Loans';
import { Investments } from './views/Investments';
import { Debts } from './views/Debts';
import { Settings } from './views/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <Transactions />;
      case 'loans':
        return <Loans />;
      case 'investments':
        return <Investments />;
      case 'debts':
        return <Debts />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}
