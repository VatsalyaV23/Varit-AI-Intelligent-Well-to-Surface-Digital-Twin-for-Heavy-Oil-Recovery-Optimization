"""
Varit AI - Well-to-Surface Digital Twin FastAPI Application Main Entry Point.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database.session import engine, Base, get_db
from app.database.models import Well
from app.api import (
    wells, dashboard, digital_twin, css, srp, integrated, simulation, alerts, analytics
)
from app.services.websocket_manager import ws_manager, simulate_live_telemetry

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Varit AI - Heavy Oil Digital Twin API",
    description="Operational Digital Twin for Cyclic Steam Stimulation (CSS) and Sucker Rod Pump (SRP) Optimization in Baghewala Heavy Oil Field",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(wells.router)
app.include_router(dashboard.router)
app.include_router(digital_twin.router)
app.include_router(css.router)
app.include_router(srp.router)
app.include_router(integrated.router)
app.include_router(simulation.router)
app.include_router(alerts.router)
app.include_router(analytics.router)

@app.get("/")
def root_status():
    return {
        "status": "ONLINE",
        "system": "Varit AI Digital Twin Platform",
        "field": "Baghewala Heavy Oil Field",
        "demo_mode": True,
        "docs_url": "/docs"
    }

@app.websocket("/ws/live-stream/{well_id}")
async def websocket_live_telemetry(websocket: WebSocket, well_id: str, db: Session = Depends(get_db)):
    await ws_manager.connect(websocket, well_id)
    well = db.query(Well).filter(Well.id == well_id).first()
    well_dict = {
        "current_res_temp_c": well.current_res_temp_c if well else 130.0,
        "spm": well.spm if well else 7.5,
        "stroke_length_m": well.stroke_length_m if well else 2.8,
        "pump_depth_m": well.pump_depth_m if well else 450.0
    }
    
    try:
        await simulate_live_telemetry(websocket, well_id, well_dict)
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, well_id)
