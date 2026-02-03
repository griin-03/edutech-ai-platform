"use client"; // QUAN TRỌNG: Biến Layout thành Client Component để dùng Provider

import { Sidebar } from "@/components/common/Sidebar";
import { SessionProvider } from "next-auth/react";      // Sửa lỗi useSession
import { TooltipProvider } from "@/components/ui/tooltip"; // Sửa lỗi Tooltip

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    // 1. Bọc SessionProvider để sửa lỗi đăng nhập/lấy thông tin user
    <SessionProvider>
      {/* 2. Bọc TooltipProvider để sửa lỗi các nút có tooltip */}
      <TooltipProvider>
        <div className="flex min-h-screen bg-[#fdfbf7] dark:bg-[#1c1917]">
          {/* Sidebar cố định bên trái */}
          <Sidebar />

          {/* Phần nội dung chính */}
          <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
            <main className="flex-1 p-6 md:p-8 overflow-y-auto h-screen scroll-smooth">
              <div className="max-w-7xl mx-auto animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
                {children}
              </div>
            </main>
          </div>
        </div>
      </TooltipProvider>
    </SessionProvider>
  );
}