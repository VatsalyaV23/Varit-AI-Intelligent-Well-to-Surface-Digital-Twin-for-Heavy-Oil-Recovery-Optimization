import React, { useState } from 'react';
import { useWell } from '../context/WellContext';
import { optimizeCss } from '../services/api';
import { CssOptimizationResult } from '../types';
import { Flame, CheckCircle2, TrendingUp, Sparkles, RefreshCw } from 'lucide-react';

export const CssOptimizationPage: React.FC = () => {
  const { currentWell, selectedWellId } = useWell();

  const [steamVol, setSteamVol] = useState<number>(currentWell?.steam_volume_m3 || 3500);
  const [steamTemp, setSteamTemp] = useState<number>(currentWell?.steam_temp_c || 235);
  const [soakDays, setSoakDays] = useState<number>(currentWell?.soak_days || 4.0);
  const [injPressure, setInjPressure] = useState<number>(65.0);
  const [injDays, setInjDays] = useState<number>(5.0);
  const [targetProdDays, setTargetProdDays] = useState<number>(90);

  const [result, setResult] = useState<CssOptimizationResult | null>(null);
  const [optimizing, setOptimizing] = useState<boolean>(false);

  const handleRunOptimization = async () => {
    try {
      setOptimizing(true);
      const res = await optimizeCss({
        well_id: selectedWellId,
        steam_volume_m3: steamVol,
        injection_pressure_bar: injPressure,
        steam_temp_c: steamTemp,
        injection_days: injDays,
        soak_days: soakDays,
        target_production_days: targetProdDays,
        previous_cycle_production_m3: 1200,
        reservoir_temp_c: currentWell?.current_res_temp_c || 38.0,
      });
      setResult(res);
    } catch (err) {
      console.error('CSS Optimization failed:', err);
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500" />
          Cyclic Steam Stimulation (CSS) Thermal Optimization
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Optimize steam injection enthalpy, soak duration, and steam-oil ratio (SOR) for maximum heavy oil recovery.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CSS Controls Panel */}
        <div className="industrial-card rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <span>Thermal Injection Parameters</span>
            <span className="text-[10px] text-orange-500 dark:text-orange-400 font-mono">CYCLE #{currentWell?.current_cycle_number || 3}</span>
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
                <label>Steam Injection Volume</label>
                <span className="text-cyan-600 dark:text-cyan-400 font-mono">{steamVol} m³</span>
              </div>
              <input
                type="range"
                min="1500"
                max="5000"
                step="100"
                value={steamVol}
                onChange={(e) => setSteamVol(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-200 dark:bg-slate-800 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
                <label>Steam Temperature</label>
                <span className="text-orange-500 dark:text-orange-400 font-mono">{steamTemp} °C</span>
              </div>
              <input
                type="range"
                min="180"
                max="280"
                step="5"
                value={steamTemp}
                onChange={(e) => setSteamTemp(Number(e.target.value))}
                className="w-full accent-orange-500 bg-slate-200 dark:bg-slate-800 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
                <label>Soak Duration</label>
                <span className="text-amber-500 dark:text-amber-400 font-mono">{soakDays} Days</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="8.0"
                step="0.5"
                value={soakDays}
                onChange={(e) => setSoakDays(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-200 dark:bg-slate-800 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
                <label>Target Production Period</label>
                <span className="text-slate-900 dark:text-slate-200 font-mono">{targetProdDays} Days</span>
              </div>
              <input
                type="range"
                min="30"
                max="180"
                step="10"
                value={targetProdDays}
                onChange={(e) => setTargetProdDays(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-200 dark:bg-slate-800 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-slate-500 dark:text-slate-400 block mb-1">Inj Press (bar)</label>
                <input
                  type="number"
                  value={injPressure}
                  onChange={(e) => setInjPressure(Number(e.target.value))}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-cyan-600 dark:text-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-500 dark:text-slate-400 block mb-1">Inj Days</label>
                <input
                  type="number"
                  value={injDays}
                  onChange={(e) => setInjDays(Number(e.target.value))}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-cyan-600 dark:text-cyan-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleRunOptimization}
            disabled={optimizing}
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 hover:from-orange-400 hover:to-amber-400 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {optimizing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing Thermal Optimization...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run CSS Optimization</span>
              </>
            )}
          </button>
        </div>

        {/* Results Comparison */}
        <div className="lg:col-span-2 industrial-card rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
              Current Operating Baseline vs Optimized CSS Plan
            </h2>
            {result && (
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                OPTIMIZATION COMPLETE
              </span>
            )}
          </div>

          {!result ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <Flame className="w-12 h-12 text-slate-400 dark:text-slate-600 animate-pulse" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Configure injection parameters and click "Run CSS Optimization"
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 max-w-md">
                Varit AI backend will execute thermal-reservoir decay models and optimize steam volume to reduce SOR while boosting cumulative oil recovery.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block border-b border-slate-200 dark:border-slate-800 pb-2">
                    Current Baseline
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Steam Volume:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">{result.current.steam_volume_m3} m³</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Soak Days:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">{result.current.soak_days} Days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Expected Prod:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-200">{result.current.expected_production_m3d} m³/d</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Steam-Oil Ratio (SOR):</span>
                      <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{result.current.sor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Energy Intensity:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">{result.current.energy_per_m3} kWh/m³</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-cyan-500/10 dark:bg-cyan-950/40 border border-cyan-500/40 space-y-3 shadow-lg shadow-cyan-500/10">
                  <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block border-b border-cyan-500/30 pb-2 flex items-center justify-between">
                    <span>AI Recommended CSS Plan</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-700 dark:text-slate-300">Steam Volume:</span>
                      <span className="font-mono font-bold text-cyan-600 dark:text-cyan-300">{result.optimized.steam_volume_m3} m³</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700 dark:text-slate-300">Soak Days:</span>
                      <span className="font-mono font-bold text-cyan-600 dark:text-cyan-300">{result.optimized.soak_days} Days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700 dark:text-slate-300">Expected Prod:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{result.optimized.expected_production_m3d} m³/d</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700 dark:text-slate-300">Steam-Oil Ratio (SOR):</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{result.optimized.sor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700 dark:text-slate-300">Energy Intensity:</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{result.optimized.energy_per_m3} kWh/m³</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 text-center">
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase block">Production Gain</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-300 font-mono">+{result.improvements.production_gain_pct}%</span>
                </div>
                <div className="p-3 rounded-xl bg-cyan-500/10 dark:bg-cyan-950/40 border border-cyan-500/30 text-center">
                  <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 uppercase block">Steam Saved</span>
                  <span className="text-lg font-black text-cyan-600 dark:text-cyan-300 font-mono">-{result.improvements.steam_reduction_pct}%</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-center">
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase block">SOR Reduction</span>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-300 font-mono">-{result.improvements.sor_reduction_pct}%</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 text-center">
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase block">Energy Savings</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-300 font-mono">-{result.improvements.energy_savings_pct}%</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-bold text-orange-500 dark:text-orange-400 block mb-1 uppercase tracking-wider">
                  Operational Window Directive
                </span>
                <p className="text-slate-700 dark:text-slate-300 font-mono leading-relaxed">{result.recommended_window}</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
