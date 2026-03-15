import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BarChart3, 
  ClipboardList, 
  Users2,
  Palette,
  LogOut,
  Bell
} from "lucide-react";
import PBSTLogo from "./PBSTLogo";

const navItems = [
  { name: "대시보드", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tier 현황", href: "/tier-status", icon: BarChart3 },
  { name: "CICO 관리", href: "/cico", icon: ClipboardList },
  { name: "교육과정 협의", href: "/meeting", icon: Users2 },
  { name: "경은그림말", href: "/picture-word", icon: Palette },
];

export default function GlobalNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 bg-slate-950/20 backdrop-blur-3xl">
      <div className="max-w-[1600px] mx-auto px-8 h-20 flex justify-between items-center">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-4 group transition-all">
          <PBSTLogo size={42} className="group-hover:scale-110 transition-transform" />
          <div className="flex flex-col">
            <span className="text-xl font-black text-white tracking-tighter">경은<span className="text-blue-500">PBST</span></span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest -mt-1">Professional Support Team</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all relative group ${
                  isActive 
                  ? "text-white bg-white/5" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-500" : "text-slate-500 group-hover:text-blue-400"} transition-colors`} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* User & Actions */}
        <div className="flex items-center gap-6">
          <button className="relative w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950" />
          </button>
          
          <div className="h-8 w-[1px] bg-white/10" />
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden lg:block">
              <p className="text-xs font-black text-white">관리자 선생님</p>
              <p className="text-[10px] font-bold text-blue-500">Professional Admin</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-white font-black text-xs">
              AD
            </div>
            <button className="p-2 text-slate-500 hover:text-red-500 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
