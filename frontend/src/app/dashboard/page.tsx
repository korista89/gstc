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
  Activity
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
    { name: "행동 분석", value: "24회", icon: Activity, color: "text-rose-500", bg: "bg-rose-500/10", label: "실시간 감지" },
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
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-[1600px] mx-auto px-8 pt-32 pb-20">
        {/* Top Header Section */}
        <section className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded-full border border-blue-500/20">
                <LayoutDashboard className="w-3 h-3" />
                PBIS DASHBOARD
              </span>
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">2026 1학기 학급 운영</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-white mb-3">
              선생님, 좋은 아침입니다. <span className="text-blue-500">경은PBST</span>가<br />학생들의 성장을 돕고 있습니다.
            </h1>
            <p className="text-slate-400 font-medium text-lg max-w-2xl">데이터 기반의 개별화 교육과정(IEP) 분석과 긍정적 행동 지원(PBIS) 리포트를 실시간으로 확인하세요.</p>
          </div>
          <div className="flex gap-3 mt-8 lg:mt-0">
            <button className="flex items-center gap-2 px-6 py-4 bg-slate-900 border border-white/5 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all">
              최근 활동 로그
            </button>
            <button 
              onClick={generateReport}
              disabled={analyzing}
              className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {analyzing ? "분석 중..." : "AI 통합 분석 리포트"}
              <ArrowUpRight className={`w-5 h-5 ${analyzing ? "animate-bounce" : ""}`} />
            </button>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, i) => (
            <div key={i} className="glass p-8 rounded-[32px] border border-white/5 relative overflow-hidden group hover:border-blue-500/30 transition-all animate-fade-in" style={{animationDelay: `${i * 100}ms`}}>
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 ${stat.bg} rounded-[20px] flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <span className="px-2 py-1 bg-white/5 rounded-lg text-[10px] font-black text-slate-500 uppercase">{stat.label}</span>
              </div>
              <p className="text-slate-400 text-sm font-bold mb-1">{stat.name}</p>
              <h4 className="text-4xl font-black text-white">{stat.value}</h4>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-12 -mt-12 opacity-50" />
            </div>
          ))}
        </section>

        {/* Content Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
          {/* Main Student List Section */}
          <section className="xl:col-span-3 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-black text-white">학급 학생 명단</h2>
                <span className="px-3 py-1 bg-slate-900 border border-white/5 rounded-full text-xs font-bold text-slate-500">{students.length} Total</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-grow sm:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="학생 검색..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="p-3 bg-slate-900 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all">
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-64 glass rounded-[40px] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
                  </div>
                ))
              ) : (
                students.filter(s => s.student_name.includes(searchQuery)).map((student, idx) => (
                  <div key={idx} className="group glass-interactive p-8 rounded-[40px] relative overflow-hidden animate-fade-in" style={{animationDelay: `${idx * 50}ms`}}>
                    <div className="flex justify-between items-start mb-8 text-white">
                      <div className="flex gap-5 items-center">
                        <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center border border-white/10 group-hover:border-blue-500/30 transition-all relative overflow-hidden">
                          <span className="text-3xl font-black relative z-10">{student.student_name[0]}</span>
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-1 bg-slate-900 border border-white/10 text-slate-400 text-[10px] font-black rounded-lg">
                              {student.class_name}
                            </span>
                            <span 
                              className="px-2.5 py-1 text-[10px] font-black rounded-lg text-white"
                              style={{ backgroundColor: getTierColor(student.tier || 1) + '20', color: getTierColor(student.tier || 1), border: `1px solid ${getTierColor(student.tier || 1)}40` }}
                            >
                              TIER {student.tier}
                            </span>
                          </div>
                          <h3 className="text-2xl font-black group-hover:text-blue-400 transition-colors uppercase">{student.student_name}</h3>
                          <p className="text-xs font-bold text-slate-500 mt-1">최근 평가: 2시간 전</p>
                        </div>
                      </div>
                      <button className="p-2 text-slate-500 hover:text-white transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-2 px-1">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">목표 달성도</span>
                          <span className="text-sm font-black text-white">{student.progress}%</span>
                        </div>
                        <div className="h-3 bg-slate-900/80 rounded-full overflow-hidden p-[2.5px] border border-white/5">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-emerald-400 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all duration-1000 ease-out"
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-2xl border border-white/5">
                        <div className="flex -space-x-2">
                          {student.subjects.slice(0, 3).map((sub, i) => (
                            <div key={sub} className="w-8 h-8 rounded-full bg-slate-800 border border-slate-950 flex items-center justify-center text-[10px] font-black text-slate-400" title={sub}>
                              {sub[0]}
                            </div>
                          ))}
                          {student.subjects.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-950 flex items-center justify-center text-[10px] font-black text-blue-500">
                              +{student.subjects.length - 3}
                            </div>
                          )}
                        </div>
                        <button className="px-6 py-2.5 bg-white text-slate-950 rounded-xl text-xs font-black hover:bg-blue-50 transition-all shadow-lg active:scale-95">
                          상세 리포트
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
            <div className="glass p-8 rounded-[40px] border border-white/5 group">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-white flex items-center gap-3">
                  <Calendar className="text-blue-500" />
                  학사 일정
                </h3>
                <span className="text-[10px] font-black text-slate-500 uppercase">March 2026</span>
              </div>
              <div className="space-y-6">
                {[
                  { title: "현근이 생일 지도", date: "03.15", tag: "생활", color: "bg-blue-500" },
                  { title: "학교 주변 봄 나들이", date: "03.28", tag: "체험", color: "bg-emerald-500" },
                  { title: "장애 인식 개선 교육", date: "04.02", tag: "교육", color: "bg-purple-500" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-5 group/item cursor-pointer">
                    <div className="text-center min-w-[40px]">
                      <p className="text-[10px] font-black text-slate-600 group-hover/item:text-blue-500 transition-colors uppercase">{item.date.split('.')[0]}월</p>
                      <p className="text-lg font-black text-white">{item.date.split('.')[1]}</p>
                    </div>
                    <div className="flex-grow pt-1">
                      <p className="text-[10px] font-black text-slate-500 mb-1">{item.tag}</p>
                      <p className="font-bold text-slate-200 group-hover/item:text-white transition-colors">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-4 bg-slate-900/50 border border-white/5 rounded-2xl text-[10px] font-black text-slate-500 hover:text-white hover:bg-slate-800 transition-all uppercase tracking-widest">Full Calendar</button>
            </div>

            {/* AI Insight Card */}
            <div className="glass p-8 rounded-[40px] border border-white/5 bg-gradient-to-br from-blue-600/10 to-transparent relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[40px] rounded-full -mr-16 -mt-16" />
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                <GraduationCap className="text-white w-7 h-7" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <h3 className="text-xl font-black text-white">AI 인사이트</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium">
                현재 3월 학사 일정을 고려할 때, <span className="text-blue-400 font-bold underline decoration-blue-500/30 underline-offset-4">인사 예절</span> 및 <span className="text-blue-400 font-bold underline decoration-blue-500/30 underline-offset-4">나 알기</span> 성취기준을 이번 주 핵심 과업으로 배치하는 것이 효율적입니다.
              </p>
              <button className="w-full py-4 bg-white text-slate-950 rounded-2xl text-xs font-black hover:bg-blue-50 transition-all shadow-xl active:scale-95">
                추천 경로 적용하기
              </button>
            </div>

            {/* System Status */}
            <div className="p-6 bg-slate-900/30 rounded-[32px] border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">시스템 상태</span>
                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Stable
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-500">서버 연결</span>
                  <span className="text-slate-300">99.9%</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-[99.9%] h-full bg-emerald-500 rounded-full" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* AI Analysis Modal - PBST Professional Style */}
      {showModal && report && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl animate-fade-in" onClick={() => setShowModal(false)} />
          <div className="glass relative z-10 w-full max-w-2xl bg-slate-900/80 border border-white/10 premium-shadow animate-scale-up overflow-hidden rounded-[48px]">
            <div className="p-10 md:p-14">
              <div className="flex justify-between items-start mb-12">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-blue-600 rounded-[28px] flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <TrendingUp className="text-white w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white">AI 지능형 분석 보고서</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1.5 flex items-center gap-2">
                       EDUCATIONAL INSIGHT ENGINE
                       <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full border border-blue-500/20">V2.4</span>
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center hover:bg-slate-700 transition-all group"
                >
                  <AlertCircle className="w-6 h-6 text-slate-500 group-hover:text-white transition-colors" />
                </button>
              </div>

              <div className="space-y-12">
                <div className="p-10 bg-blue-600/5 rounded-[40px] border border-blue-500/10 backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[40px] rounded-full -mr-16 -mt-16" />
                  <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6 flex items-center gap-3">
                    <GraduationCap className="w-4 h-4" /> 종합 분석 의견: {report.student_name}
                  </h4>
                  <p className="text-xl font-medium text-slate-100 leading-relaxed italic">
                    &quot;{report.summary.replace(/"/g, '&quot;')}&quot;
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-5">
                    <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" /> 
                      우수 발달 영역
                    </h5>
                    <div className="flex flex-wrap gap-2.5">
                      {report.strengths?.map((s: string) => (
                        <span key={s} className="px-4 py-2.5 bg-slate-950/50 text-slate-300 rounded-2xl border border-white/5 text-[11px] font-bold group-hover:border-emerald-500/30 transition-all">
                          {s}
                        </span>
                      ))}
                      {(!report.strengths || report.strengths.length === 0) && <p className="text-slate-600 text-xs font-bold">분석 데이터 생성 중...</p>}
                    </div>
                  </div>
                  <div className="space-y-5">
                    <h5 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
                       <div className="w-2 h-2 bg-amber-500 rounded-full" />
                       중점 지원 권장
                    </h5>
                    <div className="flex flex-wrap gap-2.5">
                      {report.needs_improvement?.map((s: string) => (
                        <span key={s} className="px-4 py-2.5 bg-slate-950/50 text-slate-300 rounded-2xl border border-white/5 text-[11px] font-bold transition-all">
                          {s}
                        </span>
                      ))}
                      {(!report.needs_improvement || report.needs_improvement.length === 0) && <p className="text-slate-600 text-xs font-bold">균형 있는 발달 관찰됨</p>}
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <p className="text-[10px] font-bold text-slate-500">본 분석은 참고용이며, 최종 판단은 담당 교사의 전문적 견해를 따릅니다.</p>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="w-full sm:w-auto px-12 py-5 bg-white text-slate-950 rounded-[20px] font-black hover:bg-blue-50 transition-all shadow-xl shadow-white/5"
                  >
                    리포트 닫기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer Utility */}
      <footer className="max-w-[1600px] mx-auto px-8 py-10 border-t border-white/5 flex justify-between items-center opacity-40">
        <p className="text-xs font-bold text-slate-500">© 2026 경은PBST Professional Platform. All rights reserved.</p>
        <div className="flex gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
          <a href="#" className="hover:text-white">Privacy</a>
          <a href="#" className="hover:text-white">Terms</a>
          <a href="#" className="hover:text-white">Support</a>
        </div>
      </footer>
    </div>
  );
}
