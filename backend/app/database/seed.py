"""
Database Seed Script for ThermoLift AI Baghewala Field Digital Twin.
Populates SQLite / PostgreSQL database with 5 heavy oil wells and 24 months of historical data.
"""

import os
import sys
import random
from datetime import datetime, timedelta

# Add parent dir to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.database.session import engine, SessionLocal, Base
from app.database.models import Well, ProductionHistory, CssCycle, SensorReading, Alert
from app.utils.physics import (
    calculate_viscosity, 
    calculate_thermal_decay, 
    calculate_srp_performance,
    calculate_sor
)

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("Seeding Baghewala Field Heavy Oil Wells...")

    wells_data = [
        {
            "id": "BGW-01",
            "name": "Baghewala-01",
            "depth_m": 450.0,
            "current_status": "ACTIVE_PRODUCTION",
            "init_res_temp_c": 38.0,
            "current_res_temp_c": 142.0,
            "current_res_pressure_bar": 28.5,
            "current_cycle_number": 3,
            "steam_volume_m3": 3400.0,
            "steam_temp_c": 240.0,
            "soak_days": 3.5,
            "days_into_cycle": 14.0,
            "stroke_length_m": 3.0,
            "spm": 7.2,
            "vfd_freq_hz": 43.2,
            "pump_depth_m": 430.0,
            "water_cut": 0.28
        },
        {
            "id": "BGW-02",
            "name": "Baghewala-02",
            "depth_m": 480.0,
            "current_status": "ACTIVE_PRODUCTION",
            "init_res_temp_c": 37.5,
            "current_res_temp_c": 82.0,
            "current_res_pressure_bar": 24.0,
            "current_cycle_number": 4,
            "steam_volume_m3": 3800.0,
            "steam_temp_c": 245.0,
            "soak_days": 4.0,
            "days_into_cycle": 52.0,
            "stroke_length_m": 2.8,
            "spm": 8.5,
            "vfd_freq_hz": 51.0,
            "pump_depth_m": 460.0,
            "water_cut": 0.38
        },
        {
            "id": "BGW-03",
            "name": "Baghewala-03",
            "depth_m": 520.0,
            "current_status": "ACTIVE_PRODUCTION",
            "init_res_temp_c": 39.0,
            "current_res_temp_c": 54.0,
            "current_res_pressure_bar": 21.0,
            "current_cycle_number": 2,
            "steam_volume_m3": 3000.0,
            "steam_temp_c": 230.0,
            "soak_days": 3.0,
            "days_into_cycle": 88.0,
            "stroke_length_m": 2.4,
            "spm": 9.5,
            "vfd_freq_hz": 57.0,
            "pump_depth_m": 500.0,
            "water_cut": 0.44
        },
        {
            "id": "BGW-04",
            "name": "Baghewala-04",
            "depth_m": 420.0,
            "current_status": "ACTIVE_PRODUCTION",
            "init_res_temp_c": 38.5,
            "current_res_temp_c": 118.0,
            "current_res_pressure_bar": 31.0,
            "current_cycle_number": 5,
            "steam_volume_m3": 4200.0,
            "steam_temp_c": 250.0,
            "soak_days": 4.5,
            "days_into_cycle": 28.0,
            "stroke_length_m": 3.4,
            "spm": 6.8,
            "vfd_freq_hz": 40.8,
            "pump_depth_m": 400.0,
            "water_cut": 0.25
        },
        {
            "id": "BGW-05",
            "name": "Baghewala-05",
            "depth_m": 460.0,
            "current_status": "CSS_SOAK",
            "init_res_temp_c": 37.0,
            "current_res_temp_c": 185.0,
            "current_res_pressure_bar": 36.0,
            "current_cycle_number": 1,
            "steam_volume_m3": 4500.0,
            "steam_temp_c": 255.0,
            "soak_days": 4.0,
            "days_into_cycle": 2.0,
            "stroke_length_m": 2.8,
            "spm": 5.0,
            "vfd_freq_hz": 30.0,
            "pump_depth_m": 440.0,
            "water_cut": 0.20
        }
    ]

    now = datetime.utcnow()

    for w_info in wells_data:
        visc = calculate_viscosity(w_info["current_res_temp_c"])
        srp_res = calculate_srp_performance(
            w_info["stroke_length_m"], w_info["spm"], w_info["pump_depth_m"],
            57.0, visc, w_info["current_res_pressure_bar"]
        )

        well = Well(
            id=w_info["id"],
            name=w_info["name"],
            field_name="Baghewala Heavy Oil Field",
            reservoir="Jodhpur Sandstone",
            depth_m=w_info["depth_m"],
            oil_api=18.2,
            current_status=w_info["current_status"],
            init_res_temp_c=w_info["init_res_temp_c"],
            current_res_temp_c=w_info["current_res_temp_c"],
            current_res_pressure_bar=w_info["current_res_pressure_bar"],
            current_viscosity_cp=visc,
            current_production_m3d=srp_res["oil_production_m3d"],
            water_cut=w_info["water_cut"],
            current_cycle_number=w_info["current_cycle_number"],
            steam_volume_m3=w_info["steam_volume_m3"],
            steam_temp_c=w_info["steam_temp_c"],
            soak_days=w_info["soak_days"],
            days_into_cycle=w_info["days_into_cycle"],
            stroke_length_m=w_info["stroke_length_m"],
            spm=w_info["spm"],
            vfd_freq_hz=w_info["vfd_freq_hz"],
            pump_depth_m=w_info["pump_depth_m"],
            plunger_dia_mm=57.0,
            pump_efficiency_pct=srp_res["pump_efficiency_pct"],
            peak_rod_load_kn=srp_res["peak_rod_load_kn"],
            min_rod_load_kn=srp_res["min_rod_load_kn"],
            failure_risk_pct=srp_res["failure_risk_pct"],
            energy_per_m3=srp_res["energy_per_m3"]
        )

        db.add(well)
        db.commit()

        # Seed 24 months of production history
        print(f"Seeding 24-month production history for {well.id}...")
        for month in range(24, 0, -1):
            date_stamp = now - timedelta(days=month * 30)
            
            # Physics-based cyclic variation
            cycle_phase = (24 - month) % 4
            if cycle_phase == 0:
                t_hist = 160.0 + random.uniform(-10, 10)
                st_vol = w_info["steam_volume_m3"]
            else:
                t_hist = max(40.0, 160.0 - cycle_phase * 35.0 + random.uniform(-5, 5))
                st_vol = 0.0

            v_hist = calculate_viscosity(t_hist)
            s_hist = calculate_srp_performance(
                w_info["stroke_length_m"], w_info["spm"], w_info["pump_depth_m"],
                57.0, v_hist, 25.0
            )

            sor_val = calculate_sor(st_vol, s_hist["oil_production_m3d"] * 30.0) if st_vol > 0 else 0.0

            history_entry = ProductionHistory(
                well_id=well.id,
                timestamp=date_stamp,
                oil_production_m3d=s_hist["oil_production_m3d"],
                water_production_m3d=round(s_hist["oil_production_m3d"] * w_info["water_cut"], 2),
                reservoir_temp_c=round(t_hist, 1),
                viscosity_cp=round(v_hist, 1),
                steam_injected_m3=st_vol,
                srp_spm=w_info["spm"],
                srp_efficiency_pct=s_hist["pump_efficiency_pct"],
                energy_kwh_per_m3=s_hist["energy_per_m3"],
                sor=round(sor_val, 2)
            )
            db.add(history_entry)

        # Seed CSS Cycle logs
        for c in range(1, w_info["current_cycle_number"] + 1):
            cycle = CssCycle(
                well_id=well.id,
                cycle_number=c,
                start_date=now - timedelta(days=c * 120),
                end_date=now - timedelta(days=c * 120 - 4),
                steam_volume_m3=w_info["steam_volume_m3"] + (c - 1) * 200,
                steam_temp_c=w_info["steam_temp_c"],
                injection_pressure_bar=65.0,
                soak_days=w_info["soak_days"],
                cumulative_oil_m3=round(1100.0 + c * 150.0, 1),
                sor=round(2.8 + (c * 0.2), 2),
                peak_temp_c=185.0
            )
            db.add(cycle)

        # Condition-based Alerts
        if visc > 300.0:
            db.add(Alert(
                well_id=well.id,
                severity="MEDIUM",
                title="Rising Heavy Crude Viscosity",
                message=f"Reservoir temperature cooling to {well.current_res_temp_c}°C has caused viscosity to rise to {visc} cP, impeding fluid inflow.",
                category="VISCOSITY",
                is_active=True
            ))
        if srp_res["is_rod_floating"]:
            db.add(Alert(
                well_id=well.id,
                severity="HIGH",
                title="Critical Rod Floating Risk Detected",
                message=f"Minimum rod load ({srp_res['min_rod_load_kn']} kN) is near zero due to high viscous drag. Reduce SPM or initiate CSS steam cycle.",
                category="EQUIPMENT",
                is_active=True
            ))
        if srp_res["peak_rod_load_kn"] > 95.0:
            db.add(Alert(
                well_id=well.id,
                severity="HIGH",
                title="SRP High Peak Rod Loading",
                message=f"Peak rod load reached {srp_res['peak_rod_load_kn']} kN (>{srp_res['rod_stress_pct']}% of rating). Structural fatigue risk elevated.",
                category="EQUIPMENT",
                is_active=True
            ))
        if well.current_status == "ACTIVE_PRODUCTION" and well.days_into_cycle > 60:
            db.add(Alert(
                well_id=well.id,
                severity="MEDIUM",
                title="CSS Reservoir Thermal Decline",
                message=f"Well has produced for {well.days_into_cycle} days post-steam. Reservoir temperature has dropped significantly. Consider new CSS cycle.",
                category="THERMAL",
                is_active=True
            ))

    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
