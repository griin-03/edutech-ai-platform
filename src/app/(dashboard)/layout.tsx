import { Sidebar } from "@/components/common/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#fdfbf7] dark:bg-[#1c1917]">
      {/* Sidebar cố định bên trái */}
      <Sidebar />

      {/* Phần nội dung chính */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* ĐÃ XÓA HEADER CŨ Ở ĐÂY */}
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto h-screen scroll-smooth">
          <div className="max-w-7xl mx-auto animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}