"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PASSWORD } from "@/data/config";

const roleCategories = [
  {
    title: "유치원",
    roles: ["유난초 담임", "유난초 부담임", "유백합 담임", "유백합 부담임"],
  },
  {
    title: "초등학교",
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
    roles: [
      "중1-1 담임", "중1-1 부담임", "중1-2 담임", "중1-2 부담임", "중1-3 담임", "중1-3 부담임",
      "중2-1 담임", "중2-1 부담임", "중2-2 담임", "중2-2 부담임",
      "중3-1 담임", "중3-1 부담임", "중3-2 담임", "중3-2 부담임",
      "중순회 담임", "중교과전담",
    ],
  },
  {
    title: "고등학교",
    roles: [
      "고1-1 담임", "고1-1 부담임", "고1-2 담임", "고1-2 부담임",
      "고2-1 담임", "고2-1 부담임", "고2-2 담임", "고2-2 부담임",
      "고3-1 담임", "고3-1 부담임", "고교과전담",
    ],
  },
  {
    title: "전공과",
    roles: [
      "전1-1 담임", "전1-1 부담임",
      "전2-1 담임", "전2-1 부담임", "전2-2 담임", "전2-2 부담임", "전2-3 담임", "전2-3 부담임",
      "전교과전담",
    ],
  },
  { title: "기타", roles: ["진로전담", "진로직업센터", "관리자"] },
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
      setError("비밀번호가 틀렸습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <header className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">
          GSTC
        </h1>
        <p className="text-slate-400 text-sm">
          경은학교 교사교육과정 플랫폼
        </p>
      </header>

      <div className="max-w-5xl mx-auto space-y-8 pb-24">
        {roleCategories.map((category) => (
          <section key={category.title}>
            <h2 className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-3 flex items-center gap-3">
              {category.title}
              <span className="flex-1 h-px bg-slate-800" />
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {category.roles.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setSelectedRole(role);
                    setPassword("");
                    setError("");
                  }}
                  className={`py-3 px-2 rounded-xl text-xs font-semibold transition-all border ${
                    selectedRole === role
                      ? "bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                      : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {selectedRole && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-sm">
            <div className="text-center mb-6">
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">
                로그인
              </p>
              <h2 className="text-xl font-bold">{selectedRole}</h2>
            </div>

            <div className="space-y-3">
              <input
                type="password"
                placeholder="비밀번호 입력"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                autoFocus
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-center text-white outline-none focus:border-blue-500 transition"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              {error && (
                <p className="text-red-400 text-xs text-center">{error}</p>
              )}
              <button
                onClick={handleLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
              >
                로그인
              </button>
              <button
                onClick={() => setSelectedRole(null)}
                className="w-full text-slate-500 text-sm py-2 hover:text-slate-300 transition"
              >
                뒤로가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
