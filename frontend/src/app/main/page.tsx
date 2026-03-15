"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { standards, type Standard } from "@/data/standards";
import {
  MONTHS,
  SCORE_LABELS,
  SCORE_DESCRIPTIONS,
  getStudentCount,
} from "@/data/config";

type Tab = "assignment" | "assessment";

// Assignments: { [code]: number[] } where numbers are months (3-12)
type Assignments = Record<string, number[]>;

// Scores: { [code_studentIdx]: number }
type Scores = Record<string, number>;

export default function MainPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [grade, setGrade] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("assignment");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [assignments, setAssignments] = useState<Assignments>({});
  const [scores, setScores] = useState<Scores>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Load user data from localStorage
  useEffect(() => {
    const r = localStorage.getItem("gstc_role");
    const g = localStorage.getItem("gstc_grade");
    const s = localStorage.getItem("gstc_subjects");
    if (!r || !g || !s) {
      router.push("/");
      return;
    }
    setRole(r);
    setGrade(g);
    const parsed = JSON.parse(s) as string[];
    setSubjects(parsed);
    if (parsed.length > 0) setSelectedSubject(parsed[0]);

    // Load saved assignments and scores from localStorage
    const savedAssignments = localStorage.getItem(`gstc_assignments_${r}`);
    if (savedAssignments) setAssignments(JSON.parse(savedAssignments));
    const savedScores = localStorage.getItem(`gstc_scores_${r}`);
    if (savedScores) setScores(JSON.parse(savedScores));
  }, [router]);

  // Get standards for current grade + subject
  const filteredStandards = standards.filter(
    (s) => s.grade === grade && s.subject === selectedSubject
  );

  // Get assigned standards for assessment tab
  const assignedStandards = filteredStandards.filter(
    (s) => assignments[s.code] && assignments[s.code].length > 0
  );

  const studentCount = getStudentCount(grade);

  // Toggle month assignment for a standard
  const toggleMonth = (code: string, month: number) => {
    setAssignments((prev) => {
      const current = prev[code] || [];
      let updated: number[];
      if (current.includes(month)) {
        updated = current.filter((m) => m !== month);
      } else {
        if (current.length >= 4) return prev; // max 4 months
        updated = [...current, month].sort((a, b) => a - b);
      }
      const next = { ...prev, [code]: updated };
      localStorage.setItem(`gstc_assignments_${role}`, JSON.stringify(next));
      return next;
    });
  };

  // Set score for a student on a standard
  const setScore = (code: string, studentIdx: number, score: number) => {
    const key = `${code}_${studentIdx}`;
    setScores((prev) => {
      const next = { ...prev, [key]: score };
      localStorage.setItem(`gstc_scores_${role}`, JSON.stringify(next));
      return next;
    });
  };

  const getScore = (code: string, studentIdx: number): number | undefined => {
    return scores[`${code}_${studentIdx}`];
  };

  // Calculate average for a standard
  const getAverage = (code: string): string => {
    let sum = 0;
    let count = 0;
    for (let i = 0; i < studentCount; i++) {
      const s = getScore(code, i);
      if (s !== undefined) {
        sum += s;
        count++;
      }
    }
    return count > 0 ? (sum / count).toFixed(1) : "-";
  };

  // Save assignments to backend
  const saveAssignments = useCallback(async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      // Build plan data: { "3": ["code1","code2"], "4": ["code3"], ... }
      const plan: Record<string, string[]> = {};
      for (const [code, months] of Object.entries(assignments)) {
        // Only save standards for current subject
        const std = standards.find((s) => s.code === code);
        if (!std || std.subject !== selectedSubject) continue;
        for (const m of months) {
          const mStr = String(m);
          if (!plan[mStr]) plan[mStr] = [];
          plan[mStr].push(code);
        }
      }

      const res = await fetch("/api/v1/curriculum/save-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, subject: selectedSubject, plan }),
      });

      if (res.ok) {
        setSaveMsg("저장 완료!");
      } else {
        setSaveMsg("서버 저장 실패 (로컬에는 저장됨)");
      }
    } catch {
      setSaveMsg("서버 연결 실패 (로컬에는 저장됨)");
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }, [assignments, role, selectedSubject]);

  // Save assessments to backend
  const saveAssessments = useCallback(async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const assessmentList: Array<{
        student_name: string;
        code: string;
        score: number;
      }> = [];
      for (const std of assignedStandards) {
        for (let i = 0; i < studentCount; i++) {
          const s = getScore(std.code, i);
          if (s !== undefined) {
            assessmentList.push({
              student_name: `학생${i + 1}`,
              code: std.code,
              score: s,
            });
          }
        }
      }

      if (assessmentList.length === 0) {
        setSaveMsg("저장할 평가가 없습니다.");
        setSaving(false);
        setTimeout(() => setSaveMsg(""), 3000);
        return;
      }

      const res = await fetch("/api/v1/assessment/evaluate-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, assessments: assessmentList }),
      });

      if (res.ok) {
        setSaveMsg("평가 저장 완료!");
      } else {
        setSaveMsg("서버 저장 실패 (로컬에는 저장됨)");
      }
    } catch {
      setSaveMsg("서버 연결 실패 (로컬에는 저장됨)");
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedStandards, studentCount, role, scores]);

  const handleLogout = () => {
    localStorage.removeItem("gstc_role");
    localStorage.removeItem("gstc_grade");
    localStorage.removeItem("gstc_subjects");
    router.push("/");
  };

  const scoreColors: Record<number, string> = {
    0: "bg-slate-600 text-slate-300",
    1: "bg-yellow-600/80 text-yellow-100",
    2: "bg-blue-600/80 text-blue-100",
    3: "bg-emerald-600/80 text-emerald-100",
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-blue-400">GSTC</h1>
            <span className="text-xs text-slate-500 hidden sm:inline">
              {role} · {grade}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab("assignment")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === "assignment"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              배정
            </button>
            <button
              onClick={() => setActiveTab("assessment")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === "assessment"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              평가
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="text-xs text-slate-500 hover:text-slate-300 transition"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* Subject selector */}
      <div className="bg-slate-800/50 border-b border-slate-700/50 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                selectedSubject === sub
                  ? "bg-slate-700 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {sub}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-600 whitespace-nowrap">
            {filteredStandards.length}개 성취기준
          </span>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-4">
        {activeTab === "assignment" ? (
          <AssignmentTab
            standards={filteredStandards}
            assignments={assignments}
            toggleMonth={toggleMonth}
            onSave={saveAssignments}
            saving={saving}
            saveMsg={saveMsg}
          />
        ) : (
          <AssessmentTab
            standards={assignedStandards}
            studentCount={studentCount}
            getScore={getScore}
            setScore={setScore}
            getAverage={getAverage}
            scoreColors={scoreColors}
            onSave={saveAssessments}
            saving={saving}
            saveMsg={saveMsg}
          />
        )}
      </main>
    </div>
  );
}

