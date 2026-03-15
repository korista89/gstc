"use client";

import { useState, useEffect } from "react";
import GlobalNav from "@/components/GlobalNav";
import { 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Calendar,
  ArrowUpRight,
  GraduationCap
} from "lucide-react";

interface Student {
  학생이름: string;
  학급명: string;
  담당과목: string[];
  progress?: number;
}

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/v1/assessment/students");
      const data = await res.json();
      // Add mock progress for visual flair
      const enhancedData = data.map((s: any) => ({
        ...s,
        progress: Math.floor(Math.random() * 60) + 20
      }));
      setStudents(enhancedData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { name: "전체 학생", value: students.length, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "평균 진도율", value: "32%", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
    { name: "오늘의 완료", value: "12건", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { name: "미평가 항목", value: "45개", icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 pt-28 pb-20 overflow-x-hidden">
      <GlobalNav />
      <main className="max-w-[1600px] mx-auto px-8">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded-full border border-blue-500/20">SYSTEM ACTIVE</span>
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">2026 Academic Year</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-white mb-2">지능형 교육과정 <span className="gradient-text">대시보드</span></h1>
            <p className="text-slate-400 font-medium text-lg">실시간 학생 데이터 분석 및 AI 기반 맞춤형 진도 관리</p>
          </div>
          <button className="mt-6 md:mt-0 flex items-center gap-2 px-8 py-4 bg-white text-slate-950 rounded-2xl font-black hover:bg-blue-50 transition-all premium-shadow">
            AI 분석 보고서 생성
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </section>

        {/* Statistics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="glass p-6 rounded-[32px] border border-white/5 relative overflow-hidden group hover:border-blue-500/30 transition-all animate-fade-in" style={{animationDelay: `${i * 100}ms`}}>
              <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <p className="text-slate-400 text-sm font-bold mb-1">{stat.name}</p>
              <h4 className="text-3xl font-black text-white">{stat.value}</h4>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
            </div>
          ))}
        </section>

        {/* Content Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main List */}
          <section className="xl:col-span-2 space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Users className="text-blue-500" />
                선생님의 학생 명단
              </h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-xs font-black text-slate-400 hover:text-white transition-all">최신순</button>
                <button className="px-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-xs font-black text-slate-400 hover:text-white transition-all">진도순</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="h-48 glass rounded-[32px] animate-pulse" />
                ))
              ) : (
                students.map((student, idx) => (
                  <div key={idx} className="glass-interactive p-6 rounded-[32px] relative overflow-hidden animate-fade-in" style={{animationDelay: `${idx * 50}ms`}}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-4 items-center">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-white/5 font-black text-xl text-blue-500">
                          {student.학생이름[0]}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{student.학급명}</p>
                          <h3 className="text-2xl font-black text-white">{student.학생이름}</h3>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">성취 지수</p>
                        <p className="text-2xl font-black text-emerald-400">{student.progress}%</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="h-2.5 bg-slate-900/50 rounded-full overflow-hidden p-[1px] border border-white/5">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-1000"
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-bold">
                        <div className="flex gap-2">
                          {student.담당과목?.slice(0, 2).map(sub => (
                            <span key={sub} className="px-2 py-0.5 rounded-md bg-slate-800 border border-white/5 text-slate-400">{sub}</span>
                          ))}
                        </div>
                        <span className="text-slate-500">다음 목표: 성취기준 [2국01-03]</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Sidebar Section */}
          <section className="space-y-8">
            <div className="glass p-8 rounded-[40px] border border-white/5 premium-shadow">
              <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                <Calendar className="text-purple-500" />
                학사 일정 연계 제안
              </h3>
              <div className="space-y-6">
                {[
                  { title: "현근이의 생일 파티", date: "3월 15일", tag: "생활", color: "bg-blue-500" },
                  { title: "학교 주변 봄 나들이", date: "3월 28일", tag: "계절", color: "bg-emerald-500" },
                  { title: "교통 안전 교육", date: "4월 2일", tag: "안전", color: "bg-rose-500" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 group cursor-pointer">
                    <div className={`w-1 h-12 ${item.color} rounded-full opacity-30 group-hover:opacity-100 transition-all`} />
                    <div>
                      <p className="text-xs font-black text-slate-500 mb-1">{item.date} • {item.tag}</p>
                      <p className="font-bold text-slate-200 group-hover:text-white transition-colors">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-4 bg-slate-900 border border-white/5 rounded-2xl text-xs font-black text-slate-400 hover:bg-slate-800 transition-all">전체 일정 보기</button>
            </div>

            <div className="glass p-8 rounded-[40px] border border-white/5 bg-gradient-to-br from-blue-600/10 to-transparent">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">AI 인사이트</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                현재 3월 학사 일정을 고려할 때, <span className="text-blue-400 font-bold">인사 예절</span> 및 <span className="text-blue-400 font-bold">나 알기</span> 성취기준을 우선 배치하는 것을 추천합니다. 85%의 교사들이 이 경로를 선택했습니다.
              </p>
              <button className="w-full py-4 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">데이터 매칭 시작</button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
