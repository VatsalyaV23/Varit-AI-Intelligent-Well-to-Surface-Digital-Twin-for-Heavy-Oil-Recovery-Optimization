import React, { useState } from 'react';
import { useWell } from '../context/WellContext';
import { optimizeSrp } from '../services/api';
import { SrpOptimizationResult } from '../types';
import { DynamometerChart } from '../components/DynamometerChart';
import { Settings, Sparkles, RefreshCw, Activity, CheckCircle2 } from 'lucide-react';

export const SrpOptimizationPage: React.FC = () => {
  const { currentWell, selectedWellId } = useWell();

  const [stroke, setStroke] = useState<number>(currentWell?.stroke_length_m || 2.8);
  const [spm, setSpm] = useState<number>(currentWell?.spm || 7.5);
  const [vfdFreq, setVfdFreq] = useState<number>(currentWell?.vfd_freq_hz || 45.0);
  const [pumpDepth, setPumpDepth] = useState<number>(currentWell?.pump_depth_m || 450);
  const [viscosity, setViscosity] = useState<number>(currentWell?.current_viscosity_cp || 145);
  const [pumpFillage, setPumpFillage] = useState<number>(75);

  const [result, setResult] = useState<SrpOptimizationResult | null>(null);
  const [optimizing, setOptimizing] = useState<boolean>(false);

  const handleRunOptimization = async () => {
    try {
      setOptimizing(true);
      const res = await optimizeSrp({
        well_id: selectedWellId,
        stroke_length_m: stroke,
        spm: spm,
        vfd_freq_hz: vfdFreq,
        pump_depth_m: pumpDepth,
        viscosity_cp: viscosity,
        rod_load_kn: currentWell?.peak_rod_load_kn || 94.2,
        pump_fillage_pct: pumpFillage,
      });
      setResult(res);
    } catch (err) {
      console.error('SRP Optimization failed:', err);
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />
          Sucker Rod Pump (SRP) Artificial Lift Optimization
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Optimize stroke length, SPM, and VFD motor frequency to prevent rod floating and maximize pump volumetric fillage.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls */}
        <div className="industrial-card rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
            SRP Mechanical Controls
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
                <label>Stroke Length (m)</label>
                <span className="text-cyan-600 dark:text-cyan-400 font-mono">{stroke} m</span>
              </div>
              <input
                type="range"
                min="1.5"
                max="3.8"
                step="0.1"
                value={stroke}
                onChange={(e) => setStroke(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-200 dark:bg-slate-800 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
                <label>Strokes Per Minute (SPM)</label>
                <span className="text-amber-500 dark:text-amber-400 font-mono">{spm} SPM</span>
              </div>
              <input
                type="range"
                min="3.0"
                max="12.0"
                step="0.5"
                value={spm}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSpm(val);
                  setVfdFreq(roundVal((val / 10.0) * 50.0));
                }}
                className="w-full accent-amber-500 bg-slate-200 dark:bg-slate-800 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
                <label>VFD Motor Speed (Hz)</label>
                <span className="text-emerald-500 dark:text-emerald-400 font-mono">{vfdFreq} Hz</span>
              </div>
              <input
                type="range"
                min="25.0"
                max="60.0"
                step="1.0"
                value={vfdFreq}
                onChange={(e) => setVfdFreq(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-200 dark:bg-slate-800 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-slate-500 dark:text-slate-400 block mb-1">Fluid Visc (cP)</label>
                <input
                  type="number"
                  value={viscosity}
                  onChange={(e) => setViscosity(Number(e.target.value))}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-cyan-600 dark:text-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-500 dark:text-slate-400 block mb-1">Pump Depth (m)</label>
                <input
                  type="number"
                  value={pumpDepth}
                  onChange={(e) => setPumpDepth(Number(e.target.value))}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-cyan-600 dark:text-cyan-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleRunOptimization}
            disabled={optimizing}
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {optimizing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Simulating Dynamometer Loads...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Optimize SRP</span>
              </>
            )}
          </button>
        </div>

        {/* Dynamometer Card & Results */}
        <div className="lg:col-span-2 industrial-card rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
              Simulated Surface Dynamometer Load Card (Position vs Load)
            </h2>
            {result && (
              <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                SRP OPTIMIZED
              </span>
            )}
          </div>

          <div className="industrial-card rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            {result ? (
              <DynamometerChart
                currentCard={result.dynamometer_curve_current}
                optimizedCard={result.dynamometer_curve_optimized}
              />
            ) : (
              <DynamometerChart
                currentCard={generateInitialCard(stroke, spm, 94.2, 14.1)}
              />
            )}
          </div>

          {result && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <span className="font-bold text-slate-500 dark:text-slate-400 uppercase block border-b border-slate-200 dark:border-slate-800 pb-1">
                    Current SRP Settings
                  </span>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Stroke / SPM:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{result.current.stroke_length_m} m @ {result.current.spm} SPM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Production:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-200">{result.current.oil_production_m3d} m³/d</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Pump Efficiency:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{result.current.pump_efficiency_pct} %</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Failure Risk:</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400">{result.current.failure_risk_pct} %</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-cyan-500/10 dark:bg-cyan-950/40 border border-cyan-500/40 space-y-2 text-xs">
                  <span className="font-bold text-cyan-600 dark:text-cyan-400 uppercase block border-b border-cyan-500/30 pb-1">
                    Optimized SRP Recommendation
                  </span>
                  <div className="flex justify-between">
                    <span className="text-slate-700 dark:text-slate-300">Stroke / SPM:</span>
                    <span className="font-mono font-bold text-cyan-600 dark:text-cyan-300">{result.optimized.stroke_length_m} m @ {result.optimized.spm} SPM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700 dark:text-slate-300">Production:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{result.optimized.oil_production_m3d} m³/d</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700 dark:text-slate-300">Pump Efficiency:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{result.optimized.pump_efficiency_pct} %</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700 dark:text-slate-300">Failure Risk:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{result.optimized.failure_risk_pct} %</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 text-center">
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase block">Production Gain</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-300 font-mono">+{result.improvements.production_gain_pct}%</span>
                </div>
                <div className="p-3 rounded-xl bg-cyan-500/10 dark:bg-cyan-950/40 border border-cyan-500/30 text-center">
                  <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 uppercase block">Efficiency Gain</span>
                  <span className="text-lg font-black text-cyan-600 dark:text-cyan-300 font-mono">+{result.improvements.efficiency_gain_pct}%</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 text-center">
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase block">Risk Reduction</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-300 font-mono">-{result.improvements.failure_risk_reduction_pct}%</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-center">
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase block">Energy Savings</span>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-300 font-mono">-{result.improvements.energy_savings_pct}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

function roundVal(v: number): number {
  return Math.round(v * 10) / 10;
}

function generateInitialCard(stroke: number, spm: number, prl: number, mrl: number) {
  const points = [];
  for (let i = 0; i < 25; i++) {
    const pos = stroke * (i / 24);
    points.push({ position_m: pos, load_kn: mrl + (prl - mrl) * (pos / stroke), stroke_phase: 'Upstroke' });
  }
  return points;
}
