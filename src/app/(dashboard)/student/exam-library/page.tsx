"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Search, Filter, Download, Eye, Star, FileText, Globe, Code, 
  Calculator, Atom, BookOpen, CloudLightning, Layers, SortAsc, 
  Loader2, CheckCircle2, Facebook, Twitter, Instagram, Linkedin, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// --- CONFIG MAPPING ICON ---
const SUBJECT_ICONS: Record<string, any> = {
  "English": { icon: Globe, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
  "Math": { icon: Calculator, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
  "IT": { icon: Code, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  "Coding": { icon: Code, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  "Physics": { icon: Atom, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
  "General": { icon: BookOpen, color: "text-stone-500", bg: "bg-stone-50 dark:bg-stone-800" }
};

export default function ExamLibraryPage() {
  // STATE QUẢN LÝ DỮ LIỆU
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // STATE BỘ LỌC
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState<string | null>(null);
  const [filterFormat, setFilterFormat] = useState<string | null>(null);

  // STATE LOADING BUTTON (Để tránh spam nút tải)
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // 1. FETCH DỮ LIỆU TỪ API (LẤY TẤT CẢ ĐỀ THI)
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const queryParams = new URLSearchParams();
        if(searchTerm) queryParams.set("q", searchTerm);
        if(filterSubject) queryParams.set("category", filterSubject);
        if(filterFormat) queryParams.set("format", filterFormat);

        // Gọi API lọc
        const res = await fetch(`/api/courses?${queryParams.toString()}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          const mappedData = data.map((item: any) => {
            // Mapping icon đẹp
            let subjKey = "General";
            if(item.title.includes("English") || item.category==="English") subjKey = "English";
            else if(item.title.includes("Math") || item.category==="Math") subjKey = "Math";
            else if(item.title.includes("IT") || item.category==="IT" || item.category==="Coding") subjKey = "IT";
            else if(item.title.includes("Physic") || item.category==="Physics") subjKey = "Physics";

            const theme = SUBJECT_ICONS[subjKey] || SUBJECT_ICONS["General"];

            // Giả lập số liệu nếu DB chưa có (để giao diện đẹp)
            return {
              id: item.id,
              title: item.title,
              subject: { name: item.category, ...theme },
              type: item.format || "ONLINE", // ONLINE, PDF, DOCX
              downloads: item.downloads || Math.floor(Math.random()*5000)+100,
              views: Math.floor(Math.random()*10000)+500,
              rating: item.rating || (4 + Math.random()).toFixed(1),
              pages: item.metaData?.pages || 10,
              year: item.metaData?.year || 2024,
              size: item.metaData?.size || "2MB",
              isPro: item.isPro || false,
              isSaved: item.savedCourses?.length > 0 // Kiểm tra đã lưu chưa
            };
          });
          setExams(mappedData);
        }
      } catch (error) {
        console.error("Lỗi tải đề:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search (chờ người dùng gõ xong mới tìm)
    const timeoutId = setTimeout(() => {
        fetchExams();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterSubject, filterFormat]);

  // 2. XỬ LÝ TẢI VỀ / LƯU THƯ VIỆN
  const handleDownload = async (exam: any) => {
    setDownloadingId(exam.id);
    
    try {
      // Gọi API Save Course
      const res = await fetch("/api/courses", {
        method: "POST",
        body: JSON.stringify({ action: "SAVE_COURSE", courseId: exam.id })
      });
      
      if (res.ok) {
         // Nếu là PDF/DOCX -> Mở tab mới tải file (Giả lập)
         if (exam.type !== "ONLINE") {
             window.open("https://example.com/dummy-file.pdf", "_blank");
         } else {
             // Nếu là Online Test -> Chỉ cần báo đã lưu (Có thể thêm Toast notification)
             console.log("Đã lưu vào Kho khóa học!");
         }
         
         // Cập nhật UI (Đã lưu)
         setExams(prev => prev.map(e => e.id === exam.id ? {...e, isSaved: true, downloads: Number(e.downloads) + 1} : e));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] w-full flex-col overflow-hidden bg-[#fdfbf7] dark:bg-[#0c0a09] transition-colors duration-500 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl relative animate-in fade-in zoom-in-95 duration-500">
      
      {/* --- 1. HEADER & TOOLBAR --- */}
      <div className="shrink-0 p-6 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-[#0c0a09]/80 backdrop-blur-md z-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-stone-800 dark:text-stone-100 flex items-center gap-2">
              <BookOpen className="text-amber-600" /> Thư viện Đề thi
            </h1>
            <p className="text-stone-500 text-sm font-medium mt-1">
              Kho tàng kiến thức vô tận. Hơn <span className="text-amber-600 font-bold">{loading ? "..." : exams.length}+</span> đề thi chất lượng cao.
            </p>
          </div>
          <Button className="bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-amber-600 dark:hover:bg-amber-500 font-bold shadow-lg shadow-amber-500/20">
            <CloudLightning className="mr-2 h-4 w-4" /> Đóng góp đề thi
          </Button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
            <Input 
              placeholder="Tìm kiếm theo tên đề, mã đề..." 
              className="pl-10 h-11 bg-stone-50 dark:bg-[#1c1917] border-stone-200 dark:border-stone-800 focus-visible:ring-amber-500 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="outline" className={cn("h-11 rounded-xl border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1917]", filterSubject && "bg-amber-50 border-amber-200 text-amber-700")}>
                   <Filter className="mr-2 h-4 w-4" /> {filterSubject || "Môn học"}
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent>
                   <DropdownMenuLabel>Chọn môn</DropdownMenuLabel>
                   <DropdownMenuSeparator/>
                   <DropdownMenuCheckboxItem checked={filterSubject === null} onCheckedChange={() => setFilterSubject(null)}>Tất cả</DropdownMenuCheckboxItem>
                   <DropdownMenuCheckboxItem checked={filterSubject === "English"} onCheckedChange={() => setFilterSubject("English")}>Tiếng Anh</DropdownMenuCheckboxItem>
                   <DropdownMenuCheckboxItem checked={filterSubject === "IT"} onCheckedChange={() => setFilterSubject("IT")}>Công nghệ</DropdownMenuCheckboxItem>
                   <DropdownMenuCheckboxItem checked={filterSubject === "Math"} onCheckedChange={() => setFilterSubject("Math")}>Toán học</DropdownMenuCheckboxItem>
               </DropdownMenuContent>
             </DropdownMenu>

             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="outline" className={cn("h-11 rounded-xl border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1917]", filterFormat && "bg-amber-50 border-amber-200 text-amber-700")}>
                   <Layers className="mr-2 h-4 w-4" /> {filterFormat || "Định dạng"}
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent>
                   <DropdownMenuLabel>Định dạng file</DropdownMenuLabel>
                   <DropdownMenuSeparator/>
                   <DropdownMenuCheckboxItem checked={filterFormat === null} onCheckedChange={() => setFilterFormat(null)}>Tất cả</DropdownMenuCheckboxItem>
                   <DropdownMenuCheckboxItem checked={filterFormat === "ONLINE"} onCheckedChange={() => setFilterFormat("ONLINE")}>Thi Online</DropdownMenuCheckboxItem>
                   <DropdownMenuCheckboxItem checked={filterFormat === "PDF"} onCheckedChange={() => setFilterFormat("PDF")}>PDF</DropdownMenuCheckboxItem>
               </DropdownMenuContent>
             </DropdownMenu>

             <Button variant="outline" className="h-11 w-11 p-0 rounded-xl border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1917]">
               <SortAsc className="h-4 w-4 text-stone-500" />
             </Button>
          </div>
        </div>
      </div>

      {/* --- 2. MAIN CONTENT (SCROLLABLE) --- */}
      <div className="flex-1 min-h-0 relative">
        <ScrollArea className="h-full px-6 custom-scrollbar">
          <div className="py-6 min-h-[calc(100vh-20rem)]">
            
            {/* Loading State */}
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({length:8}).map((_,i) => (
                        <div key={i} className="h-64 bg-stone-200 dark:bg-stone-800 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && exams.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                    <BookOpen size={64} className="text-stone-300 mb-4"/>
                    <h3 className="text-xl font-bold text-stone-700 dark:text-stone-300">Không tìm thấy đề thi nào</h3>
                    <p className="text-stone-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
                </div>
            )}

            {/* Exam Grid */}
            {!loading && exams.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
                {exams.map((item, index) => (
                  <Card 
                    key={item.id} 
                    className="group relative overflow-hidden border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1917] hover:shadow-xl hover:shadow-amber-900/5 dark:hover:shadow-black/50 hover:-translate-y-1 transition-all duration-500 rounded-2xl animate-in fade-in slide-in-from-bottom-10 fill-mode-forwards"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Pro Badge */}
                    {item.isPro && (
                      <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10 shadow-sm">
                        PRO
                      </div>
                    )}

                    <CardHeader className="pb-3 pt-5 px-5">
                      <div className="flex justify-between items-start mb-3">
                        <div className={`p-2.5 rounded-xl ${item.subject.bg} transition-transform group-hover:scale-110 duration-300`}>
                          <item.subject.icon size={20} className={item.subject.color} />
                        </div>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-stone-500 border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
                          {item.type}
                        </Badge>
                      </div>
                      
                      <div className="min-h-[3.5rem]">
                        <CardTitle className="text-base font-bold text-stone-800 dark:text-stone-100 leading-snug group-hover:text-amber-600 transition-colors line-clamp-2">
                          {item.title}
                        </CardTitle>
                      </div>
                    </CardHeader>

                    <CardContent className="px-5 pb-4">
                      <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400 font-medium">
                        <span className="flex items-center gap-1"><Download size={12}/> {item.downloads}</span>
                        <span className="flex items-center gap-1"><Eye size={12}/> {item.views}</span>
                        <span className="flex items-center gap-1 text-amber-500"><Star size={12} className="fill-amber-500"/> {item.rating}</span>
                      </div>
                      
                      <div className="mt-4 flex items-center gap-2 text-[10px] text-stone-400 bg-stone-50 dark:bg-stone-800/50 p-2 rounded-lg">
                        <FileText size={12} /> {item.pages} trang • {item.size} • Năm {item.year}
                      </div>
                    </CardContent>

                    <CardFooter className="px-5 pb-5 pt-0 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 h-9 text-xs font-bold border-stone-200 dark:border-stone-700 hover:text-amber-600 hover:border-amber-200 dark:text-stone-300">
                        <Eye size={14} className="mr-1.5" /> Xem
                      </Button>
                      
                      <Button 
                        onClick={() => handleDownload(item)}
                        disabled={downloadingId === item.id || item.isSaved}
                        size="sm" 
                        className={cn(
                            "flex-1 h-9 text-xs font-bold shadow-md transition-all",
                            item.isSaved 
                                ? "bg-green-600 hover:bg-green-700 text-white" 
                                : "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-amber-600"
                        )}
                      >
                        {downloadingId === item.id ? <Loader2 size={14} className="animate-spin"/> : 
                         item.isSaved ? <><CheckCircle2 size={14} className="mr-1.5"/> Đã lưu</> : 
                         <><Download size={14} className="mr-1.5" /> Tải về</>}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* --- FOOTER CHUYÊN NGHIỆP --- */}
          <div className="border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#151311] py-12 px-8">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div className="col-span-1 md:col-span-2 space-y-4">
                   <h3 className="font-black text-stone-800 dark:text-stone-100 text-lg flex items-center gap-2">
                      <BookOpen className="text-amber-600"/> EduTech Library
                   </h3>
                   <p className="text-sm text-stone-500 dark:text-stone-400 max-w-sm leading-relaxed">
                      Nền tảng chia sẻ tài liệu học tập số 1 dành cho học sinh, sinh viên. Chúng tôi cam kết chất lượng nội dung và trải nghiệm người dùng tốt nhất.
                   </p>
                   <div className="flex gap-2">
                      <Button size="icon" variant="outline" className="rounded-full h-8 w-8"><Facebook size={14}/></Button>
                      <Button size="icon" variant="outline" className="rounded-full h-8 w-8"><Twitter size={14}/></Button>
                      <Button size="icon" variant="outline" className="rounded-full h-8 w-8"><Instagram size={14}/></Button>
                      <Button size="icon" variant="outline" className="rounded-full h-8 w-8"><Linkedin size={14}/></Button>
                   </div>
                </div>
                <div>
                   <h4 className="font-bold text-stone-800 dark:text-stone-100 mb-4 text-sm uppercase tracking-wider">Tài nguyên</h4>
                   <ul className="space-y-2 text-sm text-stone-500 dark:text-stone-400">
                      <li className="hover:text-amber-600 cursor-pointer">Đề thi Đại học</li>
                      <li className="hover:text-amber-600 cursor-pointer">Tài liệu IELTS</li>
                      <li className="hover:text-amber-600 cursor-pointer">Sách giáo khoa</li>
                      <li className="hover:text-amber-600 cursor-pointer">Blog học tập</li>
                   </ul>
                </div>
                <div>
                   <h4 className="font-bold text-stone-800 dark:text-stone-100 mb-4 text-sm uppercase tracking-wider">Hỗ trợ</h4>
                   <ul className="space-y-2 text-sm text-stone-500 dark:text-stone-400">
                      <li className="hover:text-amber-600 cursor-pointer">Trung tâm trợ giúp</li>
                      <li className="hover:text-amber-600 cursor-pointer">Điều khoản sử dụng</li>
                      <li className="hover:text-amber-600 cursor-pointer">Chính sách bảo mật</li>
                      <div className="flex gap-2 mt-2">
                         <Input placeholder="Email nhận tin..." className="bg-white h-8 text-xs"/>
                         <Button size="sm" className="h-8 w-8 p-0 bg-stone-900"><ArrowRight size={12}/></Button>
                      </div>
                   </ul>
                </div>
             </div>
             <div className="border-t border-stone-200 dark:border-stone-700 pt-6 text-center text-xs text-stone-400">
                © 2026 EduTech AI Platform. All rights reserved.
             </div>
          </div>
        </ScrollArea>
      </div>

    </div>
  );
}