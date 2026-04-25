"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Users, Pill, MessageSquare, 
  Settings, LogOut, Activity, ChevronRight, Menu, ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getMe } from "@/lib/api/users";
import type { UserResponse } from "@/lib/types";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "staff"] },
  { name: "Patients", href: "/patients", icon: Users, roles: ["admin", "staff"] },
  { name: "Pharmacy", href: "/pharmacy", icon: Pill, roles: ["admin", "staff"] },
  { name: "Messages", href: "/messages", icon: MessageSquare, count: 3, roles: ["admin", "staff"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved) setIsCollapsed(JSON.parse(saved));
    
    // Fetch user for RBAC
    getMe().then(setUser).catch(() => {});
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar_collapsed", JSON.stringify(newState));
  };

  const handleLogout = () => {
    localStorage.removeItem("ashwini_token");
    // Clear cookie by setting expiry to past
    document.cookie = "ashwini_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    router.push("/");
  };

  if (!isMounted) return null;
  if (pathname === "/" || pathname === "/onboard") return null;

  return (
    <aside 
      className={cn(
        "bg-white border-r border-slate-100 flex flex-col shrink-0 h-screen sticky top-0 transition-all duration-300 ease-in-out z-50",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Brand & Toggle */}
      <div className={cn("p-6 flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
        {!isCollapsed && (
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push("/dashboard")}>
            <div className="bg-[#0F172A] p-2 rounded-xl shadow-lg shadow-slate-200">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-[#0F172A] tracking-tight">
              Ashwini<span className="text-[#2563EB]">HMS</span>
            </h1>
          </div>
        )}
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-[#0F172A] transition-colors"
        >
          {isCollapsed ? <Menu className="w-6 h-6" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-4 space-y-1.5 overflow-x-hidden">
        {navigation
          .filter(item => {
            if (!user) return true;
            if (user.is_admin) return true;
            return item.roles.includes("staff");
          })
          .map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className={cn(
                "w-full flex items-center rounded-2xl transition-all duration-200 group relative",
                isCollapsed ? "justify-center p-3" : "px-4 py-3 gap-3",
                isActive 
                  ? "bg-[#0F172A] text-white shadow-xl shadow-slate-900/10" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-[#0F172A]"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-[#2563EB]" : "text-slate-400 group-hover:text-[#2563EB]")} strokeWidth={1.5} />
              
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-sm font-bold text-left truncate">{item.name}</span>
                  {item.count && (
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold",
                      isActive ? "bg-[#2563EB] text-white" : "bg-blue-50 text-[#2563EB]"
                    )}>
                      {item.count}
                    </span>
                  )}
                </>
              )}

              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-[#0F172A] text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[60] whitespace-nowrap shadow-xl">
                  {item.name} {item.count ? `(${item.count})` : ''}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-slate-50 space-y-1.5">
        <button
          onClick={() => router.push("/settings")}
          className={cn(
            "w-full flex items-center rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-[#0F172A] transition-all group relative",
            isCollapsed ? "justify-center p-3" : "px-4 py-3 gap-3"
          )}
        >
          <Settings className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-[#2563EB]" strokeWidth={1.5} />
          {!isCollapsed && <span className="text-sm font-bold">Settings</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-4 px-3 py-2 bg-[#0F172A] text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[60] whitespace-nowrap">
              Settings
            </div>
          )}
        </button>
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center rounded-2xl text-red-500 hover:bg-red-50 transition-all group relative",
            isCollapsed ? "justify-center p-3" : "px-4 py-3 gap-3"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0 text-red-400 group-hover:text-red-600" strokeWidth={1.5} />
          {!isCollapsed && <span className="text-sm font-bold truncate">Log Off Workspace</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-4 px-3 py-2 bg-red-600 text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[60] whitespace-nowrap">
              Log Off Workspace
            </div>
          )}
        </button>
      </div>

      {/* Workspace Status */}
      {!isCollapsed && (
        <div className="p-6 bg-slate-50/50 m-4 rounded-2xl border border-slate-100/50">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Production Cluster Live
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
