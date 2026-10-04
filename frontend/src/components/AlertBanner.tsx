import React from 'react';
import { AlertItem } from '../types';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface AlertBannerProps {
  alerts: AlertItem[];
  wellId?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, wellId }) => {
  const filteredAlerts = wellId ? alerts.filter((a) => a.well_id === wellId) : alerts;

  if (filteredAlerts.length === 0) {
    return (
      <div className="flex items-center space-x-3 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs">
        <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>All systems operating within safe mechanical & thermal envelopes for selected well.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filteredAlerts.map((alert) => {
        const isHigh = alert.severity === 'HIGH';
        const isMedium = alert.severity === 'MEDIUM';

        const bgClass = isHigh
          ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-500/50 text-rose-900 dark:text-rose-200'
          : isMedium
          ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-500/40 text-amber-900 dark:text-amber-200'
          : 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-500/30 text-sky-900 dark:text-sky-200';

        const Icon = isHigh ? AlertTriangle : isMedium ? AlertCircle : Info;

        return (
          <div
            key={alert.id}
            className={`flex items-start justify-between p-3.5 border rounded-xl backdrop-blur-sm transition-all ${bgClass}`}
          >
            <div className="flex items-start space-x-3">
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs tracking-wide uppercase">
                    [{alert.well_id}] {alert.title}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-extrabold rounded uppercase ${
                      isHigh
                        ? 'bg-rose-100 dark:bg-rose-500/30 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500'
                        : isMedium
                        ? 'bg-amber-100 dark:bg-amber-500/30 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500'
                        : 'bg-sky-100 dark:bg-sky-500/30 text-sky-800 dark:text-sky-300'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">{alert.message}</p>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 shrink-0 ml-4 font-mono">
              {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      })}
    </div>
  );
};
