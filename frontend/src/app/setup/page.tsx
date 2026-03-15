"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const subjects = [
    "국어", "사회", "수학", "과학", "진로와 직업", "체육", "음악", "미술", "보건",
    "정보통신", "생활영어", "바른 생활", "슬기로운 생활", "즐거운 생활", "창의적 체험활동"
  ];

  const toggleSubject = (sub: string) => {
    setSelectedSubjects(prev => {
      const isSelected = prev.includes(sub);
      if (isSelected) {
        return prev.filter(s => s !== sub);
      } else {
        return [...prev, sub];
      }
    });
  };

  const handleSave = async () => {
    if (selectedSubjects.length === 0) {
      alert("최소 하나 이상의 과목을 선택해주세요.");
      return;
    }
    const role = localStorage.getItem("gstc_role");
    if (!role) {
      alert("로그인 정보가 없습니다. 다시 로그인 해주세요.");
      router.push("/");
      return;
    }
    
    setIsSaving(true);
    try {
      const res = await fetch("/api/v1/auth/setup-subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: role,
          selected_subjects: selectedSubjects
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("gstc_subjects", JSON.stringify(selectedSubjects));
        router.push("/dashboard");
      } else {
        const text = await res.text();
        let errorMessage = "서버 오류가 발생했습니다.";
        try {
          const data = JSON.parse(text);
          errorMessage = data.detail || errorMessage;
        } catch (e) {
          if (res.status === 504) errorMessage = "서버 응답 시간이 초과되었습니다 (Timeout).";
          else if (res.status === 500) errorMessage = "내부 서버 오류가 발생했습니다 (500).";
          console.error("Non-json error response:", text);
        }
        alert(`과목 저장에 실패했습니다: ${errorMessage}`);
      }
    } catch (e) {
      console.error("Fetch error:", e);
      alert("네트워크 연결에 실패했습니다. 서버가 오프라인이거나 연결이 불안정합니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center">
      <div className="premium-bg" />

      <div className="glass-container" style={{ padding: '60px', width: '100%', maxWidth: '900px' }}>
        <header className="mb-12" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span className="category-title">Step 02. Preference</span>
            <h2 style={{ fontSize: '48px', fontWeight: 900, marginBottom: '16px', letterSpacing: '-0.02em' }}>과목 선택</h2>
            <p style={{ color: '#94a3b8', fontWeight: 500, lineHeight: 1.6 }}>담당하시는 수업 과목을 모두 선택해 주세요. <br />다중 선택이 가능합니다.</p>
          </div>
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.1)', padding: '24px', borderRadius: '24px', textAlign: 'center', minWidth: '100px' }}>
            <p style={{ fontSize: '10px', fontWeight: 900, color: '#10b981', textTransform: 'uppercase', marginBottom: '4px' }}>Selected</p>
            <p style={{ fontSize: '32px', fontWeight: 900 }}>{selectedSubjects.length}</p>
          </div>
        </header>

        <div className="subject-grid" style={{ marginBottom: '48px' }}>
          {subjects.map(sub => (
            <button
              key={sub}
              type="button"
              onClick={() => toggleSubject(sub)}
              className={`subject-card ${selectedSubjects.includes(sub) ? "active" : ""}`}
            >
              {sub}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="premium-button"
            style={{ width: '100%', fontSize: '18px', letterSpacing: '0.1em', opacity: isSaving ? 0.7 : 1 }}
          >
            {isSaving ? "SAVING..." : "CONFIRM & START"}
          </button>
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', fontWeight: 500 }}>설제 정보는 언제든지 대시보드에서 수정하실 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
}
