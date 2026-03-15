"use client";

import { useState, useEffect } from "react";
import GlobalNav from "@/components/GlobalNav";
import { 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  ArrowUpRight,
  GraduationCap,
  LayoutDashboard,
  Search,
  Filter,
  MoreVertical,
  Activity,
  Sparkles
} from "lucide-react";
import { normalizeStudentData, Student as InternalStudent } from "@/lib/student-data";

type Student = InternalStudent;

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/v1/assessment/students");
      const data = await res.json();
      
      if (!Array.isArray(data)) {
        setStudents([]);
        return;
      }

      const normalizedData = data.map((s: any) => ({
        ...normalizeStudentData(s),
        progress: Math.floor(Math.random() * 60) + 20,
        tier: Math.floor(Math.random() * 3) + 1 // Mock tier for UI
      }));
      setStudents(normalizedData);
    } catch (e) {
      console.error(e);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setAnalyzing(true);
    try {
      const studentName = students.length > 0 ? students[0].student_name : "관리자";
      const res = await fetch("/api/v1/analytics/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_name: studentName })
      });
      const data = await res.json();
      setReport(data);
      setShowModal(true);
    } catch (e) {
      alert("분석 보고서 생성 중 오류가 발생했습니다.");
    } finally {
      setAnalyzing(false);
    }
  };

  const stats = [
    { name: "전체 학생", value: students.length, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", label: "관리 중" },
    { name: "평균 성취도", value: "68%", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "+12% 상승" },
    { name: "금일 평가", value: "8건", icon: CheckCircle2, color: "text-amber-500", bg: "bg-amber-500/10", label: "3건 대기" },
    { name: "행동 분석", value: "24회", icon: Activity, color: "text-indigo-500", bg: "bg-indigo-500/10", label: "실시간 감지" },
  ];

  const getTierColor = (tier: number) => {
    switch(tier) {
      case 1: return "var(--tier-1)";
      case 2: return "var(--tier-2)";
      case 3: return "var(--tier-3)";
      default: return "var(--text-muted)";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30">
      <GlobalNav />
      
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="pbst-blob bg-blue-600/10 w-[600px] h-[600px] -top-48 -left-48" />
        <div className="pbst-blob bg-indigo-600/10 w-[500px] h-[500px] bottom-0 right-0" />
      </div>

      <main className="relative z-10 pbst-container pt-32 pb-20">
        {/* Top Header Section */}
        <section className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 animate-pbst-fade-in">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded-xl border border-blue-500/20 uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                PBIS DASHBOARD
              </span>
              <span className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">Live Analytics · 2026</span>
            </div>
            <h1 className="pbst-h1 mb-6">
              반갑습니다, 선생님. <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">경은PBST</span>가 스마트한 교육을 지원합니다.
            </h1>
            <p className="text-slate-500 font-bold text-lg leading-relaxed">데이터 기반의 개별화 교육과정(IEP) 분석과 긍정적 행동 지원(PBIS) 리포트를 한 눈에 확인하고 체계적인 학급 운영을 시작하세요.</p>
          </div>
          <div className="flex gap-4 mt-10 lg:mt-0">
            <button className="px-8 py-4 bg-slate-900/50 border border-slate-800 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-white hover:bg-slate-800 transition-all">
              Activity Logs
            </button>
            <button 
              onClick={generateReport}
              disabled={analyzing}
              className="pbst-button-primary !px-10 !py-4 flex items-center gap-3"
            >
              {analyzing ? "분석 중..." : "AI 통합 분석 리포트"}
              <ArrowUpRight className={`w-5 h-5 ${analyzing ? "animate-pulse" : ""}`} />
            </button>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 px-1">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card p-8 group hover:border-blue-500/30 transition-all animate-pbst-scale-up" style={{animationDelay: `${i * 100}ms`}}>
              <div className="flex justify-between items-start mb-8">
                <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{stat.label}</span>
                  <div className="w-8 h-1 bg-slate-800 rounded-full" />
                </div>
              </div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">{stat.name}</p>
              <h4 className="text-4xl font-black text-white group-hover:text-blue-400 transition-colors uppercase">{stat.value}</h4>
            </div>
          ))}
        </section>

        {/* Content Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
          {/* Main Student List Section */}
          <section className="xl:col-span-3 space-y-10 px-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="flex items-center gap-5">
                <h2 className="text-3xl font-black text-white">학급 학생 명단</h2>
                <div className="px-4 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {students.length} Students Active
                </div>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative flex-grow sm:w-80 group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="학생 이름 또는 학급 검색..."
                    className="pbst-input !pl-14 !py-4"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 hover:text-white hover:border-slate-700 transition-all">
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-72 glass-card animate-pbst-shimmer overflow-hidden" />
                ))
              ) : (
                students.filter(s => s.student_name.includes(searchQuery)).map((student, idx) => (
                  <div key={idx} className="group glass-card p-8 hover:bg-blue-600/[0.02] active:scale-[0.99] transition-all animate-pbst-fade-in" style={{animationDelay: `${idx * 50}ms`}}>
                    <div className="flex justify-between items-start mb-8 text-white">
                      <div className="flex gap-6 items-center">
                        <div className="w-20 h-20 rounded-[24px] bg-slate-900 flex items-center justify-center border border-slate-800 group-hover:border-blue-500/30 transition-all relative overflow-hidden shadow-2xl">
                          <span className="text-3xl font-black relative z-10 text-slate-200 group-hover:text-white transition-colors uppercase">{student.student_name[0]}</span>
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2.5">
                            <span className="px-3 py-1 bg-slate-950 border border-slate-800 text-slate-500 text-[10px] font-black rounded-lg uppercase tracking-tighter">
                              {student.class_name}
                            </span>
                            <span 
                              className="px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-tighter"
                              style={{ backgroundColor: getTierColor(student.tier || 1) + '15', color: getTierColor(student.tier || 1), border: `1px solid ${getTierColor(student.tier || 1)}30` }}
                            >
                              TIER {student.tier}
                            </span>
                          </div>
                          <h3 className="text-2xl font-black group-hover:text-blue-400 transition-colors tracking-tight uppercase">{student.student_name}</h3>
                          <div className="flex items-center gap-2 mt-2">
                             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50" />
                             <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Status · 2h ago</p>
                          </div>
                        </div>
                      </div>
                      <button className="p-2 text-slate-700 hover:text-white transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-8">
                      <div>
                        <div className="flex justify-between mb-3 px-1">
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Learning Progress</span>
                          <span className="text-sm font-black text-white tracking-widest">{student.progress}%</span>
                        </div>
                        <div className="h-4 bg-slate-950 rounded-full overflow-hidden p-[3px] border border-slate-900 shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-emerald-400 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all duration-1000 ease-out"
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center bg-slate-950/50 p-4 rounded-2xl border border-slate-900">
                        <div className="flex -space-x-3">
                          {student.subjects.slice(0, 3).map((sub, i) => (
                            <div key={sub} className="w-10 h-10 rounded-full bg-slate-900 border-4 border-slate-950 flex items-center justify-center text-[10px] font-black text-slate-500 hover:text-white hover:border-blue-500/20 transition-all cursor-default" title={sub}>
                              {sub[0]}
                            </div>
                          ))}
                          {student.subjects.length > 3 && (
                            <div className="w-10 h-10 rounded-full bg-slate-900 border-4 border-slate-950 flex items-center justify-center text-[10px] font-black text-blue-500">
                              +{student.subjects.length - 3}
                            </div>
                          )}
                        </div>
                        <button className="px-8 py-3 bg-white text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-50 transition-all shadow-xl active:scale-95">
                          View Report
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Sidebar Section */}
          <section className="space-y-8">
            {/* Calendar & Schedule */}
            <div className="glass-card p-8 group">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black text-white flex items-center gap-3">
                  <Calendar className="text-blue-500 w-5 h-5" />
                  학사 일정
                </h3>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">March 2026</span>
              </div>
              <div className="space-y-8">
                {[
                  { title: "현근이 생일 지도", date: "03.15", tag: "생활", color: "bg-blue-500" },
                  { title: "학교 주변 봄 나들이", date: "03.28", tag: "체험", color: "bg-emerald-500" },
                  { title: "장애 인식 개선 교육", date: "04.02", tag: "교육", color: "bg-indigo-500" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group/item cursor-pointer">
                    <div className="text-center min-w-[44px]">
                      <p className="text-[10px] font-black text-slate-700 group-hover/item:text-blue-500 transition-colors uppercase mb-1">{item.date.split('.')[0]}M</p>
                      <p className="text-2xl font-black text-white group-hover/item:scale-110 transition-transform">{item.date.split('.')[1]}</p>
                    </div>
                    <div className="flex-grow pt-1">
                      <div className="flex items-center gap-2 mb-1.5">
                         <div className={`w-1.5 h-1.5 ${item.color} rounded-full`} />
                         <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">{item.tag}</p>
                      </div>
                      <p className="font-bold text-slate-300 group-hover/item:text-white transition-colors leading-tight">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-10 py-4 bg-slate-950 border border-slate-900 rounded-2xl text-[10px] font-black text-slate-600 hover:text-white hover:bg-slate-900 transition-all uppercase tracking-[0.3em]">Full Calendar</button>
            </div>

            {/* AI Insight Card */}
            <div className="glass-card p-1 p-8 bg-gradient-to-br from-blue-600/10 via-slate-900/50 to-transparent relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[40px] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <GraduationCap className="text-white w-7 h-7" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50" />
                <h3 className="text-xl font-black text-white uppercase tracking-tight">AI Insights</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-10 font-medium">
                현재 3월 학사 일정을 고려할 때, <span className="text-blue-400 font-bold underline decoration-blue-500/30 underline-offset-8">인사 예절</span> 및 <span className="text-blue-400 font-bold underline decoration-blue-500/30 underline-offset-8">나 알기</span> 성취기준을 이번 주 핵심 과업으로 배치하는 것이 효율적입니다.
              </p>
              <button className="w-full py-4 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-50 transition-all shadow-2xl shadow-white/5 active:scale-95">
                Apply Strategic Path
              </button>
            </div>

            {/* System Status */}
            <div className="p-8 bg-slate-950/50 rounded-[40px] border border-slate-900">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">System Architecture</span>
                <span className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
                  Stable
                </span>
              </div>
              <div className="space-y-5">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-600">Cloud Sync</span>
                  <span className="text-slate-400">99.9%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden p-[1.5px]">
                  <div className="w-[99.9%] h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* AI Analysis Modal - PBST Professional Style */}
      {showModal && report && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-pbst-fade-in" onClick={() => setShowModal(false)} />
          <div className="glass-card relative z-10 w-full max-w-2xl bg-slate-900/90 premium-shadow animate-pbst-scale-up overflow-hidden rounded-[48px]">
            <div className="p-10 md:p-14">
              <div className="flex justify-between items-start mb-16">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-blue-500/30">
                    <TrendingUp className="text-white w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">AI 지능형 분석 보고서</h2>
                    <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-[10px] mt-2 flex items-center gap-3">
                       EDUCATIONAL INSIGHT ENGINE
                       <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full border border-blue-500/20 text-[8px]">V2.4</span>
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center hover:bg-slate-800 transition-all group"
                >
                  <AlertCircle className="w-6 h-6 text-slate-700 group-hover:text-white transition-colors" />
                </button>
              </div>

              <div className="space-y-16">
                <div className="p-10 bg-blue-600/[0.03] rounded-[40px] border border-blue-500/10 backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[40px] rounded-full -mr-16 -mt-16" />
                  <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                    <GraduationCap className="w-4 h-4" /> 종합 분석 의견: {report.student_name}
                  </h4>
                  <p className="text-xl font-medium text-slate-200 leading-relaxed italic pr-6 underline decoration-blue-500/10 decoration-8 underline-offset-[-2px]">
                    &quot;{report.summary.replace(/"/g, '&quot;')}&quot;
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-3">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50" /> 
                      우수 발달 영역
                    </h5>
                    <div className="flex flex-wrap gap-3">
                      {report.strengths?.map((s: string) => (
                        <span key={s} className="px-5 py-3 bg-slate-950/80 text-slate-400 rounded-2xl border border-slate-900 text-[11px] font-bold hover:border-emerald-500/30 hover:text-emerald-400 transition-all cursor-default">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h5 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] flex items-center gap-3">
                       <div className="w-2.5 h-2.5 bg-amber-500 rounded-full shadow-lg shadow-amber-500/50" />
                       중점 지원 권장
                    </h5>
                    <div className="flex flex-wrap gap-3">
                      {report.needs_improvement?.map((s: string) => (
                        <span key={s} className="px-5 py-3 bg-slate-950/80 text-slate-400 rounded-2xl border border-slate-900 text-[11px] font-bold hover:border-amber-500/30 hover:text-amber-400 transition-all cursor-default">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-12 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-8">
                  <p className="text-[10px] font-bold text-slate-600 max-w-[320px] leading-relaxed">본 분석은 참고용이며, 최종 판단은 담당 교사의 전문적 견해와 개별화 교육 지원 도구로서 활용되어야 합니다.</p>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="w-full sm:w-auto px-14 py-5 bg-white text-slate-950 rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-blue-50 transition-all shadow-2xl active:scale-95"
                  >
                    Close Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer Utility */}
      <footer className="pbst-container py-12 border-t border-slate-900 flex justify-between items-center">
        <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">© 2026 경은PBST Professional Platform · Phase 2 Deployment</p>
        <div className="flex gap-10 text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">
          <a href="#" className="hover:text-blue-500 transition-colors">Privacy</a>
          <a href="#" className="hover:text-blue-500 transition-colors">Security</a>
          <a href="#" className="hover:text-blue-500 transition-colors">System</a>
        </div>
      </footer>
    </div>
  );
}
