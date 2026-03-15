"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PASSWORD, ROLES } from "@/data/config";
import PBSTLogo from "@/components/PBSTLogo";
import { Lock } from "lucide-react";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>(ROLES[0]);
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
        
        <h1 className={styles.title}>경은GSTC</h1>
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
