from fastapi import APIRouter
from app.services.sheets import sheets_service

router = APIRouter()

@router.get("/status")
def get_system_status():
    """Check health of external integrations (Google Sheets)."""
    return sheets_service.get_system_status()
