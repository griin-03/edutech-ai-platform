"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  BookOpen, Clock, Search, Filter, LayoutGrid, List as ListIcon, 
  PlayCircle, Sparkles, CheckCircle2, ArrowRight, BarChart3, Repeat, CalendarDays
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
  examResults: { score: number; createdAt: string }[]; 
  progress: number;
  bestScore: number;
  attempts: number;
  lastAttemptDate: string | null;
  status: "Not Started" | "In Progress" | "Completed";
  image: string;
}

export default function MyCoursesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalLearning: 0, completed: 0, avgScore: 0 });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses?mode=mine");
        
        if (!res.ok) throw new Error("Failed to fetch");
        
        const realData = await res.json();

        if (Array.isArray(realData)) {
          let totalScoreSum = 0;
          let examCount = 0;

          const formattedCourses = realData.map((c: any, index: number) => {
            const results = c.examResults || [];
            const attempts = results.length;
            
            const bestScore = attempts > 0 ? Math.max(...results.map((r:any) => r.score)) : 0;
            
            const lastAttemptDate = attempts > 0 
                ? new Date(results[0].createdAt).toLocaleDateString('vi-VN') 
                : null;

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
                progress = 0;
                status = "In Progress"; 
            }

            const bgGradients = [
                "bg-gradient-to-br from-blue-500 to-cyan-600",
                "bg-gradient-to-br from-purple-500 to-pink-600",
                "bg-gradient-to-br from-amber-500 to-orange-600",
                "bg-gradient-to-br from-emerald-500 to-teal-600"
            ];

            return {
              id: c.id, 
              title: c.title,
              level: c.category || "General", // Thay Level thành Category từ DB
              description: c.description,
              thumbnail: c.thumbnail,
              examResults: results,
              progress,
              bestScore,
              attempts,
              lastAttemptDate,
              status,
              image: c.thumbnail ? `url(${c.thumbnail})` : bgGradients[index % bgGradients.length],
            };
          });

          setCourses(formattedCourses);
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

  const processedCourses = useMemo(() => {
    let data = [...courses]; 

    if (activeTab === "in-progress") data = data.filter(c => c.status === "In Progress" || c.status === "Not Started");
    else if (activeTab === "completed") data = data.filter(c => c.status === "Completed");

    if (searchQuery) {
      data = data.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (sortOrder === "score-desc") data.sort((a, b) => b.bestScore - a.bestScore);
    else if (sortOrder === "progress-desc") data.sort((a, b) => b.progress - a.progress);
    else if (sortOrder === "az") data.sort((a, b) => a.title.localeCompare(b.title));
    
    return data;
  }, [activeTab, searchQuery, sortOrder, courses]);

  return (
    <div className="space-y-10 p-6 md:p-8 pb-20 min-h-screen bg-[#fdfbf7] dark:bg-[#0c0a09] transition-colors duration-500 rounded-3xl">
      
      {/* --- HEADER --- */}
      <div className="space-y-8 animate-in fade-in slide-in-from-top-10 duration-700">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
          <div>
            <Badge variant="outline" className="mb-2 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-500 font-bold px-3 py-1">
              <Sparkles size={14} className="mr-1.5" /> Học tập dựa trên dữ liệu thật
            </Badge>
            <h1 className="text-4xl font-black text-stone-800 dark:text-white tracking-tight mt-1">
              Hồ Sơ Học Tập
            </h1>
            <p className="text-stone-500 dark:text-stone-400 font-medium mt-2 max-w-xl">
              Theo dõi tiến độ, điểm số và lịch sử ôn luyện chi tiết của bạn.
            </p>
          </div>
          <Link href="/student/exam-library">
             <Button className="bg-stone-900 text-white hover:bg-black dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200 font-bold rounded-xl h-12 px-6 shadow-lg transition-transform hover:scale-105">
                Tìm đề thi mới <ArrowRight className="ml-2 h-5 w-5" />
             </Button>
          </Link>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-lg shadow-amber-500/5 bg-white dark:bg-[#1c1917] relative overflow-hidden group hover:-translate-y-1 transition-all rounded-3xl">
            <CardContent className="p-6 md:p-8">
              <div className="flex justify-between items-start">
                  <div className="h-14 w-14 bg-amber-100 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
                    <BarChart3 size={28} />
                  </div>
                  <Badge className={cn("text-white border-0 px-3 py-1 font-bold", stats.avgScore >= 8 ? "bg-emerald-500" : stats.avgScore >= 5 ? "bg-amber-500" : "bg-stone-400 dark:bg-stone-700")}>
                     {stats.avgScore >= 8 ? "Xuất sắc" : stats.avgScore >= 5 ? "Khá" : "Chưa có điểm"}
                  </Badge>
              </div>
              <p className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Điểm trung bình</p>
              <div className="flex items-baseline gap-1 mt-1">
                 <p className="text-5xl font-black text-stone-800 dark:text-white">{stats.avgScore}</p>
                 <span className="text-stone-400 font-bold text-lg">/10</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-lg shadow-emerald-500/5 bg-white dark:bg-[#1c1917] relative overflow-hidden group hover:-translate-y-1 transition-all rounded-3xl">
            <CardContent className="p-6 md:p-8">
              <div className="h-14 w-14 bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                <CheckCircle2 size={28} />
              </div>
              <p className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Đã hoàn thành</p>
              <p className="text-5xl font-black text-stone-800 dark:text-white mt-1">
                 {stats.completed} <span className="text-base text-stone-400 font-medium">bài</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg shadow-purple-500/5 bg-white dark:bg-[#1c1917] relative overflow-hidden group hover:-translate-y-1 transition-all rounded-3xl">
            <CardContent className="p-6 md:p-8">
              <div className="h-14 w-14 bg-purple-100 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                <BookOpen size={28} />
              </div>
              <p className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Đang lưu trữ</p>
              <p className="text-5xl font-black text-stone-800 dark:text-white mt-1">
                 {stats.totalLearning} <span className="text-base text-stone-400 font-medium">đề thi</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- CONTROLS --- */}
      <div className="sticky top-[80px] z-30 bg-[#fdfbf7]/90 dark:bg-[#0c0a09]/90 backdrop-blur-xl p-2 rounded-2xl -mx-2">
        <div className="bg-white dark:bg-[#1c1917] p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm đề thi đã lưu..." 
              className="pl-10 bg-stone-50 dark:bg-stone-900 border-none h-11 rounded-lg focus-visible:ring-amber-500 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 rounded-lg border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 dark:bg-stone-900">
                  <Filter className="mr-2 h-4 w-4" /> 
                  {sortOrder === 'newest' ? 'Mới nhất' : sortOrder === 'score-desc' ? 'Điểm cao nhất' : 'Sắp xếp'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuRadioGroup value={sortOrder} onValueChange={setSortOrder}>
                  <DropdownMenuRadioItem value="newest" className="rounded-lg">Mới nhất</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="score-desc" className="rounded-lg">Điểm cao nhất</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="progress-desc" className="rounded-lg">Tiến độ cao nhất</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="az" className="rounded-lg">Tên A - Z</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center bg-stone-100 dark:bg-stone-900 p-1 rounded-lg">
               <Button variant="ghost" size="sm" onClick={() => setViewMode('grid')} className={cn("h-9 w-9 p-0 rounded-md", viewMode === 'grid' && "bg-white dark:bg-stone-800 shadow-sm text-amber-600")}>
                 <LayoutGrid size={18} />
               </Button>
               <Button variant="ghost" size="sm" onClick={() => setViewMode('list')} className={cn("h-9 w-9 p-0 rounded-md", viewMode === 'list' && "bg-white dark:bg-stone-800 shadow-sm text-amber-600")}>
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
                "rounded-full border border-stone-200 dark:border-stone-800 px-6 py-2.5 font-bold transition-all text-sm bg-white dark:bg-[#1c1917] text-stone-500 dark:text-stone-400",
                "data-[state=active]:bg-stone-900 data-[state=active]:text-white data-[state=active]:border-transparent",
                "dark:data-[state=active]:bg-white dark:data-[state=active]:text-stone-900"
              )}
            >
              {tab === 'all' ? 'Tất cả' : tab === 'in-progress' ? 'Chưa đạt / Đang học' : 'Hoàn thành'}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 min-h-[400px]">
          {loading ? (
             <div className="text-center py-20 flex flex-col items-center">
                 <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full mb-4"></div>
                 <p className="text-stone-500 dark:text-stone-400 font-medium">Đang tải dữ liệu học tập...</p>
             </div>
          ) : processedCourses.length > 0 ? (
            <div className={cn(
              "grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
              viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
              {processedCourses.map((course, index) => (
                <Card 
                  key={course.id} 
                  className={cn(
                    "group overflow-hidden border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1917] hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-500 hover:-translate-y-1.5 rounded-3xl",
                    viewMode === 'list' && "flex flex-col md:flex-row"
                  )}
                >
                  {/* Image Section */}
                  <div className={cn(
                    "relative overflow-hidden shrink-0",
                    viewMode === 'grid' ? "h-56 w-full" : "w-full md:w-80 h-56 md:h-auto"
                  )}>
                     <div className={cn("absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105", !course.thumbnail && course.image)} 
                          style={course.thumbnail ? {backgroundImage: `url(${course.thumbnail})`} : {}}>
                     </div>
                     <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent"></div>
                     
                     <Badge className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white border border-white/30 font-bold px-3 py-1 uppercase tracking-wider text-[10px]">
                        {course.level}
                     </Badge>

                     <Link href={`/student/my-courses/${course.id}`}>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/20 backdrop-blur-[2px] cursor-pointer">
                            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-amber-600 shadow-2xl transform scale-50 group-hover:scale-100 transition-all duration-500">
                              <PlayCircle size={32} fill="currentColor" />
                            </div>
                        </div>
                     </Link>

                     <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="font-bold text-xl text-white line-clamp-2 leading-tight drop-shadow-md">
                            {course.title}
                        </h3>
                     </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 flex flex-col p-6">
                    {/* Header Metrics */}
                    <div className="flex justify-between items-start mb-4">
                       <Badge variant="outline" className={cn(
                         "border-0 px-2.5 py-1.5 gap-1.5 font-bold",
                         course.status === "Completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" :
                         course.status === "In Progress" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                       )}>
                          {course.status === "Completed" ? <CheckCircle2 size={14}/> : course.status === "In Progress" ? <Clock size={14}/> : <BookOpen size={14}/>}
                          {course.status === "Completed" ? "Đã xong" : course.status === "In Progress" ? "Đang học" : "Mới lưu"}
                       </Badge>

                       {/* Điểm số cao nhất */}
                       <div className="text-right">
                          <span className="text-[10px] text-stone-400 font-bold uppercase block mb-0.5">Điểm cao nhất</span>
                          <span className={cn(
                             "text-xl font-black",
                             course.bestScore >= 8 ? "text-emerald-600" : course.bestScore >= 5 ? "text-amber-600" : "text-stone-400"
                          )}>
                             {course.bestScore.toFixed(1)}
                          </span>
                       </div>
                    </div>
                    
                    {/* Detail Metrics */}
                    <div className="grid grid-cols-2 gap-4 my-4 p-4 bg-stone-50 dark:bg-stone-900/50 rounded-2xl border border-stone-100 dark:border-stone-800/50">
                        <div>
                           <div className="flex items-center gap-1.5 text-xs text-stone-400 font-bold mb-1 uppercase tracking-wider">
                              <Repeat size={14}/> Số lần thi
                           </div>
                           <p className="text-sm font-black text-stone-700 dark:text-stone-300">{course.attempts} lần</p>
                        </div>
                        <div>
                           <div className="flex items-center gap-1.5 text-xs text-stone-400 font-bold mb-1 uppercase tracking-wider">
                              <CalendarDays size={14}/> Gần nhất
                           </div>
                           <p className="text-sm font-black text-stone-700 dark:text-stone-300">{course.lastAttemptDate || "--"}</p>
                        </div>
                    </div>

                    <div className="mt-auto space-y-6">
                       <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold text-stone-600 dark:text-stone-400">
                             <span>Tiến độ hoàn thành</span>
                             <span className={cn(course.progress === 100 ? "text-emerald-500" : "text-amber-500")}>{course.progress}%</span>
                          </div>
                          
                          <Progress 
                            value={course.progress} 
                            className={cn(
                              "h-2.5 bg-stone-100 dark:bg-stone-800 rounded-full", 
                              course.progress === 100 ? "[&>*]:bg-emerald-500" : "[&>*]:bg-gradient-to-r [&>*]:from-amber-400 [&>*]:to-orange-500"
                            )} 
                          />
                       </div>
                       
                       <div className="pt-5 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center">
                          <Link href={`/student/my-courses/${course.id}`} className="w-full">
                              <Button className={cn(
                                 "w-full font-bold rounded-xl transition-all shadow-md h-12 text-sm",
                                 course.status === "Completed" 
                                   ? "bg-white border-2 border-stone-200 text-stone-700 hover:bg-stone-50 dark:bg-transparent dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                                   : "bg-stone-900 text-white hover:bg-amber-600 dark:bg-white dark:text-stone-900 dark:hover:bg-amber-500"
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
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-[#1c1917] rounded-3xl border border-dashed border-stone-200 dark:border-stone-800 shadow-sm animate-in fade-in">
               <div className="h-24 w-24 bg-stone-50 dark:bg-stone-900 rounded-full flex items-center justify-center mb-6">
                  <Search size={40} className="text-stone-300 dark:text-stone-600" />
               </div>
               <h3 className="text-2xl font-black text-stone-800 dark:text-white">
                 Chưa có khóa học nào
               </h3>
               <p className="text-stone-500 dark:text-stone-400 mt-2 max-w-xs mx-auto text-base">
                 Hãy vào <Link href="/student/exam-library" className="text-amber-600 font-bold hover:underline">Thư viện đề thi</Link> để lưu đề thi về đây nhé.
               </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}