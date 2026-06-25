import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EntityListSectionProps {
  title: string;
  icon: LucideIcon;
  variant?: 'active' | 'history';
  emptyMessage: string;
  children: React.ReactNode;
}

export function EntityListSection({
  title,
  icon: Icon,
  variant = 'active',
  emptyMessage,
  children,
}: EntityListSectionProps) {
  const isHistory = variant === 'history';

  return (
    <section className="space-y-4">
      <h3
        className={
          isHistory
            ? 'text-xl font-bold text-slate-400 flex items-center gap-2'
            : 'text-xl font-bold text-emerald-500 flex items-center gap-2'
        }
      >
        <Icon className="w-5 h-5" />
        <span>{title}</span>
      </h3>
      <div className={isHistory ? 'grid grid-cols-1 gap-4 opacity-80' : 'grid grid-cols-1 gap-4'}>
        {children ?? (
          <p className="text-slate-500 text-sm italic py-4">
            <span>{emptyMessage}</span>
          </p>
        )}
      </div>
    </section>
  );
}
