"use client";

import { useState, useEffect } from "react";
import GlobalNav from "@/components/GlobalNav";
import { 
  UserCircle2, 
  Filter, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  Target,
  Info
} from "lucide-react";

interface Standard {
  code: string;
  subject: string;
  content: string;
  level_a: string;
  level_b: string;
  level_c: string;
}

interface Student {
  학생이름: string;
  학급명: string;
}

export default function AssessmentPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedSubject, setSelectedSubject] = useState("국어");
  const [standards, setStandards] = useState<Standard[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [targetLevel, setTargetLevel] = useState<Record<string, "A" | "B" | "C">>({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
    fetchStandards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedStudent) {
      // Potentially fetch existing scores for the selected student
      // For now, just ensure the UI updates correctly
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/v1/assessment/students");
      const data = await res.json();
      setStudents(data || []);
      if (data.length > 0 && !selectedStudent) {
        setSelectedStudent(data[0]); // Set the whole student object
      }
    } catch (e) { console.error(e); }
  };

  const fetchStandards = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/curriculum/standards/by-subject/${encodeURIComponent(selectedSubject)}`);
      const data = await res.json();
      setStandards(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleScore = async (code: string, score: number) => {
    if (!selectedStudent) {
      console.error("No student selected.");
      return;
    }
    const level = targetLevel[code] || "A";
    setScores(prev => ({ ...prev, [code]: score }));
    setSyncing(true);
    try {
      await fetch("/api/v1/assessment/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_name: selectedStudent.학생이름,
          evaluations: [
            {
              코드: code,
              점수: score,
              날짜: new Date().toISOString().split("T")[0]
            }
          ]
        })
      });
      setLastSynced(new Date().toLocaleTimeString());
    } catch (e) {
      console.error("평가 저장 실패:", e);
    } finally {
      setSyncing(false);
    }
  };

  const handleLevelChange = (code: string, level: "A" | "B" | "C") => {
    setTargetLevel(prev => ({ ...prev, [code]: level }));
  };

  const getScoreColor = (score: number) => {
    switch (score) {
      case 3: return "bg-emerald-500 text-slate-950 shadow-emerald-500/20";
      case 2: return "bg-blue-500 text-white shadow-blue-500/20";
      case 1: return "bg-amber-500 text-slate-950 shadow-amber-500/20";
      case 0: return "bg-rose-500 text-white shadow-rose-500/20";
      default: return "bg-slate-900 text-slate-600 border-white/5";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-28 pb-20">
      <GlobalNav />
      <main className="max-w-7xl mx-auto px-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-full border border-emerald-500/20 uppercase tracking-widest">Assessment Mode</span>
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Achievement Tracker</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-white mb-2">성취도 <span className="gradient-text">기록기</span></h1>
            <p className="text-slate-400 font-medium text-lg">학생별 성취기준 달성도 평가 및 맞춤형 피드백 기록</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${syncing ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"}`}>
              <div className={`w-2 h-2 rounded-full ${syncing ? "bg-blue-500 animate-pulse" : "bg-emerald-500"}`} />
              <span className="text-xs font-black uppercase tracking-widest">
                {syncing ? "Syncing..." : "Cloud Synced"}
              </span>
            </div>
            {lastSynced && !syncing && <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Last save: {lastSynced}</p>}
          </div>
          
          <div className="flex gap-4 mt-8 md:mt-0">
            <div className="relative">
              <UserCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 pointer-events-none" />
              <select 
                value={selectedStudent?.학생이름 || ""}
                onChange={(e) => setSelectedStudent(students.find(s => s.학생이름 === e.target.value) || null)}
                className="bg-slate-900 border border-white/10 rounded-2xl pl-12 pr-8 py-4 font-black text-sm text-white focus:border-blue-500 outline-none appearance-none cursor-pointer"
              >
                {students.map(s => (
                  <option key={s.학생이름} value={s.학생이름}>{s.학급명} - {s.학생이름}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500 w-5 h-5 pointer-events-none" />
              <select 
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-2xl pl-12 pr-8 py-4 font-black text-sm text-white focus:border-blue-500 outline-none appearance-none cursor-pointer"
              >
                <option>국어</option><option>수학</option><option>사회</option><option>과학</option>
                <option>체육</option><option>음악</option><option>미술</option>
              </select>
            </div>
          </div>
        </header>

        <section className="space-y-8">
          {loading ? (
            <div className="text-center py-40 animate-pulse">
              <Target className="w-16 h-16 text-slate-800 mx-auto mb-4 animate-spin-slow" />
              <p className="text-slate-600 font-black">데이터 동기화 중...</p>
            </div>
          ) : (
            standards.map((standard, sIdx) => (
              <div key={standard.code} className="glass p-10 rounded-[48px] border border-white/5 flex flex-col md:flex-row gap-12 group hover:border-blue-500/20 transition-all animate-fade-in" style={{animationDelay: `${sIdx * 100}ms`}}>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-[11px] font-black px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">{standard.code}</span>
                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{standard.subject} UNIT</span>
                  </div>
                  <h3 className="text-2xl font-black mb-10 leading-tight text-white group-hover:text-blue-50 transition-colors">{standard.content}</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {(["A", "B", "C"] as const).map(lvl => (
                      <div 
                        key={lvl}
                        onClick={() => handleLevelChange(standard.code, lvl)}
                        className={`p-5 rounded-3xl border transition-all cursor-pointer flex items-center justify-between group/item ${
                          targetLevel[standard.code] === lvl 
                            ? "bg-blue-600/10 border-blue-500/50 premium-shadow" 
                            : "bg-slate-950/40 border-white/5 hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                            targetLevel[standard.code] === lvl ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-600"
                          }`}>
                            {lvl}
                          </div>
                          <p className={`text-sm font-medium leading-relaxed ${targetLevel[standard.code] === lvl ? "text-slate-200" : "text-slate-500"}`}>
                            {lvl === "A" ? standard.level_a : lvl === "B" ? standard.level_b : standard.level_c}
                          </p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 p-1 transition-all ${
                          targetLevel[standard.code] === lvl ? "border-blue-500" : "border-slate-800"
                        }`}>
                          {targetLevel[standard.code] === lvl && <div className="w-full h-full bg-blue-500 rounded-full" />}
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-slate-600">
                      <Info className="w-4 h-4" />
                      대상 학생 수준을 선택하면 평가 가이드가 자동으로 동기화됩니다.
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-80 flex flex-col justify-center items-center gap-6 border-t md:border-t-0 md:border-l border-white/5 pt-12 md:pt-0 md:pl-12">
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 text-slate-800 mx-auto mb-2" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Achievement Score</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 w-full">
                    {[3, 2, 1, 0].map(s => (
                      <button
                        key={s}
                        onClick={() => handleScore(standard.code, s)}
                        className={`h-20 rounded-[32px] font-black text-2xl transition-all relative overflow-hidden group/btn ${
                          scores[standard.code] === s ? getScoreColor(s) : "bg-slate-900/50 text-slate-500 border border-white/5 hover:border-slate-700"
                        }`}
                      >
                        {s}
                        {scores[standard.code] === s && (
                          <CheckCircle2 className="absolute top-2 right-2 w-4 h-4" />
                        )}
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className={`text-[11px] font-black transition-all ${scores[standard.code] !== undefined ? "text-emerald-500 scale-110" : "text-slate-700"}`}>
                      {scores[standard.code] !== undefined ? "✓ REAL-TIME SYNCED" : "AWAITING EVALUATION"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
