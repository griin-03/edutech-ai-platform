"use client";

import { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react"; 
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, Zap, ArrowRight, Crown, Code, Globe, Calculator, 
  PenTool, BookOpen, Flame, Users, Loader2, Clock, 
  ChevronLeft, ChevronRight, Download, Timer
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// --- CONFIG ICON & COLOR GRADIENTS ---
const SUBJECT_ICONS: Record<string, any> = {
  "English": { icon: Globe, grad: "from-blue-500/40 to-cyan-500/40", text: "text-blue-600 dark:text-blue-400" },
  "IT": { icon: Code, grad: "from-cyan-500/40 to-teal-500/40", text: "text-cyan-600 dark:text-cyan-400" },
  "Toán": { icon: Calculator, grad: "from-rose-500/40 to-orange-500/40", text: "text-rose-600 dark:text-rose-400" },
  "Design": { icon: PenTool, grad: "from-purple-500/40 to-violet-500/40", text: "text-purple-600 dark:text-purple-400" },
  "General": { icon: BookOpen, grad: "from-stone-500/40 to-stone-400/40", text: "text-stone-600 dark:text-stone-400" }
};

export default function ExamLibraryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  // --- SLIDER STATE ---
  const [bannerIndex, setBannerIndex] = useState(0);

  // Lấy dữ liệu
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await fetch("/api/courses");
        const data = await res.json();

        if (Array.isArray(data)) {
          const formattedExams = data.map((c: any) => {
            let subjectType = "General";
            if (c.title.toLowerCase().includes("toán")) subjectType = "Toán";
            else if (c.title.toLowerCase().includes("english") || c.title.toLowerCase().includes("anh")) subjectType = "English";
            else if (c.title.toLowerCase().includes("it") || c.title.toLowerCase().includes("lập trình")) subjectType = "IT";
            const theme = SUBJECT_ICONS[subjectType] || SUBJECT_ICONS["General"];
            
            const safeId = String(c.id); 
            const seed = safeId.charCodeAt(0) || 0;
            
            // Format ngày tháng năm
            const dateObj = c.createdAt ? new Date(c.createdAt) : new Date();
            const formattedDate = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')} - ${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
            
            return {
              id: c.id,
              title: c.title,
              category: c.category || "General",
              author: c.author?.name || "Giảng viên EduTech",
              icon: theme.icon,
              textColor: theme.text,
              gradient: theme.grad,
              participants: (seed * 123) % 900 + 100, 
              rating: (4 + (seed % 10) / 10).toFixed(1),
              questions: c._count?.questions || 0,
              isPro: c.category === "PRO" || c.price > 0,
              publishDate: formattedDate,
              // Bổ sung text miêu tả mồi
              description: "Bộ đề ôn tập bám sát cấu trúc đề thi chuẩn, giúp học sinh củng cố kiến thức và rèn luyện kỹ năng giải đề hiệu quả dưới áp lực thời gian."
            };
          });
          setExams(formattedExams);
        }
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  // Lọc 3 đề thi HOT nhất cho Banner Slider
  const topExams = useMemo(() => {
    return [...exams].sort((a, b) => b.participants - a.participants).slice(0, 3);
  }, [exams]);

  // Auto-play Slider
  useEffect(() => {
    if (topExams.length <= 1) return;
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % topExams.length);
    }, 4000); // 4 giây chuyển slide 1 lần
    return () => clearInterval(interval);
  }, [topExams.length]);

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || 
                              (exam.category && exam.category.includes(selectedCategory));
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, exams]);

  // LOGIC TẢI ĐỀ (Giữ nguyên)
  const handleDownloadExam = async (examId: number, isPro: boolean) => {
      const userIsPro = (session?.user as any)?.isPro === true; 

      if (isPro && !userIsPro) {
          toast.error("Khoá học này yêu cầu tài khoản PRO!", {
              description: "Vui lòng nâng cấp tài khoản để tải đề thi chất lượng cao.",
              action: {
                  label: "Nâng cấp ngay",
                  onClick: () => router.push("/student/pro")
              }
          });
          return;
      }

      setDownloadingId(examId);
      try {
          const res = await fetch("/api/courses", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "SAVE_COURSE", courseId: examId })
          });

          const data = await res.json();

          if (res.ok || data.success) {
              toast.success("Tải đề thành công!", {
                  description: "Đề thi đã được cất vào Khóa Học Của Tôi."
              });
              setTimeout(() => { router.push("/student/my-courses"); }, 1000);
          } else {
              toast.error(data.error || "Có lỗi xảy ra khi tải đề.");
              setDownloadingId(null);
          }
      } catch (error) {
          toast.error("Lỗi kết nối đến máy chủ.");
          setDownloadingId(null);
      }
  };

  const currentBanner = topExams[bannerIndex];

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f1eb] dark:bg-[#0c0a09] transition-colors duration-500 font-sans pb-20">
      
      {/* --- HERO BANNER SLIDER (KHỐI NỔI, BO GÓC TRÒN, MÀU TRÀ SỮA ĐẬM) --- */}
      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="w-full bg-gradient-to-br from-[#2c2420] via-[#1f1917] to-[#2c2420] rounded-[2.5rem] md:rounded-[3rem] shadow-2xl shadow-[#2c2420]/20 relative overflow-hidden h-[300px] md:h-[340px] border border-[#3d332d]">
          {loading ? (
             <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-10 h-10 text-amber-500 animate-spin" /></div>
          ) : currentBanner ? (
             <div key={currentBanner.id} className="absolute inset-0 flex items-center animate-in fade-in zoom-in-95 duration-700">
                {/* Nền hiệu ứng Loang lổ (Mesh Gradient) cho Banner */}
                <div className={`absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br ${currentBanner.gradient} rounded-full blur-[120px] opacity-30 -translate-y-1/2 translate-x-1/4 mix-blend-screen pointer-events-none`}></div>
                <div className={`absolute bottom-0 left-10 w-[400px] h-[400px] bg-gradient-to-tr ${currentBanner.gradient} rounded-full blur-[100px] opacity-20 translate-y-1/4 mix-blend-screen pointer-events-none`}></div>
                
                <div className="w-full px-8 md:px-14 flex items-center justify-between relative z-10">
                   <div className="flex-1 max-w-3xl space-y-5">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-amber-500 text-stone-900 hover:bg-amber-400 font-black px-3 py-1 border-0 flex items-center gap-1.5 uppercase text-[10px] tracking-wider shadow-lg shadow-amber-500/30">
                            <Flame size={14} fill="currentColor" /> Top {bannerIndex + 1} Thịnh Hành
                        </Badge>
                        <span className="text-[#a89b93] text-xs font-medium flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md backdrop-blur-md border border-white/5"><Clock size={12}/> Đăng lúc: {currentBanner.publishDate}</span>
                      </div>
                      
                      <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight line-clamp-2 drop-shadow-lg">
                         {currentBanner.title}
                      </h1>
                      
                      <div className="flex items-center gap-4 text-sm text-[#d4ccc7] font-medium">
                         <span className="bg-white/10 border border-white/5 px-4 py-1.5 rounded-xl backdrop-blur-md">Biên soạn: <strong className="text-white">{currentBanner.author}</strong></span>
                         <span className="bg-white/10 border border-white/5 px-4 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-2"><BookOpen size={16}/> <strong className="text-white">{currentBanner.questions}</strong> câu hỏi</span>
                         <span className="bg-white/10 border border-white/5 px-4 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-2"><Timer size={16}/> <strong className="text-white">10</strong> phút</span>
                      </div>

                      <Button 
                        onClick={() => handleDownloadExam(currentBanner.id, currentBanner.isPro)} 
                        disabled={downloadingId === currentBanner.id}
                        className="mt-2 bg-[#f4f1eb] text-stone-900 hover:bg-white hover:scale-105 font-black rounded-xl h-14 px-8 shadow-xl shadow-white/10 text-base transition-all duration-300"
                      >
                         {downloadingId === currentBanner.id ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Download className="mr-2 h-5 w-5" />}
                         {downloadingId === currentBanner.id ? "Đang xử lý..." : "Lưu Bộ Đề Này"}
                      </Button>
                   </div>

                   {/* Nút chuyển Slide */}
                   <div className="hidden md:flex flex-col gap-3">
                      <button onClick={() => setBannerIndex((prev) => (prev - 1 + topExams.length) % topExams.length)} className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-white backdrop-blur-md transition-all hover:scale-110 active:scale-95"><ChevronLeft size={24}/></button>
                      <button onClick={() => setBannerIndex((prev) => (prev + 1) % topExams.length)} className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-white backdrop-blur-md transition-all hover:scale-110 active:scale-95"><ChevronRight size={24}/></button>
                   </div>
                </div>
             </div>
          ) : null}
        </div>
      </div>

      {/* --- PHẦN NỘI DUNG CHÍNH --- */}
      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-grow">
        
        {/* THANH LỌC */}
        <div className="sticky top-[72px] z-30 bg-[#f4f1eb]/80 dark:bg-[#0c0a09]/80 backdrop-blur-2xl py-3 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-[#e6dfd3] dark:border-stone-800/60 rounded-2xl px-2">
          <div className="flex items-center gap-2.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 custom-scrollbar">
             {["All", "FREE", "PRO"].map((cat) => (
              <button
                key={cat} onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "whitespace-nowrap rounded-xl border px-5 py-2 font-black transition-all text-xs tracking-wider",
                  selectedCategory === cat 
                    ? "bg-[#2c2420] text-[#f4f1eb] border-[#2c2420] shadow-lg shadow-[#2c2420]/20 dark:bg-[#f4f1eb] dark:text-[#2c2420]"
                    : "bg-white/50 backdrop-blur-md border-[#e6dfd3] text-stone-600 hover:border-amber-500 hover:text-amber-600 dark:bg-stone-900/50 dark:border-stone-800 dark:text-stone-400"
                )}
              >
                {cat}
              </button>
             ))}
          </div>

          <div className="relative w-full md:w-80">
             <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
             <Input 
               value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Tìm kiếm tên đề thi..." 
               className="pl-10 h-11 bg-white/70 backdrop-blur-md border-[#e6dfd3] shadow-sm rounded-xl text-sm font-semibold dark:bg-stone-900/70 dark:border-stone-800 focus-visible:ring-amber-500"
             />
          </div>
        </div>

        {/* LƯỚI ĐỀ THI (THẺ MÀU TRÀ SỮA & HIỂN THỊ ICON PRO ĐẸP MẮT) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
               Array.from({length: 8}).map((_, i) => <div key={i} className="h-[300px] bg-[#e6dfd3]/50 dark:bg-stone-800 rounded-3xl animate-pulse"></div>)
          ) : filteredExams.length > 0 ? (
            filteredExams.map((exam) => (
              <div key={exam.id} className="group relative bg-[#faf8f5] dark:bg-[#161311] border border-[#e8e2d9] dark:border-stone-800/80 rounded-[1.5rem] overflow-hidden hover:shadow-2xl hover:shadow-[#2c2420]/10 dark:hover:shadow-black/60 transition-all duration-500 flex flex-col h-full z-0 hover:-translate-y-1.5">
                
                {/* HIỆU ỨNG GLASMORPHISM SAU NỀN */}
                <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${exam.gradient} rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 pointer-events-none`}></div>
                <div className={`absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr ${exam.gradient} rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 pointer-events-none`}></div>

                {/* --- NHÃN PRO / FREE (HIỂN THỊ RÕ RÀNG) --- */}
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                    {exam.isPro ? (
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-2.5 py-1 border-0 shadow-lg shadow-amber-500/30 flex items-center gap-1.5 uppercase tracking-widest">
                            <Crown size={12}/> PRO
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 text-[10px] font-black px-2.5 py-1 shadow-sm uppercase tracking-widest">
                            FREE
                        </Badge>
                    )}
                </div>

                {/* NỘI DUNG THẺ */}
                <div className="p-5 flex flex-col flex-grow z-10 bg-white/40 dark:bg-[#161311]/60 backdrop-blur-[2px]">
                  
                  {/* Icon & Category */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn("p-2.5 rounded-xl shadow-sm bg-gradient-to-br transition-transform group-hover:scale-110", exam.gradient)}>
                      <exam.icon size={18} className="text-white" />
                    </div>
                    <span className="text-[10px] font-black text-[#8c8279] dark:text-stone-400 uppercase tracking-widest">{exam.category}</span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-black text-[#2c2420] dark:text-stone-100 leading-snug line-clamp-2 mb-2 group-hover:text-amber-600 transition-colors">
                    {exam.title}
                  </h3>

                  {/* Description (Đã thêm) */}
                  <p className="text-sm text-[#7a6f68] dark:text-stone-400 line-clamp-2 mb-4 leading-relaxed font-medium">
                    {exam.description}
                  </p>

                  {/* Thông tin phụ: Tác giả, Lượt tải */}
                  <div className="flex items-center gap-3 text-xs font-semibold text-[#8c8279] dark:text-stone-400 mb-4">
                     <span className="bg-[#f0ece4] dark:bg-stone-800/50 px-2 py-1 rounded-md">{exam.author}</span>
                     <span className="flex items-center gap-1"><Users size={12}/> {exam.participants} tải</span>
                  </div>

                  {/* Footer Thẻ: Thời gian, Số câu */}
                  <div className="mt-auto pt-3 border-t border-[#e8e2d9] dark:border-stone-800 flex justify-between items-center text-xs font-bold text-[#5c534b] dark:text-stone-300">
                     <span className="flex items-center gap-1.5"><Timer size={14} className="text-amber-500"/> 10 phút</span>
                     <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-blue-500"/> {exam.questions} Câu</span>
                  </div>
                </div>

                {/* NÚT ACTION (Cong mượt, to rõ ràng) */}
                <div className="p-4 pt-0 z-10">
                  <Button 
                      onClick={() => handleDownloadExam(exam.id, exam.isPro)} 
                      disabled={downloadingId === exam.id}
                      className={cn(
                          "w-full text-sm font-black transition-all h-11 rounded-xl group/btn shadow-md",
                          exam.isPro 
                              ? "bg-amber-500 hover:bg-amber-600 text-stone-900 border-none shadow-amber-500/20" 
                              : "bg-[#2c2420] hover:bg-[#1a1512] text-[#f4f1eb] dark:bg-white dark:text-[#2c2420] dark:hover:bg-stone-200 border-none shadow-[#2c2420]/10"
                      )}
                  >
                     {downloadingId === exam.id ? (
                         <><Loader2 size={16} className="mr-2 animate-spin"/> Đang tải...</>
                     ) : (
                         <>
                           {exam.isPro ? "Mở khóa Tải Đề" : "Lưu Đề Miễn Phí"} 
                           <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                         </>
                     )}
                  </Button>
                </div>

              </div>
            ))
          ) : (
            <div className="col-span-full py-24 text-center">
               <div className="inline-block p-6 rounded-full bg-[#e8e2d9] dark:bg-stone-800 mb-4"><Search size={40} className="text-[#8c8279]" /></div>
               <h3 className="text-xl font-black text-[#2c2420] dark:text-stone-300">Không tìm thấy bài thi phù hợp</h3>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}