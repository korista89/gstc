import json
import pandas as pd
import random
import re
from typing import List, Dict, Any, Optional
from pathlib import Path

class AICurriculumService:
    def __init__(self):
        self.base_path = Path("/home/korista89/sst")
        self.excel_path = self.base_path / "2026 학교교육과정 연계 필수교육 활동 편성 안내(0226)진짜최종.xlsx"
        self._monthly_themes = None

    def _load_themes(self):
        if self._monthly_themes is not None:
            return self._monthly_themes
        
        try:
            df = pd.read_excel(self.excel_path)
            month_col = '연계 시기\n(월)'
            theme_col = '교육 활동명\n(주제)'
            subject_col = '관련 교과\n(창의적 체험활동 포함)'
            
            themes = {}
            for _, row in df.iterrows():
                try:
                    month_raw = str(row[month_col])
                    months_found = re.findall(r'\d+', month_raw)
                    for m in months_found:
                        m_str = f"{m}월"
                        if m_str not in themes:
                            themes[m_str] = []
                        themes[m_str].append({
                            "name": str(row[theme_col]),
                            "subjects": str(row[subject_col])
                        })
                except: continue
            self._monthly_themes = themes
            return themes
        except Exception as e:
            print(f"Error loading themes: {e}")
            return {}

    def _calculate_match_score(self, standard_content: str, theme_name: str) -> float:
        """
        Simple keyword-based semantic match score.
        """
        score = 0.0
        # Common keywords for mapping
        keywords = {
            "성격": ["자아", "감정", "나", "인식"],
            "봄": ["날씨", "계절", "환경", "동식물"],
            "가족": ["우리", "집", "부모", "예절"],
            "여름": ["여름", "안전", "물놀이", "곤충"],
            "학교": ["친구", "규칙", "준수", "교실"],
            "가을": ["가을", "추석", "추수", "명절"],
            "겨울": ["겨울", "눈", "기온", "건강"],
            "직업": ["일", "꿈", "미래", "활동"]
        }
        
        for key, words in keywords.items():
            if key in theme_name:
                for word in words:
                    if word in standard_content:
                        score += 5.0
        
        # Exact keyword match
        theme_keywords = re.findall(r'[가-힣]+', theme_name)
        for tk in theme_keywords:
            if len(tk) >= 2 and tk in standard_content:
                score += 3.0
                
        return score

    def suggest_monthly_plan(self, standards: List[Dict[str, Any]], month_count: int = 10) -> Dict[str, List[str]]:
        themes = self._load_themes()
        plan = {f"{m}월": [] for m in range(3, 13)}
        months = [f"{m}월" for m in range(3, 13)]
        
        assigned_codes = set()
        
        # 1. First pass: Match standards to monthly themes
        for month in months:
            m_themes = themes.get(month, [])
            for theme in m_themes:
                for std in standards:
                    if std["code"] in assigned_codes: continue
                    score = self._calculate_match_score(std.get("content", ""), theme["name"])
                    if score > 5.0:
                        plan[month].append(std["code"])
                        assigned_codes.add(std["code"])
        
        # 2. Second pass: Distribute remaining standards evenly
        remaining = [s for s in standards if s["code"] not in assigned_codes]
        for i, std in enumerate(remaining):
            month_idx = i % month_count
            m = months[month_idx]
            plan[m].append(std["code"])
            
        return plan

ai_curriculum_service = AICurriculumService()
