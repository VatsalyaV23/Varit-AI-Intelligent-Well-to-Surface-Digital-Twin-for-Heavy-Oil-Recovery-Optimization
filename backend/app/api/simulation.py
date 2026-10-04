from fastapi import APIRouter
from app.schemas.schemas import WhatIfRequest, WhatIfResult
from app.services.what_if_simulator import what_if_simulator

router = APIRouter(prefix="/api/simulation", tags=["Simulation"])

@router.post("/what-if", response_model=WhatIfResult)
def run_what_if_simulation(payload: WhatIfRequest):
    request_dict = payload.model_dump()
    result = what_if_simulator.run_simulation(request_dict)
    return result
