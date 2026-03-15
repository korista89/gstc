from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "GSTC - Gyeong-eun School Teacher Curriculum Platform"
    GOOGLE_CREDENTIALS_FILE: str = "service_account.json"
    
    # Updated with user provided ID
    SHEET_URL: str = "https://docs.google.com/spreadsheets/d/1dfnk_NKx5TeWLxdJvObtpYuITn5CXju6O4CtgN_MT8o/edit" 
    CURRICULUM_SHEET_NAME: str = "Curriculum_Standards"
    STUDENT_STATUS_SHEET_NAME: str = "Student_Status"
    ASSESSMENT_SHEET_NAME: str = "Assessments"
    
    SECRET_KEY: str = "gestc_secret_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    DEFAULT_PASSWORD: str = "ges2811"

    class Config:
        env_file = ".env"

settings = Settings()
