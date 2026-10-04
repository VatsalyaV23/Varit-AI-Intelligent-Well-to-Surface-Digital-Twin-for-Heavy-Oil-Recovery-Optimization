"""
WebSocket Connection Manager & Telemetry Simulator for real-time live data stream.
Simulates real-time sensor updates where temperature cooling -> viscosity rise -> rod load increase -> risk evolution.
"""

import asyncio
import json
import random
from typing import Dict, List
from fastapi import WebSocket
from app.utils.physics import (
    calculate_viscosity, 
    calculate_srp_performance
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, well_id: str):
        await websocket.accept()
        if well_id not in self.active_connections:
            self.active_connections[well_id] = []
        self.active_connections[well_id].append(websocket)

    def disconnect(self, websocket: WebSocket, well_id: str):
        if well_id in self.active_connections:
            if websocket in self.active_connections[well_id]:
                self.active_connections[well_id].remove(websocket)

    async def broadcast_well_update(self, well_id: str, data: dict):
        if well_id in self.active_connections:
            for connection in self.active_connections[well_id]:
                try:
                    await connection.send_text(json.dumps(data))
                except Exception:
                    pass

ws_manager = ConnectionManager()

async def simulate_live_telemetry(websocket: WebSocket, well_id: str, base_well_data: dict):
    """
    Periodically emits realistic physics-consistent telemetry ticks over WebSocket.
    """
    temp = base_well_data.get("current_res_temp_c", 130.0)
    spm = base_well_data.get("spm", 7.5)
    stroke = base_well_data.get("stroke_length_m", 2.8)
    depth = base_well_data.get("pump_depth_m", 450.0)
    
    tick = 0
    try:
        while True:
            await asyncio.sleep(2.5)  # Emit tick every 2.5 seconds
            tick += 1
            
            # Micro thermal cooling step
            temp -= random.uniform(0.05, 0.15)
            if temp < 40.0:
                temp = 150.0  # Reset cycle trigger
                
            visc = calculate_viscosity(temp)
            
            # Minor random RPM/SPM jitter
            spm_jitter = spm + random.uniform(-0.15, 0.15)
            
            srp_eval = calculate_srp_performance(
                stroke_length_m=stroke,
                spm=spm_jitter,
                pump_depth_m=depth,
                plunger_dia_mm=57.0,
                viscosity_cp=visc,
                bhp_bar=24.5
            )
            
            telemetry_tick = {
                "well_id": well_id,
                "timestamp": asyncio.get_event_loop().time(),
                "tick_count": tick,
                "reservoir_temp_c": round(temp, 1),
                "viscosity_cp": round(visc, 1),
                "oil_production_m3d": srp_eval["oil_production_m3d"],
                "pump_efficiency_pct": srp_eval["pump_efficiency_pct"],
                "peak_rod_load_kn": srp_eval["peak_rod_load_kn"],
                "min_rod_load_kn": srp_eval["min_rod_load_kn"],
                "power_kw": srp_eval["power_kw"],
                "failure_risk_pct": srp_eval["failure_risk_pct"],
                "is_rod_floating": srp_eval["is_rod_floating"],
                "energy_per_m3": srp_eval["energy_per_m3"]
            }
            
            await websocket.send_text(json.dumps(telemetry_tick))
    except Exception as e:
        # Client disconnected
        pass
