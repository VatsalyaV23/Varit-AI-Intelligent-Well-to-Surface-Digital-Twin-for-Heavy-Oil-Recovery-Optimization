import React, { useEffect, useState } from 'react';
import { useWell } from '../context/WellContext';
import { getWellAnalytics } from '../services/api';
import { BarChart3, Thermometer, Droplets } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ScatterChart,
  Scatter
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { selectedWellId, theme } = useWell();
  const [history, setHistory] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getWellAnalytics(selectedWellId);
        setHistory(data.history || []);
        setCycles(data.css_cycles || []);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedWellId]);

  const tooltipBg = theme === 'dark' ? '#111c2d' : '#ffffff';
  const tooltipText = theme === 'dark' ? '#ffffff' : '#0f172a';
  const gridStroke = theme === 'dark' ? '#273c5a' : '#cbd5e1';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />
          Historical Operational Analytics — [{selectedWellId}]
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Multi-cycle trend analysis, thermal efficiency decay, and steam-oil ratio (SOR) tracking for Baghewala Field.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Production vs Steam Injected */}
        <div className="industrial-card rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>24-Month Oil Production vs CSS Steam Volume</span>
            <Droplets className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
          </h3>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={history} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.4} />
                <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} />
                <YAxis yAxisId="left" stroke="#00d2ff" fontSize={10} unit=" m³" />
                <YAxis yAxisId="right" orientation="right" stroke="#ff5722" fontSize={10} unit=" m³" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: '#38547c',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: tooltipText,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                <Bar yAxisId="right" dataKey="steam_injected_m3" name="Steam Injected (m³)" fill="#ff5722" opacity={0.6} />
                <Line yAxisId="left" type="monotone" dataKey="oil_production_m3d" name="Oil Production (m³/d)" stroke="#00d2ff" strokeWidth={2.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Temperature vs Viscosity Cross Plot */}
        <div className="industrial-card rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Reservoir Temp vs Crude Viscosity</span>
            <Thermometer className="w-4 h-4 text-orange-500 dark:text-orange-400" />
          </h3>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.4} />
                <XAxis type="number" dataKey="reservoir_temp_c" name="Reservoir Temp" unit=" °C" stroke="#94a3b8" fontSize={10} />
                <YAxis type="number" dataKey="viscosity_cp" name="Viscosity" unit=" cP" stroke="#ffb300" fontSize={10} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: '#38547c',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: tooltipText,
                  }}
                />
                <Scatter name="Temp vs Viscosity Data" data={history} fill="#ffb300" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Cycle Summary Table */}
      <div className="industrial-card rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>Historical CSS Cycle Log Summary — [{selectedWellId}]</span>
          <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400">Cycles: 1 to {cycles.length}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Cycle #</th>
                <th className="py-2.5 px-3">Start Date</th>
                <th className="py-2.5 px-3">Steam Volume</th>
                <th className="py-2.5 px-3">Soak Days</th>
                <th className="py-2.5 px-3">Peak Temp</th>
                <th className="py-2.5 px-3">Cumulative Oil</th>
                <th className="py-2.5 px-3">Cycle SOR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono">
              {cycles.map((c) => (
                <tr key={c.cycle_number} className="hover:bg-slate-100/60 dark:hover:bg-slate-900/60 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-cyan-600 dark:text-cyan-400">Cycle #{c.cycle_number}</td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{c.start_date}</td>
                  <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">{c.steam_volume_m3} m³</td>
                  <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">{c.soak_days} Days</td>
                  <td className="py-2.5 px-3 text-orange-500 dark:text-orange-400">{c.peak_temp_c} °C</td>
                  <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">{c.cumulative_oil_m3} m³</td>
                  <td className="py-2.5 px-3 text-amber-500 dark:text-amber-400">{c.sor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
