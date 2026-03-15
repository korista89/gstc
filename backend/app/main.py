from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.endpoints import auth, curriculum, assessment

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(curriculum.router, prefix="/api/v1/curriculum", tags=["curriculum"])
app.include_router(assessment.router, prefix="/api/v1/assessment", tags=["assessment"])

@app.get("/")
def read_root():
    return {"message": "Welcome to GSTC API"}

# Router registrations will go here
