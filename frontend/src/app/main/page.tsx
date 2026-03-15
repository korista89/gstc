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
import GlobalNav from "@/components/GlobalNav";
import { 
  Calendar, 
  CheckCircle, 
  Save, 
  LogOut, 
  BookOpen, 
  User, 
  BarChart3, 
  ChevronDown, 
  Info,
  Clock,
  Layout
} from "lucide-react";

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

  const getScore = useCallback((code: string, studentIdx: number): number | undefined => {
    return scores[`${code}_${studentIdx}`];
  }, [scores]);

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
      const plan: Record<string, string[]> = {};
      for (const [code, months] of Object.entries(assignments)) {
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
        setSaveMsg("배정 내역이 성공적으로 저장되었습니다.");
      } else {
        setSaveMsg("서버 저장 실패 (로컬 보관 중)");
      }
    } catch {
      setSaveMsg("연결 오류 (로컬 보관 중)");
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
        setSaveMsg("저장할 평가 데이터가 없습니다.");
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
        setSaveMsg("학생 평가가 저장되었습니다.");
      } else {
        setSaveMsg("서버 저장 실패 (로컬 보관 중)");
      }
    } catch {
      setSaveMsg("연결 오류 (로컬 보관 중)");
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }, [assignedStandards, studentCount, role, getScore]);

  const scoreColors: Record<number, string> = {
    0: "bg-slate-700/50 text-slate-400 border-slate-700",
    1: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    2: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    3: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      <GlobalNav />
      
      {/* Subject Navigation Bar */}
      <div className="sticky top-20 z-40 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
            <Layout className="w-5 h-5 text-blue-500 shrink-0" />
            <div className="flex gap-2">
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 border ${
                    selectedSubject === sub
                      ? "bg-blue-600/10 border-blue-500 text-white shadow-lg shadow-blue-500/10"
                      : "bg-transparent border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0 pl-6">
            <div className="flex bg-slate-950/50 p-1 rounded-2xl border border-slate-800">
              <button
                onClick={() => setActiveTab("assignment")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === "assignment"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                배정
              </button>
              <button
                onClick={() => setActiveTab("assessment")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === "assessment"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                평가
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="animate-pbst-fade-in">
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
        </div>
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
      <div className="flex flex-col items-center justify-center py-40 glass border-dashed">
        <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-slate-700 mb-6">
          <BookOpen className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold mb-2">성취기준 데이터가 없습니다</h3>
        <p className="text-slate-500">다른 과목을 선택하시거나 관리자에게 문의하세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="pbst-label text-blue-500">Monthly Planning</span>
          </div>
          <h2 className="text-3xl font-black">교육과정 월별 배정</h2>
          <p className="text-slate-500 mt-2">각 성취기준을 가장 적합한 실천 월(최대 4개)에 배정하십시오.</p>
        </div>
        <div className="flex items-center gap-4">
          {saveMsg && <span className="text-sm font-bold text-emerald-400 animate-pulse">{saveMsg}</span>}
          <button
            onClick={onSave}
            disabled={saving}
            className="pbst-button-primary flex items-center gap-2"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "저장 중..." : "배정 내역 저장"}
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden border-slate-800/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800/80">
                <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-500 w-24">Code</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-500">Standard Content</th>
                {MONTHS.map((m) => (
                  <th key={m} className="p-6 text-xs font-black uppercase tracking-widest text-slate-500 text-center w-12">{m}M</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {standards.map((std) => {
                const assigned = assignments[std.code] || [];
                return (
                  <tr key={std.code} className="hover:bg-blue-600/[0.02] transition-colors group">
                    <td className="p-6">
                      <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 font-bold">
                        {std.code}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-200 leading-relaxed">{std.content}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-500/50">{std.activity}</span>
                        </div>
                      </div>
                    </td>
                    {MONTHS.map((m) => {
                      const isActive = assigned.includes(m);
                      return (
                        <td key={m} className="p-4 text-center">
                          <button
                            onClick={() => toggleMonth(std.code, m)}
                            className={`w-9 h-9 rounded-xl text-xs font-black transition-all duration-300 border flex items-center justify-center ${
                              isActive
                                ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20"
                                : "bg-slate-900/50 border-slate-800 md:opacity-10 group-hover:opacity-100 hover:border-slate-500 text-slate-700 hover:text-slate-300"
                            }`}
                          >
                            {isActive ? m : ""}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
      <div className="flex flex-col items-center justify-center py-40 glass border-dashed">
        <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-slate-700 mb-6">
          <Calendar className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold mb-2">배정된 성취기준이 없습니다</h3>
        <p className="text-slate-500">배정 탭에서 먼저 월별 계획을 수립해주십시오.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span className="pbst-label text-emerald-500">Student Assessment</span>
          </div>
          <h2 className="text-3xl font-black">학생별 교육과정 평가</h2>
          <p className="text-slate-500 mt-2">학생별 도달 정도를 4단계(0~3)로 평가하여 정량화된 성취도를 기록합니다.</p>
        </div>
        <div className="flex items-center gap-4">
          {saveMsg && <span className="text-sm font-bold text-emerald-400 animate-pulse">{saveMsg}</span>}
          <button
            onClick={onSave}
            disabled={saving}
            className="pbst-button-primary flex items-center gap-2 border-emerald-500/50 shadow-emerald-500/10"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "저장 중..." : "평가 내역 저장"}
          </button>
        </div>
      </div>

      {/* Legend Card */}
      <div className="glass-card p-6 flex flex-wrap items-center gap-8 border-slate-800/50 bg-slate-900/30">
        <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest mr-4">
          <Info className="w-4 h-4" />
          Score Guide
        </div>
        {[0, 1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-3">
             <div className={`w-8 h-8 rounded-xl border flex items-center justify-center font-black text-xs ${scoreColors[s]}`}>
              {s}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-slate-400">{SCORE_LABELS[s]}</span>
              <span className="text-[11px] text-slate-500 font-medium">{SCORE_DESCRIPTIONS[s]}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden border-slate-800/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800/80">
                <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-500 w-24">Code</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-500 min-w-[300px]">Standard Content</th>
                {Array.from({ length: studentCount }, (_, i) => (
                  <th key={i} className="p-6 text-xs font-black uppercase tracking-widest text-slate-500 text-center w-16">S{i + 1}</th>
                ))}
                <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-500 text-center w-20">AVG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {standards.map((std) => (
                <tr key={std.code} className="hover:bg-blue-600/[0.02] transition-colors group">
                  <td className="p-6 align-top">
                    <button
                      onClick={() => setExpandedCode(expandedCode === std.code ? null : std.code)}
                      className="group/btn flex items-center gap-2"
                    >
                      <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 font-bold group-hover/btn:border-blue-500 group-hover/btn:text-blue-400 transition-colors">
                        {std.code}
                      </div>
                    </button>
                  </td>
                  <td className="p-6 align-top">
                    <div className="space-y-3">
                      <p className="text-sm font-bold text-slate-300 leading-relaxed">{std.content}</p>
                      
                      {expandedCode === std.code && (
                        <div className="grid grid-cols-3 gap-3 pt-4 animate-pbst-scale-up">
                          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/50">
                            <span className="pbst-label !text-[8px] text-emerald-500 block mb-1">Grade A</span>
                            <p className="text-[11px] text-slate-400 leading-normal">{std.levelA}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/50">
                            <span className="pbst-label !text-[8px] text-blue-500 block mb-1">Grade B</span>
                            <p className="text-[11px] text-slate-400 leading-normal">{std.levelB}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/50">
                            <span className="pbst-label !text-[8px] text-amber-500 block mb-1">Grade C</span>
                            <p className="text-[11px] text-slate-400 leading-normal">{std.levelC}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  {Array.from({ length: studentCount }, (_, i) => {
                    const currentScore = getScore(std.code, i);
                    return (
                      <td key={i} className="p-4 align-top text-center">
                        <select
                          value={currentScore ?? ""}
                          onChange={(e) => setScore(std.code, i, parseInt(e.target.value))}
                          className={`w-12 h-10 rounded-xl text-sm font-black text-center cursor-pointer outline-none transition-all duration-300 border appearance-none ${
                            currentScore !== undefined
                              ? scoreColors[currentScore]
                              : "bg-slate-950/50 border-slate-800 text-slate-600 hover:border-slate-600"
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
                  <td className="p-6 align-top text-center">
                    <div className="h-10 flex items-center justify-center">
                      <span className="text-sm font-black text-blue-400 font-mono">
                        {getAverage(std.code)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
