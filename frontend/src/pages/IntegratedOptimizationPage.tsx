import React, { useState } from 'react';
import { useWell } from '../context/WellContext';
import { optimizeIntegrated } from '../services/api';
import { IntegratedOptimizationResult } from '../types';
import { Cpu, Sparkles, RefreshCw, CheckCircle2, Flame, Settings, Zap, ShieldCheck } from 'lucide-react';

export const IntegratedOptimizationPage: React.FC = () => {
  const { selectedWellId } = useWell();

  const [maxSteam, setMaxSteam] = useState<number>(4500);
  const [maxSpm, setMaxSpm] = useState<number>(10.0);
  const [maxRodLoad, setMaxRodLoad] = useState<number>(115.0);

  const [result, setResult] = useState<IntegratedOptimizationResult | null>(null);
  const [optimizing, setOptimizing] = useState<boolean>(false);

  const handleRunIntegratedOptimization = async () => {
    try {
      setOptimizing(true);
      const res = await optimizeIntegrated({
        well_id: selectedWellId,
        max_steam_m3: maxSteam,
        max_spm: maxSpm,
        max_rod_load_kn: maxRodLoad,
        objective: 'MAX_PRODUCTION_MIN_ENERGY',
      });
      setResult(res);
    } catch (err) {
      console.error('Integrated Optimization failed:', err);
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />
          Integrated Joint CSS + SRP Multi-Variable AI Optimization
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          SciPy Constrained Non-Linear Optimization (SLSQP) coupling thermal reservoir kinetics with surface artificial lift dynamics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls */}
        <div className="industrial-card rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <span>Optimization Boundary Constraints</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
                <label>Max Steam Volume Cap</label>
                <span className="text-orange-500 dark:text-orange-400 font-mono">{maxSteam} m³</span>
              </div>
              <input
                type="range"
                min="3000"
                max="6000"
                step="250"
                value={maxSteam}
                onChange={(e) => setMaxSteam(Number(e.target.value))}
                className="w-full accent-orange-500 bg-slate-200 dark:bg-slate-800 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
                <label>Max Allowed SPM Limit</label>
                <span className="text-amber-500 dark:text-amber-400 font-mono">{maxSpm} SPM</span>
              </div>
              <input
                type="range"
                min="6.0"
                max="12.0"
                step="0.5"
                value={maxSpm}
                onChange={(e) => setMaxSpm(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-200 dark:bg-slate-800 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
                <label>Max Peak Rod Load Limit</label>
                <span className="text-rose-500 dark:text-rose-400 font-mono">{maxRodLoad} kN</span>
              </div>
              <input
                type="range"
                min="90"
                max="140"
                step="5"
                value={maxRodLoad}
                onChange={(e) => setMaxRodLoad(Number(e.target.value))}
                className="w-full accent-rose-500 bg-slate-200 dark:bg-slate-800 cursor-pointer"
              />
            </div>

            <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
              <span className="font-bold text-cyan-600 dark:text-cyan-400 block">SciPy Optimization Target:</span>
              <p className="leading-relaxed">
                Maximize Net Production & System Efficiency while penalizing Rod Floating, High SOR (&gt;3.8), and Excess Electrical Power.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunIntegratedOptimization}
            disabled={optimizing}
            className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/30 hover:brightness-110 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {optimizing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running SciPy Constrained Optimization...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Joint AI Optimization</span>
              </>
            )}
          </button>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 industrial-card rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
              Optimal Well-to-Surface Integrated Operating Plan
            </h2>
            {result && (
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                PARETO OPTIMAL
              </span>
            )}
          </div>

          {!result ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <Cpu className="w-12 h-12 text-slate-400 dark:text-slate-600 animate-pulse" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Set operational boundary limits and click "Run Joint AI Optimization"
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 max-w-md">
                Couples thermal steam kinetics with mechanical surface pumping parameters to produce a unified operational plan for Baghewala Field.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-orange-500/10 dark:bg-orange-950/30 border border-orange-500/40 space-y-3">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider block border-b border-orange-500/30 pb-2 flex items-center gap-1.5">
                    <Flame className="w-4 h-4" />
                    Recommended CSS Thermal Plan
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-700 dark:text-slate-300">Steam Volume:</span>
                      <span className="font-mono font-bold text-orange-600 dark:text-orange-300">{result.recommended_css.steam_volume_m3} m³</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700 dark:text-slate-300">Steam Temp / Press:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">{result.recommended_css.steam_temp_c}°C @ {result.recommended_css.injection_pressure_bar} bar</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700 dark:text-slate-300">Soak Days:</span>
                      <span className="font-mono font-bold text-orange-600 dark:text-orange-300">{result.recommended_css.soak_days} Days</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-cyan-500/10 dark:bg-cyan-950/30 border border-cyan-500/40 space-y-3">
                  <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block border-b border-cyan-500/30 pb-2 flex items-center gap-1.5">
                    <Settings className="w-4 h-4" />
                    Recommended SRP Mechanical Plan
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-700 dark:text-slate-300">Stroke Length:</span>
                      <span className="font-mono font-bold text-cyan-600 dark:text-cyan-300">{result.recommended_srp.stroke_length_m} m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700 dark:text-slate-300">Strokes Per Minute:</span>
                      <span className="font-mono font-bold text-cyan-600 dark:text-cyan-300">{result.recommended_srp.spm} SPM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700 dark:text-slate-300">VFD Frequency:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">{result.recommended_srp.vfd_freq_hz} Hz</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block border-b border-slate-200 dark:border-slate-800 pb-2">
                  Predicted Well-to-Surface Performance Outcomes
                </span>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Daily Oil Prod</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {result.predicted_outcomes.oil_production_m3d} m³/d
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Steam-Oil Ratio</span>
                    <span className="text-lg font-black text-cyan-600 dark:text-cyan-400 font-mono">
                      {result.predicted_outcomes.sor}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Pump Efficiency</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {result.predicted_outcomes.pump_efficiency_pct} %
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Equipment Risk</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {result.predicted_outcomes.failure_risk_pct} %
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 text-center">
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase block">Prod Gain</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-300 font-mono">+{result.comparison_summary.production_increase_pct}%</span>
                </div>
                <div className="p-3 rounded-xl bg-cyan-500/10 dark:bg-cyan-950/40 border border-cyan-500/30 text-center">
                  <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 uppercase block">SOR Reduced</span>
                  <span className="text-lg font-black text-cyan-600 dark:text-cyan-300 font-mono">-{result.comparison_summary.sor_reduction_pct}%</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-center">
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase block">Energy Saved</span>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-300 font-mono">-{result.comparison_summary.energy_savings_pct}%</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 text-center">
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase block">Eff Improvement</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-300 font-mono">+{result.comparison_summary.efficiency_improvement_pct}%</span>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
