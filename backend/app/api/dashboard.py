from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import Well, Alert
from app.schemas.schemas import DashboardSummaryResponse

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    wells = db.query(Well).all()
    total_wells = len(wells)
    active_wells = len([w for w in wells if w.current_status == "ACTIVE_PRODUCTION"])
    
    if total_wells == 0:
        return {
            "total_wells": 0, "active_wells": 0, "total_oil_production_m3d": 0,
            "avg_reservoir_temp_c": 0, "avg_viscosity_cp": 0, "avg_srp_efficiency_pct": 0,
            "avg_sor": 0, "avg_energy_per_m3": 0, "high_risk_wells_count": 0, "wells_summary": []
        }

    total_oil_prod = sum(w.current_production_m3d for w in wells)
    avg_temp = sum(w.current_res_temp_c for w in wells) / total_wells
    avg_visc = sum(w.current_viscosity_cp for w in wells) / total_wells
    avg_eff = sum(w.pump_efficiency_pct for w in wells) / total_wells
    avg_energy = sum(w.energy_per_m3 for w in wells) / total_wells
    high_risk_count = len([w for w in wells if w.failure_risk_pct > 30.0])
    
    # Calculate avg SOR for active cycles
    sors = [w.steam_volume_m3 / max(1.0, w.current_production_m3d * 90.0) for w in wells]
    avg_sor = sum(sors) / len(sors)

    wells_summary = []
    for w in wells:
        wells_summary.append({
            "id": w.id,
            "name": w.name,
            "status": w.current_status,
            "oil_production_m3d": w.current_production_m3d,
            "reservoir_temp_c": w.current_res_temp_c,
            "viscosity_cp": w.current_viscosity_cp,
            "spm": w.spm,
            "pump_efficiency_pct": w.pump_efficiency_pct,
            "failure_risk_pct": w.failure_risk_pct,
            "peak_rod_load_kn": w.peak_rod_load_kn,
            "is_rod_floating": w.min_rod_load_kn <= 0.5
        })

    return {
        "total_wells": total_wells,
        "active_wells": active_wells,
        "total_oil_production_m3d": round(total_oil_prod, 2),
        "avg_reservoir_temp_c": round(avg_temp, 1),
        "avg_viscosity_cp": round(avg_visc, 1),
        "avg_srp_efficiency_pct": round(avg_eff, 1),
        "avg_sor": round(avg_sor, 2),
        "avg_energy_per_m3": round(avg_energy, 2),
        "high_risk_wells_count": high_risk_count,
        "wells_summary": wells_summary
    }
