from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database.session import get_db
from app.database.models import Well
from app.schemas.schemas import DigitalTwinResponse
from app.utils.physics import (
    calculate_viscosity, 
    calculate_srp_performance
)

router = APIRouter(prefix="/api/wells", tags=["Digital Twin"])

@router.get("/{well_id}/digital-twin", response_model=DigitalTwinResponse)
def get_digital_twin_state(well_id: str, db: Session = Depends(get_db)):
    well = db.query(Well).filter(Well.id == well_id).first()
    if not well:
        raise HTTPException(status_code=404, detail=f"Well {well_id} not found")

    visc = calculate_viscosity(well.current_res_temp_c)
    srp_eval = calculate_srp_performance(
        well.stroke_length_m, well.spm, well.pump_depth_m,
        well.plunger_dia_mm, visc, well.current_res_pressure_bar, well.water_cut
    )

    # Fluid mobility k_rel / visc (mD/cP)
    mobility = 850.0 / max(1.0, visc)

    res_state = {
        "pressure_bar": well.current_res_pressure_bar,
        "temperature_c": well.current_res_temp_c,
        "formation_temp_c": well.init_res_temp_c,
        "thermal_radius_m": round(12.5 + (well.steam_volume_m3 / 300.0), 1),
        "fluid_mobility_md_cp": round(mobility, 3)
    }

    wellbore_state = {
        "bottom_hole_pressure_bar": round(well.current_res_pressure_bar * 0.78, 1),
        "fluid_temp_c": round(well.current_res_temp_c * 0.92, 1),
        "fluid_viscosity_cp": visc,
        "total_flow_rate_m3d": srp_res["gross_production_m3d"],
        "water_cut_pct": round(well.water_cut * 100.0, 1)
    }

    fluid_state = {
        "temperature_c": well.current_res_temp_c,
        "viscosity_cp": visc,
        "mobility_md_cp": round(mobility, 3),
        "pump_load_kn": srp_res["peak_rod_load_kn"],
        "oil_production_m3d": srp_res["oil_production_m3d"]
    }

    srp_state = {
        "stroke_length_m": well.stroke_length_m,
        "spm": well.spm,
        "vfd_freq_hz": well.vfd_freq_hz,
        "pump_efficiency_pct": srp_res["pump_efficiency_pct"],
        "peak_rod_load_kn": srp_res["peak_rod_load_kn"],
        "min_rod_load_kn": srp_res["min_rod_load_kn"],
        "pump_fillage_pct": srp_res["pump_fillage"],
        "failure_risk_pct": srp_res["failure_risk_pct"],
        "is_rod_floating": srp_res["is_rod_floating"]
    }

    return {
        "well_id": well.id,
        "timestamp": datetime.utcnow().isoformat(),
        "reservoir": res_state,
        "wellbore": wellbore_state,
        "fluid": fluid_state,
        "srp": srp_state
    }
