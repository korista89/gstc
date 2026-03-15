"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const subjects = [
    "국어", "사회", "수학", "과학", "진로와 직업", "체육", "음악", "미술", "선택(보건)",
    "창의적 체험활동", "바른 생활", "슬기로운 생활", "즐거운 생활"
  ];

  const toggleSubject = (sub: string) => {
    setSelectedSubjects(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const handleSave = () => {
    if (selectedSubjects.length === 0) {
      alert("최소 하나 이상의 과목을 선택해주세요.");
      return;
    }
    // Save to local storage or API
    localStorage.setItem("gstc_subjects", JSON.stringify(selectedSubjects));
    alert("설명이 저장되었습니다. 대시보드로 이동합니다.");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col items-center justify-center">
      <div className="glass p-10 rounded-3xl max-w-2xl w-full border border-slate-700 shadow-2xl">
        <h2 className="text-3xl font-black mb-2 gradient-text">과목 및 학급 설정</h2>
        <p className="text-slate-400 mb-8">담당하시는 수업 과목을 선택해 주세요. (추후 변경 가능)</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
          {subjects.map(sub => (
            <button
              key={sub}
              onClick={() => toggleSubject(sub)}
              className={`p-4 rounded-2xl border transition-all font-bold ${
                selectedSubjects.includes(sub)
                  ? "bg-emerald-600 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  : "bg-slate-800 border-slate-700 hover:border-slate-500"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-black text-lg hover:from-blue-500 hover:to-indigo-500 transition-all shadow-xl"
        >
          설정 완료 및 시작하기
        </button>
      </div>
    </div>
  );
}
