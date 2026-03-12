"use client";

import { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react"; 
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { 
  Search, SlidersHorizontal, Zap, Star, ArrowRight, Crown,
  Code, Globe, Calculator, PenTool, BookOpen, Flame, Users, Instagram, Facebook, Twitter, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// --- CONFIG ICON MÔN HỌC ---
const SUBJECT_ICONS: Record<string, any> = {
  "English": { icon: Globe, color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400", grad: "from-blue-500 to-cyan-500" },
  "IT": { icon: Code, color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10 dark:text-cyan-400", grad: "from-cyan-500 to-teal-500" },
  "Toán": { icon: Calculator, color: "text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400", grad: "from-rose-500 to-red-600" },
  "Design": { icon: PenTool, color: "text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400", grad: "from-purple-500 to-violet-600" },
  "General": { icon: BookOpen, color: "text-stone-600 bg-stone-50 dark:bg-stone-500/10 dark:text-stone-400", grad: "from-stone-500 to-gray-500" }
};

export default function ExamLibraryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🔥 STATE MỚI: Theo dõi xem nút tải nào đang xoay loading
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  // Lấy dữ liệu thật từ Database
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
            
            return {
              id: c.id,
              title: c.title,
              category: c.category || "General",
              author: c.author?.name || "Giảng viên",
              icon: theme.icon,
              color: theme.color,
              gradient: theme.grad,
              participants: (seed * 123) % 900 + 100, 
              rating: (4 + (seed % 10) / 10).toFixed(1),
              isHot: ((seed * 123) % 900 + 100) > 600,
              questions: c._count?.questions || 0,
              isPro: c.category === "PRO" || c.price > 0 
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

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || 
                              (exam.category && exam.category.includes(selectedCategory));
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, exams]);

  const featuredExam = exams.find(e => e.isHot) || exams[0];

  // ==============================================================================
  // 🔥 LOGIC MỚI: TẢI ĐỀ (LƯU DATABASE) VÀ CHUYỂN HƯỚNG SANG MY COURSES
  // ==============================================================================
  const handleDownloadExam = async (examId: number, isPro: boolean) => {
      // 1. Kiểm tra quyền PRO
      const userIsPro = (session?.user as any)?.isPro === true; 

      if (isPro && !userIsPro) {
          toast.error("Khoá học này yêu cầu tài khoản PRO!", {
              description: "Vui lòng nâng cấp tài khoản để tải đề thi chất lượng cao.",
              action: {
                  label: "Nâng cấp ngay",
                  onClick: () => router.push("/student/pro") // Trỏ đúng về trang PRO
              }
          });
          return;
      }

      // 2. Bắt đầu gọi API lưu khóa học
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
                  description: "Đề thi đã được cất vào Khóa Học Của Tôi. Hệ thống đang chuyển hướng..."
              });
              
              // 3. Chuyển hướng sang kho cá nhân sau 1 giây
              setTimeout(() => {
                  router.push("/student/my-courses");
              }, 1000);
          } else {
              toast.error(data.error || "Có lỗi xảy ra khi tải đề.");
              setDownloadingId(null);
          }
      } catch (error) {
          toast.error("Lỗi kết nối đến máy chủ.");
          setDownloadingId(null);
      }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfbf7] dark:bg-[#0c0a09] transition-colors duration-500">
      <div className="flex-grow space-y-10 pb-20">
      
      {/* --- HERO SECTION --- */}
      {!loading && featuredExam && (
        <div className="relative overflow-hidden rounded-b-3xl bg-stone-900 text-white shadow-2xl mx-auto border-b border-stone-800 mb-8 animate-in fade-in slide-in-from-top-10 duration-700">
          <div className={`absolute inset-0 bg-gradient-to-r ${featuredExam.gradient} opacity-20`}></div>
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 p-10 md:p-14 flex flex-col md:flex-row items-center gap-10 max-w-7xl mx-auto">
            <div className="flex-1 space-y-6 text-center md:text-left">
               <Badge className="bg-amber-500 text-black hover:bg-amber-400 font-bold px-3 py-1 mb-2 animate-pulse border-0">
                  <Flame size={14} className="mr-1 fill-black" /> ĐỀ THI HOT NHẤT TUẦN
               </Badge>
               <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight line-clamp-2">
                  {featuredExam.title}
               </h1>
               <p className="text-stone-300 text-lg max-w-xl mx-auto md:mx-0">
                  Cung cấp bởi: <span className="font-bold text-white">{featuredExam.author}</span> • {featuredExam.questions} câu hỏi
               </p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2">
                  <Button 
                    size="lg" 
                    onClick={() => handleDownloadExam(featuredExam.id, featuredExam.isPro)} 
                    disabled={downloadingId === featuredExam.id}
                    className="bg-white text-stone-900 hover:bg-stone-200 font-bold rounded-xl h-14 px-8 shadow-xl text-lg w-full sm:w-auto"
                  >
                     {downloadingId === featuredExam.id ? <Loader2 className="mr-2 animate-spin text-stone-900"/> : <Zap className="mr-2 fill-stone-900" />}
                     {downloadingId === featuredExam.id ? "Đang xử lý..." : "Tải Đề Ngay"}
                  </Button>
               </div>
            </div>
            
            <div className="hidden md:flex items-center justify-center relative w-80 h-80">
               <div className={`absolute inset-0 bg-gradient-to-br ${featuredExam.gradient} rounded-full blur-[80px] opacity-40`}></div>
               <div className="relative bg-stone-950/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl rotate-6 hover:rotate-0 transition-transform duration-500">
                  <featuredExam.icon size={80} className="text-white mb-4" />
                  <div className="space-y-2">
                     <div className="h-2 w-32 bg-white/20 rounded-full"></div>
                     <div className="h-2 w-20 bg-white/20 rounded-full"></div>
                  </div>
                  {featuredExam.isPro && <Badge className="absolute top-4 right-4 bg-amber-500 text-black font-bold border-0">PRO</Badge>}
               </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* --- FILTER BAR --- */}
      <div className="sticky top-[80px] z-30 bg-[#fdfbf7]/90 dark:bg-[#0c0a09]/90 backdrop-blur-xl py-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
           {["All", "FREE", "PRO"].map((cat) => (
            <button
              key={cat} onClick={() => setSelectedCategory(cat)}
              className={cn(
                "whitespace-nowrap rounded-full border px-5 py-2 font-bold transition-all text-sm",
                selectedCategory === cat 
                  ? "bg-stone-900 text-white border-stone-900 shadow-lg dark:bg-stone-100 dark:text-stone-900"
                  : "bg-white border-stone-200 text-stone-600 hover:border-amber-400 hover:text-amber-600 dark:bg-[#1c1917] dark:border-stone-800 dark:text-stone-400"
              )}
            >
              {cat}
            </button>
           ))}
        </div>

        <div className="flex gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input 
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm đề thi..." 
                className="pl-9 bg-white border-stone-200 rounded-xl dark:bg-[#1c1917] dark:border-stone-800"
              />
           </div>
        </div>
      </div>

      {/* --- EXAM GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
        {loading ? (
             Array.from({length: 8}).map((_, i) => (
                 <div key={i} className="h-72 bg-stone-200 dark:bg-stone-800 rounded-3xl animate-pulse"></div>
             ))
        ) : filteredExams.length > 0 ? (
          filteredExams.map((exam) => (
            <Card key={exam.id} className="group flex flex-col h-full relative overflow-hidden border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1917] hover:shadow-2xl hover:shadow-amber-900/5 dark:hover:shadow-black/50 hover:-translate-y-1.5 transition-all duration-300 rounded-3xl">
              {/* Sticker PRO */}
              {exam.isPro && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-black text-xs font-bold px-3 py-1.5 rounded-bl-2xl z-10 shadow-sm flex items-center gap-1">
                      <Crown size={12}/> PRO
                  </div>
              )}
              
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${exam.gradient}`}></div>
              
              <CardHeader className="pb-3 pt-6 px-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${exam.color} shadow-sm group-hover:scale-110 transition-transform`}>
                    <exam.icon size={24} />
                  </div>
                  {!exam.isPro && <Badge variant="outline" className="border-emerald-200 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 font-bold px-3 py-1">FREE</Badge>}
                </div>
                
                <div className="min-h-[3.5rem] flex items-center">
                  <CardTitle className="text-lg font-bold text-stone-800 dark:text-stone-100 leading-tight group-hover:text-amber-600 transition-colors line-clamp-2">
                    {exam.title}
                  </CardTitle>
                </div>

                <div className="flex items-center gap-3 pt-2 text-xs font-medium text-stone-500 dark:text-stone-400">
                  <span className="flex items-center gap-1"><Users size={12}/> {exam.participants} lượt tải</span>
                </div>
              </CardHeader>

              <CardContent className="pb-4 px-6 flex-grow">
                <div className="grid grid-cols-2 gap-2 mt-2">
                   <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-3 text-center border border-stone-100 dark:border-stone-800">
                      <p className="text-[10px] text-stone-400 uppercase font-bold">Câu hỏi</p>
                      <p className="text-sm font-bold text-stone-700 dark:text-stone-300">{exam.questions}</p>
                   </div>
                   <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-3 text-center border border-stone-100 dark:border-stone-800">
                      <p className="text-[10px] text-stone-400 uppercase font-bold">Giảng viên</p>
                      <p className="text-sm font-bold text-stone-700 dark:text-stone-300 truncate px-1">{exam.author}</p>
                   </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0 px-6 pb-6 mt-auto">
                <Button 
                    onClick={() => handleDownloadExam(exam.id, exam.isPro)} 
                    disabled={downloadingId === exam.id}
                    className={cn(
                        "w-full font-bold shadow-md transition-all h-12 rounded-xl group",
                        exam.isPro 
                            ? "bg-amber-500 hover:bg-amber-600 text-stone-900 shadow-amber-500/20" 
                            : "bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
                    )}
                >
                   {downloadingId === exam.id ? (
                       <><Loader2 size={16} className="mr-2 animate-spin"/> Đang Tải Về...</>
                   ) : (
                       <>
                         {exam.isPro ? "Mở khóa Tải Đề" : "Xem & Tải Miễn Phí"} 
                         <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                       </>
                   )}
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
             <div className="inline-block p-6 rounded-full bg-stone-100 dark:bg-stone-800 mb-4">
               <Search size={48} className="text-stone-300" />
             </div>
             <h3 className="text-xl font-bold text-stone-700 dark:text-stone-300">Không tìm thấy bài thi nào</h3>
          </div>
        )}
      </div>
      </div>
      </div>

      {/* --- FOOTER (Giữ nguyên) --- */}
      <footer className="bg-white dark:bg-[#110e0d] border-t border-stone-200 dark:border-stone-800/50 pt-20 pb-10">
         <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 mb-16">
               <div className="col-span-1 md:col-span-4 space-y-6">
                  <div className="flex items-center gap-2 text-2xl font-black text-stone-900 dark:text-white">
                     <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                         <Zap size={24} fill="currentColor"/>
                     </div>
                     EduTech.AI
                  </div>
                  <p className="text-stone-500 dark:text-stone-400 text-base leading-relaxed pr-4">
                     Kho tàng tri thức vô tận. Nền tảng duy nhất bạn cần để chinh phục mọi kỳ thi, từ THPT Quốc Gia đến các chứng chỉ quốc tế.
                  </p>
                  <div className="flex gap-3 pt-2">
                     <Button size="icon" variant="outline" className="rounded-full border-stone-200 dark:border-stone-700 hover:text-blue-600 hover:border-blue-600 dark:bg-transparent"><Facebook size={18}/></Button>
                     <Button size="icon" variant="outline" className="rounded-full border-stone-200 dark:border-stone-700 hover:text-sky-500 hover:border-sky-500 dark:bg-transparent"><Twitter size={18}/></Button>
                     <Button size="icon" variant="outline" className="rounded-full border-stone-200 dark:border-stone-700 hover:text-rose-500 hover:border-rose-500 dark:bg-transparent"><Instagram size={18}/></Button>
                  </div>
               </div>

               <div className="col-span-1 md:col-span-2 md:col-start-6">
                  <h4 className="font-bold text-stone-900 dark:text-white mb-6 text-lg">Khám phá</h4>
                  <ul className="space-y-4 text-base text-stone-500 dark:text-stone-400 font-medium">
                     <li className="hover:text-amber-600 dark:hover:text-amber-500 cursor-pointer transition-colors">Trang chủ</li>
                     <li className="hover:text-amber-600 dark:hover:text-amber-500 cursor-pointer transition-colors flex items-center gap-2">Đề thi PRO <Badge className="bg-amber-500 hover:bg-amber-500 text-[10px] px-1 py-0 h-4">HOT</Badge></li>
                     <li className="hover:text-amber-600 dark:hover:text-amber-500 cursor-pointer transition-colors">Bảng xếp hạng</li>
                  </ul>
               </div>

               <div className="col-span-1 md:col-span-2">
                  <h4 className="font-bold text-stone-900 dark:text-white mb-6 text-lg">Hỗ trợ</h4>
                  <ul className="space-y-4 text-base text-stone-500 dark:text-stone-400 font-medium">
                     <li className="hover:text-amber-600 dark:hover:text-amber-500 cursor-pointer transition-colors">Trung tâm CSKH</li>
                     <li className="hover:text-amber-600 dark:hover:text-amber-500 cursor-pointer transition-colors">Chính sách bảo mật</li>
                     <li className="hover:text-amber-600 dark:hover:text-amber-500 cursor-pointer transition-colors">Điều khoản dịch vụ</li>
                  </ul>
               </div>

               <div className="col-span-1 md:col-span-3">
                  <h4 className="font-bold text-stone-900 dark:text-white mb-6 text-lg">Nhận thông báo</h4>
                  <p className="text-base text-stone-500 dark:text-stone-400 mb-4 font-medium">Đừng bỏ lỡ các bộ đề Vận dụng cao mới nhất.</p>
                  <div className="flex flex-col gap-3">
                     <Input placeholder="Nhập email của bạn..." className="h-12 bg-stone-50 border-stone-200 dark:bg-stone-900/50 dark:border-stone-800 rounded-xl px-4"/>
                     <Button className="h-12 bg-stone-900 text-white hover:bg-amber-600 rounded-xl font-bold dark:bg-white dark:text-stone-900 dark:hover:bg-amber-500 w-full">Đăng ký ngay</Button>
                  </div>
               </div>
            </div>

            <div className="border-t border-stone-100 dark:border-stone-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium">
               <p className="text-stone-400">© 2026 EduTech AI Platform. Mọi bản quyền được bảo lưu.</p>
               <div className="flex gap-6 text-stone-400">
                  <span className="hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer transition-colors">Privacy</span>
                  <span className="hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer transition-colors">Terms</span>
                  <span className="hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer transition-colors">Vietnam (VN)</span>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}