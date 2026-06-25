import React from 'react';
import { Button } from '../ui';
import { Plus, Minus } from 'lucide-react';

interface PageShellProps {
  title: string;
  subtitle: string;
  addLabel: string;
  showAddForm: boolean;
  onToggleAddForm: () => void;
  children: React.ReactNode;
}

export function PageShell({
  title,
  subtitle,
  addLabel,
  showAddForm,
  onToggleAddForm,
  children,
}: PageShellProps) {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0" translate="no">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div className="flex flex-col">
          <h2 className="text-4xl md:text-5xl font-bold text-emerald-900 tracking-tight font-serif">
            <span>{title}</span>
          </h2>
          <p className="text-slate-400 text-sm md:text-base mt-2">
            <span>{subtitle}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleAddForm}
          className="md:hidden w-full flex items-center justify-center gap-3 bg-emerald-900 text-white py-4 rounded-3xl shadow-xl shadow-emerald-900/20 active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5 text-accent-gold" />
          <span className="font-bold text-sm tracking-wide">{addLabel}</span>
        </button>

        <Button onClick={onToggleAddForm} className="hidden md:flex gap-2 rounded-2xl px-8 h-12">
          {showAddForm ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm ? 'Cancelar' : addLabel}</span>
        </Button>
      </header>

      {children}
    </div>
  );
}
