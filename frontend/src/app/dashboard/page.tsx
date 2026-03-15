"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GlobalNav from "@/components/GlobalNav";
import { TrendingUp, Users, AlertTriangle, CheckCircle2 } from "lucide-react";
import styles from "./dashboard.module.css";
import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedRole = localStorage.getItem("gstc_role");
    if (!savedRole) {
      router.push("/");
    } else {
      setRole(savedRole);
      setLoading(false);
    }
  }, [router]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <GlobalNav />
      
      <main className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>대시보드</h1>
          <p className={styles.subtitle}>{role} 성취기준 관리 현황</p>
        </header>

        {/* Analytics Overview */}
        <div className={styles.statGrid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>등록 학생</h3>
              <Users className={styles.icon} />
            </div>
            <p className={styles.statValue}>24명</p>
            <p className={styles.statDesc}>
              <span className={styles.trendUp}>↑ 2</span> 지난달 대비
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>성취기준 입력 완료율</h3>
              <CheckCircle2 className={styles.icon} style={{ color: '#10b981' }} />
            </div>
            <p className={styles.statValue}>85%</p>
            <p className={styles.statDesc}>국어, 수학 완료됨</p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>집중 지원 대상</h3>
              <AlertTriangle className={styles.icon} style={{ color: '#f59e0b' }} />
            </div>
            <p className={styles.statValue}>3명</p>
            <p className={styles.statDesc}>
              <span className={styles.trendDown}>↓ 1</span> 지난달 대비
            </p>
          </div>
          
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>AI 분석 리포트</h3>
              <TrendingUp className={styles.icon} style={{ color: '#6366f1' }} />
            </div>
            <p className={styles.statValue}>12건</p>
            <p className={styles.statDesc}>이번 달 생성됨</p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className={styles.gridResponsive}>
          {/* Section 1: Recent Progress */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <CheckCircle2 className={styles.icon} />
              <h2 className={styles.sectionTitle}>최근 진도율 (국어)</h2>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>학생명</th>
                    <th>현재 단원</th>
                    <th>상태</th>
                    <th>업데이트</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>김민수</td>
                    <td>2단원. 읽기 기초</td>
                    <td><span className={`${styles.badge} ${styles.badgeNormal}`}>진행중</span></td>
                    <td>2026-03-15</td>
                  </tr>
                  <tr>
                    <td>이서연</td>
                    <td>3단원. 문장 만들기</td>
                    <td><span className={`${styles.badge} ${styles.badgeNormal}`}>진행중</span></td>
                    <td>2026-03-14</td>
                  </tr>
                  <tr>
                    <td>박지호</td>
                    <td>1단원. 자음과 모음</td>
                    <td><span className={`${styles.badge} ${styles.badgeAlert}`}>지연됨</span></td>
                    <td>2026-03-10</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: AI Insights (Placeholder to match PBST style) */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <TrendingUp className={styles.icon} />
              <h2 className={styles.sectionTitle}>학급 운영 AI 인사이트</h2>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#334155', lineHeight: '1.6' }}>
              <strong>요약 분석 결과:</strong><br />
              현재 학급의 전반적인 성취기준 도달률은 안정적인 궤도에 있습니다. 
              다만 <em>박지호</em> 학생의 기초 국어 성취기준 도달이 다소 지연되고 있으니 개별화된 보충 자료(그림말 등) 활용을 권장합니다.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

