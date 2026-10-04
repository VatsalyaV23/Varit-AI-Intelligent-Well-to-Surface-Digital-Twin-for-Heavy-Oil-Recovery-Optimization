"""
Physics-inspired mathematical models for heavy oil reservoir, CSS thermal response,
Beggs-Robinson/Andrade viscosity correlations, and Sucker Rod Pump (SRP) mechanics.
"""

import math

def calculate_viscosity(temperature_c: float, dead_oil_api: float = 18.0) -> float:
    """
    Calculate crude oil viscosity in cP based on reservoir/wellbore temperature (°C)
    using modified Beggs-Robinson heavy crude empirical correlation for Baghewala crude.
    """
    # Clamp temp to realistic range
    temp = max(20.0, min(300.0, temperature_c))
    
    # Baghewala crude API ~ 17-19
    # Base viscosity at 35°C is ~ 6500-8000 cP
    # As temp increases to 180°C, viscosity drops to 15-25 cP
    base_visc = 12.0  # High temp asymptote (cP)
    thermal_effect = 7800.0 * math.exp(-0.042 * (temp - 35.0))
    
    viscosity = base_visc + thermal_effect
    return float(round(viscosity, 2))

def calculate_thermal_decay(days_into_cycle: float, steam_vol_m3: float, 
                            steam_temp_c: float, soak_days: float, 
                            init_res_temp_c: float = 38.0) -> float:
    """
    Calculate reservoir temperature evolution after steam injection cycle.
    """
    # Peak temperature after soak depends on steam heat input
    energy_injected = steam_vol_m3 * (steam_temp_c - 100.0) * 0.0022  # Arbitrary heat scale
    peak_temp = init_res_temp_c + min(160.0, energy_injected / (1.0 + 0.05 * soak_days))
    
    # Cooling coefficient (days^-1)
    cooling_rate = 0.015 + 0.003 * max(0.5, soak_days)
    
    # Temperature at day t
    current_temp = init_res_temp_c + (peak_temp - init_res_temp_c) * math.exp(-cooling_rate * days_into_cycle)
    return float(round(current_temp, 1))

def calculate_srp_performance(stroke_length_m: float, spm: float, pump_depth_m: float, 
                             plunger_dia_mm: float, viscosity_cp: float, 
                             bhp_bar: float, water_cut: float = 0.35):
    """
    Calculate Sucker Rod Pump (SRP) mechanical loads, pump fillage, 
    oil production rate, energy consumption, and structural risks.
    """
    # Plunger area in m2
    r_m = (plunger_dia_mm / 1000.0) / 2.0
    area_m2 = math.pi * r_m**2
    
    # Theoretical volumetric displacement (m3/day)
    # Displacement = Stroke * SPM * Area * 1440 mins/day
    v_theoretical = stroke_length_m * spm * area_m2 * 1440.0
    
    # Pump Fillage / Volumetric Efficiency
    # High viscosity restricts pump valve closure speed & fluid entry
    visc_penalty = min(0.40, 0.000035 * viscosity_cp)
    spm_penalty = max(0.0, 0.02 * (spm - 9.0))
    bhp_boost = min(0.10, 0.002 * max(0.0, bhp_bar - 10.0))
    
    fillage = 0.94 - visc_penalty - spm_penalty + bhp_boost
    fillage = max(0.20, min(0.98, fillage))
    
    # Fluid production rate
    gross_fluid_m3d = v_theoretical * fillage
    oil_prod_m3d = gross_fluid_m3d * (1.0 - water_cut)
    
    # Fluid weight & Rod weight (approximate API Grade D 7/8" rod string)
    rod_weight_per_m = 3.3  # kg/m
    total_rod_mass_kg = rod_weight_per_m * pump_depth_m
    rod_weight_kn = (total_rod_mass_kg * 9.81) / 1000.0
    
    fluid_column_mass_kg = area_m2 * pump_depth_m * (1000.0 * (1.0 - water_cut*0.1))
    fluid_weight_kn = (fluid_column_mass_kg * 9.81) / 1000.0
    
    # Viscous drag force on upstroke
    viscous_drag_kn = (0.000015 * viscosity_cp * spm * stroke_length_m * (pump_depth_m / 1000.0))
    
    # Acceleration factor
    accel_factor = (stroke_length_m * (spm**2)) / 1790.0
    
    # Peak Rod Load (PRL) in kN
    prl_kn = rod_weight_kn * (1.0 + accel_factor) + fluid_weight_kn + viscous_drag_kn
    
    # Minimum Rod Load (MRL) in kN (downstroke)
    # Downstroke drag opposes gravity
    downward_drag_kn = viscous_drag_kn * 1.3
    mrl_kn = rod_weight_kn * (1.0 - accel_factor * 0.8) * 0.87 - downward_drag_kn
    
    # Rod floating condition check
    is_rod_floating = mrl_kn <= 0.5
    
    # Rod fatigue load ratio (assuming Max Rating = 140 kN)
    rod_load_rating_kn = 135.0
    rod_stress_ratio = prl_kn / rod_load_rating_kn
    
    # Overall Failure Risk (%)
    # Combines Fatigue, Rod Floating, and High Drag
    fatigue_risk = max(0.0, (rod_stress_ratio - 0.75) / 0.25) * 60.0
    floating_risk = 80.0 if is_rod_floating else max(0.0, (2.0 - mrl_kn)/2.0) * 40.0
    visc_risk = min(30.0, viscosity_cp / 300.0)
    
    total_failure_risk = min(99.0, max(5.0, fatigue_risk + floating_risk + visc_risk))
    
    # Electrical Power & Energy calculation (kW and kWh/m3)
    hydraulic_power_kw = (gross_fluid_m3d * 1000.0 * 9.81 * pump_depth_m) / (86400.0 * 1000.0)
    system_efficiency = fillage * 0.65 * (1.0 / (1.0 + 0.0001 * viscosity_cp))
    system_efficiency = max(0.20, min(0.85, system_efficiency))
    
    elec_power_kw = hydraulic_power_kw / system_efficiency
    daily_energy_kwh = elec_power_kw * 24.0
    energy_per_m3 = daily_energy_kwh / max(0.1, oil_prod_m3d)
    
    return {
        "theoretical_disp_m3d": round(v_theoretical, 2),
        "pump_fillage": round(fillage * 100.0, 1),
        "oil_production_m3d": round(oil_prod_m3d, 2),
        "gross_production_m3d": round(gross_fluid_m3d, 2),
        "peak_rod_load_kn": round(prl_kn, 2),
        "min_rod_load_kn": round(mrl_kn, 2),
        "is_rod_floating": is_rod_floating,
        "rod_stress_pct": round(rod_stress_ratio * 100.0, 1),
        "failure_risk_pct": round(total_failure_risk, 1),
        "power_kw": round(elec_power_kw, 2),
        "energy_per_m3": round(energy_per_m3, 2),
        "pump_efficiency_pct": round(system_efficiency * 100.0, 1)
    }

def calculate_sor(steam_vol_m3: float, cycle_cum_oil_m3: float) -> float:
    """Steam-Oil Ratio (m3 steam / m3 oil)"""
    if cycle_cum_oil_m3 <= 0:
        return 99.0
    return float(round(steam_vol_m3 / cycle_cum_oil_m3, 2))
