import React, { useEffect, useState } from 'react';
import { useWell } from '../context/WellContext';
import { getDashboardSummary, getWellAnalytics } from '../services/api';
import { DashboardSummary } from '../types';
import { KpiCard } from '../components/KpiCard';
import { AlertBanner } from '../components/AlertBanner';
import {
  Activity,
  Flame,
  Thermometer,
  Gauge,
  Zap,
  ShieldAlert,
  TrendingUp,
  Droplets,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { currentWell, selectedWellId, setSelectedWellId, alerts, liveTick, theme } = useWell();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const sumData = await getDashboardSummary();
        setSummary(sumData);

        if (selectedWellId) {
          const analytics = await getWellAnalytics(selectedWellId);
          setHistoryData(analytics.history || []);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedWellId]);

  const displayProd = liveTick && liveTick.well_id === selectedWellId
    ? liveTick.oil_production_m3d
    : currentWell?.current_production_m3d || 0;

  const displayTemp = liveTick && liveTick.well_id === selectedWellId
    ? liveTick.reservoir_temp_c
    : currentWell?.current_res_temp_c || 0;

  const displayVisc = liveTick && liveTick.well_id === selectedWellId
    ? liveTick.viscosity_cp
    : currentWell?.current_viscosity_cp || 0;

  const displayEff = liveTick && liveTick.well_id === selectedWellId
    ? liveTick.pump_efficiency_pct
    : currentWell?.pump_efficiency_pct || 0;

  const displayRisk = liveTick && liveTick.well_id === selectedWellId
    ? liveTick.failure_risk_pct
    : currentWell?.failure_risk_pct || 0;

  const tooltipBg = theme === 'dark' ? '#111c2d' : '#ffffff';
  const tooltipText = theme === 'dark' ? '#ffffff' : '#0f172a';
  const gridStroke = theme === 'dark' ? '#273c5a' : '#cbd5e1';

  return (
    <div className="space-y-6 pb-12">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Varit AI — Baghewala Heavy Oil Field Summary
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time Operational Monitoring & Thermal-Mechanical Performance Dashboard
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/integrated-optimization')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer"
          >
            <Flame className="w-4 h-4" />
            <span>Run Joint AI Optimizer</span>
          </button>
        </div>
      </div>

      {/* Field Level KPI Grid - Fully responsive with proper gaps to avoid overlapping */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        <KpiCard
          title="Active Wells"
          value={summary ? `${summary.active_wells}/${summary.total_wells}` : '5/5'}
          icon={Layers}
          color="cyan"
          subtitle="Baghewala Field"
        />
        <KpiCard
          title="Field Oil Prod"
          value={summary ? summary.total_oil_production_m3d : 0}
          unit="m³/d"
          icon={Droplets}
          color="emerald"
          trend="+8.4%"
        />
        <KpiCard
          title="Well Prod"
          value={displayProd}
          unit="m³/d"
          icon={Activity}
          color="cyan"
          isLiveUpdated={!!liveTick}
        />
        <KpiCard
          title="Reservoir Temp"
          value={displayTemp}
          unit="°C"
          icon={Thermometer}
          color="flame"
          isLiveUpdated={!!liveTick}
        />
        <KpiCard
          title="Oil Viscosity"
          value={displayVisc}
          unit="cP"
          icon={TrendingUp}
          color="amber"
          isLiveUpdated={!!liveTick}
        />
        <KpiCard
          title="SRP Efficiency"
          value={displayEff}
          unit="%"
          icon={Gauge}
          color="cyan"
          isLiveUpdated={!!liveTick}
        />
        <KpiCard
          title="Energy / bbl"
          value={currentWell ? currentWell.energy_per_m3 : 42.8}
          unit="kWh/m³"
          icon={Zap}
          color="amber"
        />
        <KpiCard
          title="Equipment Risk"
          value={displayRisk}
          unit="%"
          icon={ShieldAlert}
          color={displayRisk > 30 ? 'rose' : 'emerald'}
          isLiveUpdated={!!liveTick}
        />
      </div>

      {/* Operational Alerts Banner */}
      <div className="industrial-card rounded-xl p-4">
        <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Field Operational Alerts & Health Notifications
        </h2>
        <AlertBanner alerts={alerts} wellId={selectedWellId} />
      </div>

      {/* Main Charts & Well Selection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Production & Viscosity Trend Chart */}
        <div className="lg:col-span-2 industrial-card rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                Historical Thermal & Production Dynamics — [{selectedWellId}]
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                24-Month Time-Series: Oil Production vs Crude Oil Viscosity Decay
              </p>
            </div>
            <span className="self-start sm:self-auto text-[11px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/30">
              CSS Cycle #{currentWell?.current_cycle_number || 3}
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00d2ff" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorVisc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff5722" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff5722" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.4} />
                <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} />
                <YAxis yAxisId="left" stroke="#00d2ff" fontSize={10} unit=" m³" />
                <YAxis yAxisId="right" orientation="right" stroke="#ff5722" fontSize={10} unit=" cP" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: '#38547c',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: tooltipText,
                  }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="oil_production_m3d"
                  name="Oil Production (m³/d)"
                  stroke="#00d2ff"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProd)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="viscosity_cp"
                  name="Viscosity (cP)"
                  stroke="#ff5722"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVisc)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Multi-Well Field Selector Grid */}
        <div className="industrial-card rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Well Overview</span>
            <span className="text-[11px] text-slate-400 font-normal">Click to Switch</span>
          </h3>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {summary?.wells_summary.map((w) => {
              const isSelected = w.id === selectedWellId;
              return (
                <div
                  key={w.id}
                  onClick={() => setSelectedWellId(w.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-500/10 dark:bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/20'
                      : 'bg-white/40 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          w.status === 'ACTIVE_PRODUCTION' ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                      />
                      <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">{w.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      {w.oil_production_m3d} m³/d
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/60 text-[10px]">
                    <div>
                      <span className="text-slate-400 block">Temp</span>
                      <span className="text-slate-700 dark:text-slate-200 font-mono">{w.reservoir_temp_c}°C</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Viscosity</span>
                      <span className="text-slate-700 dark:text-slate-200 font-mono">{w.viscosity_cp} cP</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Risk</span>
                      <span
                        className={`font-mono font-bold ${
                          w.failure_risk_pct > 30 ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-500 dark:text-emerald-400'
                        }`}
                      >
                        {w.failure_risk_pct}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => navigate('/digital-twin')}
            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 font-semibold text-xs border border-cyan-500/30 hover:bg-cyan-500/10 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <span>Open Interactive Digital Twin</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
