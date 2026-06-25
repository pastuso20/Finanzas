import React from 'react';
import { Card, cn } from '../ui';
import { formatCurrency } from '../../utils';
import type { LucideIcon } from 'lucide-react';

export interface MetricItem {
  label: string;
  mobileLabel?: string;
  value: React.ReactNode;
  valueClassName?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  mobileExtra?: React.ReactNode;
}

interface SummaryMetricsProps {
  sectionTitle: string;
  metrics: MetricItem[];
  columns?: 2 | 3;
}

export function SummaryMetrics({ sectionTitle, metrics, columns = 3 }: SummaryMetricsProps) {
  const gridCols = columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3';

  return (
    <>
      <div className="md:hidden pt-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">
          <span>{sectionTitle}</span>
        </p>
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
          {metrics.map((metric, i) => (
            <div
              key={metric.label}
              className={cn('p-6 flex justify-between items-center', i % 2 === 1 && 'bg-slate-50/30')}
            >
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                <span>{metric.mobileLabel ?? metric.label}</span>
              </p>
              <div className="text-right">
                <p className={cn('text-xl font-bold font-mono tracking-tighter', metric.valueClassName ?? 'text-emerald-900')}>
                  <span>{metric.value}</span>
                </p>
                {metric.mobileExtra}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={cn('hidden md:grid grid-cols-1 gap-6', gridCols)}>
        {metrics.map(metric => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="flex flex-col justify-center bg-white border-none shadow-sm">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">
                <span>{metric.label}</span>
              </p>
              {Icon ? (
                <div className="flex items-center gap-3">
                  <Icon className={cn('w-8 h-8', metric.iconClassName ?? 'text-emerald-500')} />
                  <p className={cn('text-3xl font-bold font-mono', metric.valueClassName ?? 'text-emerald-900')}>
                    <span>{metric.value}</span>
                  </p>
                </div>
              ) : (
                <p className={cn('text-3xl font-bold font-mono', metric.valueClassName ?? 'text-emerald-900')}>
                  <span>{metric.value}</span>
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}

/** Helper for currency metric values */
export function metricCurrency(value: Parameters<typeof formatCurrency>[0]): string {
  return formatCurrency(value);
}
