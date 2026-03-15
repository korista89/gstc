"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [password, setPassword] = useState("");

  const roleCategories = [
    { title: "유치원", roles: ["유난초 담임", "유난초 부담임", "유백합 담임", "유백합 부담임"] },
    { 
      title: "초등학교", 
      roles: [
        "초1-1 담임", "초1-1 부담임", "초1-2 담임", "초1-2 부담임", "초1-3 담임", "초1-3 부담임",
        "초2-1 담임", "초2-1 부담임", "초2-2 담임", "초2-2 부담임", "초2-3 담임", "초2-3 부담임",
        "초3-1 담임", "초3-1 부담임", "초3-2 담임", "초3-2 부담임", "초3-3 담임", "초3-3 부담임",
        "초4-1 담임", "초4-1 부담임", "초4-2 담임", "초4-2 부담임", "초4-3 담임", "초4-3 부담임",
        "초5-1 담임", "초5-1 부담임", "초5-2 담임", "초5-2 부담임", "초5-3 담임", "초5-3 부담임",
        "초6-1 담임", "초6-1 부담임", "초6-2 담임", "초6-2 부담임", "초6-3 담임", "초6-3 부담임",
      ] 
    },
    { 
      title: "중학교", 
      roles: [
        "중1-1 담임", "중1-1 부담임", "중1-2 담임", "중1-2 부담임", "중1-3 담임", "중1-3 부담임",
        "중2-1 담임", "중2-1 부담임", "중2-2 담임", "중2-2 부담임",
        "중3-1 담임", "중3-1 부담임", "중3-2 담임", "중3-2 부담임",
        "중순회 담임", "중교과전담"
      ] 
    },
    { 
      title: "고등학교", 
      roles: [
        "고1-1 담임", "고1-1 부담임", "고1-2 담임", "고1-2 부담임",
        "고2-1 담임", "고2-1 부담임", "고2-2 담임", "고2-2 부담임",
        "고3-1 담임", "고3-1 부담임", "고교과전담"
      ] 
    },
    { 
      title: "전공과", 
      roles: [
        "전1-1 담임", "전1-1 부담임", "전2-1 담임", "전2-1 부담임", "전2-2 담임", "전2-2 부담임", "전2-3 담임", "전2-3 부담임",
        "전교과전담"
      ] 
    },
    { title: "기타", roles: ["진로전담", "진로직업센터", "관리자"] }
  ];

  const handleLogin = () => {
    if (password === "ges2811") {
      localStorage.setItem("gstc_role", selectedRole || "");
      router.push("/setup");
    } else {
      alert("비밀번호가 틀렸습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 flex flex-col items-center">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[160px]" />
      </div>

      <header className="relative z-10 text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4">
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            GSTC PREMIUM
          </span>
        </h1>
        <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Diamond Special Education Platform</p>
      </header>

      <div className="relative z-10 w-full max-w-7xl space-y-12 mb-32">
        {roleCategories.map((category) => (
          <section key={category.title} className="space-y-4">
            <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="w-8 h-[1px] bg-slate-800"></span>
              {category.title}
              <span className="flex-1 h-[1px] bg-slate-800"></span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {category.roles.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`group relative p-3 rounded-2xl border transition-all duration-300 ${
                    selectedRole === role
                      ? "bg-blue-600/20 border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.4)] scale-105 z-20"
                      : "bg-slate-900/40 border-slate-800 hover:border-slate-600 hover:bg-slate-900/60"
                  }`}
                >
                  <div className={`text-[10px] sm:text-xs font-bold leading-tight ${
                    selectedRole === role ? "text-blue-200" : "text-slate-500 group-hover:text-slate-300"
                  }`}>
                    {role}
                  </div>
                  {selectedRole === role && (
                    <div className="absolute inset-0 bg-blue-400/5 rounded-2xl animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {selectedRole && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-slate-950 p-10 rounded-[40px] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] w-full max-w-md animate-in zoom-in-95 duration-300">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                <span className="text-4xl text-blue-500">🔒</span>
              </div>
              <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-2">Authenticated Login</p>
              <h2 className="text-2xl font-black text-white">{selectedRole}</h2>
            </div>
            
            <div className="space-y-4">
              <input
                type="password"
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="w-full bg-black border border-white/5 rounded-2xl px-6 py-5 text-center text-xl font-black tracking-widest focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button
                onClick={handleLogin}
                className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-blue-900/40 transition-all active:scale-95"
              >
                ACCESS PLATFORM
              </button>
              <button 
                onClick={() => {setSelectedRole(null); setPassword("");}}
                className="w-full text-slate-500 text-xs font-bold hover:text-white transition-colors py-2"
              >
                GO BACK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
