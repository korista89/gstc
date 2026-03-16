"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GlobalNav from "@/components/GlobalNav";
import { BarChart3, TrendingUp, AlertCircle, FileText } from "lucide-react";

export default function AllStudentsStatusPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data representing school-wide student stats since we don't have a specific global sheet endpoint right now
  const allStudentsStats = [
    { id: 1, name: "김민수", grade: "초등 1학년", achievement: 75, tier: 1 },
    { id: 2, name: "이서연", grade: "초등 2학년", achievement: 90, tier: 1 },
    { id: 3, name: "박지호", grade: "초등 3학년", achievement: 40, tier: 2 },
    { id: 4, name: "최은주", grade: "중등 1학년", achievement: 85, tier: 1 },
    { id: 5, name: "정태영", grade: "고등 2학년", achievement: 20, tier: 3 },
  ];

  useEffect(() => {
    const savedRole = localStorage.getItem("gstc_role");
    if (!savedRole) {
      router.push("/");
    } else {
      setRole(savedRole);
      setLoading(false);
    }
  }, [router]);

  if (loading) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <GlobalNav />
      
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>전교생 성취 현황</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>전체 학생의 539 성취기준 도달 및 티어 현황을 확인합니다.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>전체 학생 수</h3>
              <BarChart3 size={20} color="#3b82f6" />
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>145<span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 500 }}> 명</span></p>
          </div>
          
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>평균 도달률</h3>
              <TrendingUp size={20} color="#10b981" />
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>68<span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 500 }}> %</span></p>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>집중 지원 필요 (Tier 3)</h3>
              <AlertCircle size={20} color="#ef4444" />
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>12<span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 500 }}> 명</span></p>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={20} color="#6366f1" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>학생 세부 현황</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>학생명</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>과정/학년</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>성취기준 도달률</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>티어 상태</th>
                </tr>
              </thead>
              <tbody>
                {allStudentsStats.map((student) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: '#0f172a' }}>{student.name}</td>
                    <td style={{ padding: '1rem 1.5rem', color: '#475569' }}>{student.grade}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ flex: 1, backgroundColor: '#e2e8f0', borderRadius: '999px', height: '0.5rem', overflow: 'hidden' }}>
                          <div style={{ width: `${student.achievement}%`, backgroundColor: student.achievement > 70 ? '#10b981' : student.achievement > 40 ? '#3b82f6' : '#f59e0b', height: '100%' }}></div>
                        </div>
                        <span style={{ fontSize: '0.85rem', color: '#64748b', minWidth: '3rem' }}>{student.achievement}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '999px', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        backgroundColor: student.tier === 1 ? '#dcfce7' : student.tier === 2 ? '#fef08a' : '#fee2e2',
                        color: student.tier === 1 ? '#166534' : student.tier === 2 ? '#854d0e' : '#991b1b'
                      }}>
                        Tier {student.tier}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
