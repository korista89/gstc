"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Check, ChevronRight } from "lucide-react";
import PBSTLogo from "@/components/PBSTLogo";
import styles from "./setup.module.css";
import { gradeSubjects } from "@/data/config";

function extractGrade(role: string): string {
  const m = role.match(/^(초|중|고)(\d)/);
  if (m) return `${m[1]}${m[2]}`;
  if (role.startsWith("유")) return "초1";
  if (role.startsWith("전")) return "고3";
  if (role.includes("중")) return "중1";
  if (role.includes("고")) return "고1";
  return "고1";
}

export default function SetupPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [grade, setGrade] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const savedRole = localStorage.getItem("gstc_role");
    if (!savedRole) {
      router.push("/");
      return;
    }
    
    setRole(savedRole);
    const g = extractGrade(savedRole);
    setGrade(g);
    localStorage.setItem("gstc_grade", g);
    setAvailableSubjects(gradeSubjects[g] || []);
    
    const savedSubjects = localStorage.getItem("gstc_subjects");
    if (savedSubjects) {
      setSelectedSubjects(JSON.parse(savedSubjects));
    }
  }, [router]);

  const toggleSubject = (sub: string) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(sub)) return prev.filter((s) => s !== sub);
      if (prev.length >= 5) return prev;
      return [...prev, sub];
    });
  };

  const handleSave = async () => {
    if (selectedSubjects.length === 0) return;
    
    setIsSaving(true);
    try {
      const res = await fetch("/api/v1/auth/setup-subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, selected_subjects: selectedSubjects }),
      });

      if (res.ok) {
        localStorage.setItem("gstc_subjects", JSON.stringify(selectedSubjects));
        router.push("/dashboard");
      } else {
        localStorage.setItem("gstc_subjects", JSON.stringify(selectedSubjects));
        router.push("/dashboard");
      }
    } catch {
      localStorage.setItem("gstc_subjects", JSON.stringify(selectedSubjects));
      router.push("/dashboard");
    } finally {
      setIsSaving(false);
    }
  };

  if (!role) return null;

  return (
    <div className={styles.container}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      
      <div className={styles.setupCard}>
        <div className={styles.header}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <PBSTLogo size={64} />
          </div>
          <h1 className={styles.title}>환경 설정</h1>
          <p className={styles.subtitle}>
            <strong>{role}</strong> 과정에서 우선적으로 관리할 교과를 선택합니다.
            선택한 교과는 대시보드와 관리 화면에 기본으로 표시됩니다.<br/>
            최대 5개까지 선택 가능합니다.
          </p>
        </div>

        <div className={styles.alertBox}>
          <BookOpen className={styles.icon} />
          최소 1개 이상의 교과를 선택해야 시스템 시작이 가능합니다. ({selectedSubjects.length}/5)
        </div>
        
        <div className={styles.actionArea}>
          <div className={styles.subjectGrid}>
            {availableSubjects.map((subject) => {
              const isSelected = selectedSubjects.includes(subject);
              return (
                <button
                  key={subject}
                  onClick={() => toggleSubject(subject)}
                  className={`${styles.subjectBtn} ${isSelected ? styles.subjectSelected : ''}`}
                >
                  {isSelected && <Check className={styles.iconCheck} />}
                  {subject}
                </button>
              );
            })}
          </div>

          <button 
            onClick={handleSave} 
            disabled={selectedSubjects.length === 0 || isSaving}
            className={styles.submitBtn}
          >
            {isSaving ? "설정 저장 중..." : "대시보드 시작하기"}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      
      <footer style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#94a3b8', zIndex: 10 }}>
        © 2026 Gyeongun School Configuration System. Secure Access Only.
      </footer>
    </div>
  );
}
