import React, { useEffect, useState } from 'react';
import { useWell } from '../context/WellContext';
import { getDigitalTwin } from '../services/api';
import { DigitalTwinState } from '../types';
import {
  Layers,
  Thermometer,
  Activity,
  Settings,
  Droplets,
  Radio,
  Zap
} from 'lucide-react';

export const DigitalTwinPage: React.FC = () => {
  const { selectedWellId, liveTick } = useWell();
  const [twin, setTwin] = useState<DigitalTwinState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTwin = async () => {
      try {
        setLoading(true);
        const data = await getDigitalTwin(selectedWellId);
        setTwin(data);
      } catch (err) {
        console.error('Failed to fetch digital twin:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTwin();
  }, [selectedWellId]);

  const currentTemp = liveTick?.reservoir_temp_c ?? twin?.reservoir.temperature_c ?? 130.0;
  const currentVisc = liveTick?.viscosity_cp ?? twin?.wellbore.fluid_viscosity_cp ?? 145.0;
  const currentProd = liveTick?.oil_production_m3d ?? twin?.fluid.oil_production_m3d ?? 18.4;
  const currentEff = liveTick?.pump_efficiency_pct ?? twin?.srp.pump_efficiency_pct ?? 78.5;
  const currentPRL = liveTick?.peak_rod_load_kn ?? twin?.srp.peak_rod_load_kn ?? 94.2;
  const currentRisk = liveTick?.failure_risk_pct ?? twin?.srp.failure_risk_pct ?? 12.4;
  const isFloating = liveTick?.is_rod_floating ?? twin?.srp.is_rod_floating ?? false;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />
            4-Layer Well-to-Surface Digital Twin — [{selectedWellId}]
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time coupled physics: Reservoir → Wellbore → Fluid Model → Sucker Rod Pump (SRP)
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-mono text-cyan-600 dark:text-cyan-400">
          <Radio className="w-4 h-4 text-emerald-500 dark:text-emerald-400 animate-pulse" />
          <span>REAL-TIME STREAMING: {liveTick ? 'ACTIVE (WebSocket)' : 'CONNECTED'}</span>
        </div>
      </div>

      {/* 4-Layer Glassmorphic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Layer 1: Reservoir Twin */}
        <div className="industrial-card rounded-2xl p-5 border-l-4 border-l-orange-500 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
              <span className="text-xs font-extrabold text-orange-500 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <Thermometer className="w-4 h-4" />
                1. Reservoir Twin
              </span>
              <span className="text-[10px] font-mono text-slate-400">Layer 01</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Reservoir Temp</span>
                <span className="font-mono font-bold text-orange-500 dark:text-orange-400 text-sm">{currentTemp} °C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Reservoir Pressure</span>
                <span className="font-mono text-slate-700 dark:text-slate-200">{twin?.reservoir.pressure_bar || 28.5} bar</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Formation Temp</span>
                <span className="font-mono text-slate-700 dark:text-slate-200">{twin?.reservoir.formation_temp_c || 38.0} °C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Steam Radius</span>
                <span className="font-mono text-slate-700 dark:text-slate-200">{twin?.reservoir.thermal_radius_m || 23.8} m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Fluid Mobility</span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                  {twin?.reservoir.fluid_mobility_md_cp || 5.86} mD/cP
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
            CSS steam heats matrix, reducing crude heavy oil viscosity.
          </div>
        </div>

        {/* Layer 2: Wellbore Twin */}
        <div className="industrial-card rounded-2xl p-5 border-l-4 border-l-sky-500 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
              <span className="text-xs font-extrabold text-sky-500 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Droplets className="w-4 h-4" />
                2. Wellbore Twin
              </span>
              <span className="text-[10px] font-mono text-slate-400">Layer 02</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Bottom-Hole Press</span>
                <span className="font-mono text-slate-700 dark:text-slate-200">{twin?.wellbore.bottom_hole_pressure_bar || 22.2} bar</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Fluid Temp</span>
                <span className="font-mono text-slate-700 dark:text-slate-200">{(currentTemp * 0.92).toFixed(1)} °C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Crude Viscosity</span>
                <span className="font-mono font-bold text-amber-500 dark:text-amber-400 text-sm">{currentVisc} cP</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Gross Flow Rate</span>
                <span className="font-mono text-slate-700 dark:text-slate-200">{twin?.wellbore.total_flow_rate_m3d || 27.0} m³/d</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Water Cut</span>
                <span className="font-mono text-slate-700 dark:text-slate-200">{twin?.wellbore.water_cut_pct || 32.0} %</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
            Beggs-Robinson empirical thermal crude correlation model.
          </div>
        </div>

        {/* Layer 3: Fluid Coupling Model */}
        <div className="industrial-card rounded-2xl p-5 border-l-4 border-l-amber-500 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
              <span className="text-xs font-extrabold text-amber-500 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                3. Fluid Coupling Model
              </span>
              <span className="text-[10px] font-mono text-slate-400">Layer 03</span>
            </div>

            <div className="p-3 bg-slate-100/80 dark:bg-slate-900/80 rounded-xl border border-amber-500/30 text-[11px] space-y-2">
              <div className="flex items-center justify-between font-mono text-slate-700 dark:text-slate-300">
                <span>Temp ({currentTemp}°C) ↓</span>
                <span className="text-amber-500 dark:text-amber-400 font-bold">Visc ({currentVisc} cP) ↑</span>
              </div>
              <div className="flex items-center justify-between font-mono text-slate-700 dark:text-slate-300">
                <span>Mobility ↓</span>
                <span className="text-rose-500 dark:text-rose-400 font-bold">PRL ({currentPRL} kN) ↑</span>
              </div>
              <div className="flex items-center justify-between font-mono text-slate-700 dark:text-slate-300">
                <span>Fillage ({twin?.srp.pump_fillage_pct || 78.5}%) ↓</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">Prod ({currentProd} m³/d)</span>
              </div>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Estimated Oil Prod</span>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-sm">{currentProd} m³/d</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Hydraulic Power</span>
                <span className="font-mono text-slate-700 dark:text-slate-200">14.2 kW</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
            Couples fluid viscosity to plunger valve opening dynamics.
          </div>
        </div>

        {/* Layer 4: SRP Twin */}
        <div className="industrial-card rounded-2xl p-5 border-l-4 border-l-cyan-500 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
              <span className="text-xs font-extrabold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="w-4 h-4" />
                4. SRP Mechanical Twin
              </span>
              <span className="text-[10px] font-mono text-slate-400">Layer 04</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Stroke / SPM</span>
                <span className="font-mono text-slate-700 dark:text-slate-200">
                  {twin?.srp.stroke_length_m || 2.8} m @ {twin?.srp.spm || 7.5} SPM
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">VFD Speed</span>
                <span className="font-mono text-slate-700 dark:text-slate-200">{twin?.srp.vfd_freq_hz || 45.0} Hz</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Pump Efficiency</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{currentEff} %</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Peak Rod Load</span>
                <span className="font-mono font-bold text-rose-500 dark:text-rose-400">{currentPRL} kN</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Structural Risk</span>
                <span
                  className={`font-mono font-bold ${
                    currentRisk > 30 ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {currentRisk} % {isFloating && '(ROD FLOATING!)'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
            API Spec 11B Rod String Fatigue & Load Card Modeling.
          </div>
        </div>

      </div>

      {/* Physics Correlation Card */}
      <div className="industrial-card rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
          Governing Physics Correlations & Operational Envelope
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Varit AI integrates Andrade/Beggs-Robinson temperature-viscosity decay equations:
          <span className="font-mono text-cyan-600 dark:text-cyan-300 mx-1.5 font-bold">μ(T) = 15.0 + 7800 · exp(-0.042 · (T - 35))</span>
          with Sucker Rod Pump (SRP) fluid acceleration and viscous friction equations. As steam dissipates post-CSS, reservoir temperature decreases, causing viscosity to climb up to 6,500+ cP. High viscosity severely increases downstroke viscous drag, reducing minimum rod load below zero and triggering dangerous <strong className="text-rose-500 dark:text-rose-400">Rod Floating</strong> conditions.
        </p>
      </div>
    </div>
  );
};
