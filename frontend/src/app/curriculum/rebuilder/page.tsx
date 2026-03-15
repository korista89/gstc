"use client";

import { useState, useEffect } from "react";
import GlobalNav from "@/components/GlobalNav";
import { 
  Sparkles, 
  Save, 
  Search, 
  Trash2, 
  ChevronRight,
  Info,
  CalendarCheck
} from "lucide-react";

interface Standard {
  code: string;
  subject: string;
  content: string;
  element: string;
}

const MONTHS = ["3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

export default function CurriculumRebuilder() {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("국어");
  const [monthlyPlan, setMonthlyPlan] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("gstc_role") || "관리자 선생님";
    setUserRole(role);
    
    const initialPlan: Record<string, string[]> = {};
    MONTHS.forEach(m => initialPlan[m] = []);
    setMonthlyPlan(initialPlan);

    fetchStandards();
    loadExistingPlan(role, selectedSubject);
  }, [selectedSubject]);

  const fetchStandards = async () => {
    try {
      const res = await fetch(`/api/v1/curriculum/standards/by-subject/${encodeURIComponent(selectedSubject)}`);
      const data = await res.json();
      setStandards(data || []);
    } catch (e) { console.error(e); }
  };

  const loadExistingPlan = async (role: string, subject: string) => {
    try {
      const res = await fetch(`/api/v1/curriculum/get-plan?role=${encodeURIComponent(role)}&subject=${encodeURIComponent(subject)}`);
      const data = await res.json();
      if (data && Object.keys(data).length > 0) {
        setMonthlyPlan(data);
      }
    } catch (e) { console.error(e); }
  };

  const handleAiSuggest = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/curriculum/suggest-plan?subject=${encodeURIComponent(selectedSubject)}`);
      const data = await res.json();
      setMonthlyPlan(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/v1/curriculum/save-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: userRole,
          subject: selectedSubject,
          plan: monthlyPlan
        })
      });
      alert("성공적으로 저장되었습니다!");
    } catch (e) { alert("저장에 실패했습니다."); }
    finally { setSaving(false); }
  };

  const addStandardToMonth = (month: string, code: string) => {
    setMonthlyPlan(prev => ({
      ...prev,
      [month]: prev[month].includes(code) ? prev[month] : [...prev[month], code]
    }));
  };

  const removeStandardFromMonth = (month: string, code: string) => {
    setMonthlyPlan(prev => ({
      ...prev,
      [month]: prev[month].filter(c => c !== code)
    }));
  };

  const filteredStandards = standards.filter(s => 
    s.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.content.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-slate-950 pt-28 pb-20">
      <GlobalNav />
      <main className="max-w-[1700px] mx-auto px-8">
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-12 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-black rounded-full border border-purple-500/20 uppercase tracking-widest">Editor Mode</span>
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Visual Reconstruction</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-white mb-2">교육과정 <span className="gradient-text">재구성 편집기</span></h1>
            <p className="text-slate-400 font-medium text-lg">{userRole}님, 창의적인 학급 교육과정을 설계하세요.</p>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-8 xl:mt-0">
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 font-black text-sm text-white focus:border-blue-500 outline-none backdrop-blur-xl"
            >
              <option>국어</option><option>수학</option><option>사회</option><option>과학</option>
              <option>체육</option><option>음악</option><option>미술</option>
            </select>
            <button 
              onClick={handleAiSuggest}
              disabled={loading}
              className={`px-8 py-4 rounded-2xl font-black text-sm transition-all flex items-center gap-3 premium-shadow ${
                loading ? "bg-slate-800 text-slate-500" : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-105 active:scale-95"
              }`}
            >
              <Sparkles className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              AI 지능형 제안
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className={`px-10 py-4 rounded-2xl font-black text-sm transition-all shadow-xl ${
                saving ? "bg-slate-800 text-slate-500" : "bg-white text-slate-950 hover:bg-emerald-50 active:scale-95"
              }`}
            >
              <div className="flex items-center gap-2">
                <Save className="w-5 h-5" />
                {saving ? "저장 중..." : "최종 확정"}
              </div>
            </button>
          </div>
        </header>

        <div className="flex flex-col xl:flex-row gap-8 items-start">
          {/* Calendar Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-5 gap-6 animate-fade-in">
            {MONTHS.map((month, mIdx) => (
              <div key={month} className="glass p-6 rounded-[32px] border border-white/5 flex flex-col min-h-[500px] group hover:border-blue-500/20 transition-all">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                  <h3 className="text-lg font-black text-blue-400">{month}</h3>
                  <CalendarCheck className="w-5 h-5 text-slate-700 group-hover:text-blue-500/50 transition-colors" />
                </div>
                
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] pr-2 scrollbar-hide">
                  {monthlyPlan[month]?.map(code => {
                    const std = standards.find(s => s.code === code);
                    return (
                      <div 
                        key={`${month}-${code}`}
                        className="p-4 bg-slate-900/40 rounded-2xl border border-white/5 text-[11px] font-bold flex justify-between items-start group/item hover:bg-slate-900/60 transition-all animate-fade-in"
                        title={std?.content}
                      >
                        <div className="flex flex-col gap-1.5 flex-1 pr-3">
                          <span className="text-blue-500 text-[10px] tracking-tight">{code}</span>
                          <span className="text-slate-300 leading-relaxed line-clamp-2">{std?.content}</span>
                        </div>
                        <button 
                          onClick={() => removeStandardFromMonth(month, code)}
                          className="opacity-0 group-item-hover:opacity-100 p-1.5 hover:bg-red-500/10 rounded-lg text-slate-600 hover:text-red-500 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                  <div className="border-2 border-dashed border-white/5 rounded-2xl h-24 flex items-center justify-center text-[10px] font-black text-slate-700 hover:border-blue-500/30 hover:text-slate-500 transition-all cursor-pointer">
                    Click to Assign
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Standards Sidebar */}
          <div className="w-full xl:w-[450px] glass p-8 rounded-[40px] border border-white/5 sticky top-28 h-[calc(100vh-140px)] flex flex-col premium-shadow animate-fade-in" style={{animationDelay: '200ms'}}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-white">성취기준 <span className="text-blue-500">POOL</span></h3>
              <span className="text-[10px] font-black px-2 py-1 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">{standards.length}</span>
            </div>
            
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input 
                type="text" 
                placeholder="코드 또는 내용으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:border-blue-500 outline-none text-white transition-all"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-3 scrollbar-hide">
              {filteredStandards.map((std, i) => (
                <div 
                  key={std.code}
                  className="p-5 bg-slate-900/30 border border-white/5 rounded-3xl hover:border-blue-500/40 transition-all cursor-pointer group hover:bg-slate-900/60 flex flex-col gap-3"
                  onClick={() => addStandardToMonth("3월", std.code)}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">{std.code}</span>
                    <div className="p-1 px-2 rounded-lg bg-slate-800/80 text-[9px] font-black text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">ADD +</div>
                  </div>
                  <p className="text-xs font-bold leading-relaxed text-slate-300 group-hover:text-white transition-colors">
                    {std.content}
                  </p>
                  <div className="flex items-center gap-2 text-[9px] font-black text-slate-600">
                    <Info className="w-3 h-3" />
                    {std.element}
                  </div>
                </div>
              ))}
              {filteredStandards.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-slate-600 font-bold">검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
