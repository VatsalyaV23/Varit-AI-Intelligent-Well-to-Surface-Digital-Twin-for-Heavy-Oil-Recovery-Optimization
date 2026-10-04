from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.database.session import get_db
from app.database.models import Well, ProductionHistory, CssCycle

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/{well_id}")
def get_well_analytics(well_id: str, db: Session = Depends(get_db)):
    well = db.query(Well).filter(Well.id == well_id).first()
    if not well:
        raise HTTPException(status_code=404, detail=f"Well {well_id} not found")

    history = (
        db.query(ProductionHistory)
        .filter(ProductionHistory.well_id == well_id)
        .order_by(ProductionHistory.timestamp.asc())
        .all()
    )

    cycles = (
        db.query(CssCycle)
        .filter(CssCycle.well_id == well_id)
        .order_by(CssCycle.cycle_number.asc())
        .all()
    )

    history_data = []
    for entry in history:
        history_data.append({
            "timestamp": entry.timestamp.strftime("%Y-%m-%d"),
            "oil_production_m3d": entry.oil_production_m3d,
            "water_production_m3d": entry.water_production_m3d,
            "reservoir_temp_c": entry.reservoir_temp_c,
            "viscosity_cp": entry.viscosity_cp,
            "steam_injected_m3": entry.steam_injected_m3,
            "srp_spm": entry.srp_spm,
            "srp_efficiency_pct": entry.srp_efficiency_pct,
            "energy_kwh_per_m3": entry.energy_kwh_per_m3,
            "sor": entry.sor
        })

    cycles_data = []
    for c in cycles:
        cycles_data.append({
            "cycle_number": c.cycle_number,
            "start_date": c.start_date.strftime("%Y-%m-%d"),
            "steam_volume_m3": c.steam_volume_m3,
            "soak_days": c.soak_days,
            "cumulative_oil_m3": c.cumulative_oil_m3,
            "sor": c.sor,
            "peak_temp_c": c.peak_temp_c
        })

    return {
        "well_id": well.id,
        "well_name": well.name,
        "current_status": well.current_status,
        "history": history_data,
        "css_cycles": cycles_data
    }
