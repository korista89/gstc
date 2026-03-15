from typing import List, Dict, Any, Optional
import datetime

class AIInsightService:
    def __init__(self):
        pass

    def generate_student_report(self, student_name: str, assessments: List[Dict[str, Any]], standards: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generates a summary report for a specific student based on their assessments.
        """
        if not assessments:
            return {
                "student_name": student_name,
                "summary": "평가 데이터가 아직 충분하지 않습니다.",
                "status": "pending",
                "recommendation": "충분한 평가 데이터를 수집한 후 분석을 다시 실행해 주세요."
            }

        # Basic analysis logic
        total_evals = len(assessments)
        completed_evals = [a for a in assessments if int(a.get("score", 0)) >= 2]
        completion_rate = (len(completed_evals) / total_evals) * 100 if total_evals > 0 else 0
        
        # Identify strengths and weaknesses
        # Group by subject if available in standards
        subject_performance = {}
        standard_map = {s["code"]: s for s in standards}
        
        for a in assessments:
            code = a.get("코드") or a.get("성취기준코드")
            score = int(a.get("score") or a.get("점수") or 0)
            std = standard_map.get(code)
            if std:
                subj = std.get("subject") or std.get("영역")
                if subj not in subject_performance:
                    subject_performance[subj] = []
                subject_performance[subj].append(score)

        strengths = []
        needs_improvement = []
        for subj, scores in subject_performance.items():
            avg = sum(scores) / len(scores)
            if avg >= 2.5:
                strengths.append(subj)
            elif avg < 1.5:
                needs_improvement.append(subj)

        summary = f"{student_name} 학생은 현재까지 총 {total_evals}건의 평가가 진행되었으며, 약 {completion_rate:.1f}%의 성취도를 보이고 있습니다. "
        if strengths:
            summary += f"{', '.join(strengths)} 영역에서 강점을 보이고 있으며, "
        if needs_improvement:
            summary += f"{', '.join(needs_improvement)} 영역에서는 추가적인 보충 지도가 권장됩니다."
        else:
            summary += "균형 있는 성취를 보이고 있습니다."

        return {
            "student_name": student_name,
            "summary": summary,
            "completion_rate": completion_rate,
            "strengths": strengths,
            "needs_improvement": needs_improvement,
            "timestamp": datetime.datetime.now().isoformat()
        }

    def generate_class_insight(self, students_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Placeholder for school-wide or class-wide insights.
        """
        return {
            "insight": "전체적으로 기초 학습 역량 강화가 필요한 시기입니다. 3월 학기 초 적응 활동에 집중해 주세요.",
            "suggestion": "인사 나누기, 교실 규칙 익히기 성취기준 우선 배치 권장"
        }

ai_insight_service = AIInsightService()
