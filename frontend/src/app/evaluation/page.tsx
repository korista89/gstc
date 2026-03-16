"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GlobalNav from "@/components/GlobalNav";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";

export default function EvaluationPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const [evaluationData, setEvaluationData] = useState({
    student: "",
    score: 3,
    notes: ""
  });

  useEffect(() => {
    const savedRole = localStorage.getItem("gstc_role");
    if (!savedRole) {
      router.push("/");
      return;
    }
    setRole(savedRole);
    
    // Load subjects for evaluation context
    const storedSubjects = localStorage.getItem("gstc_subjects");
    if (storedSubjects) {
      const parsed = JSON.parse(storedSubjects);
      setSubjects(parsed);
      if (parsed.length > 0) setSelectedSubject(parsed[0]);
    } else {
      setSubjects(["전체"]);
      setSelectedSubject("전체");
    }
    
    setLoading(false);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSubmitStatus("idle");
    
    try {
      // Mock integration with existing API endpoint
      const payload = {
        role,
        subject: selectedSubject,
        student_code: evaluationData.student,
        score: evaluationData.score,
        notes: evaluationData.notes,
        month: `${new Date().getMonth() + 1}월`
      };
      
      const res = await fetch("/api/v1/assessment/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setSubmitStatus("success");
        setEvaluationData({ ...evaluationData, student: "", notes: "" }); // Reset some form fields
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setSaving(false);
      setTimeout(() => setSubmitStatus("idle"), 3000);
    }
  };

  if (loading) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <GlobalNav />
      
      <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>성취기준 평가</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>담당 교과 및 학생에 대한 세부 평가를 진행합니다.</p>
        </header>

        <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>평가 교과 선택</label>
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#f8fafc' }}
                required
              >
                {subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>학생 이름</label>
              <input 
                type="text" 
                placeholder="예: 김민수" 
                value={evaluationData.student}
                onChange={(e) => setEvaluationData({...evaluationData, student: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>도달 수준 (1~5)</label>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>1: 수동적 참여 불가능 ~ 5: 독립적 수행 가능</p>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input 
                  type="range" 
                  min="1" max="5" 
                  value={evaluationData.score}
                  onChange={(e) => setEvaluationData({...evaluationData, score: parseInt(e.target.value)})}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#4f46e5', minWidth: '2rem', textAlign: 'center' }}>{evaluationData.score}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>관찰 내용 및 특이사항</label>
              <textarea 
                rows={4}
                placeholder="학생의 수행 과정 중 특이점이나 지원 필요도를 기록하세요."
                value={evaluationData.notes}
                onChange={(e) => setEvaluationData({...evaluationData, notes: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <button 
                type="submit" 
                disabled={saving}
                style={{ 
                  width: '100%', padding: '1rem', borderRadius: '0.5rem', 
                  backgroundColor: saving ? '#94a3b8' : '#4f46e5', color: 'white', 
                  fontWeight: 600, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
                }}
              >
                {saving ? "저장 중..." : "평가 제출하기"}
                {!saving && <CheckCircle size={18} />}
              </button>

              {submitStatus === "success" && (
                <div style={{ padding: '0.75rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <CheckCircle size={16} /> 평가 결과가 성공적으로 저장되었습니다.
                </div>
              )}
              {submitStatus === "error" && (
                <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <AlertTriangle size={16} /> 저장 중 오류가 발생했습니다. 다시 시도해주세요.
                </div>
              )}
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
