from fastapi import APIRouter
from app.schemas.schemas import IntegratedOptimizeRequest, IntegratedOptimizationResult
from app.services.integrated_optimizer import integrated_optimizer

router = APIRouter(prefix="/api/integrated", tags=["Integrated Optimization"])

@router.post("/optimize", response_model=IntegratedOptimizationResult)
def optimize_integrated_parameters(payload: IntegratedOptimizeRequest):
    request_dict = payload.model_dump()
    result = integrated_optimizer.optimize_integrated(request_dict)
    return result
