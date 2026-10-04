from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.database.models import Alert
from app.schemas.schemas import AlertResponse

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertResponse])
def get_active_alerts(well_id: str = None, db: Session = Depends(get_db)):
    query = db.query(Alert).filter(Alert.is_active == True)
    if well_id:
        query = query.filter(Alert.well_id == well_id)
    alerts = query.order_by(Alert.timestamp.desc()).all()
    return alerts
