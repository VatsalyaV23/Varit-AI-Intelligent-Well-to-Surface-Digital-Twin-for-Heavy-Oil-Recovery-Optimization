"""
What-If Simulation Engine for CSS and SRP joint scenario modeling.
Generates baseline vs proposed scenario time-series predictions.
"""

from typing import Dict, Any, List
from app.utils.physics import (
    calculate_viscosity, 
    calculate_thermal_decay, 
    calculate_srp_performance,
    calculate_sor
)

class WhatIfSimulator:
    def run_simulation(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        well_id = request_data.get("well_id", "BGW-01")
        
        # User proposed parameters
        prop_steam = request_data.get("steam_volume_m3", 3800.0)
        prop_press = request_data.get("steam_pressure_bar", 65.0)
        prop_soak = request_data.get("soak_days", 4.0)
        prop_stroke = request_data.get("stroke_length_m", 3.2)
        prop_spm = request_data.get("spm", 8.0)
        prop_vfd = request_data.get("vfd_freq_hz", 48.0)
        cutoff_days = int(request_data.get("production_cutoff_days", 90))

        # Baseline parameters
        base_steam = 3000.0
        base_press = 55.0
        base_soak = 3.0
        base_stroke = 2.6
        base_spm = 6.5

        # Single-point baseline summary
        b_temp_mid = calculate_thermal_decay(30.0, base_steam, 230.0, base_soak, 38.0)
        b_visc_mid = calculate_viscosity(b_temp_mid)
        b_srp_mid = calculate_srp_performance(base_stroke, base_spm, 450.0, 57.0, b_visc_mid, 25.0)

        # Single-point proposed summary
        p_temp_mid = calculate_thermal_decay(30.0, prop_steam, 245.0, prop_soak, 38.0)
        p_visc_mid = calculate_viscosity(p_temp_mid)
        p_srp_mid = calculate_srp_performance(prop_stroke, prop_spm, 450.0, 57.0, p_visc_mid, 25.0)

        # Time series projection over cycle length
        time_series = []
        b_cum_oil = 0.0
        p_cum_oil = 0.0

        for day in range(1, cutoff_days + 1, 3):
            # Baseline day
            b_t = calculate_thermal_decay(float(day), base_steam, 230.0, base_soak, 38.0)
            b_v = calculate_viscosity(b_t)
            b_srp = calculate_srp_performance(base_stroke, base_spm, 450.0, 57.0, b_v, 25.0)
            b_cum_oil += b_srp["oil_production_m3d"] * 3.0

            # Proposed day
            p_t = calculate_thermal_decay(float(day), prop_steam, 245.0, prop_soak, 38.0)
            p_v = calculate_viscosity(p_t)
            p_srp = calculate_srp_performance(prop_stroke, prop_spm, 450.0, 57.0, p_v, 25.0)
            p_cum_oil += p_srp["oil_production_m3d"] * 3.0

            time_series.append({
                "day": day,
                "baseline_temp_c": round(b_t, 1),
                "proposed_temp_c": round(p_t, 1),
                "baseline_viscosity_cp": round(b_v, 1),
                "proposed_viscosity_cp": round(p_v, 1),
                "baseline_production_m3d": round(b_srp["oil_production_m3d"], 2),
                "proposed_production_m3d": round(p_srp["oil_production_m3d"], 2),
                "baseline_pump_eff_pct": round(b_srp["pump_efficiency_pct"], 1),
                "proposed_pump_eff_pct": round(p_srp["pump_efficiency_pct"], 1),
                "baseline_failure_risk_pct": round(b_srp["failure_risk_pct"], 1),
                "proposed_failure_risk_pct": round(p_srp["failure_risk_pct"], 1),
                "baseline_cum_oil_m3": round(b_cum_oil, 1),
                "proposed_cum_oil_m3": round(p_cum_oil, 1)
            })

        sor_base = calculate_sor(base_steam, b_cum_oil)
        sor_prop = calculate_sor(prop_steam, p_cum_oil)

        baseline_summary = {
            "steam_volume_m3": base_steam,
            "soak_days": base_soak,
            "stroke_length_m": base_stroke,
            "spm": base_spm,
            "avg_production_m3d": round(b_cum_oil / cutoff_days, 2),
            "cum_oil_m3": round(b_cum_oil, 1),
            "sor": round(sor_base, 2),
            "avg_pump_eff_pct": round(b_srp_mid["pump_efficiency_pct"], 1),
            "avg_failure_risk_pct": round(b_srp_mid["failure_risk_pct"], 1),
            "energy_per_m3": round(b_srp_mid["energy_per_m3"], 2)
        }

        proposed_summary = {
            "steam_volume_m3": prop_steam,
            "soak_days": prop_soak,
            "stroke_length_m": prop_stroke,
            "spm": prop_spm,
            "avg_production_m3d": round(p_cum_oil / cutoff_days, 2),
            "cum_oil_m3": round(p_cum_oil, 1),
            "sor": round(sor_prop, 2),
            "avg_pump_eff_pct": round(p_srp_mid["pump_efficiency_pct"], 1),
            "avg_failure_risk_pct": round(p_srp_mid["failure_risk_pct"], 1),
            "energy_per_m3": round(p_srp_mid["energy_per_m3"], 2)
        }

        deltas = {
            "oil_production_delta_m3d": round(proposed_summary["avg_production_m3d"] - baseline_summary["avg_production_m3d"], 2),
            "oil_production_pct": round(((proposed_summary["cum_oil_m3"] - baseline_summary["cum_oil_m3"]) / baseline_summary["cum_oil_m3"]) * 100.0, 1),
            "sor_delta": round(proposed_summary["sor"] - baseline_summary["sor"], 2),
            "energy_delta_pct": round(((baseline_summary["energy_per_m3"] - proposed_summary["energy_per_m3"]) / baseline_summary["energy_per_m3"]) * 100.0, 1),
            "risk_delta_pct": round(proposed_summary["avg_failure_risk_pct"] - baseline_summary["avg_failure_risk_pct"], 1)
        }

        return {
            "well_id": well_id,
            "baseline": baseline_summary,
            "scenario": proposed_summary,
            "deltas": deltas,
            "time_series_comparison": time_series
        }

what_if_simulator = WhatIfSimulator()
