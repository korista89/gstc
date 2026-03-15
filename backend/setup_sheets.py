import gspread
from oauth2client.service_account import ServiceAccountCredentials
import json
import os
import sys

# Add the parent directory to sys.path to import app
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from app.core.config import settings

def init_sheets():
    # Setup credentials
    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    creds_path = os.path.join(os.path.dirname(__file__), '..', settings.GOOGLE_CREDENTIALS_FILE)
    
    if not os.path.exists(creds_path):
        print(f"Error: {creds_path} not found.")
        return

    creds = ServiceAccountCredentials.from_json_keyfile_name(creds_path, scope)
    client = gspread.authorize(creds)
    
    try:
        sh = client.open_by_url(settings.SHEET_URL)
        print(f"Opened spreadsheet: {sh.title}")
    except Exception as e:
        print(f"Error opening spreadsheet: {e}")
        return

    # 1. Initialize Curriculum_Standards
    try:
        ws_curriculum = sh.worksheet(settings.CURRICULUM_SHEET_NAME)
        print(f"Found existing {settings.CURRICULUM_SHEET_NAME}")
    except gspread.WorksheetNotFound:
        print(f"Creating {settings.CURRICULUM_SHEET_NAME}...")
        ws_curriculum = sh.add_worksheet(title=settings.CURRICULUM_SHEET_NAME, rows=1000, cols=10)
        headers = ["code", "subject", "content", "element", "level_a", "level_b", "level_c", "grade_group"]
        ws_curriculum.append_row(headers)

    # 2. Upload Seed Data if empty (except headers)
    if ws_curriculum.row_count <= 1 or not ws_curriculum.cell(2,1).value:
        seed_path = os.path.join(os.path.dirname(__file__), '..', 'app', 'core', 'curriculum_seed.json')
        if os.path.exists(seed_path):
            with open(seed_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            rows = []
            for item in data:
                rows.append([
                    item.get("code"),
                    item.get("subject"),
                    item.get("content"),
                    item.get("element"),
                    item.get("level_a"),
                    item.get("level_b"),
                    item.get("level_c"),
                    item.get("grade_group")
                ])
            
            # Batch update to avoid quota issues
            ws_curriculum.append_rows(rows)
            print(f"Uploaded {len(rows)} curriculum standards.")

    # 3. Initialize Student_Status
    try:
        sh.worksheet(settings.STUDENT_STATUS_SHEET_NAME)
    except gspread.WorksheetNotFound:
        print(f"Creating {settings.STUDENT_STATUS_SHEET_NAME}...")
        ws = sh.add_worksheet(title=settings.STUDENT_STATUS_SHEET_NAME, rows=1000, cols=10)
        # 학급ID, 학급명, 학생번호, 학생이름, 담당교사, 담당과목(JSON), 비고
        headers = ["학급ID", "학급명", "학생번호", "학생이름", "담당교사", "담당과목", "비고"]
        ws.append_row(headers)

    # 4. Initialize Assessments
    try:
        sh.worksheet(settings.ASSESSMENT_SHEET_NAME)
    except gspread.WorksheetNotFound:
        print(f"Creating {settings.ASSESSMENT_SHEET_NAME}...")
        ws = sh.add_worksheet(title=settings.ASSESSMENT_SHEET_NAME, rows=5000, cols=10)
        headers = ["학생이름", "성취기준코드", "평가날짜", "점수", "성취수준", "비고"]
        ws.append_row(headers)

    # 5. Initialize Users
    try:
        sh.worksheet("Users")
    except gspread.WorksheetNotFound:
        print("Creating Users worksheet...")
        ws = sh.add_worksheet(title="Users", rows=1000, cols=5)
        headers = ["Role", "Subjects", "ID", "Name", "Department"]
        ws.append_row(headers)

    # 6. Initialize Monthly_Plans
    try:
        sh.worksheet("Monthly_Plans")
    except gspread.WorksheetNotFound:
        print("Creating Monthly_Plans worksheet...")
        ws = sh.add_worksheet(title="Monthly_Plans", rows=2000, cols=10)
        headers = ["Role", "Subject", "Month", "Standards", "Comment"]
        ws.append_row(headers)

    print("Sheet initialization complete.")

if __name__ == "__main__":
    init_sheets()
