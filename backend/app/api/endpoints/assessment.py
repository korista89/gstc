from fastapi import APIRouter, HTTPException
from app.services.sheets import sheets_service
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

router = APIRouter()

class AssessmentUpdate(BaseModel):
    student_name: str
    code: str
    score: int
    level: str  # A, B, or C
    date: Optional[str] = None
    note: Optional[str] = ""

@router.get("/students")
def get_students():
    try:
        return sheets_service.fetch_students()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evaluate")
def evaluate_student(data: AssessmentUpdate):
    try:
        # Save to Assessments sheet
        sh = sheets_service.get_spreadsheet()
        if not sh:
            raise HTTPException(status_code=500, detail="Sheet connection failed")
        
        from app.core.config import settings
        ws = sh.worksheet(settings.ASSESSMENT_SHEET_NAME)
        
        import datetime
        eval_date = data.date or datetime.date.today().isoformat()
        
        ws.append_row([
            data.student_name,
            data.code,
            eval_date,
            data.score,
            data.level,
            data.note
        ])
        
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
