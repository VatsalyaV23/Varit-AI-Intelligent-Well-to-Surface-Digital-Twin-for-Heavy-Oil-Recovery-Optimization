from fastapi import APIRouter
from app.schemas.schemas import CssOptimizeRequest, CssOptimizationResult
from app.services.css_engine import css_optimizer

router = APIRouter(prefix="/api/css", tags=["CSS Optimization"])

@router.post("/optimize", response_model=CssOptimizationResult)
def optimize_css_parameters(payload: CssOptimizeRequest):
    request_dict = payload.model_dump()
    result = css_optimizer.optimize_css(request_dict)
    return result
