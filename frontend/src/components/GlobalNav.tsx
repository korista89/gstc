"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  ClipboardList,
  Users2,
  Palette,
  FileText,
  LogOut,
  Bell
} from "lucide-react";
import PBSTLogo from "./PBSTLogo";
import styles from "./GlobalNav.module.css";

const navItems = [
  { name: "대시보드", href: "/dashboard", icon: LayoutDashboard },
  { name: "전교생성취현황", href: "/all-students-status", icon: BarChart3 },
  { name: "평가", href: "/evaluation", icon: FileText },
  { name: "CICO 관리", href: "/cico", icon: ClipboardList },
  { name: "교육과정 협의", href: "/meeting", icon: Users2 },
  { name: "경은그림말", href: "/picture-word", icon: Palette },
];

export default function GlobalNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("gstc_role");
    if (role) {
      setCurrentRole(role);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("gstc_role");
    router.push("/");
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.navContainer}>
        {/* Logo Group */}
        <Link href="/dashboard" className={styles.logoGroup}>
          <PBSTLogo size={42} />
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>경은GSTC</span>
            <span className={styles.logoSubtitle}>Teacher Curriculum System</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className={styles.navLinks}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <Icon className={styles.icon} />
                <span className="hidden md:inline">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* User Actions */}
        <div className={styles.userSection}>
          <button className={styles.navItem} aria-label="Notifications">
            <Bell className={styles.icon} />
          </button>
          
          <div className={styles.divider} />
          
          <div className={styles.userInfo}>
            <div className={styles.userDetails}>
              <p className={styles.userName}>{currentRole || "Guest"}</p>
              <p className={styles.userRole}>System User</p>
            </div>
            <div className={styles.avatar}>
              {currentRole ? currentRole.substring(0, 1) : "G"}
            </div>
            <button 
              onClick={handleLogout}
              className={styles.navItem} 
              style={{ padding: '0.5rem', marginLeft: '0.5rem', color: '#ef4444' }}
              title="로그아웃"
            >
              <LogOut className={styles.icon} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
