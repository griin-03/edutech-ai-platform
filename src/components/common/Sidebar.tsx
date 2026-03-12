"use client";

import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore"; 
import { useTheme } from "next-themes";
import { 
  LogOut, ChevronLeft, ChevronRight, GraduationCap, 
  Settings, Coffee, Moon, Sun,
  LayoutDashboard, Users, BookOpen, ShieldCheck, 
  BarChart3, MessageSquare, Star, FileVideo, PlusCircle,
  CreditCard, AlertTriangle, ArrowUpCircle, Award, 
  PenTool, Brain, Globe, Clock, Home, Library, History // 🔥 Đã import thêm History/Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// --- 1. MENU ADMIN ---
const ADMIN_NAV = [
  {
    group: "Quản trị hệ thống",
    items: [
      { label: "Tổng quan", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Quản lý User", href: "/admin/users", icon: Users },
      { label: "Quản lý Khóa học", href: "/admin/courses", icon: BookOpen },
      { label: "Kiểm duyệt nội dung", href: "/admin/moderation", icon: AlertTriangle }, 
      { label: "Giao dịch tài chính", href: "/admin/transactions", icon: CreditCard }, 
      { label: "Yêu cầu nâng cấp", href: "/admin/upgrades", icon: ArrowUpCircle }, 
      { label: "Phân tích hệ thống", href: "/admin/analytics", icon: BarChart3 }, 
      { label: "Cài đặt hệ thống", href: "/admin/settings", icon: ShieldCheck },
    ]
  }
];

// --- 2. MENU TEACHER ---
const TEACHER_NAV = [
  {
    group: "Tổng quan",
    items: [
      { label: "Bảng điều khiển", href: "/teacher/dashboard", icon: LayoutDashboard },
      { label: "Phân tích số liệu", href: "/teacher/analytics", icon: BarChart3 },
    ]
  },
  {
    group: "Giảng dạy",
    items: [
      { label: "Khóa học của tôi", href: "/teacher/courses", icon: BookOpen },
      { label: "Tạo khóa mới", href: "/teacher/courses/create", icon: PlusCircle },
      { label: "Quản lý học viên", href: "/teacher/students", icon: Users },
      { label: "Quản lý kỳ thi", href: "/teacher/exams", icon: PenTool }, 
    ]
  },
  {
    group: "Tương tác",
    items: [
      { label: "Hỏi đáp & Thảo luận", href: "/teacher/community", icon: MessageSquare },
      { label: "Đánh giá & Review", href: "/teacher/reviews", icon: Star },
    ]
  }
];

// --- 3. MENU STUDENT ---
const STUDENT_NAV = [
  {
    group: "Học tập",
    items: [
      { label: "Trang chủ", href: "/student/dashboard", icon: Home },
      { label: "Đề thi của tôi", href: "/student/my-courses", icon: BookOpen },
      { label: "Thư viện đề thi", href: "/student/exam-library", icon: Library }, 
      { label: "Lịch sử thi", href: "/student/history", icon: History }, // 🔥 Đổi icon từ Globe sang History
      { label: "Giảng Viên", href: "/student/teacher", icon: GraduationCap }, 
    ]
  },
  {
    group: "Trợ lý AI & Cộng đồng",
    items: [
      { label: "AI Mentor (Định hướng)", href: "/student/ai-mentor", icon: Brain }, 
      { label: "AI Tutor (Gia sư)", href: "/student/ai-tutor", icon: MessageSquare }, 
      { label: "Cộng đồng", href: "/student/community", icon: Users }, 
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore(); 
  const { data: session, status } = useSession(); 
  const { setTheme, theme } = useTheme();
  
  const [currentRole, setCurrentRole] = useState<string>("student");

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
        const role = ((session.user as any).role || user?.role || "student").toString().toLowerCase();
        setCurrentRole(role);
    }
  }, [session, status, user]);
  
  let navGroups = [];

  if (currentRole === 'admin') {
    navGroups = ADMIN_NAV;
  } else if (currentRole === 'teacher') {
    navGroups = TEACHER_NAV;
  } else {
    navGroups = STUDENT_NAV;
  }
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <aside 
      className={cn(
        "sticky top-0 h-screen flex flex-col transition-all duration-500 ease-in-out border-r z-50",
        "bg-[#fdfbf7] dark:bg-[#1c1917] border-stone-200 dark:border-stone-800 shrink-0", // Thêm shrink-0 để không bị bóp méo
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* 1. Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 h-7 w-7 bg-amber-600 hover:bg-amber-500 text-white rounded-full flex items-center justify-center shadow-md shadow-amber-900/20 transition-all hover:scale-110 z-50 ring-4 ring-[#fdfbf7] dark:ring-[#1c1917]"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* 2. Logo Header */}
      <div className="h-20 shrink-0 flex items-center justify-center px-4">
        <div className={cn("flex items-center gap-3 transition-all duration-300", isCollapsed ? "justify-center" : "justify-start w-full")}>
          <div className="relative group shrink-0">
            <div className="absolute inset-0 bg-amber-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity rounded-full"></div>
            <div className="relative h-11 w-11 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-inner border border-white/20 text-white">
              <GraduationCap size={22} className="drop-shadow-md" />
            </div>
          </div>
          
          {!isCollapsed && (
            <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
              <span className="font-bold text-xl text-stone-800 dark:text-stone-100 leading-none">
                EduTech<span className="text-amber-600">.AI</span>
              </span>
              <div className="flex items-center gap-2 mt-1">
                 <span className="text-[10px] font-medium text-stone-500 tracking-wider uppercase">Learning Platform</span>
                 
                 {/* Badge Role Dynamic */}
                 {currentRole === 'admin' && <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold border border-red-200">ADMIN</span>}
                 {currentRole === 'teacher' && <span className="text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold border border-blue-200">TEACHER</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      <Separator className="bg-stone-200 dark:bg-stone-800 mx-4 w-auto mb-2 shrink-0" />

      {/* 3. Main Menu (Scrollable) */}
      <ScrollArea className="flex-1 px-3 py-2 custom-scrollbar min-h-0">
        <div className="space-y-4 pb-4"> 
          
          {navGroups.map((group: any, groupIndex: number) => (
            <div key={groupIndex} className="space-y-1">
              {!isCollapsed && (
                <h4 className="px-4 text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 mt-2 truncate">
                  {group.group}
                </h4>
              )}
              
              {group.items.map((item: any, itemIndex: number) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;

                return (
                  <Link key={itemIndex} href={item.href}>
                    <div className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group cursor-pointer relative overflow-hidden mx-1", // 🔥 Giảm py-3 xuống py-2.5 để tiết kiệm không gian
                      isActive 
                        ? "bg-gradient-to-r from-amber-100 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/10 text-amber-700 dark:text-amber-400 font-bold shadow-sm" 
                        : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-200",
                      isCollapsed && "justify-center px-0"
                    )}>
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-500 rounded-r-full" />}
                      
                      <Icon className={cn("h-5 w-5 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                      
                      {!isCollapsed && <span className="text-sm">{item.label}</span>}

                       {isCollapsed && (
                        <div className="absolute left-14 bg-stone-800 text-white text-xs px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100] pointer-events-none shadow-xl border border-stone-700">
                          {item.label}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* 4. Footer Actions */}
      <div className="shrink-0 p-4 border-t border-stone-200 dark:border-stone-800 bg-[#f8f5f0]/50 dark:bg-[#151311]/50 backdrop-blur-md">
        <div className="space-y-1">
           
           {/* Dark Mode Toggle */}
           <div 
             onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
             className={cn(
               "flex items-center gap-3 px-3 py-2 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors group",
               isCollapsed && "justify-center"
             )}
           >
              <div className="relative h-5 w-5">
                {mounted && (
                  <>
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute text-amber-500" />
                    <Moon className="h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute text-blue-400" />
                  </>
                )}
              </div>
              {!isCollapsed && <span className="text-sm font-medium">Giao diện</span>}
           </div>

           {/* Settings Link Dynamic */}
           <Link href={currentRole === 'admin' ? "/admin/settings" : currentRole === 'teacher' ? "/teacher/settings" : "/student/settings"}>
             <div className={cn(
               "flex items-center gap-3 px-3 py-2 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors",
               isCollapsed && "justify-center"
             )}>
                <Settings size={20} />
                {!isCollapsed && <span className="text-sm font-medium">Cài đặt</span>}
             </div>
           </Link>
           
           {/* Logout Button */}
           <button
             onClick={() => signOut({ callbackUrl: "/login" })} 
             className={cn(
               "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-500/80 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group",
               isCollapsed && "justify-center"
             )}
           >
             <LogOut size={20} />
             {!isCollapsed && <span className="text-sm font-medium">Đăng xuất</span>}
           </button>
        
          {/* Banner QC: CHỈ HIỆN KHI LÀ STUDENT CHÍNH HIỆU */}
          {!isCollapsed && currentRole === 'student' && status === 'authenticated' && (
            <div className="mt-2 p-3 rounded-xl bg-gradient-to-br from-stone-800 to-stone-900 text-stone-100 relative overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <Coffee size={40} />
              </div>
              <p className="text-xs font-bold text-amber-500 mb-1">PRO PLAN</p>
              <p className="text-xs text-stone-300 mb-2 line-clamp-1">Mở khóa tính năng AI cao cấp.</p>
              <Link href="/student/pro">
                <Button size="sm" variant="secondary" className="w-full h-7 text-xs bg-amber-600 hover:bg-amber-500 text-white border-0">Nâng cấp</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}