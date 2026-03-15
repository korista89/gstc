import sys
import os

# Fix path for Vercel: allow 'import app' to work
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
try:
    from app.core.config import settings
except ImportError as e:
    # Failback if path fix didn't work as expected
    print(f"ImportError for settings: {e}")
    # Try relative import as last resort
    from core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    from app.api.endpoints import auth, curriculum, assessment, analytics
except ImportError as e:
    print(f"ImportError for endpoints: {e}")
    from api.endpoints import auth, curriculum, assessment, analytics

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(curriculum.router, prefix="/api/v1/curriculum", tags=["curriculum"])
app.include_router(assessment.router, prefix="/api/v1/assessment", tags=["assessment"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])

@app.get("/")
def read_root():
    return {"message": "Welcome to GSTC API", "status": "active"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
