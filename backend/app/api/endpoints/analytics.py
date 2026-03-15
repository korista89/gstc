from fastapi import APIRouter, HTTPException
from app.services.sheets import sheets_service
from app.services.ai_insight import ai_insight_service
from app.services.ai_curriculum import ai_curriculum_service
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

router = APIRouter()

class ReportRequest(BaseModel):
    student_name: str

@router.post("/report")
def generate_report(req: ReportRequest):
    try:
        # 1. Fetch assessments for student
        assessments = sheets_service.fetch_assessments(req.student_name)
        
        # 2. Fetch all standards to map codes to subjects/details
        standards = sheets_service.fetch_curriculum()
        
        # 3. Generate insight
        report = ai_insight_service.generate_student_report(req.student_name, assessments, standards)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/class-summary")
def get_class_summary():
    try:
        # Logic for class summary could be added here
        return ai_insight_service.generate_class_insight([])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
