"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { gradeSubjects } from "@/data/config";

function extractGrade(role: string): string {
  // "초1-1 담임" → "초1", "중2-2 부담임" → "중2", "고3-1 담임" → "고3"
  // "중교과전담" → "중1", "고교과전담" → "고1", "전교과전담" → "고3"
  // "유난초 담임" → "초1"
  // "진로전담", "관리자" etc → "고1" (default: full range)
  const m = role.match(/^(초|중|고)(\d)/);
  if (m) return `${m[1]}${m[2]}`;
  if (role.startsWith("유")) return "초1";
  if (role.startsWith("전")) return "고3";
  if (role.includes("중")) return "중1";
  if (role.includes("고")) return "고1";
  return "고1"; // default: widest range
}

export default function SetupPage() {
  const router = useRouter();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [grade, setGrade] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("gstc_role");
    if (!role) {
      router.push("/");
      return;
    }
    const g = extractGrade(role);
    setGrade(g);
    localStorage.setItem("gstc_grade", g);
    setAvailableSubjects(gradeSubjects[g] || []);
  }, [router]);

  const toggleSubject = (sub: string) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(sub)) return prev.filter((s) => s !== sub);
      if (prev.length >= 5) return prev;
      return [...prev, sub];
    });
  };

  const handleSave = async () => {
    if (selectedSubjects.length === 0) {
      alert("최소 하나 이상의 과목을 선택해주세요.");
      return;
    }
    const role = localStorage.getItem("gstc_role");
    if (!role) {
      router.push("/");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/v1/auth/setup-subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, selected_subjects: selectedSubjects }),
      });

      if (res.ok) {
        localStorage.setItem("gstc_subjects", JSON.stringify(selectedSubjects));
        router.push("/main");
      } else {
        alert("과목 저장에 실패했습니다. 서버 연결을 확인해주세요.");
        // Save locally anyway so user can proceed
        localStorage.setItem("gstc_subjects", JSON.stringify(selectedSubjects));
        router.push("/main");
      }
    } catch {
      // Offline mode: save locally and proceed
      localStorage.setItem("gstc_subjects", JSON.stringify(selectedSubjects));
      router.push("/main");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-lg">
        <div className="mb-6">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">
            과목 설정
          </p>
          <h2 className="text-2xl font-bold mb-1">수업 과목 선택</h2>
          <p className="text-slate-400 text-sm">
            {grade} 학년 기준 · 최대 5개 선택 가능 ({selectedSubjects.length}/5)
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {availableSubjects.map((sub) => (
            <button
              key={sub}
              onClick={() => toggleSubject(sub)}
              className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all border ${
                selectedSubjects.includes(sub)
                  ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                  : "bg-slate-700/50 border-slate-600/50 text-slate-400 hover:bg-slate-700 hover:text-slate-300"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || selectedSubjects.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition"
        >
          {isSaving ? "저장 중..." : "선택 완료"}
        </button>
      </div>
    </div>
  );
}
