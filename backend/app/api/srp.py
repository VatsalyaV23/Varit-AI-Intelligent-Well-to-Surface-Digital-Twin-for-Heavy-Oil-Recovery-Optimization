from fastapi import APIRouter
from app.schemas.schemas import SrpOptimizeRequest, SrpOptimizationResult
from app.services.srp_engine import srp_optimizer

router = APIRouter(prefix="/api/srp", tags=["SRP Optimization"])

@router.post("/optimize", response_model=SrpOptimizationResult)
def optimize_srp_parameters(payload: SrpOptimizeRequest):
    request_dict = payload.model_dump()
    result = srp_optimizer.optimize_srp(request_dict)
    return result