// ============== Assignment Tab ==============
function AssignmentTab({
  standards,
  assignments,
  toggleMonth,
  onSave,
  saving,
  saveMsg,
}: {
  standards: Standard[];
  assignments: Assignments;
  toggleMonth: (code: string, month: number) => void;
  onSave: () => void;
  saving: boolean;
  saveMsg: string;
}) {
  if (standards.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p className="text-lg mb-2">해당 학년/과목에 성취기준이 없습니다.</p>
        <p className="text-sm">다른 과목을 선택해주세요.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">월별 성취기준 배정</h2>
          <p className="text-xs text-slate-500">
            각 성취기준을 3~12월에 배정하세요 (최대 4개월)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saveMsg && (
            <span className="text-xs text-emerald-400">{saveMsg}</span>
          )}
          <button
            onClick={onSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            {saving ? "저장 중..." : "서버에 저장"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-2 px-2 text-slate-400 font-medium w-24">
                코드
              </th>
              <th className="text-left py-2 px-2 text-slate-400 font-medium min-w-48">
                성취기준
              </th>
              {MONTHS.map((m) => (
                <th
                  key={m}
                  className="py-2 px-1 text-slate-400 font-medium text-center w-10"
                >
                  {m}월
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {standards.map((std) => {
              const assigned = assignments[std.code] || [];
              return (
                <tr
                  key={std.code}
                  className="border-b border-slate-800 hover:bg-slate-800/50"
                >
                  <td className="py-2 px-2 text-xs text-slate-500 font-mono">
                    {std.code}
                  </td>
                  <td className="py-2 px-2">
                    <div
                      className="text-slate-300 text-xs leading-relaxed"
                      title={`활동: ${std.activity}\nA: ${std.levelA}\nB: ${std.levelB}\nC: ${std.levelC}`}
                    >
                      {std.content}
                    </div>
                  </td>
                  {MONTHS.map((m) => (
                    <td key={m} className="py-2 px-1 text-center">
                      <button
                        onClick={() => toggleMonth(std.code, m)}
                        className={`w-7 h-7 rounded-md text-xs font-bold transition ${
                          assigned.includes(m)
                            ? "bg-blue-600 text-white"
                            : "bg-slate-800 text-slate-600 hover:bg-slate-700"
                        }`}
                      >
                        {assigned.includes(m) ? "●" : ""}
                      </button>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============== Assessment Tab ==============
function AssessmentTab({
  standards,
  studentCount,
  getScore,
  setScore,
  getAverage,
  scoreColors,
  onSave,
  saving,
  saveMsg,
}: {
  standards: Standard[];
  studentCount: number;
  getScore: (code: string, studentIdx: number) => number | undefined;
  setScore: (code: string, studentIdx: number, score: number) => void;
  getAverage: (code: string) => string;
  scoreColors: Record<number, string>;
  onSave: () => void;
  saving: boolean;
  saveMsg: string;
}) {
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  if (standards.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p className="text-lg mb-2">배정된 성취기준이 없습니다.</p>
        <p className="text-sm">
          배정 탭에서 먼저 성취기준을 월별로 배정해주세요.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">성취기준 평가</h2>
          <p className="text-xs text-slate-500">
            학생별 0~3점 평가 · 0=미성취, 1=C, 2=B, 3=A
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saveMsg && (
            <span className="text-xs text-emerald-400">{saveMsg}</span>
          )}
          <button
            onClick={onSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            {saving ? "저장 중..." : "서버에 저장"}
          </button>
        </div>
      </div>

      {/* Score legend */}
      <div className="flex gap-3 mb-4 text-xs">
        {[0, 1, 2, 3].map((s) => (
          <span key={s} className="flex items-center gap-1">
            <span
              className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${scoreColors[s]}`}
            >
              {s}
            </span>
            <span className="text-slate-500">
              {SCORE_LABELS[s]} - {SCORE_DESCRIPTIONS[s]}
            </span>
          </span>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-2 px-2 text-slate-400 font-medium w-24">
                코드
              </th>
              <th className="text-left py-2 px-2 text-slate-400 font-medium min-w-40">
                성취기준
              </th>
              {Array.from({ length: studentCount }, (_, i) => (
                <th
                  key={i}
                  className="py-2 px-1 text-slate-400 font-medium text-center w-12"
                >
                  학생{i + 1}
                </th>
              ))}
              <th className="py-2 px-2 text-slate-400 font-medium text-center w-12">
                평균
              </th>
            </tr>
          </thead>
          <tbody>
            {standards.map((std) => (
              <tr
                key={std.code}
                className="border-b border-slate-800 hover:bg-slate-800/50"
              >
                <td className="py-2 px-2 text-xs text-slate-500 font-mono">
                  <button
                    onClick={() =>
                      setExpandedCode(
                        expandedCode === std.code ? null : std.code
                      )
                    }
                    className="hover:text-blue-400 transition text-left"
                    title="성취수준 보기"
                  >
                    {std.code}
                  </button>
                </td>
                <td className="py-2 px-2">
                  <div className="text-xs text-slate-300 leading-relaxed">
                    {std.content}
                  </div>
                  {expandedCode === std.code && (
                    <div className="mt-2 text-[11px] space-y-1 bg-slate-800 rounded-lg p-2">
                      <p className="text-emerald-400">
                        <strong>A(3점):</strong> {std.levelA}
                      </p>
                      <p className="text-blue-400">
                        <strong>B(2점):</strong> {std.levelB}
                      </p>
                      <p className="text-yellow-400">
                        <strong>C(1점):</strong> {std.levelC}
                      </p>
                    </div>
                  )}
                </td>
                {Array.from({ length: studentCount }, (_, i) => {
                  const currentScore = getScore(std.code, i);
                  return (
                    <td key={i} className="py-2 px-1 text-center">
                      <select
                        value={currentScore ?? ""}
                        onChange={(e) =>
                          setScore(
                            std.code,
                            i,
                            parseInt(e.target.value)
                          )
                        }
                        className={`w-10 h-8 rounded text-xs font-bold text-center cursor-pointer outline-none transition ${
                          currentScore !== undefined
                            ? scoreColors[currentScore]
                            : "bg-slate-800 text-slate-600"
                        }`}
                      >
                        <option value="">-</option>
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                      </select>
                    </td>
                  );
                })}
                <td className="py-2 px-2 text-center text-xs font-bold text-slate-300">
                  {getAverage(std.code)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
