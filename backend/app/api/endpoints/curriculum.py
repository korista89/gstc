from fastapi import APIRouter, HTTPException
from app.services.sheets import sheets_service
from pydantic import BaseModel
from typing import List, Dict

router = APIRouter()

class PlanSaveRequest(BaseModel):
    role: str
    subject: str
    plan: Dict[str, List[str]]

@router.post("/save-plan")
def save_plan(data: PlanSaveRequest):
    try:
        success = sheets_service.save_curriculum_plan(data.role, data.subject, data.plan)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to save plan")
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get-plan")
def get_plan(role: str, subject: str):
    try:
        return sheets_service.get_curriculum_plan(role, subject)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
