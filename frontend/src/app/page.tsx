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
    <div className="min-h-screen p-6 md:p-12 flex flex-col items-center">
      <div className="premium-bg" />

      <header className="relative z-10 text-center mb-16">
        <h1 className="text-5xl md:text-6xl mb-4">
          <span className="gradient-text">
            GSTC PREMIUM
          </span>
        </h1>
        <p className="category-title" style={{ justifyContent: 'center' }}>Diamond Special Education Platform</p>
      </header>

      <div className="relative z-10 w-full max-w-7xl space-y-12 mb-32">
        {roleCategories.map((category) => (
          <section key={category.title}>
            <h2 className="category-title">
              {category.title}
            </h2>
            <div className="role-grid">
              {category.roles.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`role-card ${selectedRole === role ? "active" : ""}`}
                >
                  {role}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {selectedRole && (
        <div 
          style={{ 
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', 
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 
          }}
        >
          <div className="glass-container" style={{ padding: '60px', width: '100%', maxWidth: '440px' }}>
            <div className="text-center mb-10">
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '20px' }}>🔒</span>
              <p className="category-title" style={{ justifyContent: 'center', marginBottom: '8px' }}>Authenticated Login</p>
              <h2 style={{ fontSize: '32px', fontWeight: 900 }}>{selectedRole}</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="password"
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                style={{ 
                  width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '20px', padding: '24px', textAlign: 'center', color: 'white',
                  fontSize: '24px', fontWeight: 900, outline: 'none'
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button
                onClick={handleLogin}
                className="premium-button"
                style={{ width: '100%', fontSize: '14px', letterSpacing: '0.2em' }}
              >
                ACCESS PLATFORM
              </button>
              <button 
                onClick={() => {setSelectedRole(null); setPassword("");}}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', fontWeight: 700, cursor: 'pointer', padding: '10px' }}
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
