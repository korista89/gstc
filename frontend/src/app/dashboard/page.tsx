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

        {/* Analytics Overview - Emphasizing 539 Standards */}
        <div className={styles.statGrid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>전체 성취기준 달성도</h3>
              <CheckCircle2 className={styles.icon} style={{ color: '#10b981' }} />
            </div>
            <p className={styles.statValue}>142<span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>/539</span></p>
            <p className={styles.statDesc}>
              <span className={styles.trendUp}>↑ 12</span> 이번 학기 달성
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>내 담당 교육과정 진행률</h3>
              <Users className={styles.icon} style={{ color: '#3b82f6' }} />
            </div>
            <p className={styles.statValue}>68%</p>
            <p className={styles.statDesc}>계획 대비 평가 완료 비율</p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>집중 지원 대상 성취기준</h3>
              <AlertTriangle className={styles.icon} style={{ color: '#f59e0b' }} />
            </div>
            <p className={styles.statValue}>15건</p>
            <p className={styles.statDesc}>
              <span className={styles.trendDown}>↓ 3</span> 지난달 대비
            </p>
          </div>
          
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>12년 교육과정 누적 분석</h3>
              <TrendingUp className={styles.icon} style={{ color: '#6366f1' }} />
            </div>
            <p className={styles.statValue}>정상 궤도</p>
            <p className={styles.statDesc}>AI 기반 연계성 분석 완료</p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className={styles.gridResponsive}>
          {/* Section 1: 539 Standard Progress Tracker */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <CheckCircle2 className={styles.icon} />
              <h2 className={styles.sectionTitle}>학급별 539 성취기준 도달 현황</h2>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>학생명</th>
                    <th>담당 교과/학급 진행률</th>
                    <th>12년 누적 (539)</th>
                    <th>최근 평가</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>김민수</td>
                    <td>
                      <div style={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                        <div style={{ width: '75%', backgroundColor: '#3b82f6', height: '100%' }}></div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>75% (진행중)</span>
                    </td>
                    <td><span className={`${styles.badge} ${styles.badgeNormal}`}>145 / 539</span></td>
                    <td>2026-03-15</td>
                  </tr>
                  <tr>
                    <td>이서연</td>
                    <td>
                      <div style={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                        <div style={{ width: '90%', backgroundColor: '#10b981', height: '100%' }}></div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>90% (우수)</span>
                    </td>
                    <td><span className={`${styles.badge} ${styles.badgeNormal}`}>160 / 539</span></td>
                    <td>2026-03-14</td>
                  </tr>
                  <tr>
                    <td>박지호</td>
                    <td>
                      <div style={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                        <div style={{ width: '40%', backgroundColor: '#f59e0b', height: '100%' }}></div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>40% (지원필요)</span>
                    </td>
                    <td><span className={`${styles.badge} ${styles.badgeAlert}`}>120 / 539</span></td>
                    <td>2026-03-10</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: AI Insights focused on 12-year goal */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <TrendingUp className={styles.icon} />
              <h2 className={styles.sectionTitle}>12년 로드맵 AI 인사이트</h2>
            </div>
            <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#334155', lineHeight: '1.6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 700, color: '#0f172a' }}>
                 <div style={{ padding: '4px 8px', backgroundColor: '#ede9fe', color: '#6d28d9', borderRadius: '4px', fontSize: '0.75rem' }}>AI 분석</div>
                 <span>경은학교 539 로드맵 (초1 ~ 고3)</span>
              </div>
              <p style={{ marginBottom: '1rem' }}>
                현재 담당하시는 교육과정은 539개의 전체 성취기준 중 약 <strong>18%</strong>를 커버하고 있습니다. 
                이전 학년도 과정과의 연계성을 분석한 결과, <em>박지호</em> 학생의 기초 국어 성취기준 도달이 다소 지연되고 있습니다.
              </p>
              <p style={{ fontSize: '0.85rem', color: '#64748b', backgroundColor: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: '1px dashed #cbd5e1' }}>
                💡 <strong>AI 제안:</strong> 부족한 성취기준을 보완하기 위해 이번 달 계획에 개별화된 보충 자료(그림말 등) 활동을 1~2회 추가 배정하는 것을 권장합니다.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

