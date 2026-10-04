"""
Model loader service to interface between API and ML models/Physics engine.
"""

import os
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any
from app.utils.physics import (
    calculate_viscosity, 
    calculate_thermal_decay, 
    calculate_srp_performance
)

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../models"))

class ModelLoader:
    def __init__ (self):
        self.models = {}
        self.load_models()

    def load_models(self):
        model_names = ["temperature", "viscosity", "production", "pump_efficiency", "failure_risk"]
        for name in model_names:
            file_path = os.path.join(MODELS_DIR, f"{name}_model.joblib")
            if os.path.exists(file_path):
                try:
                    self.models[name] = joblib.load(file_path)
                    print(f"Loaded ML model: {name}")
                except Exception as e:
                    print(f"Failed to load {name} model: {e}")
                    self.models[name] = None
            else:
                self.models[name] = None

    def predict_well_state(self, features: Dict[str, float]) -> Dict[str, float]:
        """
        Takes operational parameters dict and returns predictions for
        temperature, viscosity, oil production, pump efficiency, failure risk.
        Falls back seamlessly to exact physics engine if ML models are uninitialized.
        """
        # Feature vector for ML
        feature_cols = [
            "steam_volume_m3", "steam_temp_c", "soak_days", "days_into_cycle",
            "init_res_temp_c", "reservoir_pressure_bar", "stroke_length_m",
            "spm", "pump_depth_m", "water_cut"
        ]
        
        # Prepare input df
        input_data = {col: [features.get(col, 0.0)] for col in feature_cols}
        X_df = pd.DataFrame(input_data)

        # 1. Temperature
        if self.models.get("temperature") is not None:
            pred_temp = float(self.models["temperature"].predict(X_df)[0])
        else:
            pred_temp = calculate_thermal_decay(
                features.get("days_into_cycle", 10.0),
                features.get("steam_volume_m3", 3200.0),
                features.get("steam_temp_c", 230.0),
                features.get("soak_days", 3.0),
                features.get("init_res_temp_c", 38.0)
            )

        # 2. Viscosity
        if self.models.get("viscosity") is not None:
            pred_visc = float(self.models["viscosity"].predict(X_df)[0])
        else:
            pred_visc = calculate_viscosity(pred_temp)

        # 3. SRP performance & physics
        srp_res = calculate_srp_performance(
            stroke_length_m=features.get("stroke_length_m", 2.8),
            spm=features.get("spm", 7.5),
            pump_depth_m=features.get("pump_depth_m", 450.0),
            plunger_dia_mm=57.0,
            viscosity_cp=pred_visc,
            bhp_bar=features.get("reservoir_pressure_bar", 28.0) * 0.75,
            water_cut=features.get("water_cut", 0.35)
        )

        # 4. Production
        if self.models.get("production") is not None:
            pred_prod = float(self.models["production"].predict(X_df)[0])
        else:
            pred_prod = srp_res["oil_production_m3d"]

        # 5. Pump Efficiency
        if self.models.get("pump_efficiency") is not None:
            pred_eff = float(self.models["pump_efficiency"].predict(X_df)[0])
        else:
            pred_eff = srp_res["pump_efficiency_pct"]

        # 6. Failure Risk
        if self.models.get("failure_risk") is not None:
            pred_risk = float(self.models["failure_risk"].predict(X_df)[0])
        else:
            pred_risk = srp_res["failure_risk_pct"]

        return {
            "predicted_temperature_c": round(pred_temp, 1),
            "predicted_viscosity_cp": round(pred_visc, 1),
            "predicted_oil_production_m3d": round(max(0.1, pred_prod), 2),
            "predicted_pump_efficiency_pct": round(max(5.0, min(99.0, pred_eff)), 1),
            "predicted_failure_risk_pct": round(max(1.0, min(99.0, pred_risk)), 1),
            "peak_rod_load_kn": srp_res["peak_rod_load_kn"],
            "min_rod_load_kn": srp_res["min_rod_load_kn"],
            "is_rod_floating": srp_res["is_rod_floating"],
            "energy_per_m3": srp_res["energy_per_m3"],
            "power_kw": srp_res["power_kw"]
        }

model_loader = ModelLoader()
