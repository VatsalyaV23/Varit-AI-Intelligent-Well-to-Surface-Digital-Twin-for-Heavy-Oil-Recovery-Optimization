import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'cyan' | 'amber' | 'flame' | 'emerald' | 'rose';
  trend?: string;
  isLiveUpdated?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  color = 'cyan',
  trend,
  isLiveUpdated = false,
}) => {
  const colorMap = {
    cyan: {
      border: 'border-cyan-500/30 hover:border-cyan-400',
      iconBg: 'bg-cyan-500/10 text-cyan-400 dark:text-cyan-400 light:text-cyan-600',
      glow: 'shadow-cyan-500/10',
    },
    amber: {
      border: 'border-amber-500/30 hover:border-amber-400',
      iconBg: 'bg-amber-500/10 text-amber-400 dark:text-amber-400 light:text-amber-600',
      glow: 'shadow-amber-500/10',
    },
    flame: {
      border: 'border-orange-500/30 hover:border-orange-400',
      iconBg: 'bg-orange-500/10 text-orange-400 dark:text-orange-400 light:text-orange-600',
      glow: 'shadow-orange-500/10',
    },
    emerald: {
      border: 'border-emerald-500/30 hover:border-emerald-400',
      iconBg: 'bg-emerald-500/10 text-emerald-400 dark:text-emerald-400 light:text-emerald-600',
      glow: 'shadow-emerald-500/10',
    },
    rose: {
      border: 'border-rose-500/30 hover:border-rose-400',
      iconBg: 'bg-rose-500/10 text-rose-400 dark:text-rose-400 light:text-rose-600',
      glow: 'shadow-rose-500/10',
    },
  };

  const selectedColor = colorMap[color];

  return (
    <div
      className={`relative overflow-hidden rounded-xl p-4 sm:p-5 industrial-card border ${selectedColor.border} transition-all duration-300 shadow-lg ${selectedColor.glow} flex flex-col justify-between`}
    >
      {isLiveUpdated && (
        <span className="absolute top-2 right-2 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
      )}

      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-400 light:text-slate-500 tracking-wider uppercase truncate">
            {title}
          </span>
          <div className={`p-2 rounded-lg shrink-0 ${selectedColor.iconBg}`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="flex items-baseline space-x-1.5 flex-wrap">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-100 dark:text-white light:text-slate-900 font-mono truncate">
            {value}
          </span>
          {unit && (
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-slate-500">
              {unit}
            </span>
          )}
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-800/50 dark:border-slate-800/50 light:border-slate-200/80 flex items-center justify-between text-[10px] sm:text-[11px] gap-1">
        {subtitle && (
          <span className="text-slate-400 dark:text-slate-400 light:text-slate-500 truncate">
            {subtitle}
          </span>
        )}
        {trend && (
          <span
            className={`font-semibold shrink-0 ${
              trend.startsWith('+') ? 'text-emerald-400 dark:text-emerald-400 light:text-emerald-600' : 'text-amber-400 dark:text-amber-400 light:text-amber-600'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};
