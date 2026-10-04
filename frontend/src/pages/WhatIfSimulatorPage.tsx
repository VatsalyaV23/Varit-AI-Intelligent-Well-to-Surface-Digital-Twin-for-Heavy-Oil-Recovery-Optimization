import React, { useState, useEffect } from 'react';
import { useWell } from '../context/WellContext';
import { runWhatIfSimulation } from '../services/api';
import { WhatIfResult } from '../types';
import { Sliders, Activity, Flame, Settings, Play, RefreshCw } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export const WhatIfSimulatorPage: React.FC = () => {
  const { selectedWellId, theme } = useWell();

  const [steamVol, setSteamVol] = useState<number>(3800);
  const [steamPress, setSteamPress] = useState<number>(65.0);
  const [soakDays, setSoakDays] = useState<number>(4.0);
  const [stroke, setStroke] = useState<number>(3.2);
  const [spm, setSpm] = useState<number>(8.0);
  const [vfdFreq, setVfdFreq] = useState<number>(48.0);
  const [cutoffDays, setCutoffDays] = useState<number>(90);

  const [simResult, setSimResult] = useState<WhatIfResult | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);

  const handleSimulate = async () => {
    try {
      setSimulating(true);
      const data = await runWhatIfSimulation({
        well_id: selectedWellId,
        steam_volume_m3: steamVol,
        steam_pressure_bar: steamPress,
        soak_days: soakDays,
        stroke_length_m: stroke,
        spm: spm,
        vfd_freq_hz: vfdFreq,
        production_cutoff_days: cutoffDays,
      });
      setSimResult(data);
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setSimulating(false);
    }
  };

  useEffect(() => {
    handleSimulate();
  }, [selectedWellId]);

  const tooltipBg = theme === 'dark' ? '#111c2d' : '#ffffff';
  const tooltipText = theme === 'dark' ? '#ffffff' : '#0f172a';
  const gridStroke = theme === 'dark' ? '#273c5a' : '#cbd5e1';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />
            Interactive What-If Operations Simulator — [{selectedWellId}]
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simulate operational adjustments across CSS thermal injection and SRP mechanical lift parameters over 120 days.
          </p>
        </div>

        <button
          onClick={handleSimulate}
          disabled={simulating}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer disabled:opacity-50"
        >
          {simulating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Running Simulation...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Simulate Scenario</span>
            </>
          )}
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="industrial-card rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
          <span>Proposed Operational Parameters</span>
          <span className="text-xs text-cyan-600 dark:text-cyan-400 font-mono">Current Baseline vs Proposed Scenario</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-3 p-3.5 bg-slate-100/60 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-orange-500 dark:text-orange-400 uppercase tracking-wider block flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              Thermal Steam Variables
            </span>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1">
                <span>Steam Volume:</span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">{steamVol} m³</span>
              </div>
              <input
                type="range"
                min="2000"
                max="5000"
                step="100"
                value={steamVol}
                onChange={(e) => setSteamVol(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-200 dark:bg-slate-800 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1">
                <span>Soak Time:</span>
                <span className="font-mono text-amber-500 dark:text-amber-400 font-bold">{soakDays} Days</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="7.0"
                step="0.5"
                value={soakDays}
                onChange={(e) => setSoakDays(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-200 dark:bg-slate-800 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-3 p-3.5 bg-slate-100/60 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block flex items-center gap-1">
              <Settings className="w-3.5 h-3.5" />
              SRP Artificial Lift Variables
            </span>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1">
                <span>Stroke Length:</span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">{stroke} m</span>
              </div>
              <input
                type="range"
                min="1.8"
                max="3.6"
                step="0.1"
                value={stroke}
                onChange={(e) => setStroke(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-200 dark:bg-slate-800 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1">
                <span>Strokes Per Minute:</span>
                <span className="font-mono text-amber-500 dark:text-amber-400 font-bold">{spm} SPM</span>
              </div>
              <input
                type="range"
                min="4.0"
                max="11.0"
                step="0.5"
                value={spm}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSpm(val);
                  setVfdFreq(Math.round((val / 10.0) * 50.0 * 10) / 10);
                }}
                className="w-full accent-amber-500 bg-slate-200 dark:bg-slate-800 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-3 p-3.5 bg-slate-100/60 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              Cycle Horizon
            </span>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1">
                <span>Production Cutoff:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{cutoffDays} Days</span>
              </div>
              <input
                type="range"
                min="30"
                max="150"
                step="10"
                value={cutoffDays}
                onChange={(e) => setCutoffDays(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-200 dark:bg-slate-800 cursor-pointer"
              />
            </div>

            <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400">
              VFD Frequency: <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">{vfdFreq} Hz</span>
            </div>
          </div>
        </div>
      </div>

      {simResult && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Cumulative Oil Recovery</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl font-black text-slate-900 dark:text-white font-mono">{simResult.scenario.cum_oil_m3}</span>
              <span className="text-xs text-slate-400">m³</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
              +{simResult.deltas.oil_production_pct}% vs Baseline ({simResult.baseline.cum_oil_m3} m³)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Steam-Oil Ratio (SOR)</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl font-black text-cyan-600 dark:text-cyan-400 font-mono">{simResult.scenario.sor}</span>
            </div>
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mt-1 block">
              {simResult.deltas.sor_delta <= 0 ? `${simResult.deltas.sor_delta}` : `+${simResult.deltas.sor_delta}`} vs Baseline ({simResult.baseline.sor})
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Average Pump Efficiency</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{simResult.scenario.avg_pump_eff_pct}%</span>
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              Baseline: {simResult.baseline.avg_pump_eff_pct}%
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Average Equipment Risk</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl font-black text-amber-500 dark:text-amber-400 font-mono">{simResult.scenario.avg_failure_risk_pct}%</span>
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              Baseline: {simResult.baseline.avg_failure_risk_pct}%
            </span>
          </div>
        </div>
      )}

      {simResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="industrial-card rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Daily Oil Production Forecast (m³/d)</span>
              <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400">Day 1 to Day {cutoffDays}</span>
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simResult.time_series_comparison} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.4} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} unit="d" />
                  <YAxis stroke="#94a3b8" fontSize={11} unit=" m³" />
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
                  <Line
                    type="monotone"
                    dataKey="baseline_production_m3d"
                    name="Current Baseline"
                    stroke="#ffb300"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="proposed_production_m3d"
                    name="Proposed Scenario"
                    stroke="#00d2ff"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="industrial-card rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Thermal Cooling vs Crude Viscosity</span>
              <span className="text-xs font-mono text-orange-500 dark:text-orange-400">Beggs-Robinson Correlation</span>
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simResult.time_series_comparison} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.4} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} unit="d" />
                  <YAxis stroke="#ff5722" fontSize={11} unit=" °C" />
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
                  <Line
                    type="monotone"
                    dataKey="baseline_temp_c"
                    name="Baseline Temp (°C)"
                    stroke="#ff5722"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="proposed_temp_c"
                    name="Proposed Temp (°C)"
                    stroke="#ff5722"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="proposed_viscosity_cp"
                    name="Proposed Viscosity (cP)"
                    stroke="#ffb300"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
