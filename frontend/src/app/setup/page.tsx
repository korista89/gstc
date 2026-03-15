"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

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
        localStorage.setItem("gstc_subjects", JSON.stringify(selectedSubjects));
        router.push("/dashboard");
      } else {
        alert("과목 저장에 실패했습니다. (서버 오류)");
      }
    } catch (e) {
      console.error(e);
      alert("네트워크 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8 flex flex-col items-center justify-center">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 bg-slate-900/40 backdrop-blur-2xl p-10 md:p-16 rounded-[40px] max-w-4xl w-full border border-white/5 shadow-[0_32px_64px_rgba(0,0,0,0.4)] animate-in fade-in zoom-in-95 duration-500">
        <header className="mb-12 flex justify-between items-start">
          <div>
            <span className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em] mb-3 block">Step 02. Preference</span>
            <h2 className="text-4xl font-black mb-4 tracking-tight">과목 선택</h2>
            <p className="text-slate-400 font-medium">담당하시는 수업 과목을 모두 선택해 주세요. <br className="hidden md:block"/>다중 선택이 가능합니다.</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-4 rounded-2xl text-center">
            <p className="text-[10px] font-black text-emerald-500 uppercase mb-1">Selected</p>
            <p className="text-2xl font-black text-white">{selectedSubjects.length}</p>
          </div>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-12">
          {subjects.map(sub => (
            <button
              key={sub}
              type="button"
              onClick={() => toggleSubject(sub)}
              className={`group relative p-6 rounded-[24px] border transition-all duration-300 overflow-hidden ${
                selectedSubjects.includes(sub)
                  ? "bg-emerald-500/20 border-emerald-500/50 shadow-[0_10px_30px_rgba(16,185,129,0.2)] scale-[1.02]"
                  : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"
              }`}
            >
              <span className={`relative z-10 font-bold transition-colors ${
                selectedSubjects.includes(sub) ? "text-emerald-300" : "text-slate-400 group-hover:text-slate-200"
              }`}>
                {sub}
              </span>
              {selectedSubjects.includes(sub) && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={handleSave}
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[20px] font-black text-lg tracking-widest uppercase hover:from-blue-500 hover:to-indigo-500 transition-all shadow-[0_15px_30px_rgba(37,99,235,0.25)] active:scale-[0.98]"
          >
            CONFIRM & START
          </button>
          <p className="text-center text-slate-500 text-xs font-medium">설정 정보는 언제든지 대시보드에서 수정하실 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
}
