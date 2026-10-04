export interface Well {
  id: string;
  name: string;
  field_name: string;
  reservoir: string;
  depth_m: number;
  oil_api: number;
  current_status: string;
  init_res_temp_c: number;
  current_res_temp_c: number;
  current_res_pressure_bar: number;
  current_viscosity_cp: number;
  current_production_m3d: number;
  water_cut: number;
  current_cycle_number: number;
  steam_volume_m3: number;
  steam_temp_c: number;
  soak_days: number;
  days_into_cycle: number;
  stroke_length_m: number;
  spm: number;
  vfd_freq_hz: number;
  pump_depth_m: number;
  plunger_dia_mm: number;
  pump_efficiency_pct: number;
  peak_rod_load_kn: number;
  min_rod_load_kn: number;
  failure_risk_pct: number;
  energy_per_m3: number;
}

export interface WellSummaryItem {
  id: string;
  name: string;
  status: string;
  oil_production_m3d: number;
  reservoir_temp_c: number;
  viscosity_cp: number;
  spm: number;
  pump_efficiency_pct: number;
  failure_risk_pct: number;
  peak_rod_load_kn: number;
  is_rod_floating: boolean;
}

export interface DashboardSummary {
  total_wells: number;
  active_wells: number;
  total_oil_production_m3d: number;
  avg_reservoir_temp_c: number;
  avg_viscosity_cp: number;
  avg_srp_efficiency_pct: number;
  avg_sor: number;
  avg_energy_per_m3: number;
  high_risk_wells_count: number;
  wells_summary: WellSummaryItem[];
}

export interface DigitalTwinState {
  well_id: string;
  timestamp: string;
  reservoir: {
    pressure_bar: number;
    temperature_c: number;
    formation_temp_c: number;
    thermal_radius_m: number;
    fluid_mobility_md_cp: number;
  };
  wellbore: {
    bottom_hole_pressure_bar: number;
    fluid_temp_c: number;
    fluid_viscosity_cp: number;
    total_flow_rate_m3d: number;
    water_cut_pct: number;
  };
  fluid: {
    temperature_c: number;
    viscosity_cp: number;
    mobility_md_cp: number;
    pump_load_kn: number;
    oil_production_m3d: number;
  };
  srp: {
    stroke_length_m: number;
    spm: number;
    vfd_freq_hz: number;
    pump_efficiency_pct: number;
    peak_rod_load_kn: number;
    min_rod_load_kn: number;
    pump_fillage_pct: number;
    failure_risk_pct: number;
    is_rod_floating: boolean;
  };
}

export interface CssOptimizationResult {
  well_id: string;
  current: Record<string, number>;
  optimized: Record<string, number>;
  improvements: Record<string, number>;
  recommended_window: string;
}

export interface SrpOptimizationResult {
  well_id: string;
  current: Record<string, number | boolean>;
  optimized: Record<string, number | boolean>;
  improvements: Record<string, number>;
  dynamometer_curve_current: { position_m: number; load_kn: number; stroke_phase: string }[];
  dynamometer_curve_optimized: { position_m: number; load_kn: number; stroke_phase: string }[];
}

export interface IntegratedOptimizationResult {
  well_id: string;
  current_state: Record<string, number>;
  recommended_css: Record<string, number>;
  recommended_srp: Record<string, number>;
  predicted_outcomes: Record<string, number | boolean>;
  comparison_summary: Record<string, number>;
}

export interface WhatIfResult {
  well_id: string;
  baseline: Record<string, number>;
  scenario: Record<string, number>;
  deltas: Record<string, number>;
  time_series_comparison: {
    day: number;
    baseline_temp_c: number;
    proposed_temp_c: number;
    baseline_viscosity_cp: number;
    proposed_viscosity_cp: number;
    baseline_production_m3d: number;
    proposed_production_m3d: number;
    baseline_pump_eff_pct: number;
    proposed_pump_eff_pct: number;
    baseline_failure_risk_pct: number;
    proposed_failure_risk_pct: number;
    baseline_cum_oil_m3: number;
    proposed_cum_oil_m3: number;
  }[];
}

export interface AlertItem {
  id: number;
  well_id: string;
  timestamp: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  message: string;
  category: string;
  is_active: boolean;
}

export interface LiveTelemetryTick {
  well_id: string;
  timestamp: number;
  tick_count: number;
  reservoir_temp_c: number;
  viscosity_cp: number;
  oil_production_m3d: number;
  pump_efficiency_pct: number;
  peak_rod_load_kn: number;
  min_rod_load_kn: number;
  power_kw: number;
  failure_risk_pct: number;
  is_rod_floating: boolean;
  energy_per_m3: number;
}
