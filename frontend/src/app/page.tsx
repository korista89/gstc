"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PASSWORD } from "@/data/config";
import PBSTLogo from "@/components/PBSTLogo";
import { Lock } from "lucide-react";
import styles from "./page.module.css";

const ROLES = [
  "유난초 담임", "유난초 부담임", "유백합 담임", "유백합 부담임",
  "초1-1 담임", "초1-1 부담임", "초1-2 담임", "초1-2 부담임",
  "중1-1 담임", "중1-1 부담임", "중1-2 담임", "중1-2 부담임",
  "고1-1 담임", "고1-1 부담임", "고1-2 담임", "고1-2 부담임",
  "전공과 담임", "전공과 부담임", "관리자", "진로전담", "기타전담"
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>("초1-1 담임");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      localStorage.setItem("gstc_role", selectedRole);
      router.push("/setup");
    } else {
      setError("시스템 비밀번호가 일치하지 않습니다.");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      
      <div className={styles.loginCard}>
        <div className={styles.logoWrapper}>
          <PBSTLogo size={80} />
        </div>
        
        <h1 className={styles.title}>경은SST</h1>
        <p className={styles.subtitle}>교사교육과정 성취기준 관리 시스템</p>

        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="role-select">담당 학급 / 직무</label>
            <select 
              id="role-select"
              className={styles.input}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              {ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password-input">접근 암호</label>
            <input
              id="password-input"
              type="password"
              className={styles.input}
              placeholder="시스템 비밀번호 입력"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
            />
            {error && (
              <div className={styles.error}>
                <span style={{ fontSize: '14px' }}>⚠️</span> {error}
              </div>
            )}
          </div>

          <button type="submit" className={styles.button}>
            <Lock size={18} />
            시스템 접속
          </button>
        </form>
      </div>

      <footer style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#94a3b8', zIndex: 10 }}>
        © 2026 Gyeongun School Configuration System. Secure Access Only.
      </footer>
    </div>
  );
}
