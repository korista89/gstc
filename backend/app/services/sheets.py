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

        # Try various paths for service_account.json
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        possible_paths = [
            os.path.join(base_dir, settings.GOOGLE_CREDENTIALS_FILE),
            os.path.join(os.getcwd(), "backend", settings.GOOGLE_CREDENTIALS_FILE),
            os.path.join(os.getcwd(), settings.GOOGLE_CREDENTIALS_FILE),
            settings.GOOGLE_CREDENTIALS_FILE
        ]
        
        for creds_path in possible_paths:
            if os.path.exists(creds_path):
                try:
                    creds = ServiceAccountCredentials.from_json_keyfile_name(creds_path, scope)
                    self._client = gspread.authorize(creds)
                    print(f"Successfully loaded credentials from {creds_path}")
                    return self._client
                except Exception as e:
                    print(f"Failed to load credentials from {creds_path}: {e}")
            
        print("No service account credentials found!")
        return None

    def safe_get_worksheet(self, sh, name: str):
        try:
            return sh.worksheet(name)
        except Exception as e:
            print(f"Worksheet {name} not found: {e}")
            return None

    def safe_append_row(self, ws, row: List[Any]) -> bool:
        for attempt in range(3):
            try:
                ws.append_row(row)
                return True
            except Exception as e:
                wait_time = attempt + 1
                print(f"Error appending row (attempt {attempt+1}, waiting {wait_time}s): {e}")
                time.sleep(wait_time)
        return False

    def safe_append_rows(self, ws, rows: List[List[Any]]) -> bool:
        for attempt in range(3):
            try:
                ws.append_rows(rows)
                return True
            except Exception as e:
                wait_time = attempt + 1
                print(f"Error appending rows (attempt {attempt+1}, waiting {wait_time}s): {e}")
                time.sleep(wait_time)
        return False

    def safe_update_cell(self, ws, row: int, col: int, value: Any) -> bool:
        for attempt in range(3):
            try:
                # Ensure sheet is big enough
                if ws.row_count < row or ws.col_count < col:
                    needed_rows = max(row, ws.row_count)
                    needed_cols = max(col, ws.col_count)
                    ws.resize(rows=needed_rows, cols=needed_cols)
                    time.sleep(0.5) 
                
                ws.update_cell(row, col, value)
                return True
            except Exception as e:
                wait_time = attempt + 1
                print(f"Error updating cell {row},{col} (attempt {attempt+1}, waiting {wait_time}s): {e}")
                time.sleep(wait_time)
        return False

    def get_spreadsheet(self):
        client = self.get_client()
        if not client:
            raise Exception("Google Sheets 클라이언트 초기화 실패 (자격 증명 확인 필요)")
        if not settings.SHEET_URL:
            raise Exception("스프레드시트 URL이 설정되지 않았습니다 (settings.SHEET_URL 확인 필요)")
        try:
            return client.open_by_url(settings.SHEET_URL)
        except Exception as e:
            raise Exception(f"스프레드시트 열기 실패: {str(e)}")

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

    def save_user_subjects(self, role: str, subjects: List[str]):
        try:
            self._cache.pop("subjects", None) # Invalidate cache
            sh = self.get_spreadsheet()
            
            clean_role = str(role).strip()
            
            try:
                ws = sh.worksheet("Users")
            except Exception as e:
                try:
                    ws = sh.add_worksheet(title="Users", rows=100, cols=5)
                    ws.append_row(["Role", "Subjects", "ID", "Name"])
                    time.sleep(1)
                except Exception as e2:
                    raise Exception(f"Users 시트 생성 실패: {str(e2)}")
            
            # Optimize: Get all values in one call
            try:
                all_values = ws.get_all_values()
            except Exception as e:
                raise Exception(f"시트 데이터 읽기 실패: {str(e)}")

            if not all_values:
                headers = ["Role", "Subjects", "ID", "Name"]
                ws.append_row(headers)
                all_values = [headers]
            
            headers = all_values[0]
            records = [dict(zip(headers, r)) for r in all_values[1:]]
            
            # Find the row for this role
            row_idx = -1
            for idx, r in enumerate(records):
                stored_role = str(r.get("Role") or r.get("ID") or "").strip()
                if stored_role.lower() == clean_role.lower():
                    row_idx = idx + 2 # +1 for header, +1 for 1-based indexing
                    break
            
            if "Subjects" not in headers:
                sub_col = len(headers) + 1
                self.safe_update_cell(ws, 1, sub_col, "Subjects")
            else:
                sub_col = headers.index("Subjects") + 1

            subject_str = ",".join(subjects)
            if row_idx != -1:
                success = self.safe_update_cell(ws, row_idx, sub_col, subject_str)
                if not success: raise Exception("기존 사용자 정보 업데이트 실패")
                return True
            else:
                # Add new row for this role
                new_row = [clean_role, subject_str, clean_role, "Unknown"]
                success = self.safe_append_row(ws, new_row)
                if not success: raise Exception("신규 사용자 정보 추가 실패")
                return True
                
        except Exception as e:
            print(f"Error saving user subjects: {e}")
            raise e

    def get_user_subjects(self, role: str) -> List[str]:
        try:
            # Check cache first
            # but for setup flow, we might want to skip cache or have a separate key
            
            sh = self.get_spreadsheet()
            if not sh: return []
            ws = self.safe_get_worksheet(sh, "Users")
            if not ws: return []
            
            clean_role = str(role).strip().lower()
            records = self.safe_get_all_records(ws)
            for r in records:
                stored_role = str(r.get("Role") or r.get("ID") or "").strip().lower()
                if stored_role == clean_role:
                    sub_str = r.get("Subjects", "")
                    return sub_str.split(",") if sub_str else []
            return []
        except Exception as e:
            print(f"Error fetching user subjects: {e}")
            return []

    def get_curriculum_plan(self, role: str, subject: str) -> Dict[str, List[str]]:
        sh = self.get_spreadsheet()
        if not sh: return {}
        try:
            ws = self.safe_get_worksheet(sh, "Monthly_Plans")
            if not ws: return {}
            records = self.safe_get_all_records(ws)
            
            plan = {}
            for r in reversed(records):
                m = r.get("Month")
                if r.get("Role") == role and r.get("Subject") == subject and m not in plan:
                    plan[m] = r.get("Standards", "").split(",") if r.get("Standards") else []
            return plan
        except Exception as e:
            print(f"Error fetching plan: {e}")
            return {}

    def fetch_assessments(self, student_name: str) -> List[Dict[str, Any]]:
        sh = self.get_spreadsheet()
        if not sh: return []
        try:
            ws = self.safe_get_worksheet(sh, "Assessments")
            if not ws: return []
            records = self.safe_get_all_records(ws)
            return [r for r in records if r.get("StudentName") == student_name]
        except Exception as e:
            print(f"Error fetching assessments: {e}")
            return []

sheets_service = SheetsService()
