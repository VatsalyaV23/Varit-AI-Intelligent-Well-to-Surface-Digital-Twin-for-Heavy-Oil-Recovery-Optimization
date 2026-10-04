"""
SRP Optimization Engine & Dynamometer Load Card Generator.
"""

import math
from typing import Dict, Any, List
from app.utils.physics import calculate_srp_performance

class SrpOptimizationEngine:
    def generate_dynamometer_card(self, stroke_m: float, spm: float, 
                                  prl_kn: float, mrl_kn: float, 
                                  fillage_pct: float) -> List[Dict[str, float]]:
        """
        Generates simulated Dynamometer Load Card points (Position in meters vs Load in kN)
        showing upstroke, downstroke, valve action, and fillage truncation.
        """
        points = []
        n_points = 50
        stroke_in_m = stroke_m
        
        # Upstroke: 0 to Stroke (0 to PI radians)
        for i in range(n_points // 2):
            theta = (i / (n_points // 2 - 1)) * math.pi
            pos = stroke_in_m * 0.5 * (1.0 - math.cos(theta))
            
            # Fluid pick-up at bottom of stroke (fillage effect)
            if pos < (1.0 - fillage_pct / 100.0) * stroke_in_m:
                load = mrl_kn + (prl_kn - mrl_kn) * 0.2 * (pos / max(0.01, stroke_in_m))
            else:
                load = mrl_kn + (prl_kn - mrl_kn) * (0.8 + 0.2 * math.sin(theta))
            
            points.append({
                "position_m": round(pos, 3),
                "load_kn": round(load, 2),
                "stroke_phase": "Upstroke"
            })
            
        # Downstroke: Stroke back to 0 (PI to 2*PI radians)
        for i in range(n_points // 2):
            theta = math.pi + (i / (n_points // 2 - 1)) * math.pi
            pos = stroke_in_m * 0.5 * (1.0 - math.cos(theta))
            
            # Downstroke load relaxes to MRL
            load = mrl_kn + (prl_kn - mrl_kn) * 0.25 * math.sin(theta - math.pi)
            points.append({
                "position_m": round(pos, 3),
                "load_kn": round(max(0.0, load), 2),
                "stroke_phase": "Downstroke"
            })
            
        return points

    def optimize_srp(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        well_id = request_data.get("well_id", "BGW-01")
        cur_stroke = request_data.get("stroke_length_m", 2.8)
        cur_spm = request_data.get("spm", 7.5)
        cur_vfd = request_data.get("vfd_freq_hz", 45.0)
        pump_depth = request_data.get("pump_depth_m", 450.0)
        viscosity = request_data.get("viscosity_cp", 145.0)
        cur_fillage = request_data.get("pump_fillage_pct", 75.0)

        # Baseline evaluation
        base_srp = calculate_srp_performance(
            stroke_length_m=cur_stroke, spm=cur_spm, pump_depth_m=pump_depth,
            plunger_dia_mm=57.0, viscosity_cp=viscosity, bhp_bar=25.0
        )

        cur_out = {
            "stroke_length_m": cur_stroke,
            "spm": cur_spm,
            "vfd_freq_hz": cur_vfd,
            "oil_production_m3d": base_srp["oil_production_m3d"],
            "pump_efficiency_pct": base_srp["pump_efficiency_pct"],
            "pump_fillage_pct": base_srp["pump_fillage"],
            "peak_rod_load_kn": base_srp["peak_rod_load_kn"],
            "min_rod_load_kn": base_srp["min_rod_load_kn"],
            "failure_risk_pct": base_srp["failure_risk_pct"],
            "energy_per_m3": base_srp["energy_per_m3"],
            "power_kw": base_srp["power_kw"],
            "is_rod_floating": base_srp["is_rod_floating"]
        }

        # Grid search for optimal stroke length & SPM combination
        best_stroke = cur_stroke
        best_spm = cur_spm
        best_vfd = cur_vfd
        max_eff_prod_score = -1e9
        best_res = None

        stroke_candidates = [cur_stroke * 1.1, cur_stroke * 1.2, 3.2, 3.5]
        spm_candidates = [5.5, 6.5, 7.0, 7.5, 8.0]

        for s_m in stroke_candidates:
            if s_m > 3.8:
                continue
            for sp in spm_candidates:
                eval_res = calculate_srp_performance(
                    stroke_length_m=s_m, spm=sp, pump_depth_m=pump_depth,
                    plunger_dia_mm=57.0, viscosity_cp=viscosity, bhp_bar=25.0
                )
                
                vfd_hz = (sp / 10.0) * 50.0  # VFD frequency scale
                
                # Objective: Maximize Oil Production & Efficiency, penalize Failure Risk & Floating
                score = (eval_res["oil_production_m3d"] * 12.0 + 
                         eval_res["pump_efficiency_pct"] * 2.0 - 
                         eval_res["failure_risk_pct"] * 5.0 - 
                         (100.0 if eval_res["is_rod_floating"] else 0.0))

                if score > max_eff_prod_score:
                    max_eff_prod_score = score
                    best_stroke = s_m
                    best_spm = sp
                    best_vfd = vfd_hz
                    best_res = {
                        "stroke_length_m": round(s_m, 2),
                        "spm": round(sp, 1),
                        "vfd_freq_hz": round(vfd_hz, 1),
                        "oil_production_m3d": eval_res["oil_production_m3d"],
                        "pump_efficiency_pct": eval_res["pump_efficiency_pct"],
                        "pump_fillage_pct": eval_res["pump_fillage"],
                        "peak_rod_load_kn": eval_res["peak_rod_load_kn"],
                        "min_rod_load_kn": eval_res["min_rod_load_kn"],
                        "failure_risk_pct": eval_res["failure_risk_pct"],
                        "energy_per_m3": eval_res["energy_per_m3"],
                        "power_kw": eval_res["power_kw"],
                        "is_rod_floating": eval_res["is_rod_floating"]
                    }

        if best_res is None:
            best_res = cur_out

        improvements = {
            "production_gain_pct": round(((best_res["oil_production_m3d"] - cur_out["oil_production_m3d"]) / cur_out["oil_production_m3d"]) * 100.0, 1),
            "efficiency_gain_pct": round(best_res["pump_efficiency_pct"] - cur_out["pump_efficiency_pct"], 1),
            "failure_risk_reduction_pct": round(cur_out["failure_risk_pct"] - best_res["failure_risk_pct"], 1),
            "energy_savings_pct": round(((cur_out["energy_per_m3"] - best_res["energy_per_m3"]) / cur_out["energy_per_m3"]) * 100.0, 1)
        }

        dyn_current = self.generate_dynamometer_card(
            cur_stroke, cur_spm, cur_out["peak_rod_load_kn"], 
            cur_out["min_rod_load_kn"], cur_out["pump_fillage_pct"]
        )

        dyn_optimized = self.generate_dynamometer_card(
            best_res["stroke_length_m"], best_res["spm"], 
            best_res["peak_rod_load_kn"], best_res["min_rod_load_kn"], 
            best_res["pump_fillage_pct"]
        )

        return {
            "well_id": well_id,
            "current": cur_out,
            "optimized": best_res,
            "improvements": improvements,
            "dynamometer_curve_current": dyn_current,
            "dynamometer_curve_optimized": dyn_optimized
        }

srp_optimizer = SrpOptimizationEngine()
