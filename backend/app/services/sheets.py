import gspread
from oauth2client.service_account import ServiceAccountCredentials
from app.core.config import settings
import os
import time
from typing import List, Dict, Any

class SheetsService:
    def __init__(self):
        self._client = None
        self._cache = {}
        self.CACHE_TTL = 300

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
                    return self._client
                except Exception as e:
                    print(f"Failed to load credentials from {creds_path}: {e}")

        print("No service account credentials found!")
        return None

    def get_spreadsheet(self):
        client = self.get_client()
        if not client:
            raise Exception("Google Sheets 클라이언트 초기화 실패")
        try:
            return client.open_by_url(settings.SHEET_URL)
        except Exception as e:
            raise Exception(f"스프레드시트 열기 실패: {str(e)}")

    def safe_get_worksheet(self, sh, name: str):
        try:
            return sh.worksheet(name)
        except Exception:
            return None

    def safe_append_row(self, ws, row: List[Any]) -> bool:
        for attempt in range(3):
            try:
                ws.append_row(row)
                return True
            except Exception as e:
                time.sleep(attempt + 1)
        return False

    def safe_append_rows(self, ws, rows: List[List[Any]]) -> bool:
        for attempt in range(3):
            try:
                ws.append_rows(rows)
                return True
            except Exception as e:
                time.sleep(attempt + 1)
        return False

    def safe_update_cell(self, ws, row: int, col: int, value: Any) -> bool:
        for attempt in range(3):
            try:
                if ws.row_count < row or ws.col_count < col:
                    ws.resize(rows=max(row, ws.row_count), cols=max(col, ws.col_count))
                    time.sleep(0.5)
                ws.update_cell(row, col, value)
                return True
            except Exception as e:
                time.sleep(attempt + 1)
        return False

    def safe_get_all_records(self, ws) -> List[Dict[str, Any]]:
        try:
            return ws.get_all_records()
        except Exception:
            all_vals = ws.get_all_values()
            if len(all_vals) < 2:
                return []
            headers = all_vals[0]
            records = []
            for row in all_vals[1:]:
                record = {}
                for ci, h in enumerate(headers):
                    if ci < len(row) and h:
                        record[h] = row[ci]
                records.append(record)
            return records

    def save_user_subjects(self, role: str, subjects: List[str]):
        try:
            sh = self.get_spreadsheet()
            clean_role = str(role).strip()

            try:
                ws = sh.worksheet("Users")
            except Exception:
                ws = sh.add_worksheet(title="Users", rows=100, cols=5)
                ws.append_row(["Role", "Subjects"])
                time.sleep(1)

            all_values = ws.get_all_values()
            if not all_values:
                ws.append_row(["Role", "Subjects"])
                all_values = [["Role", "Subjects"]]

            headers = all_values[0]
            records = [dict(zip(headers, r)) for r in all_values[1:]]

            row_idx = -1
            for idx, r in enumerate(records):
                stored_role = str(r.get("Role", "")).strip()
                if stored_role.lower() == clean_role.lower():
                    row_idx = idx + 2
                    break

            sub_col = headers.index("Subjects") + 1 if "Subjects" in headers else len(headers) + 1
            if "Subjects" not in headers:
                self.safe_update_cell(ws, 1, sub_col, "Subjects")

            subject_str = ",".join(subjects)
            if row_idx != -1:
                self.safe_update_cell(ws, row_idx, sub_col, subject_str)
            else:
                self.safe_append_row(ws, [clean_role, subject_str])
            return True
        except Exception as e:
            print(f"Error saving user subjects: {e}")
            raise e

    def save_curriculum_plan(self, role: str, subject: str, plan_data: Dict[str, List[str]]):
        self._cache.pop("plans", None)
        try:
            sh = self.get_spreadsheet()
            try:
                ws = sh.worksheet("Monthly_Plans")
            except Exception:
                ws = sh.add_worksheet(title="Monthly_Plans", rows=1000, cols=12)
                ws.append_row(["Role", "Subject", "Month", "Standards"])

            rows = []
            for month, standards in plan_data.items():
                rows.append([role, subject, month, ",".join(standards)])

            if rows:
                self.safe_append_rows(ws, rows)
            return True
        except Exception as e:
            print(f"Error saving plan: {e}")
            return False

    def get_curriculum_plan(self, role: str, subject: str) -> Dict[str, List[str]]:
        try:
            sh = self.get_spreadsheet()
            ws = self.safe_get_worksheet(sh, "Monthly_Plans")
            if not ws:
                return {}
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

sheets_service = SheetsService()
