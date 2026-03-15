"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { gradeSubjects } from "@/data/config";
import { Sparkles, CheckCircle2, BookOpen, ChevronRight, Layout } from "lucide-react";

function extractGrade(role: string): string {
  const m = role.match(/^(초|중|고)(\d)/);
  if (m) return `${m[1]}${m[2]}`;
  if (role.startsWith("유")) return "초1";
  if (role.startsWith("전")) return "고3";
  if (role.includes("중")) return "중1";
  if (role.includes("고")) return "고1";
  return "고1";
}

export default function SetupPage() {
  const router = useRouter();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [grade, setGrade] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [role, setRole] = useState("");

  useEffect(() => {
    const r = localStorage.getItem("gstc_role");
    if (!r) {
      router.push("/");
      return;
    }
    setRole(r);
    const g = extractGrade(r);
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
    if (selectedSubjects.length === 0) return;
    
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
        localStorage.setItem("gstc_subjects", JSON.stringify(selectedSubjects));
        router.push("/main");
      }
    } catch {
      localStorage.setItem("gstc_subjects", JSON.stringify(selectedSubjects));
      router.push("/main");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="pbst-blob bg-blue-600 w-[600px] h-[600px] -bottom-48 -left-48 opacity-10" />
      <div className="pbst-blob bg-emerald-600 w-[400px] h-[400px] -top-48 -right-48 opacity-10" />

      <div className="w-full max-w-2xl relative z-10 animate-pbst-scale-up">
        <div className="glass-card overflow-hidden shadow-2xl">
          {/* Progress Header */}
          <div className="bg-gradient-to-r from-blue-600/20 via-indigo-600/10 to-transparent p-10 border-b border-slate-700/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Layout className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="pbst-label text-blue-400">Step 2: Configuration</p>
                <h1 className="text-3xl font-black tracking-tight">{role} 워크스페이스 설정</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-700/50">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-slate-300">{grade} 교육과정 기준</span>
              </div>
              <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-700 ease-out"
                  style={{ width: `${(selectedSubjects.length / 5) * 100}%` }}
                />
              </div>
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                {selectedSubjects.length} / 5 Selected
              </span>
            </div>
          </div>

          <div className="p-10">
            <div className="flex items-center gap-2 mb-8">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold">담당하시는 수업 과목을 선택해주세요</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
              {availableSubjects.map((sub) => {
                const isSelected = selectedSubjects.includes(sub);
                return (
                  <button
                    key={sub}
                    onClick={() => toggleSubject(sub)}
                    className={`group relative py-4 px-4 rounded-2xl text-sm font-bold transition-all duration-300 border flex flex-col gap-3 min-h-[100px] justify-between text-left ${
                      isSelected
                        ? "bg-emerald-600/10 border-emerald-500 text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                        : "bg-slate-900/40 border-slate-800/50 text-slate-500 hover:bg-slate-800/60 hover:border-slate-700 hover:text-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="relative z-10">{sub}</span>
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-700 group-hover:border-slate-500 transition-colors" />
                      )}
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${
                      isSelected ? "text-emerald-500/50" : "text-slate-700"
                    }`}>
                      {isSelected ? "Active Workspace" : "Select Subject"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-6 pt-6 border-t border-slate-800/50">
              <div className="text-slate-500 text-xs">
                <p>선택하신 과목에 맞추어 성취기준 데이터가</p>
                <p>워크스페이스에 자동으로 배정됩니다.</p>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving || selectedSubjects.length === 0}
                className="pbst-button-primary min-w-[180px] !py-4 flex items-center justify-center gap-2 disabled:opacity-30 disabled:grayscale transition-all"
              >
                {isSaving ? "데이터 준비 중..." : "워크스페이스 시작"}
                <ChevronRight className={`w-4 h-4 transition-transform ${isSaving ? "animate-ping" : "group-hover:translate-x-1"}`} />
              </button>
            </div>
          </div>
        </div>
        
        <p className="text-center mt-8 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
          Gyeongun School Curriculum System · Phase 2
        </p>
      </div>
    </div>
  );
}
