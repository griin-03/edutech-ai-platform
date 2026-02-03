"use client";

import { useAuthStore } from "@/stores/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react"; // Thêm icon cho chuyên nghiệp
import { cn } from "@/lib/utils";

export function Header() {
  const user = useAuthStore((state) => state.user);
  
  // --- LOGIC THÔNG BÁO BẢO TRÌ ---
  const [config, setConfig] = useState<{ isMaintenance: boolean; maintenanceMsg: string } | null>(null);

  useEffect(() => {
    // Gọi API lấy cấu hình hệ thống (tạo ở bước dưới)
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/system/config");
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (error) {
        console.error("Lỗi lấy cấu hình hệ thống:", error);
      }
    };
    fetchConfig();
  }, []);

  return (
    <div className="flex flex-col w-full sticky top-0 z-50">
      {/* 1. BANNER THÔNG BÁO (Hiện ra khi có bảo trì) */}
      {config?.isMaintenance && (
        <div className="bg-amber-500 text-white px-6 py-2 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-500">
          <AlertTriangle size={16} className="animate-bounce" />
          <span className="text-xs md:text-sm font-bold tracking-wide">
            {config.maintenanceMsg || "Hệ thống đang được bảo trì để nâng cấp trải nghiệm tốt hơn!"}
          </span>
        </div>
      )}

      {/* 2. GIAO DIỆN HEADER CŨ (Giữ nguyên 100%) */}
      <header className="flex h-16 items-center justify-end gap-4 border-b bg-white/50 backdrop-blur-md px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none text-slate-900">{user?.name || "Guest User"}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role || "Student"}</p>
          </div>
          <Avatar className="cursor-pointer ring-2 ring-teal-500 ring-offset-2 hover:scale-105 transition-transform">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white font-bold">
              {user?.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>
    </div>
  );
}