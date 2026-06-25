import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  HandCoins,
  TrendingUp,
  Settings,
  CreditCard,
  PiggyBank,
  type LucideIcon,
} from 'lucide-react';
import { Dashboard } from '../views/Dashboard';
import { Transactions } from '../views/Transactions';
import { Loans } from '../views/Loans';
import { Investments } from '../views/Investments';
import { Debts } from '../views/Debts';
import { Savings } from '../views/Savings';
import { Settings as SettingsView } from '../views/Settings';

export type AppTab =
  | 'dashboard'
  | 'transactions'
  | 'loans'
  | 'investments'
  | 'debts'
  | 'savings'
  | 'settings';

export interface NavItem {
  id: AppTab;
  label: string;
  icon: LucideIcon;
  mobileLabel?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Panel Principal', mobileLabel: 'Panel', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transacciones', mobileLabel: 'Transacciones', icon: Wallet },
  { id: 'loans', label: 'Préstamos', mobileLabel: 'Préstamos', icon: HandCoins },
  { id: 'investments', label: 'Inversiones', mobileLabel: 'Inversiones', icon: TrendingUp },
  { id: 'debts', label: 'Deudas', mobileLabel: 'Deudas', icon: CreditCard },
  { id: 'savings', label: 'Ahorros', mobileLabel: 'Ahorros', icon: PiggyBank },
];

export const SETTINGS_NAV: NavItem = {
  id: 'settings',
  label: 'Configuración',
  icon: Settings,
};

export const VIEW_BY_TAB: Record<AppTab, React.ComponentType> = {
  dashboard: Dashboard,
  transactions: Transactions,
  loans: Loans,
  investments: Investments,
  debts: Debts,
  savings: Savings,
  settings: SettingsView,
};

export function isAppTab(value: string): value is AppTab {
  return value in VIEW_BY_TAB;
}
