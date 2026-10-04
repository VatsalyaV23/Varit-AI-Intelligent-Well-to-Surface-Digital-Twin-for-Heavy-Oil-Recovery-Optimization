"""
Script to generate synthetic Baghewala field training dataset based on physics formulas
and train ML models for Production, Temperature, Viscosity, Pump Efficiency, and Failure Risk.
Saves trained models to models/ directory.
"""

import os
import sys
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
import joblib

# Add project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from app.utils.physics import (
    calculate_viscosity, 
    calculate_thermal_decay, 
    calculate_srp_performance,
    calculate_sor
)

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../models"))
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data"))

def generate_synthetic_dataset(num_samples: int = 5000, seed: int = 42) -> pd.DataFrame:
    """Generates synthetic dataset following physical Baghewala reservoir & SRP principles."""
    np.random.seed(seed)
    
    # Feature ranges
    steam_vol = np.random.uniform(1800, 4800, num_samples)
    steam_temp = np.random.uniform(190, 260, num_samples)
    soak_days = np.random.uniform(1.5, 6.0, num_samples)
    days_into_cycle = np.random.uniform(1, 150, num_samples)
    init_res_temp = np.random.uniform(35.0, 42.0, num_samples)
    res_pressure = np.random.uniform(18.0, 45.0, num_samples)
    stroke_length = np.random.uniform(2.0, 3.6, num_samples)
    spm = np.random.uniform(4.5, 11.0, num_samples)
    pump_depth = np.random.uniform(380, 580, num_samples)
    water_cut = np.random.uniform(0.18, 0.55, num_samples)
    
    records = []
    
    for i in range(num_samples):
        # 1. Thermal decay
        temp = calculate_thermal_decay(
            days_into_cycle[i], steam_vol[i], steam_temp[i], soak_days[i], init_res_temp[i]
        )
        # Add slight observational noise
        temp_noisy = temp + np.random.normal(0, 0.5)
        
        # 2. Viscosity
        visc = calculate_viscosity(temp_noisy)
        visc_noisy = max(10.0, visc + np.random.normal(0, 5.0))
        
        # 3. SRP performance
        srp_res = calculate_srp_performance(
            stroke_length_m=stroke_length[i],
            spm=spm[i],
            pump_depth_m=pump_depth[i],
            plunger_dia_mm=57.0,
            viscosity_cp=visc_noisy,
            bhp_bar=res_pressure[i] * 0.75,
            water_cut=water_cut[i]
        )
        
        oil_prod = max(0.5, srp_res["oil_production_m3d"] + np.random.normal(0, 0.3))
        pump_eff = max(15.0, min(98.0, srp_res["pump_efficiency_pct"] + np.random.normal(0, 1.0)))
        fail_risk = max(3.0, min(99.0, srp_res["failure_risk_pct"] + np.random.normal(0, 1.0)))
        
        records.append({
            "steam_volume_m3": steam_vol[i],
            "steam_temp_c": steam_temp[i],
            "soak_days": soak_days[i],
            "days_into_cycle": days_into_cycle[i],
            "init_res_temp_c": init_res_temp[i],
            "reservoir_pressure_bar": res_pressure[i],
            "stroke_length_m": stroke_length[i],
            "spm": spm[i],
            "pump_depth_m": pump_depth[i],
            "water_cut": water_cut[i],
            "temperature_c": temp_noisy,
            "viscosity_cp": visc_noisy,
            "oil_production_m3d": oil_prod,
            "pump_efficiency_pct": pump_eff,
            "failure_risk_pct": fail_risk
        })
        
    df = pd.DataFrame(records)
    return df

def train_and_save_models():
    os.makedirs(MODELS_DIR, exist_ok=True)
    os.makedirs(DATA_DIR, exist_ok=True)
    
    print("Generating synthetic dataset...")
    df = generate_synthetic_dataset(num_samples=4000)
    csv_path = os.path.join(DATA_DIR, "synthetic_training_data.csv")
    df.to_csv(csv_path, index=False)
    print(f"Saved dataset to {csv_path}")
    
    feature_cols = [
        "steam_volume_m3", "steam_temp_c", "soak_days", "days_into_cycle",
        "init_res_temp_c", "reservoir_pressure_bar", "stroke_length_m",
        "spm", "pump_depth_m", "water_cut"
    ]
    
    X = df[feature_cols]
    
    # 1. Temperature model
    print("Training Temperature Model...")
    y_temp = df["temperature_c"]
    temp_model = GradientBoostingRegressor(n_estimators=100, max_depth=5, random_state=42)
    temp_model.fit(X, y_temp)
    joblib.dump(temp_model, os.path.join(MODELS_DIR, "temperature_model.joblib"))
    
    # 2. Viscosity model
    print("Training Viscosity Model...")
    y_visc = df["viscosity_cp"]
    visc_model = RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42)
    visc_model.fit(X, y_visc)
    joblib.dump(visc_model, os.path.join(MODELS_DIR, "viscosity_model.joblib"))
    
    # 3. Production model
    print("Training Production Model...")
    y_prod = df["oil_production_m3d"]
    prod_model = GradientBoostingRegressor(n_estimators=120, max_depth=6, random_state=42)
    prod_model.fit(X, y_prod)
    joblib.dump(prod_model, os.path.join(MODELS_DIR, "production_model.joblib"))
    
    # 4. Pump Efficiency model
    print("Training Pump Efficiency Model...")
    y_eff = df["pump_efficiency_pct"]
    eff_model = RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42)
    eff_model.fit(X, y_eff)
    joblib.dump(eff_model, os.path.join(MODELS_DIR, "pump_efficiency_model.joblib"))
    
    # 5. Failure Risk model
    print("Training Failure Risk Model...")
    y_risk = df["failure_risk_pct"]
    risk_model = GradientBoostingRegressor(n_estimators=100, max_depth=5, random_state=42)
    risk_model.fit(X, y_risk)
    joblib.dump(risk_model, os.path.join(MODELS_DIR, "failure_risk_model.joblib"))
    
    print("All ML models successfully trained and saved to models/ directory!")

if __name__ == "__main__":
    train_and_save_models()
