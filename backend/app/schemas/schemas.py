from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Well Schemas
class WellBase(BaseModel):
    id: str
    name: str
    field_name: str
    reservoir: str
    depth_m: float
    oil_api: float
    current_status: str
    init_res_temp_c: float
    current_res_temp_c: float
    current_res_pressure_bar: float
    current_viscosity_cp: float
    current_production_m3d: float
    water_cut: float
    current_cycle_number: int
    steam_volume_m3: float
    steam_temp_c: float
    soak_days: float
    days_into_cycle: float
    stroke_length_m: float
    spm: float
    vfd_freq_hz: float
    pump_depth_m: float
    plunger_dia_mm: float
    pump_efficiency_pct: float
    peak_rod_load_kn: float
    min_rod_load_kn: float
    failure_risk_pct: float
    energy_per_m3: float

class WellResponse(WellBase):
    class Config:
        from_attributes = True

# Digital Twin Schemas
class ReservoirState(BaseModel):
    pressure_bar: float
    temperature_c: float
    formation_temp_c: float
    thermal_radius_m: float
    fluid_mobility_md_cp: float

class WellboreState(BaseModel):
    bottom_hole_pressure_bar: float
    fluid_temp_c: float
    fluid_viscosity_cp: float
    total_flow_rate_m3d: float
    water_cut_pct: float

class FluidState(BaseModel):
    temperature_c: float
    viscosity_cp: float
    mobility_md_cp: float
    pump_load_kn: float
    oil_production_m3d: float

class SrpState(BaseModel):
    stroke_length_m: float
    spm: float
    vfd_freq_hz: float
    pump_efficiency_pct: float
    peak_rod_load_kn: float
    min_rod_load_kn: float
    pump_fillage_pct: float
    failure_risk_pct: float
    is_rod_floating: bool

class DigitalTwinResponse(BaseModel):
    well_id: str
    timestamp: str
    reservoir: ReservoirState
    wellbore: WellboreState
    fluid: FluidState
    srp: SrpState

# Optimization Schemas
class CssOptimizeRequest(BaseModel):
    well_id: str
    steam_volume_m3: float = Field(..., ge=1000, le=6000)
    injection_pressure_bar: float = Field(..., ge=20, le=100)
    steam_temp_c: float = Field(..., ge=150, le=300)
    injection_days: float = Field(..., ge=1, le=14)
    soak_days: float = Field(..., ge=1, le=10)
    target_production_days: float = Field(..., ge=30, le=180)
    previous_cycle_production_m3: float = Field(..., ge=0)
    reservoir_temp_c: float = Field(..., ge=30, le=200)

class CssOptimizationResult(BaseModel):
    well_id: str
    current: Dict[str, float]
    optimized: Dict[str, float]
    improvements: Dict[str, float]
    recommended_window: str

class SrpOptimizeRequest(BaseModel):
    well_id: str
    stroke_length_m: float = Field(..., ge=1.0, le=4.5)
    spm: float = Field(..., ge=2.0, le=15.0)
    vfd_freq_hz: float = Field(..., ge=30.0, le=60.0)
    pump_depth_m: float = Field(..., ge=200.0, le=1200.0)
    viscosity_cp: float = Field(..., ge=5.0, le=10000.0)
    rod_load_kn: float = Field(..., ge=10.0, le=200.0)
    pump_fillage_pct: float = Field(..., ge=10.0, le=100.0)

class SrpOptimizationResult(BaseModel):
    well_id: str
    current: Dict[str, float]
    optimized: Dict[str, float]
    improvements: Dict[str, float]
    dynamometer_curve_current: List[Dict[str, float]]
    dynamometer_curve_optimized: List[Dict[str, float]]

class IntegratedOptimizeRequest(BaseModel):
    well_id: str
    max_steam_m3: float = Field(default=4500.0)
    max_spm: float = Field(default=10.0)
    max_rod_load_kn: float = Field(default=115.0)
    min_pump_fillage_pct: float = Field(default=70.0)
    objective: str = Field(default="MAX_PRODUCTION_MIN_ENERGY")

class IntegratedOptimizationResult(BaseModel):
    well_id: str
    recommended_css: Dict[str, float]
    recommended_srp: Dict[str, float]
    predicted_outcomes: Dict[str, float]
    comparison_summary: Dict[str, Any]

# What-If Simulation Schema
class WhatIfRequest(BaseModel):
    well_id: str
    steam_volume_m3: float
    steam_pressure_bar: float
    soak_days: float
    stroke_length_m: float
    spm: float
    vfd_freq_hz: float
    production_cutoff_days: float = Field(default=90.0)

class WhatIfResult(BaseModel):
    well_id: str
    baseline: Dict[str, float]
    scenario: Dict[str, float]
    deltas: Dict[str, float]
    time_series_comparison: List[Dict[str, float]]

# Alerts & Summary
class AlertResponse(BaseModel):
    id: int
    well_id: str
    timestamp: datetime
    severity: str
    title: str
    message: str
    category: str
    is_active: bool

    class Config:
        from_attributes = True

class DashboardSummaryResponse(BaseModel):
    total_wells: int
    active_wells: int
    total_oil_production_m3d: float
    avg_reservoir_temp_c: float
    avg_viscosity_cp: float
    avg_srp_efficiency_pct: float
    avg_sor: float
    avg_energy_per_m3: float
    high_risk_wells_count: int
    wells_summary: List[Dict[str, Any]]
