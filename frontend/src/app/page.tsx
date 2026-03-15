"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [password, setPassword] = useState("");

  const kindergarten = ["유난초 담임", "유난초 부담임", "유백합 담임", "유백합 부담임"];
  const elementary = Array.from({ length: 6 }, (_, i) => [
    `초${i + 1}-1 담임`, `초${i + 1}-1 부담임`,
    `초${i + 1}-2 담임`, `초${i + 1}-2 부담임`
  ]).flat();
  const middle = [
    ...Array.from({ length: 3 }, (_, i) => [
      `중${i + 1}-1 담임`, `중${i + 1}-1 부담임`,
      `중${i + 1}-2 담임`, `중${i + 1}-2 부담임`
    ]).flat(),
    "중순회 담임", "중교과전담"
  ];
  const high = Array.from({ length: 3 }, (_, i) => [
    `고${i + 1}-1 담임`, `고${i + 1}-1 부담임`,
    `고${i + 1}-2 담임`, `고${i + 1}-2 부담임`
  ]).flat();
  const vocational = [
    ...Array.from({ length: 2 }, (_, i) => [
      `전${i + 1}-1 담임`, `전${i + 1}-1 부담임`,
      `전${i + 1}-2 담임`, `전${i + 1}-2 부담임`,
      `전${i + 1}-3 담임`, `전${i + 1}-3 부담임`
    ]).flat(),
    "전교과전담"
  ];

  const roles = [...kindergarten, ...elementary, ...middle, ...high, ...vocational, "관리자"];

  const handleLogin = () => {
    if (password === "ges2811") {
      // Save role info and navigate
      localStorage.setItem("gstc_role", selectedRole || "");
      router.push("/setup");
    } else {
      alert("비밀번호가 틀렸습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col items-center">
      <h1 className="text-4xl font-black mb-8 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
        GSTC 플랫폼 로그인
      </h1>

      <div className="grid grid-cols-6 md:grid-cols-9 gap-3 max-w-5xl mb-12">
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`p-3 rounded-xl border transition-all text-xs font-bold ${
              selectedRole === role
                ? "bg-blue-600 border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.5)] scale-105"
                : "bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800"
            } active:scale-95`}
          >
            {role}
          </button>
        ))}
      </div>

      {selectedRole && (
        <div className="fixed bottom-12 bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <p className="mb-4 text-center font-bold text-blue-300">{selectedRole} 로그인</p>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleLogin}
              className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-bold transition-colors"
            >
              입장
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
