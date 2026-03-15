from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.core.config import settings
from typing import List, Optional

router = APIRouter()

class LoginRequest(BaseModel):
    role: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    role: str

@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest):
    if req.password == settings.DEFAULT_PASSWORD:
        # For now, simple mock token
        return {
            "access_token": f"mock_token_{req.role}",
            "token_type": "bearer",
            "role": req.role
        }
    else:
        raise HTTPException(status_code=401, detail="비밀번호가 일치하지 않습니다.")

class SubjectSetupRequest(BaseModel):
    role: str
    selected_subjects: List[str]

from app.services.sheets import sheets_service

@router.post("/setup-subjects")
def setup_subjects(req: SubjectSetupRequest):
    success = sheets_service.save_user_subjects(req.role, req.selected_subjects)
    if success:
        return {"message": "Subjects saved successfully"}
    else:
        raise HTTPException(status_code=500, detail="데이터 저장 중 오류가 발생했습니다.")
