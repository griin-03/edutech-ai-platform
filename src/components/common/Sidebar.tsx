"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "next-themes";
import { 
  LogOut, ChevronLeft, ChevronRight, GraduationCap, 
  Settings, Coffee, Moon, Sun
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { setTheme, theme } = useTheme();
  
  // Logic lấy dữ liệu theo Role (đã cập nhật để hiểu cấu trúc nhóm)
  const role = user?.role || "student";
  const navGroups = NAV_ITEMS[role] || []; 
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Fix lỗi Hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <aside 
      className={cn(
        "sticky top-0 h-screen flex flex-col transition-all duration-500 ease-in-out border-r z-50",
        "bg-[#fdfbf7] dark:bg-[#1c1917] border-stone-200 dark:border-stone-800",
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
      <div className="h-20 flex items-center justify-center px-4">
        <div className={cn("flex items-center gap-3 transition-all duration-300", isCollapsed ? "justify-center" : "justify-start w-full")}>
          <div className="relative group">
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
              <span className="text-[10px] font-medium text-stone-500 tracking-wider uppercase mt-1">
                Learning Platform
              </span>
            </div>
          )}
        </div>
      </div>

      <Separator className="bg-stone-200 dark:bg-stone-800 mx-4 w-auto mb-4" />

      {/* 3. Main Menu (Scrollable - ĐÃ SỬA LOGIC RENDER NHÓM) */}
      <ScrollArea className="flex-1 px-3 py-2 custom-scrollbar">
        <div className="space-y-6">
          
          {/* Vòng lặp qua từng Nhóm (Group) */}
          {navGroups.map((group: any, groupIndex: number) => (
            <div key={groupIndex} className="space-y-1">
              {/* Tiêu đề nhóm (chỉ hiện khi không thu gọn) */}
              {!isCollapsed && (
                <h4 className="px-4 text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 mt-2 truncate">
                  {group.group}
                </h4>
              )}
              
              {/* Vòng lặp qua từng Item trong nhóm */}
              {group.items.map((item: any, itemIndex: number) => {
                const isActive = pathname === item.href;
                const Icon = item.icon; // Lấy component Icon

                return (
                  <Link key={itemIndex} href={item.href}>
                    <div className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group cursor-pointer relative overflow-hidden mx-1",
                      isActive 
                        ? "bg-gradient-to-r from-amber-100 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/10 text-amber-700 dark:text-amber-400 font-bold shadow-sm" 
                        : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-200",
                      isCollapsed && "justify-center px-0"
                    )}>
                      {/* Active Indicator Line */}
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-500 rounded-r-full" />}
                      
                      {/* Icon */}
                      <Icon className={cn("h-5 w-5 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                      
                      {/* Label */}
                      {!isCollapsed && (
                        <span className="text-sm">{item.label}</span>
                      )}

                       {/* Tooltip ảo khi thu gọn */}
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
      <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-[#f8f5f0]/50 dark:bg-[#151311]/50 backdrop-blur-md">
        <div className="space-y-1">
           
           {/* Nút Dark/Light Mode */}
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

           {/* ĐÃ SỬA: Thêm thẻ Link bọc ngoài nút Cài đặt */}
           <Link href="/student/settings">
             <div className={cn(
               "flex items-center gap-3 px-3 py-2 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors",
               isCollapsed && "justify-center"
             )}>
                <Settings size={20} />
                {!isCollapsed && <span className="text-sm font-medium">Cài đặt</span>}
             </div>
           </Link>
           
           <button
            onClick={() => { logout(); window.location.href = "/login"; }}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-500/80 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors",
              isCollapsed && "justify-center"
            )}
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="text-sm font-medium">Đăng xuất</span>}
          </button>
        </div>
        
        {/* Banner QC nhỏ */}
        {!isCollapsed && (
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-br from-stone-800 to-stone-900 text-stone-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2 opacity-10">
               <Coffee size={40} />
             </div>
             <p className="text-xs font-bold text-amber-500 mb-1">PRO PLAN</p>
             <p className="text-xs text-stone-300 mb-2">Mở khóa tính năng AI cao cấp.</p>
             <Button size="sm" variant="secondary" className="w-full h-7 text-xs bg-amber-600 hover:bg-amber-500 text-white border-0">Nâng cấp</Button>
          </div>
        )}
      </div>
    </aside>
  );
}