"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  UserCheck, 
  Settings, 
  LogOut,
  Sparkles
} from "lucide-react";

const navItems = [
  { name: "대시보드", href: "/dashboard", icon: LayoutDashboard },
  { name: "교육과정 재구성", href: "/curriculum/rebuilder", icon: BookOpen },
  { name: "성취도 평가", href: "/assessment", icon: UserCheck },
];

export default function GlobalNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 bg-slate-950/20 backdrop-blur-3xl">
      <div className="max-w-[1600px] mx-auto px-8 h-20 flex justify-between items-center">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 group transition-all">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black gradient-text tracking-tighter">GSTC PLATFORM</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest -mt-1">Gyeong-eun School Professional</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all relative group ${
                  isActive 
                  ? "text-white bg-white/5" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-500 group-hover:text-blue-400"} transition-colors`} />
                {item.name}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* User & Actions */}
        <div className="flex items-center gap-6">
          <div className="h-10 w-[1px] bg-white/5" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-xs font-black text-white">관리자 선생님</p>
              <p className="text-[10px] font-bold text-blue-500">Professional Plan</p>
            </div>
            <button className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center hover:border-red-500/50 group transition-all">
              <LogOut className="w-5 h-5 text-slate-500 group-hover:text-red-500 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
