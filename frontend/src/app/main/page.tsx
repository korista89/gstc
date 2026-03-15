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
  BookOpen, 
  User, 
  BarChart3, 
  Info,
  Clock,
  Layout
} from "lucide-react";
import styles from "./main.module.css";
import LoadingSkeleton from "@/components/LoadingSkeleton";

type Tab = "assignment" | "assessment";

// Assignments: { [code]: number[] } where numbers are months (3-12)
type Assignments = Record<string, number[]>;

// Scores: { [code_studentIdx]: number }
type Scores = Record<string, number>;

export default function MainPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [grade, setGrade] = useState("");
  
  // Selection State (Subjects OR Classes based on role)
  const [selectionType, setSelectionType] = useState<"subject" | "class">("subject");
  const [selections, setSelections] = useState<string[]>([]);
  const [activeSelection, setActiveSelection] = useState("");
  
  const [activeTab, setActiveTab] = useState<Tab>("assignment");
  const [assignments, setAssignments] = useState<Assignments>({});
  const [scores, setScores] = useState<Scores>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // Load user data from localStorage
  useEffect(() => {
    const r = localStorage.getItem("gstc_role");
    const g = localStorage.getItem("gstc_grade");
    if (!r || !g) {
      router.push("/");
      return;
    }
    setRole(r);
    setGrade(g);
    
    // Determine Flow
    const isSubjectRole = r.includes('전담') || r.includes('교과') || r.includes('교사') || r.includes('상담');
    const isHomeroom = r.includes('담임') && !r.includes('전공과 교과') && !r.includes('전담') && !r.includes('교과');
    
    if (isSubjectRole && !isHomeroom) {
      setSelectionType("class");
      const savedClasses = localStorage.getItem("gstc_classes");
      if (savedClasses) {
        const parsed = JSON.parse(savedClasses) as string[];
        setSelections(parsed);
        if (parsed.length > 0) setActiveSelection(parsed[0]);
      } else {
         router.push("/setup");
         return;
      }
    } else {
      setSelectionType("subject");
      const savedSubjects = localStorage.getItem("gstc_subjects");
      if (savedSubjects) {
        const parsed = JSON.parse(savedSubjects) as string[];
        setSelections(parsed);
        if (parsed.length > 0) setActiveSelection(parsed[0]);
      } else {
         router.push("/setup");
         return;
      }
    }

    // Load saved assignments and scores from localStorage
    const savedAssignments = localStorage.getItem(`gstc_assignments_${r}`);
    if (savedAssignments) setAssignments(JSON.parse(savedAssignments));
    const savedScores = localStorage.getItem(`gstc_scores_${r}`);
    if (savedScores) setScores(JSON.parse(savedScores));
    
    setLoading(false);
  }, [router]);

  // Determine current active grade and subject based on selection type
  // If Subject Teacher -> activeSelection is the Class (e.g. '초3-1'). 
  //   In this case, we need to show ALL subjects for that grade, or perhaps specific subjects?
  //   Wait, if they are a Subject Teacher, they teach a specific subject across multiple classes.
  //   But the original setup only asked them to pick classes. 
  //   Let's assume for now a Subject Teacher can see ALL subjects for the selected class grade, or we need to refine this.
  //   For now, we fetch standards based on the grade of the selected class, and all subjects.
  const currentGrade = selectionType === "class" ? activeSelection.split('-')[0] : grade;
  
  // Get standards for current view
  const filteredStandards = standards.filter((s) => {
    if (selectionType === "subject") {
      return s.grade === currentGrade && s.subject === activeSelection;
    } else {
      return s.grade === currentGrade; // Subject teacher sees all subjects for the class, or we'd need another filter for their specific subject.
    }
  });

  // Get assigned standards for assessment tab
  const assignedStandards = filteredStandards.filter(
    (s) => assignments[s.code] && assignments[s.code].length > 0
  );

  const studentCount = getStudentCount(currentGrade);

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
        // If subject teacher, activeSelection is the Class, std.subject might be any subject.
        // If homeroom teacher, activeSelection is the Subject.
        if (!std || (selectionType === "subject" && std.subject !== activeSelection)) continue;
        for (const m of months) {
          const mStr = String(m);
          if (!plan[mStr]) plan[mStr] = [];
          plan[mStr].push(code);
        }
      }

      const payload = {
        role,
        selection_type: selectionType,
        selection_value: activeSelection,
        plan 
      };

      const res = await fetch("/api/v1/curriculum/save-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
  }, [assignments, role, activeSelection, selectionType]);

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

  if (loading) return <LoadingSkeleton />;

  return (
    <div className={styles.container}>
      <GlobalNav />
      
      <main className={styles.mainContent}>
        <div className={styles.headerSection}>
          <h1 className={styles.pageTitle}>학급 관리 워크스페이스</h1>
          <p className={styles.pageSubtitle}>{role} 담당 학생 교육과정 관리</p>
        </div>

        <div className={styles.controlPanel}>
          <div className={styles.tabGroup}>
            <button
              className={`${styles.tabBtn} ${activeTab === "assignment" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("assignment")}
            >
              <Calendar size={18} style={{ marginRight: '6px', display: 'inline' }} />
              월별 배정
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === "assessment" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("assessment")}
            >
              <CheckCircle size={18} style={{ marginRight: '6px', display: 'inline' }} />
              학생 평가
            </button>
          </div>
          
          <div className={styles.tabGroup} style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '1rem', marginLeft: '0.5rem' }}>
            <Layout size={18} style={{ color: '#64748b', alignSelf: 'center', marginRight: '6px' }} />
            {selections.map((sel) => (
              <button
                key={sel}
                onClick={() => setActiveSelection(sel)}
                className={`${styles.tabBtn} ${activeSelection === sel ? styles.tabActive : ""}`}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                {sel}
              </button>
            ))}
          </div>

          <div className={styles.actionGroup}>
            {saveMsg && <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>{saveMsg}</span>}
            <button 
              className={styles.primaryBtn} 
              onClick={activeTab === "assignment" ? saveAssignments : saveAssessments}
              disabled={saving}
            >
              <Save size={18} />
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          {activeTab === "assignment" ? (
            <AssignmentTab
              standards={filteredStandards}
              assignments={assignments}
              toggleMonth={toggleMonth}
            />
          ) : (
            <AssessmentTab
              standards={assignedStandards}
              studentCount={studentCount}
              getScore={getScore}
              setScore={setScore}
              getAverage={getAverage}
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
}: {
  standards: Standard[];
  assignments: Assignments;
  toggleMonth: (code: string, month: number) => void;
}) {
  if (standards.length === 0) {
    return (
      <div className={styles.emptyState} style={{ padding: '4rem' }}>
        <BookOpen className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>성취기준 데이터가 없습니다</h3>
        <p>다른 과목을 선택하시거나 관리자에게 문의하세요.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', width: '100px' }}>Code</th>
            <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Standard Content</th>
            {MONTHS.map((m) => (
              <th key={m} style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', textAlign: 'center', width: '60px' }}>{m}M</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {standards.map((std) => {
            const assigned = assignments[std.code] || [];
            return (
              <tr key={std.code} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ padding: '0.25rem 0.5rem', backgroundColor: '#f1f5f9', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'inline-block' }}>
                    {std.code}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>{std.content}</p>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3b82f6', backgroundColor: '#eff6ff', padding: '0.1rem 0.4rem', borderRadius: '0.25rem' }}>{std.activity}</span>
                </td>
                {MONTHS.map((m) => {
                  const isActive = assigned.includes(m);
                  return (
                    <td key={m} style={{ padding: '0.5rem', textAlign: 'center' }}>
                      <button
                        onClick={() => toggleMonth(std.code, m)}
                        style={{
                          width: '36px', height: '36px', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 800, border: '1px solid',
                          cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
                          backgroundColor: isActive ? '#3b82f6' : 'transparent',
                          borderColor: isActive ? '#2563eb' : '#e2e8f0',
                          color: isActive ? 'white' : '#94a3b8'
                        }}
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
  );
}

// ============== Assessment Tab ==============
function AssessmentTab({
  standards,
  studentCount,
  getScore,
  setScore,
  getAverage,
}: {
  standards: Standard[];
  studentCount: number;
  getScore: (code: string, studentIdx: number) => number | undefined;
  setScore: (code: string, studentIdx: number, score: number) => void;
  getAverage: (code: string) => string;
}) {
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  if (standards.length === 0) {
    return (
      <div className={styles.emptyState} style={{ padding: '4rem' }}>
        <Calendar className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>배정된 성취기준이 없습니다</h3>
        <p>상단 탭의 &quot;월별 배정&quot;에서 먼저 계획을 수립해주십시오.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
          <Info size={16} /> Score Guide
        </div>
        {[0, 1, 2, 3].map((s) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '28px', height: '28px', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800,
              backgroundColor: s === 0 ? '#f1f5f9' : s === 1 ? '#fef3c7' : s === 2 ? '#dbeafe' : '#d1fae5',
              color: s === 0 ? '#64748b' : s === 1 ? '#d97706' : s === 2 ? '#2563eb' : '#059669',
              border: `1px solid ${s === 0 ? '#cbd5e1' : s === 1 ? '#fcd34d' : s === 2 ? '#bfdbfe' : '#a7f3d0'}`
            }}>
              {s}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>{SCORE_LABELS[s]}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', width: '90px' }}>Code</th>
              <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', minWidth: '250px' }}>Standard Content</th>
              {Array.from({ length: studentCount }, (_, i) => (
                <th key={i} style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', textAlign: 'center', width: '60px' }}>S{i + 1}</th>
              ))}
              <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', textAlign: 'center', width: '70px' }}>AVG</th>
            </tr>
          </thead>
          <tbody>
            {standards.map((std) => (
              <tr key={std.code} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s', backgroundColor: expandedCode === std.code ? '#fafaf9' : 'transparent' }}>
                <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                  <button
                    onClick={() => setExpandedCode(expandedCode === std.code ? null : std.code)}
                    style={{ padding: '0.25rem 0.5rem', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    {std.code}
                  </button>
                </td>
                <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>{std.content}</p>
                  
                  {expandedCode === std.code && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '1rem' }}>
                      <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Grade A</span>
                        <p style={{ fontSize: '0.8rem', color: '#334155' }}>{std.levelA}</p>
                      </div>
                      <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Grade B</span>
                        <p style={{ fontSize: '0.8rem', color: '#334155' }}>{std.levelB}</p>
                      </div>
                      <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Grade C</span>
                        <p style={{ fontSize: '0.8rem', color: '#334155' }}>{std.levelC}</p>
                      </div>
                    </div>
                  )}
                </td>
                {Array.from({ length: studentCount }, (_, i) => {
                  const currentScore = getScore(std.code, i);
                  return (
                    <td key={i} style={{ padding: '0.5rem', verticalAlign: 'top', textAlign: 'center' }}>
                      <select
                        value={currentScore ?? ""}
                        onChange={(e) => setScore(std.code, i, parseInt(e.target.value))}
                        style={{
                          width: '44px', height: '40px', borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: 800, textAlign: 'center', cursor: 'pointer', outline: 'none', appearance: 'none', margin: '0 auto', display: 'block',
                          backgroundColor: currentScore === undefined ? '#f8fafc' : currentScore === 0 ? '#f1f5f9' : currentScore === 1 ? '#fef3c7' : currentScore === 2 ? '#dbeafe' : '#d1fae5',
                          color: currentScore === undefined ? '#94a3b8' : currentScore === 0 ? '#64748b' : currentScore === 1 ? '#b45309' : currentScore === 2 ? '#1d4ed8' : '#047857',
                          border: `1px solid ${currentScore === undefined ? '#e2e8f0' : currentScore === 0 ? '#cbd5e1' : currentScore === 1 ? '#fcd34d' : currentScore === 2 ? '#bfdbfe' : '#a7f3d0'}`
                        }}
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
                <td style={{ padding: '1rem', verticalAlign: 'top', textAlign: 'center' }}>
                  <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#3b82f6', fontFamily: 'monospace' }}>
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
  );
}

