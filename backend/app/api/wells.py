from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.database.models import Well
from app.schemas.schemas import WellResponse

router = APIRouter(prefix="/api/wells", tags=["Wells"])

@router.get("", response_model=List[WellResponse])
def get_all_wells(db: Session = Depends(get_db)):
    wells = db.query(Well).all()
    return wells

@router.get("/{well_id}", response_model=WellResponse)
def get_well_by_id(well_id: str, db: Session = Depends(get_db)):
    well = db.query(Well).filter(Well.id == well_id).first()
    if not well:
        raise HTTPException(status_code=404, detail=f"Well {well_id} not found")
    return well
