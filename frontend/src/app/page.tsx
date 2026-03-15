"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PASSWORD } from "@/data/config";
import PBSTLogo from "@/components/PBSTLogo";
import { Shield, ChevronRight, GraduationCap, Users, BookOpen, Briefcase, Cpu } from "lucide-react";

const roleCategories = [
  {
    title: "유치원",
    icon: <GraduationCap className="w-4 h-4" />,
    roles: ["유난초 담임", "유난초 부담임", "유백합 담임", "유백합 부담임"],
  },
  {
    title: "초등학교",
    icon: <Users className="w-4 h-4" />,
    roles: [
      "초1-1 담임", "초1-1 부담임", "초1-2 담임", "초1-2 부담임", "초1-3 담임", "초1-3 부담임",
      "초2-1 담임", "초2-1 부담임", "초2-2 담임", "초2-2 부담임", "초2-3 담임", "초2-3 부담임",
      "초3-1 담임", "초3-1 부담임", "초3-2 담임", "초3-2 부담임", "초3-3 담임", "초3-3 부담임",
      "초4-1 담임", "초4-1 부담임", "초4-2 담임", "초4-2 부담임", "초4-3 담임", "초4-3 부담임",
      "초5-1 담임", "초5-1 부담임", "초5-2 담임", "초5-2 부담임", "초5-3 담임", "초5-3 부담임",
      "초6-1 담임", "초6-1 부담임", "초6-2 담임", "초6-2 부담임", "초6-3 담임", "초6-3 부담임",
    ],
  },
  {
    title: "중학교",
    icon: <BookOpen className="w-4 h-4" />,
    roles: [
      "중1-1 담임", "중1-1 부담임", "중1-2 담임", "중1-2 부담임", "중1-3 담임", "중1-3 부담임",
      "중2-1 담임", "중2-1 부담임", "중2-2 담임", "중2-2 부담임",
      "중3-1 담임", "중3-1 부담임", "중3-2 담임", "중3-2 부담임",
      "중순회 담임", "중교과전담",
    ],
  },
  {
    title: "고등학교",
    icon: <Briefcase className="w-4 h-4" />,
    roles: [
      "고1-1 담임", "고1-1 부담임", "고1-2 담임", "고1-2 부담임",
      "고2-1 담임", "고2-1 부담임", "고2-2 담임", "고2-2 부담임",
      "고3-1 담임", "고3-1 부담임", "고교과전담",
    ],
  },
  {
    title: "전공과",
    icon: <Cpu className="w-4 h-4" />,
    roles: [
      "전1-1 담임", "전1-1 부담임",
      "전2-1 담임", "전2-1 부담임", "전2-2 담임", "전2-2 부담임", "전2-3 담임", "전2-3 부담임",
      "전교과전담",
    ],
  },
  { title: "기타", icon: <Shield className="w-4 h-4" />, roles: ["진로전담", "진로직업센터", "관리자"] },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (password === PASSWORD) {
      localStorage.setItem("gstc_role", selectedRole || "");
      router.push("/setup");
    } else {
      setError("비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 overflow-hidden relative">
      {/* Decorative Background Blobs */}
      <div className="pbst-blob bg-blue-600 w-[500px] h-[500px] -top-48 -left-48" />
      <div className="pbst-blob bg-indigo-600 w-[400px] h-[400px] top-1/2 -right-48" />
      <div className="pbst-blob bg-purple-600 w-[300px] h-[300px] -bottom-24 left-1/4" />

      {/* Main Content */}
      <div className="relative z-10 pbst-container min-h-screen flex flex-col items-center">
        <header className="text-center mb-16 animate-pbst-fade-in">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 scale-150" />
              <PBSTLogo size={96} className="relative z-10 border-4 border-slate-900/50 shadow-2xl" />
            </div>
          </div>
          <h1 className="pbst-h1 mb-3">
            <span className="gradient-text">경은PBST</span>
          </h1>
          <p className="pbst-label text-slate-400">
            Professional Behavior Support Team Platform
          </p>
        </header>

        <div className="w-full max-w-6xl space-y-12 pb-32">
          {roleCategories.map((category, idx) => (
            <section 
              key={category.title} 
              className="animate-pbst-fade-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 shadow-lg">
                  {category.icon}
                </div>
                <h2 className="pbst-h2 !text-xl !font-bold flex items-center gap-3">
                  {category.title}
                  <span className="pbst-label !text-[9px] text-slate-500 opacity-50">Division</span>
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-slate-800 to-transparent" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {category.roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setSelectedRole(role);
                      setPassword("");
                      setError("");
                    }}
                    className={`group relative p-4 rounded-2xl text-sm font-bold transition-all duration-300 border text-left flex flex-col justify-between h-28 ${
                      selectedRole === role
                        ? "bg-blue-600/10 border-blue-500 text-white shadow-[0_0_30px_rgba(59,130,246,0.15)]"
                        : "bg-slate-900/40 border-slate-800/50 text-slate-400 hover:bg-slate-800/60 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <span className="relative z-10">{role}</span>
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-black uppercase tracking-widest ${
                        selectedRole === role ? "text-blue-400" : "text-slate-600"
                      }`}>Access</span>
                      <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${
                        selectedRole === role ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                      }`} />
                    </div>
                    {selectedRole === role && (
                      <div className="absolute inset-0 bg-blue-500/5 rounded-2xl animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Login Modal */}
      {selectedRole && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-card p-10 w-full max-w-sm animate-pbst-scale-up border-slate-700/50 bg-slate-900/80">
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto mb-6 shadow-xl">
                <Shield className="w-8 h-8" />
              </div>
              <p className="pbst-label mb-2">Security Verification</p>
              <h2 className="text-2xl font-black gradient-text tracking-tight">{selectedRole}</h2>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  autoFocus
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-2xl px-6 py-4 text-center text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all font-bold placeholder:text-slate-600"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              
              {error && (
                <p className="text-rose-400 text-xs font-bold text-center animate-bounce">{error}</p>
              )}

              <button
                onClick={handleLogin}
                className="w-full pbst-button-primary !py-4 flex items-center justify-center gap-2"
              >
                시스템 접속
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSelectedRole(null)}
                className="w-full text-slate-500 text-sm font-bold py-2 hover:text-slate-300 transition-colors"
              >
                다른 직무 선택하기
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer Branding */}
      <footer className="fixed bottom-0 left-0 w-full p-8 relative z-10 flex justify-between items-end">
        <div className="hidden md:block">
          <p className="text-[10px] font-black text-slate-700 tracking-[0.2em] uppercase">
            © 2026 Gyeongun PBST Professional System
          </p>
        </div>
        <div className="px-6 py-2 rounded-full glass border-blue-500/10 text-[10px] font-black text-blue-500/50 tracking-widest uppercase animate-pulse">
          Secure Environment
        </div>
      </footer>
    </div>
  );
}
