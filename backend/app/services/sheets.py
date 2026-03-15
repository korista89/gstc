import gspread
from oauth2client.service_account import ServiceAccountCredentials
from app.core.config import settings
import os
import time
from typing import Optional, List, Dict, Any

class SheetsService:
    def __init__(self):
        self._client = None
        self._cache = {}
        self.CACHE_TTL = 300  # 5 minutes cache

    def _get_from_cache(self, key: str):
        if key in self._cache:
            data, timestamp = self._cache[key]
            if time.time() - timestamp < self.CACHE_TTL:
                return data
        return None

    def _set_to_cache(self, key: str, data: Any):
        self._cache[key] = (data, time.time())

    def get_client(self):
        if self._client:
            return self._client
        
        scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
        
        env_creds = os.environ.get('GOOGLE_SERVICE_ACCOUNT_JSON')
        if env_creds:
            import json
            try:
                creds_dict = json.loads(env_creds)
                creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
                self._client = gspread.authorize(creds)
                return self._client
            except Exception as e:
                print(f"Error loading credentials from env: {e}")

        creds_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), settings.GOOGLE_CREDENTIALS_FILE)
        if os.path.exists(creds_path):
            creds = ServiceAccountCredentials.from_json_keyfile_name(creds_path, scope)
            self._client = gspread.authorize(creds)
            return self._client
            
        return None

    def get_spreadsheet(self):
        client = self.get_client()
        if not client or not settings.SHEET_URL:
            return None
        try:
            return client.open_by_url(settings.SHEET_URL)
        except Exception as e:
            print(f"Error opening spreadsheet: {e}")
            return None

    def safe_get_all_records(self, ws) -> List[Dict[str, Any]]:
        try:
            return ws.get_all_records()
        except Exception:
            all_vals = ws.get_all_values()
            if len(all_vals) < 2: return []
            headers = all_vals[0]
            records = []
            for row in all_vals[1:]:
                record = {}
                for ci, h in enumerate(headers):
                    if ci < len(row) and h:
                        record[h] = row[ci]
                records.append(record)
            return records

    def fetch_students(self) -> List[Dict[str, Any]]:
        cached = self._get_from_cache("students")
        if cached: return cached
        
        try:
            sh = self.get_spreadsheet()
            if not sh: return []
            try:
                ws = sh.worksheet(settings.STUDENT_STATUS_SHEET_NAME)
            except:
                ws = sh.worksheet("학생명단")
            
            records = self.safe_get_all_records(ws)
            self._set_to_cache("students", records)
            return records
        except Exception as e:
            print(f"Error fetching students: {e}")
            return []

    def fetch_curriculum(self) -> List[Dict[str, Any]]:
        cached = self._get_from_cache("curriculum")
        if cached: return cached
        
        sh = self.get_spreadsheet()
        if not sh: return []
        ws = sh.worksheet(settings.CURRICULUM_SHEET_NAME)
        records = self.safe_get_all_records(ws)
        self._set_to_cache("curriculum", records)
        return records

    def save_curriculum_plan(self, role: str, subject: str, plan_data: Dict[str, List[str]]):
        self._cache.pop("plans", None)
        try:
            sh = self.get_spreadsheet()
            if not sh: return False
            try:
                ws = sh.worksheet("Monthly_Plans")
            except:
                ws = sh.add_worksheet(title="Monthly_Plans", rows=1000, cols=12)
                ws.append_row(["Role", "Subject", "Month", "Standards"])

            rows = []
            for month, standards in plan_data.items():
                rows.append([role, subject, month, ",".join(standards)])
            
            ws.append_rows(rows)
            return True
        except Exception as e:
            print(f"Error saving plan: {e}")
            return False

    def get_curriculum_plan(self, role: str, subject: str) -> Dict[str, List[str]]:
        sh = self.get_spreadsheet()
        if not sh: return {}
        try:
            ws = sh.worksheet("Monthly_Plans")
            records = self.safe_get_all_records(ws)
            
            plan = {}
            for r in reversed(records):
                m = r.get("Month")
                if r.get("Role") == role and r.get("Subject") == subject and m not in plan:
                    plan[m] = r.get("Standards", "").split(",") if r.get("Standards") else []
            return plan
        except:
            return {}

    def fetch_assessments(self, student_name: str) -> List[Dict[str, Any]]:
        sh = self.get_spreadsheet()
        if not sh: return []
        try:
            ws = sh.worksheet("Assessments")
            records = self.safe_get_all_records(ws)
            return [r for r in records if r.get("StudentName") == student_name]
        except:
            return []

sheets_service = SheetsService()
