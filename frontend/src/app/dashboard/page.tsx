import { normalizeStudentData, Student as InternalStudent } from "@/lib/student-data";

// Keep existing Student interface for internal use if necessary, or just use the imported one
type Student = InternalStudent;

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/v1/assessment/students");
      const data = await res.json();
      
      if (!Array.isArray(data)) {
        console.error("Data is not an array:", data);
        setStudents([]);
        return;
      }

      // Add mock progress for visual flair
      const enhancedData = data.map((s: any) => ({
        ...s,
        progress: Math.floor(Math.random() * 60) + 20
      }));
      setStudents(enhancedData);
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
      // For demo, generate for the first student if available
      const studentName = students.length > 0 ? students[0].학생이름 : "관리자";
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
          <button 
            onClick={generateReport}
            disabled={analyzing}
            className="mt-6 md:mt-0 flex items-center gap-2 px-8 py-4 bg-white text-slate-950 rounded-2xl font-black hover:bg-blue-50 transition-all premium-shadow disabled:opacity-50"
          >
            {analyzing ? "AI 분석 중..." : "AI 분석 보고서 생성"}
            <ArrowUpRight className={`w-5 h-5 ${analyzing ? "animate-bounce" : ""}`} />
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
                  <div key={i} className="h-48 glass rounded-[40px] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
                  </div>
                ))
              ) : (
                students.map((rawStudent, idx) => {
                  const student = normalizeStudentData(rawStudent);
                  return (
                    <div key={idx} className="group glass-interactive p-8 rounded-[40px] relative overflow-hidden animate-fade-in" style={{animationDelay: `${idx * 50}ms`}}>
                      <div className="flex justify-between items-start mb-8">
                        <div className="flex gap-5 items-center">
                          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center border border-white/10 font-black text-2xl text-white group-hover:scale-110 transition-transform">
                            {student.student_name[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded-full border border-blue-500/20 uppercase tracking-tighter">
                                {student.class_name}
                              </span>
                            </div>
                            <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors">{student.student_name}</h3>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">성취도</p>
                          <p className="text-3xl font-black gradient-text">{student.progress}%</p>
                        </div>
                      </div>
                      
                      <div className="space-y-5">
                        <div className="h-3 bg-slate-900/80 rounded-full overflow-hidden p-[2px] border border-white/5">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-400 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-1000 ease-out"
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            {student.subjects.slice(0, 3).map(sub => (
                              <span key={sub} className="px-3 py-1 rounded-xl bg-slate-900/50 border border-white/10 text-[11px] font-bold text-slate-300">
                                {sub}
                              </span>
                            ))}
                            {student.subjects.length > 3 && (
                              <span className="px-2 py-1 text-[11px] font-bold text-slate-500">+{student.subjects.length - 3}</span>
                            )}
                          </div>
                          <button className="flex items-center gap-1.5 text-[11px] font-black text-blue-400 hover:text-white transition-colors group/btn">
                            평가하기
                            <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
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

      {/* AI Analysis Modal */}
      {showModal && report && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setShowModal(false)} />
          <div className="glass-container relative z-10 w-full max-w-2xl p-10 md:p-16 border border-white/10 premium-shadow animate-scale-up">
            <div className="flex justify-between items-start mb-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <TrendingUp className="text-white w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white">AI 지능형 분석 결과</h2>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Experimental AI Insight</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center hover:bg-slate-800 transition-all"
              >
                <AlertCircle className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            <div className="space-y-10">
              <div className="p-8 bg-blue-600/5 rounded-[40px] border border-blue-500/10 backdrop-blur-sm">
                <h4 className="text-sm font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" /> 종합 소견: {report.student_name}
                </h4>
                <p className="text-lg font-medium text-slate-200 leading-relaxed italic">
                  &quot;{report.summary.replace(/"/g, '&quot;')}&quot;
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h5 className="text-xs font-black text-emerald-500 uppercase tracking-widest">Strengths (우수 영역)</h5>
                  <div className="flex flex-wrap gap-2">
                    {report.strengths?.map((s: string) => (
                      <span key={s} className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/10 text-xs font-black">
                        {s}
                      </span>
                    ))}
                    {(!report.strengths || report.strengths.length === 0) && <p className="text-slate-600 text-xs font-bold">분석 중...</p>}
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="text-xs font-black text-rose-500 uppercase tracking-widest">Focus Area (보충 권장)</h5>
                  <div className="flex flex-wrap gap-2">
                    {report.needs_improvement?.map((s: string) => (
                      <span key={s} className="px-4 py-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/10 text-xs font-black">
                        {s}
                      </span>
                    ))}
                    {(!report.needs_improvement || report.needs_improvement.length === 0) && <p className="text-slate-600 text-xs font-bold">균형 있는 발달 중</p>}
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 flex justify-end">
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-10 py-5 bg-white text-slate-950 rounded-2xl font-black hover:bg-blue-50 transition-all"
                >
                  확인 및 닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
