"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { 
  Search, SlidersHorizontal, Zap, Trophy, Star, ArrowRight, 
  Code, Globe, Calculator, PenTool, BarChart3, BookOpen, Flame, Users, Clock, Sparkles, Instagram, Facebook, Twitter, Linkedin
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link"; 

// --- CONFIG ICON MÔN HỌC ---
const SUBJECT_ICONS: Record<string, any> = {
  "English": { icon: Globe, color: "text-blue-600 bg-blue-50", grad: "from-blue-500 to-cyan-500" },
  "IT": { icon: Code, color: "text-cyan-600 bg-cyan-50", grad: "from-cyan-500 to-teal-500" },
  "Math": { icon: Calculator, color: "text-rose-600 bg-rose-50", grad: "from-rose-500 to-red-600" },
  "Design": { icon: PenTool, color: "text-purple-600 bg-purple-50", grad: "from-purple-500 to-violet-600" },
  "General": { icon: BookOpen, color: "text-stone-600 bg-stone-50", grad: "from-stone-500 to-gray-500" }
};

export default function TakeExamPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 1. FETCH & TRANSFORM DATA ---
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await fetch("/api/courses");
        const data = await res.json();

        if (Array.isArray(data)) {
          const formattedExams = data.map((c: any) => {
            // XỬ LÝ ICON
            let subjectType = "General";
            if (c.category) subjectType = c.category; 
            else if (c.title.includes("English")) subjectType = "English";
            else if (c.title.includes("IT") || c.title.includes("Code")) subjectType = "IT";
            const theme = SUBJECT_ICONS[subjectType] || SUBJECT_ICONS["General"];
            
            // GIẢ LẬP SỐ LIỆU "THỊ TRƯỜNG" (Marketplace Data)
            // 🔥 SỬA LỖI TẠI ĐÂY: Thêm String() để đảm bảo ID luôn là chuỗi trước khi gọi charCodeAt
            const safeId = String(c.id); 
            const seed = safeId.charCodeAt(0) || 0;
            
            const participants = (seed * 123) % 900 + 100; // 100 - 1000 người
            const rating = (4 + (seed % 10) / 10).toFixed(1); // 4.0 - 4.9
            const isHot = participants > 600;

            return {
              id: c.id,
              title: c.title,
              category: c.category || "General",
              level: c.level || "Beginner",
              icon: theme.icon,
              color: theme.color,
              gradient: theme.grad,
              participants: participants,
              rating: rating,
              isHot: isHot,
              questions: 10, // Bạn có thể lấy length của mảng questions nếu API trả về
              time: "10 mins"
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

  // --- 2. LOGIC BỘ LỌC ---
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || 
                              (exam.category && exam.category.includes(selectedCategory)) ||
                              (selectedCategory === "IT & Programming" && (exam.category === "IT" || exam.title.includes("IT")));
      const matchesDifficulty = selectedDifficulty ? exam.level === selectedDifficulty : true;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchTerm, selectedCategory, selectedDifficulty, exams]);

  // Lấy 1 bài để làm Featured (Bài đầu tiên hoặc bài Hot nhất)
  const featuredExam = exams.find(e => e.isHot) || exams[0];

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfbf7] dark:bg-[#0c0a09] transition-colors duration-500">
      <div className="flex-grow space-y-10 pb-20">
      
      {/* --- HERO SECTION (BANNER QUẢNG CÁO) --- */}
      {!loading && featuredExam && (
        <div className="relative overflow-hidden rounded-b-3xl bg-stone-900 text-white shadow-2xl mx-auto border-b border-stone-800 mb-8 animate-in fade-in slide-in-from-top-10 duration-700">
          <div className={`absolute inset-0 bg-gradient-to-r ${featuredExam.gradient} opacity-20`}></div>
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 p-10 md:p-14 flex flex-col md:flex-row items-center gap-10 max-w-7xl mx-auto">
            <div className="flex-1 space-y-6 text-center md:text-left">
               <Badge className="bg-amber-500 text-black hover:bg-amber-400 font-bold px-3 py-1 mb-2 animate-pulse border-0">
                  <Flame size={14} className="mr-1 fill-black" /> ĐỀ THI HOT NHẤT TUẦN
               </Badge>
               <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                  {featuredExam.title}
               </h1>
               <p className="text-stone-300 text-lg max-w-xl mx-auto md:mx-0">
                  Tham gia ngay cùng <span className="text-white font-bold">{featuredExam.participants}+ thí sinh</span> khác. 
                  Thử thách kiến thức {featuredExam.category} của bạn ngay hôm nay!
               </p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2">
                  <Link href={`/student/my-courses/${featuredExam.id}`}>
                      <Button size="lg" className="bg-white text-stone-900 hover:bg-stone-200 font-bold rounded-xl h-14 px-8 shadow-xl text-lg w-full sm:w-auto">
                         <Zap className="mr-2 fill-stone-900" /> Thử sức ngay
                      </Button>
                  </Link>
                  <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 backdrop-blur border border-white/10">
                     <Star className="text-yellow-400 fill-yellow-400" /> 
                     <span className="font-bold text-xl">{featuredExam.rating}</span>
                     <span className="text-stone-400 text-sm">Rating</span>
                  </div>
               </div>
            </div>
            
            {/* Hình minh họa 3D giả lập */}
            <div className="hidden md:flex items-center justify-center relative w-80 h-80">
               <div className={`absolute inset-0 bg-gradient-to-br ${featuredExam.gradient} rounded-full blur-[80px] opacity-40`}></div>
               <div className="relative bg-stone-950/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl rotate-6 hover:rotate-0 transition-transform duration-500">
                  <featuredExam.icon size={80} className="text-white mb-4" />
                  <div className="space-y-2">
                     <div className="h-2 w-32 bg-white/20 rounded-full"></div>
                     <div className="h-2 w-20 bg-white/20 rounded-full"></div>
                     <div className="h-2 w-40 bg-white/10 rounded-full mt-4"></div>
                  </div>
                  <Badge className="absolute top-4 right-4 bg-white text-black font-bold border-0">PRO</Badge>
               </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* --- FILTER BAR (THANH CÔNG CỤ) --- */}
      <div className="sticky top-[80px] z-30 bg-[#fdfbf7]/90 dark:bg-[#0c0a09]/90 backdrop-blur-xl py-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
           {["All", "English", "IT", "Math", "Design", "General"].map((cat) => (
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
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 px-4 bg-white border-stone-200 rounded-xl dark:bg-[#1c1917] dark:border-stone-800">
                <SlidersHorizontal size={16} className="mr-2"/> Lọc
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Độ khó</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {["Beginner", "Intermediate", "Advanced"].map(l => (
                  <DropdownMenuCheckboxItem key={l} checked={selectedDifficulty === l} onCheckedChange={(c) => setSelectedDifficulty(c ? l : null)}>
                      {l}
                  </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* --- EXAM GRID (DANH SÁCH THI ĐẤU) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
        {loading ? (
             Array.from({length: 8}).map((_, i) => (
                 <div key={i} className="h-72 bg-stone-200 dark:bg-stone-800 rounded-3xl animate-pulse"></div>
             ))
        ) : filteredExams.length > 0 ? (
          filteredExams.map((exam) => (
            <Card key={exam.id} className="group flex flex-col h-full relative overflow-hidden border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1917] hover:shadow-2xl hover:shadow-amber-900/5 dark:hover:shadow-black/50 hover:-translate-y-1.5 transition-all duration-300 rounded-3xl">
              {/* Sticker Hot */}
              {exam.isHot && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl z-10 shadow-sm">
                      HOT
                  </div>
              )}
              
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${exam.gradient}`}></div>
              
              <CardHeader className="pb-3 pt-6 px-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${exam.color} shadow-sm group-hover:scale-110 transition-transform`}>
                    <exam.icon size={24} />
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "border-0 font-bold px-3 py-1 uppercase text-[10px] tracking-wider",
                      exam.level === "Beginner" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30" :
                      exam.level === "Intermediate" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30" :
                      "bg-rose-100 text-rose-700 dark:bg-rose-900/30"
                    )}
                  >
                    {exam.level}
                  </Badge>
                </div>
                
                <div className="min-h-[3.5rem] flex items-center">
                  <CardTitle className="text-lg font-bold text-stone-800 dark:text-stone-100 leading-tight group-hover:text-amber-600 transition-colors line-clamp-2">
                    {exam.title}
                  </CardTitle>
                </div>

                <div className="flex items-center gap-3 pt-2 text-xs font-medium text-stone-500 dark:text-stone-400">
                  <span className="flex items-center gap-1"><Users size={12}/> {exam.participants}</span>
                  <span className="text-stone-300">•</span>
                  <span className="flex items-center gap-1 text-amber-500"><Star size={12} className="fill-amber-500"/> {exam.rating}</span>
                </div>
              </CardHeader>

              <CardContent className="pb-4 px-6 flex-grow">
                <div className="grid grid-cols-2 gap-2 mt-2">
                   <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-stone-400 uppercase font-bold">Thời gian</p>
                      <p className="text-sm font-bold text-stone-700 dark:text-stone-300">{exam.time}</p>
                   </div>
                   <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-stone-400 uppercase font-bold">Câu hỏi</p>
                      <p className="text-sm font-bold text-stone-700 dark:text-stone-300">{exam.questions}</p>
                   </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0 px-6 pb-6">
                <Link href={`/student/my-courses/${exam.id}`} className="w-full">
                    <Button className="w-full font-bold shadow-md transition-all h-11 rounded-xl bg-white border-2 border-stone-100 text-stone-700 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:bg-transparent dark:border-stone-700 dark:text-stone-300 dark:hover:border-amber-500 dark:hover:text-amber-400">
                       Chi tiết đề thi <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
             <div className="inline-block p-6 rounded-full bg-stone-100 dark:bg-stone-800 mb-4">
               <Search size={48} className="text-stone-300" />
             </div>
             <h3 className="text-xl font-bold text-stone-700 dark:text-stone-300">Không tìm thấy bài thi nào</h3>
             <Button 
               variant="link" onClick={() => {setSearchTerm(""); setSelectedCategory("All"); setSelectedDifficulty(null)}}
               className="text-amber-600 font-bold mt-2"
             >
               Xóa bộ lọc
             </Button>
          </div>
        )}
      </div>
      </div>
      </div>

      {/* --- FOOTER (CHUYÊN NGHIỆP) --- */}
      <footer className="bg-white dark:bg-[#1c1917] border-t border-stone-200 dark:border-stone-800 pt-16 pb-8">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
               {/* Cot 1: Brand */}
               <div className="col-span-1 md:col-span-1 space-y-4">
                  <div className="flex items-center gap-2 text-xl font-black text-stone-900 dark:text-white">
                     <div className="h-8 w-8 bg-amber-500 rounded-lg flex items-center justify-center text-white"><Zap size={20} fill="currentColor"/></div>
                     EduTech.AI
                  </div>
                  <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">
                     Nền tảng thi trắc nghiệm trực tuyến hàng đầu, ứng dụng AI để cá nhân hóa lộ trình học tập và đánh giá năng lực chuẩn xác.
                  </p>
                  <div className="flex gap-4 pt-2">
                     <Button size="icon" variant="ghost" className="hover:text-amber-600 hover:bg-amber-50 rounded-full"><Facebook size={18}/></Button>
                     <Button size="icon" variant="ghost" className="hover:text-amber-600 hover:bg-amber-50 rounded-full"><Twitter size={18}/></Button>
                     <Button size="icon" variant="ghost" className="hover:text-amber-600 hover:bg-amber-50 rounded-full"><Instagram size={18}/></Button>
                     <Button size="icon" variant="ghost" className="hover:text-amber-600 hover:bg-amber-50 rounded-full"><Linkedin size={18}/></Button>
                  </div>
               </div>

               {/* Cot 2: Links */}
               <div>
                  <h4 className="font-bold text-stone-900 dark:text-white mb-6">Khám phá</h4>
                  <ul className="space-y-3 text-sm text-stone-500 dark:text-stone-400">
                     <li className="hover:text-amber-600 cursor-pointer transition-colors">Về chúng tôi</li>
                     <li className="hover:text-amber-600 cursor-pointer transition-colors">Thư viện đề thi</li>
                     <li className="hover:text-amber-600 cursor-pointer transition-colors">Bảng xếp hạng</li>
                     <li className="hover:text-amber-600 cursor-pointer transition-colors">Blog công nghệ</li>
                  </ul>
               </div>

               {/* Cot 3: Support */}
               <div>
                  <h4 className="font-bold text-stone-900 dark:text-white mb-6">Hỗ trợ</h4>
                  <ul className="space-y-3 text-sm text-stone-500 dark:text-stone-400">
                     <li className="hover:text-amber-600 cursor-pointer transition-colors">Trung tâm trợ giúp</li>
                     <li className="hover:text-amber-600 cursor-pointer transition-colors">Điều khoản sử dụng</li>
                     <li className="hover:text-amber-600 cursor-pointer transition-colors">Chính sách bảo mật</li>
                     <li className="hover:text-amber-600 cursor-pointer transition-colors">Liên hệ báo lỗi</li>
                  </ul>
               </div>

               {/* Cot 4: Newsletter */}
               <div>
                  <h4 className="font-bold text-stone-900 dark:text-white mb-6">Đăng ký nhận tin</h4>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">Nhận thông báo về đề thi mới và mẹo thi cử hàng tuần.</p>
                  <div className="flex gap-2">
                     <Input placeholder="Email của bạn" className="bg-stone-50 border-stone-200 dark:bg-stone-900 dark:border-stone-800"/>
                     <Button className="bg-stone-900 text-white hover:bg-amber-600"><ArrowRight size={16}/></Button>
                  </div>
               </div>
            </div>

            <div className="border-t border-stone-100 dark:border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
               <p className="text-xs text-stone-400">© 2026 EduTech AI Platform. All rights reserved.</p>
               <div className="flex gap-6 text-xs text-stone-400">
                  <span className="hover:text-stone-600 cursor-pointer">Privacy</span>
                  <span className="hover:text-stone-600 cursor-pointer">Terms</span>
                  <span className="hover:text-stone-600 cursor-pointer">Sitemap</span>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}