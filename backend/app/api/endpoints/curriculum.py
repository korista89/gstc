from fastapi import APIRouter, HTTPException
from app.services.sheets import sheets_service
from app.services.ai_curriculum import ai_curriculum_service
from typing import List, Dict, Any

router = APIRouter()

@router.get("/standards")
def get_standards():
    try:
        standards = sheets_service.fetch_curriculum()
        return standards
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/subjects")
def get_subjects():
    try:
        standards = sheets_service.fetch_curriculum()
        # Extract unique subjects
        subjects = sorted(list(set(s.get("subject", "") for s in standards if s.get("subject"))))
        return subjects
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/standards/by-subject/{subject}")
def get_standards_by_subject(subject: str):
    try:
        standards = sheets_service.fetch_curriculum()
        filtered = [s for s in standards if s.get("subject") == subject]
        return filtered
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/suggest-plan")
def suggest_plan(subject: str):
    try:
        standards = [s for s in sheets_service.fetch_curriculum() if s.get("subject") == subject]
        if not standards:
            return {"message": "No standards found for subject"}
        
        plan = ai_curriculum_service.suggest_monthly_plan(standards)
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel

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
