"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Check, ChevronRight, Users } from "lucide-react";
import PBSTLogo from "@/components/PBSTLogo";
import styles from "./setup.module.css";
import { gradeSubjects, isHomeroomTeacher, isSubjectTeacher, CLASSES } from "@/data/config";

function extractGrade(role: string): string {
  const m = role.match(/^(초|중|고)(\d)/);
  if (m) return `${m[1]}${m[2]}`;
  if (role.startsWith("유")) return "초1";
  if (role.startsWith("전")) return "전공1";
  if (role.includes("중")) return "중1";
  if (role.includes("고")) return "고1";
  return "초1";
}

export default function SetupPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [grade, setGrade] = useState("");
  const [selectionType, setSelectionType] = useState<"subject" | "class">("subject");
  
  // For Homeroom Teachers
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  
  // For Subject Teachers
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  
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
    
    // Determine Flow Type
    if (isSubjectTeacher(savedRole) && !isHomeroomTeacher(savedRole)) {
      setSelectionType("class");
      const savedClasses = localStorage.getItem("gstc_classes");
      if (savedClasses) setSelectedClasses(JSON.parse(savedClasses));
    } else {
      setSelectionType("subject");
      setAvailableSubjects(gradeSubjects[g] || []);
      const savedSubjects = localStorage.getItem("gstc_subjects");
      if (savedSubjects) setSelectedSubjects(JSON.parse(savedSubjects));
    }
  }, [router]);

  const toggleSelection = (item: string) => {
    if (selectionType === "subject") {
      setSelectedSubjects((prev) => {
        if (prev.includes(item)) return prev.filter((s) => s !== item);
        if (prev.length >= 5) return prev;
        return [...prev, item];
      });
    } else {
      setSelectedClasses((prev) => {
        if (prev.includes(item)) return prev.filter((c) => c !== item);
        if (prev.length >= 8) return prev; // allow more classes
        return [...prev, item];
      });
    }
  };

  const currentSelections = selectionType === "subject" ? selectedSubjects : selectedClasses;
  const isAdmin = role?.includes("관리자");
  const maxSelections = isAdmin ? 1 : (selectionType === "subject" ? 5 : 8);
  const selectionName = selectionType === "subject" ? "교과" : "학급";
  const ICON = selectionType === "subject" ? BookOpen : Users;

  const handleSave = async () => {
    if (!isAdmin && currentSelections.length === 0) return;
    
    setIsSaving(true);
    try {
      let payload: any;
      if (selectionType === "subject") {
        const subjectsToSave = isAdmin ? ["전체"] : selectedSubjects;
        localStorage.setItem("gstc_subjects", JSON.stringify(subjectsToSave));
        payload = { role, selected_subjects: subjectsToSave };
      } else {
        const classesToSave = isAdmin ? ["전체"] : selectedClasses;
        localStorage.setItem("gstc_classes", JSON.stringify(classesToSave));
        payload = { role, selected_classes: classesToSave };
      }

      await fetch("/api/v1/auth/setup-subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      router.push("/dashboard");
    } catch {
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
            <strong>{role}</strong> 과정에서 우선적으로 관리할 <strong>{selectionName}</strong>를 선택합니다.
            선택한 {selectionName}는 대시보드와 관리 화면에 기본으로 표시됩니다.<br/>
            최대 {maxSelections}개까지 선택 가능합니다.
          </p>
        </div>

        {!isAdmin && (
          <div className={styles.alertBox}>
            <ICON className={styles.icon} />
            최소 1개 이상의 {selectionName}를 선택해야 시스템 시작이 가능합니다. ({currentSelections.length}/{maxSelections})
          </div>
        )}
        
        <div className={styles.actionArea}>
          {!isAdmin && (
            <div className={styles.subjectGrid}>
              {(selectionType === "subject" ? availableSubjects : CLASSES).map((item) => {
                const isSelected = currentSelections.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggleSelection(item)}
                    className={`${styles.subjectBtn} ${isSelected ? styles.subjectSelected : ''}`}
                  >
                    {isSelected && <Check className={styles.iconCheck} />}
                    {item}
                  </button>
                );
              })}
            </div>
          )}

          <button 
            onClick={handleSave} 
            disabled={(!isAdmin && currentSelections.length === 0) || isSaving}
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
