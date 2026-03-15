from fastapi import APIRouter, HTTPException
from app.services.sheets import sheets_service
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

router = APIRouter()

class AssessmentUpdate(BaseModel):
    role: str
    student_name: str
    code: str
    score: int
    date: Optional[str] = None

@router.post("/evaluate")
def evaluate_student(data: AssessmentUpdate):
    try:
        sh = sheets_service.get_spreadsheet()
        if not sh:
            raise HTTPException(status_code=500, detail="Sheet connection failed")

        try:
            ws = sh.worksheet("Assessments")
        except Exception:
            ws = sh.add_worksheet(title="Assessments", rows=5000, cols=10)
            ws.append_row(["Role", "StudentName", "Code", "Score", "Date"])

        import datetime
        eval_date = data.date or datetime.date.today().isoformat()

        sheets_service.safe_append_row(ws, [
            data.role,
            data.student_name,
            data.code,
            data.score,
            eval_date,
        ])

        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class BulkAssessmentRequest(BaseModel):
    role: str
    assessments: List[Dict[str, Any]]

@router.post("/evaluate-bulk")
def evaluate_bulk(data: BulkAssessmentRequest):
    try:
        sh = sheets_service.get_spreadsheet()
        if not sh:
            raise HTTPException(status_code=500, detail="Sheet connection failed")

        try:
            ws = sh.worksheet("Assessments")
        except Exception:
            ws = sh.add_worksheet(title="Assessments", rows=5000, cols=10)
            ws.append_row(["Role", "StudentName", "Code", "Score", "Date"])

        import datetime
        today = datetime.date.today().isoformat()

        rows = []
        for a in data.assessments:
            rows.append([
                data.role,
                a.get("student_name", ""),
                a.get("code", ""),
                a.get("score", 0),
                a.get("date", today),
            ])

        if rows:
            sheets_service.safe_append_rows(ws, rows)

        return {"status": "success", "count": len(rows)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get-assessments")
def get_assessments(role: str):
    try:
        sh = sheets_service.get_spreadsheet()
        if not sh:
            return []

        ws = sheets_service.safe_get_worksheet(sh, "Assessments")
        if not ws:
            return []

        records = sheets_service.safe_get_all_records(ws)
        return [r for r in records if r.get("Role") == role]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
