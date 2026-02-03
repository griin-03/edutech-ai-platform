"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  BookOpen, Clock, Search, Filter, LayoutGrid, List as ListIcon, 
  PlayCircle, Award, Sparkles, Zap, CheckCircle2, ArrowRight, GraduationCap, ArrowUpRight, BarChart3, Repeat, CalendarDays
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link"; 

// Interface cho dữ liệu thật
interface CourseData {
  id: string;
  title: string;
  level: string;
  description: string;
  thumbnail: string | null;
  examResults: { score: number; createdAt: string }[]; // Mảng kết quả thi từ DB
  
  // Các chỉ số tính toán (Computed metrics)
  progress: number;
  bestScore: number;
  attempts: number;
  lastAttemptDate: string | null;
  status: "Not Started" | "In Progress" | "Completed";
  image: string;
}

export default function MyCoursesPage() {
  // --- STATE QUẢN LÝ ---
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  
  // --- STATE DỮ LIỆU ---
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalLearning: 0, completed: 0, avgScore: 0 });

  // --- EFFECT: TẢI DỮ LIỆU & TÍNH TOÁN METRICS ---
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // GỌI API VỚI MODE=MINE (Chỉ lấy khóa học của tôi)
        const res = await fetch("/api/courses?mode=mine");
        
        if (!res.ok) throw new Error("Failed to fetch");
        
        const realData = await res.json();

        if (Array.isArray(realData)) {
          let totalScoreSum = 0;
          let examCount = 0;

          const formattedCourses = realData.map((c: any, index: number) => {
            // 1. Phân tích kết quả thi
            const results = c.examResults || [];
            const attempts = results.length;
            
            // 2. Tìm điểm cao nhất
            const bestScore = attempts > 0 ? Math.max(...results.map((r:any) => r.score)) : 0;
            
            // 3. Xác định ngày thi gần nhất
            const lastAttemptDate = attempts > 0 
                ? new Date(results[0].createdAt).toLocaleDateString('vi-VN') 
                : null;

            // 4. Tính toán tiến độ & Trạng thái
            // - Chưa thi: 0% (Hoặc mặc định là đang học vì đã add vào My Courses)
            // - Đã thi nhưng < 5 điểm: 50%
            // - Đã thi và >= 5 điểm: 100% (Hoàn thành)
            let progress = 0;
            let status: any = "Not Started";

            if (attempts > 0) {
                if (bestScore >= 5) {
                    progress = 100;
                    status = "Completed";
                } else {
                    progress = 50; 
                    status = "In Progress";
                }
                totalScoreSum += bestScore;
                examCount++;
            } else {
                // Nếu chưa thi lần nào nhưng đã có trong My Courses -> Coi là đang học (mới bắt đầu)
                progress = 0;
                status = "In Progress"; 
            }

            // 5. Hình ảnh (Fallback)
            const bgGradients = [
                "bg-gradient-to-br from-blue-500 to-cyan-600",
                "bg-gradient-to-br from-purple-500 to-pink-600",
                "bg-gradient-to-br from-amber-500 to-orange-600",
                "bg-gradient-to-br from-emerald-500 to-teal-600"
            ];

            return {
              id: c.id, 
              title: c.title,
              level: c.level || "Beginner",
              description: c.description,
              thumbnail: c.thumbnail,
              examResults: results,
              
              // Metrics
              progress,
              bestScore,
              attempts,
              lastAttemptDate,
              status,
              image: c.thumbnail ? `url(${c.thumbnail})` : bgGradients[index % bgGradients.length],
            };
          });

          setCourses(formattedCourses);

          // Cập nhật thống kê tổng quan
          setStats({
            totalLearning: formattedCourses.length,
            completed: formattedCourses.filter((c: any) => c.status === "Completed").length,
            avgScore: examCount > 0 ? parseFloat((totalScoreSum / examCount).toFixed(1)) : 0
          });
        }
      } catch (error) {
        console.error("Lỗi tải khóa học:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // --- LOGIC LỌC & SẮP XẾP ---
  const processedCourses = useMemo(() => {
    let data = [...courses]; 

    // Filter by Tab
    if (activeTab === "in-progress") data = data.filter(c => c.status === "In Progress" || c.status === "Not Started");
    else if (activeTab === "completed") data = data.filter(c => c.status === "Completed");

    // Filter by Search
    if (searchQuery) {
      data = data.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Sort
    if (sortOrder === "score-desc") data.sort((a, b) => b.bestScore - a.bestScore);
    else if (sortOrder === "progress-desc") data.sort((a, b) => b.progress - a.progress);
    else if (sortOrder === "az") data.sort((a, b) => a.title.localeCompare(b.title));
    
    return data;
  }, [activeTab, searchQuery, sortOrder, courses]);

  return (
    <div className="space-y-10 pb-20 min-h-screen bg-[#fdfbf7] transition-colors duration-500">
      
      {/* --- HEADER --- */}
      <div className="space-y-8 animate-in fade-in slide-in-from-top-10 duration-700">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <Badge variant="outline" className="mb-2 bg-amber-50 text-amber-700 border-amber-200">
              <Sparkles size={12} className="mr-1" /> Học tập dựa trên dữ liệu thật
            </Badge>
            <h1 className="text-4xl font-black text-stone-800 tracking-tight">
              Hồ Sơ Học Tập Của Tôi
            </h1>
            <p className="text-stone-500 font-medium mt-2 max-w-xl">
              Theo dõi tiến độ, điểm số và lịch sử ôn luyện chi tiết của bạn.
            </p>
          </div>
          <Link href="/student/take-exam">
             <Button className="bg-stone-900 text-white hover:bg-black font-bold rounded-xl h-12 px-6 shadow-lg">
                <ArrowRight className="mr-2 h-5 w-5" /> Tìm đề thi mới
             </Button>
          </Link>
        </div>

        {/* STATS CARDS (DỮ LIỆU THẬT) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Điểm trung bình */}
          <Card className="border-0 shadow-lg shadow-amber-500/5 bg-white relative overflow-hidden group hover:-translate-y-1 transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                  <div className="h-12 w-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
                    <BarChart3 size={24} />
                  </div>
                  <Badge className={cn("text-white border-0", stats.avgScore >= 8 ? "bg-green-500" : stats.avgScore >= 5 ? "bg-amber-500" : "bg-stone-400")}>
                     {stats.avgScore >= 8 ? "Xuất sắc" : stats.avgScore >= 5 ? "Khá" : "Chưa có điểm"}
                  </Badge>
              </div>
              <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">Điểm trung bình</p>
              <div className="flex items-baseline gap-1 mt-1">
                 <p className="text-4xl font-black text-stone-800">{stats.avgScore}</p>
                 <span className="text-stone-400 font-bold">/10</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Card 2: Hoàn thành */}
          <Card className="border-0 shadow-lg shadow-emerald-500/5 bg-white relative overflow-hidden group hover:-translate-y-1 transition-all">
            <CardContent className="p-6">
              <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
                <CheckCircle2 size={24} />
              </div>
              <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">Đã hoàn thành</p>
              <p className="text-4xl font-black text-stone-800 mt-1">
                 {stats.completed} <span className="text-sm text-stone-400 font-medium">khóa học</span>
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Đang học */}
          <Card className="border-0 shadow-lg shadow-purple-500/5 bg-white relative overflow-hidden group hover:-translate-y-1 transition-all">
            <CardContent className="p-6">
              <div className="h-12 w-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-4">
                <BookOpen size={24} />
              </div>
              <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">Đang theo học</p>
              <p className="text-4xl font-black text-stone-800 mt-1">
                 {stats.totalLearning} <span className="text-sm text-stone-400 font-medium">khóa học</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- CONTROLS --- */}
      <div className="sticky top-[80px] z-30 bg-[#fdfbf7]/90 backdrop-blur-xl p-2 rounded-2xl">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 group-focus-within:text-amber-500" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm khoá học..." 
              className="pl-10 bg-stone-50 border-stone-200 h-11 rounded-lg"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 rounded-lg border-stone-200 text-stone-600">
                  <Filter className="mr-2 h-4 w-4" /> 
                  {sortOrder === 'newest' ? 'Mới nhất' : sortOrder === 'score-desc' ? 'Điểm cao nhất' : 'Sắp xếp'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={sortOrder} onValueChange={setSortOrder}>
                  <DropdownMenuRadioItem value="newest">Mới nhất</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="score-desc">Điểm cao nhất</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="progress-desc">Tiến độ cao nhất</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="az">Tên A - Z</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center bg-stone-100 p-1 rounded-lg">
               <Button variant="ghost" size="sm" onClick={() => setViewMode('grid')} className={cn("h-9 w-9 p-0", viewMode === 'grid' && "bg-white shadow-sm text-amber-600")}>
                 <LayoutGrid size={18} />
               </Button>
               <Button variant="ghost" size="sm" onClick={() => setViewMode('list')} className={cn("h-9 w-9 p-0", viewMode === 'list' && "bg-white shadow-sm text-amber-600")}>
                 <ListIcon size={18} />
               </Button>
            </div>
          </div>
        </div>
      </div>

      {/* --- COURSE LIST --- */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-transparent p-0 h-auto gap-2 flex-wrap">
          {["all", "in-progress", "completed"].map((tab) => (
            <TabsTrigger 
              key={tab} 
              value={tab} 
              className={cn(
                "rounded-full border border-stone-200 px-6 py-2.5 font-bold transition-all text-sm bg-white text-stone-500",
                "data-[state=active]:bg-stone-900 data-[state=active]:text-white data-[state=active]:border-transparent"
              )}
            >
              {tab === 'all' ? 'Tất cả' : tab === 'in-progress' ? 'Đang học' : 'Hoàn thành'}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 min-h-[400px]">
          {loading ? (
             <div className="text-center py-20 flex flex-col items-center">
                 <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full mb-4"></div>
                 <p className="text-stone-500">Đang tải dữ liệu học tập...</p>
             </div>
          ) : processedCourses.length > 0 ? (
            <div className={cn(
              "grid gap-6",
              viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
              {processedCourses.map((course, index) => (
                <Card 
                  key={course.id} 
                  className={cn(
                    "group overflow-hidden border-stone-200 bg-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 rounded-3xl",
                    viewMode === 'list' && "flex flex-col md:flex-row"
                  )}
                >
                  {/* Image Section */}
                  <div className={cn(
                    "relative overflow-hidden shrink-0",
                    viewMode === 'grid' ? "h-52 w-full" : "w-full md:w-72 h-52 md:h-auto"
                  )}>
                     <div className={`absolute inset-0 bg-cover bg-center ${!course.thumbnail ? course.image : ''}`} 
                          style={course.thumbnail ? {backgroundImage: `url(${course.thumbnail})`} : {}}>
                     </div>
                     <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all"></div>
                     
                     <Badge className="absolute top-4 left-4 bg-white/90 text-stone-900 backdrop-blur-md shadow-lg border-0 font-bold px-3">
                        {course.level}
                     </Badge>

                     <Link href={`/student/my-courses/${course.id}`}>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/20 backdrop-blur-[2px] cursor-pointer">
                            <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center text-amber-600 shadow-2xl transform scale-50 group-hover:scale-100 transition-all duration-500">
                              <PlayCircle size={28} fill="currentColor" />
                            </div>
                        </div>
                     </Link>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 flex flex-col p-6">
                    {/* Header Metrics */}
                    <div className="flex justify-between items-start mb-3">
                       <Badge variant="outline" className={cn(
                         "border-0 px-2 py-1 gap-1",
                         course.status === "Completed" ? "bg-emerald-100 text-emerald-700" :
                         course.status === "In Progress" ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-600"
                       )}>
                          {course.status === "Completed" ? <CheckCircle2 size={12}/> : course.status === "In Progress" ? <Clock size={12}/> : <BookOpen size={12}/>}
                          {course.status === "Completed" ? "Đã xong" : course.status === "In Progress" ? "Đang học" : "Mới lưu"}
                       </Badge>

                       {/* Điểm số cao nhất */}
                       <div className="text-right">
                          <span className="text-[10px] text-stone-400 font-bold uppercase block">Điểm cao nhất</span>
                          <span className={cn(
                             "text-lg font-black",
                             course.bestScore >= 8 ? "text-emerald-600" : course.bestScore >= 5 ? "text-amber-600" : "text-stone-400"
                          )}>
                             {course.bestScore.toFixed(1)}
                          </span>
                       </div>
                    </div>

                    <h3 className="font-bold text-xl text-stone-800 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                      {course.title}
                    </h3>
                    
                    {/* Detail Metrics */}
                    <div className="grid grid-cols-2 gap-4 my-4 p-3 bg-stone-50 rounded-xl">
                        <div>
                           <div className="flex items-center gap-1.5 text-xs text-stone-400 font-medium mb-1">
                              <Repeat size={14}/> Số lần thi
                           </div>
                           <p className="text-sm font-bold text-stone-700">{course.attempts} lần</p>
                        </div>
                        <div>
                           <div className="flex items-center gap-1.5 text-xs text-stone-400 font-medium mb-1">
                              <CalendarDays size={14}/> Gần nhất
                           </div>
                           <p className="text-sm font-bold text-stone-700">{course.lastAttemptDate || "--"}</p>
                        </div>
                    </div>

                    <div className="mt-auto space-y-5">
                       <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold text-stone-600">
                             <span>Tiến độ</span>
                             <span className="text-stone-400">{course.progress}%</span>
                          </div>
                          
                          <Progress 
                            value={course.progress} 
                            className={cn(
                              "h-2 bg-stone-100 rounded-full", 
                              course.progress === 100 ? "[&>*]:bg-emerald-500" : "[&>*]:bg-gradient-to-r [&>*]:from-amber-500 [&>*]:to-orange-500"
                            )} 
                          />
                       </div>
                       
                       <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                          <Link href={`/student/my-courses/${course.id}`} className="w-full">
                              <Button className={cn(
                                 "w-full font-bold rounded-lg transition-all shadow-md",
                                 course.status === "Completed" 
                                   ? "bg-white border-2 border-stone-200 text-stone-700 hover:bg-stone-50"
                                   : "bg-stone-900 text-white hover:bg-amber-600"
                              )}>
                                 {course.status === "Completed" ? "Ôn tập lại" : "Vào học ngay"}
                              </Button>
                          </Link>
                       </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
               <div className="h-24 w-24 bg-stone-100 rounded-full flex items-center justify-center mb-6">
                  <Search size={40} className="text-stone-300" />
               </div>
               <h3 className="text-xl font-bold text-stone-800">
                 Chưa có khóa học nào
               </h3>
               <p className="text-stone-500 mt-2 max-w-xs mx-auto">
                 Hãy vào <Link href="/student/exam-library" className="text-amber-600 font-bold hover:underline">Thư viện đề thi</Link> để lưu đề thi về đây nhé.
               </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}