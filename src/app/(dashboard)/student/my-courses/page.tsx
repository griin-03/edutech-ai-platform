"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu";
import { 
  BookOpen, Clock, MoreVertical, Search, Filter, LayoutGrid, List as ListIcon, 
  PlayCircle, Award, Star, Calendar, ArrowRight, Zap, CheckCircle2, TrendingUp, Sparkles, GraduationCap, ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- DUMMY DATA ---
const COURSES = [
  {
    id: 1,
    title: "IELTS Intensive Masterclass: Reading & Listening",
    instructor: "Dr. Sarah Watson",
    level: "Advanced",
    progress: 75,
    totalLessons: 40,
    completedLessons: 30,
    duration: "12h 30m",
    image: "bg-gradient-to-br from-amber-500 to-orange-600",
    status: "In Progress",
    lastAccessed: "2 hours ago",
    category: "Language"
  },
  {
    id: 2,
    title: "ReactJS & Next.js 14: The Complete Guide",
    instructor: "Maximilian Schwarz",
    level: "Intermediate",
    progress: 45,
    totalLessons: 120,
    completedLessons: 54,
    duration: "48h 15m",
    image: "bg-gradient-to-br from-blue-500 to-cyan-600",
    status: "In Progress",
    lastAccessed: "1 day ago",
    category: "Programming"
  },
  {
    id: 3,
    title: "UI/UX Design Fundamentals with Figma",
    instructor: "Gary Simon",
    level: "Beginner",
    progress: 100,
    totalLessons: 25,
    completedLessons: 25,
    duration: "8h 00m",
    image: "bg-gradient-to-br from-purple-500 to-pink-600",
    status: "Completed",
    lastAccessed: "1 week ago",
    category: "Design"
  },
  {
    id: 4,
    title: "Python for Data Science and Machine Learning",
    instructor: "Jose Portilla",
    level: "Advanced",
    progress: 10,
    totalLessons: 80,
    completedLessons: 8,
    duration: "32h 45m",
    image: "bg-gradient-to-br from-emerald-500 to-teal-600",
    status: "In Progress",
    lastAccessed: "3 days ago",
    category: "Data Science"
  },
  {
    id: 5,
    title: "English Writing Task 2: Band 8.0 Strategies",
    instructor: "IELTS Liz",
    level: "Advanced",
    progress: 90,
    totalLessons: 15,
    completedLessons: 13,
    duration: "5h 20m",
    image: "bg-gradient-to-br from-rose-500 to-red-600",
    status: "In Progress",
    lastAccessed: "5 hours ago",
    category: "Language"
  },
  {
    id: 6,
    title: "Webflow 101: The Future of Web Design",
    instructor: "Ran Segall",
    level: "Beginner",
    progress: 0,
    totalLessons: 30,
    completedLessons: 0,
    duration: "10h 00m",
    image: "bg-gradient-to-br from-stone-600 to-stone-800",
    status: "Not Started",
    lastAccessed: "Never",
    category: "Design"
  },
];

export default function MyCoursesPage() {
  // --- STATE QUẢN LÝ ---
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // newest, progress-desc, progress-asc, az

  // --- LOGIC LỌC & SẮP XẾP (REAL-TIME) ---
  const processedCourses = useMemo(() => {
    let data = [...COURSES];

    // 1. Filter by Tab
    if (activeTab === "in-progress") {
      data = data.filter(c => c.status === "In Progress");
    } else if (activeTab === "completed") {
      data = data.filter(c => c.status === "Completed");
    } else if (activeTab === "saved") {
      // Giả lập tab saved (hiện tại chưa có data saved thực)
      data = []; 
    }

    // 2. Filter by Search
    if (searchQuery) {
      data = data.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.instructor.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 3. Sort
    if (sortOrder === "progress-desc") {
      data.sort((a, b) => b.progress - a.progress);
    } else if (sortOrder === "progress-asc") {
      data.sort((a, b) => a.progress - b.progress);
    } else if (sortOrder === "az") {
      data.sort((a, b) => a.title.localeCompare(b.title));
    }
    // "newest" mặc định giữ nguyên thứ tự mảng gốc (giả định mảng gốc đã sort theo time)

    return data;
  }, [activeTab, searchQuery, sortOrder]);

  return (
    <div className="space-y-10 pb-20 min-h-screen bg-[#fdfbf7] dark:bg-[#0c0a09] transition-colors duration-500">
      
      {/* --- 1. HEADER & STATS (Entrance Animation) --- */}
      <div className="space-y-8 animate-in fade-in slide-in-from-top-10 duration-700">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
          <div>
            <Badge variant="outline" className="mb-2 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400">
              <Sparkles size={12} className="mr-1" /> Học tập không giới hạn
            </Badge>
            <h1 className="text-4xl font-black text-stone-800 dark:text-stone-100 tracking-tight">
              Khoá học của tôi
            </h1>
            <p className="text-stone-500 dark:text-stone-400 font-medium mt-2 max-w-xl">
              Chào mừng trở lại! Bạn đang làm rất tốt. Hãy tiếp tục duy trì chuỗi học tập để đạt được mục tiêu tuần này nhé.
            </p>
          </div>
          <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg shadow-orange-500/20 font-bold rounded-xl h-12 px-6 transition-transform hover:scale-105 active:scale-95">
            <Zap className="mr-2 h-5 w-5 fill-white" /> Khám phá khoá mới
          </Button>
        </div>

        {/* Stats Cards 3D Effect */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg shadow-amber-500/5 bg-white dark:bg-[#1c1917] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <PlayCircle size={80} className="text-amber-500" />
            </div>
            <CardContent className="p-6">
              <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform">
                <PlayCircle size={24} />
              </div>
              <p className="text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Đang học</p>
              <p className="text-4xl font-black text-stone-800 dark:text-stone-100 mt-1">4</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg shadow-emerald-500/5 bg-white dark:bg-[#1c1917] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckCircle2 size={80} className="text-emerald-500" />
            </div>
            <CardContent className="p-6">
              <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                <CheckCircle2 size={24} />
              </div>
              <p className="text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Đã hoàn thành</p>
              <p className="text-4xl font-black text-stone-800 dark:text-stone-100 mt-1">12</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-purple-500/5 bg-white dark:bg-[#1c1917] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Award size={80} className="text-purple-500" />
            </div>
            <CardContent className="p-6">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                <Award size={24} />
              </div>
              <p className="text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Chứng chỉ</p>
              <p className="text-4xl font-black text-stone-800 dark:text-stone-100 mt-1">8</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- 2. CONTROLS & FILTERS (Sticky) --- */}
      <div className="sticky top-[80px] z-30 bg-[#fdfbf7]/80 dark:bg-[#0c0a09]/80 backdrop-blur-xl p-2 rounded-2xl transition-all animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
        <div className="bg-white dark:bg-[#1c1917] p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Search */}
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm khoá học, giảng viên..." 
              className="pl-10 bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 focus-visible:ring-amber-500 h-11 rounded-lg"
            />
          </div>

          {/* Filters Right */}
          <div className="flex items-center gap-3 w-full md:w-auto">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 h-11 rounded-lg hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20">
                  <Filter className="mr-2 h-4 w-4" /> 
                  {sortOrder === 'newest' ? 'Mới nhất' : sortOrder === 'progress-desc' ? 'Tiến độ giảm dần' : sortOrder === 'az' ? 'A - Z' : 'Sắp xếp'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Sắp xếp theo</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sortOrder} onValueChange={setSortOrder}>
                  <DropdownMenuRadioItem value="newest">Mới nhất (Mặc định)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="progress-desc">Tiến độ cao nhất</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="progress-asc">Tiến độ thấp nhất</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="az">Tên A - Z</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-8 w-[1px] bg-stone-200 dark:bg-stone-700 hidden md:block"></div>

            <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-lg">
               <Button 
                 variant="ghost" 
                 size="sm" 
                 onClick={() => setViewMode('grid')}
                 className={cn("h-9 w-9 p-0 rounded-md transition-all", viewMode === 'grid' && "bg-white dark:bg-stone-700 shadow-sm text-amber-600")}
               >
                 <LayoutGrid size={18} />
               </Button>
               <Button 
                 variant="ghost" 
                 size="sm" 
                 onClick={() => setViewMode('list')}
                 className={cn("h-9 w-9 p-0 rounded-md transition-all", viewMode === 'list' && "bg-white dark:bg-stone-700 shadow-sm text-amber-600")}
               >
                 <ListIcon size={18} />
               </Button>
            </div>
          </div>
        </div>
      </div>

      {/* --- 3. COURSE LIST --- */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
        <TabsList className="bg-transparent p-0 h-auto gap-2 flex-wrap">
          {["all", "in-progress", "completed", "saved"].map((tab) => (
            <TabsTrigger 
              key={tab} 
              value={tab} 
              className={cn(
                "rounded-full border border-stone-200 dark:border-stone-800 px-6 py-2.5 font-bold transition-all text-sm",
                "data-[state=active]:bg-stone-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-stone-900 data-[state=active]:border-transparent data-[state=active]:shadow-lg",
                "bg-white dark:bg-[#1c1917] text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
              )}
            >
              {tab === 'all' ? 'Tất cả' : tab === 'in-progress' ? 'Đang học' : tab === 'completed' ? 'Đã xong' : 'Đã lưu'}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 min-h-[400px]">
          {processedCourses.length > 0 ? (
            <div className={cn(
              "grid gap-6",
              viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
              {processedCourses.map((course, index) => (
                <Card 
                  key={course.id} 
                  className={cn(
                    "group overflow-hidden border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1917] hover:shadow-2xl hover:shadow-amber-900/5 dark:hover:shadow-black/50 transition-all duration-500 hover:-translate-y-1 rounded-3xl",
                    viewMode === 'list' && "flex flex-col md:flex-row"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }} // Stagger animation
                >
                  {/* Image Section */}
                  <div className={cn(
                    "relative overflow-hidden shrink-0",
                    viewMode === 'grid' ? "h-52 w-full" : "w-full md:w-72 h-52 md:h-auto"
                  )}>
                     <div className={`absolute inset-0 ${course.image} opacity-90 group-hover:scale-110 transition-transform duration-700`}></div>
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                     
                     {/* Level Badge */}
                     <Badge className="absolute top-4 left-4 bg-white/90 text-stone-900 backdrop-blur-md shadow-lg border-0 font-bold px-3">
                        {course.level}
                     </Badge>

                     {/* Play Button Overlay */}
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/20 backdrop-blur-[2px]">
                        <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center text-amber-600 shadow-2xl cursor-pointer transform scale-50 group-hover:scale-100 transition-all duration-500">
                           <PlayCircle size={28} fill="currentColor" />
                        </div>
                     </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 flex flex-col p-6">
                    <div className="flex justify-between items-start mb-3">
                       <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md">
                          {course.category}
                       </p>
                       {course.progress === 100 && (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 hover:bg-emerald-200 gap-1 border-0">
                             <Award size={12} /> Hoàn thành
                          </Badge>
                       )}
                    </div>

                    <h3 className="font-bold text-xl text-stone-800 dark:text-stone-100 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors leading-tight">
                      {course.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-6">
                       <div className="h-6 w-6 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                          {/* Placeholder avatar */}
                          <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-stone-500">
                             {course.instructor.charAt(0)}
                          </div>
                       </div>
                       <p className="text-xs font-bold text-stone-500 dark:text-stone-400">{course.instructor}</p>
                    </div>

                    <div className="mt-auto space-y-5">
                       {/* Info Row */}
                       <div className="flex items-center justify-between text-xs text-stone-400 font-medium">
                          <span className="flex items-center gap-1.5"><BookOpen size={14}/> {course.totalLessons} bài học</span>
                          <span className="flex items-center gap-1.5"><Clock size={14}/> {course.duration}</span>
                       </div>

                       {/* Progress Bar */}
                       <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold text-stone-600 dark:text-stone-300">
                             <span>{course.progress}% Hoàn thành</span>
                             <span className="text-stone-400">{course.completedLessons}/{course.totalLessons}</span>
                          </div>
                          {/* FIX LỖI: Dùng class thay vì prop indicatorColor */}
                          <Progress 
                            value={course.progress} 
                            className={cn(
                              "h-2 bg-stone-100 dark:bg-stone-800 rounded-full", 
                              course.progress === 100 ? "[&>*]:bg-emerald-500" : "[&>*]:bg-gradient-to-r [&>*]:from-amber-500 [&>*]:to-orange-500"
                            )} 
                          />
                       </div>
                       
                       {/* Footer Actions */}
                       <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center">
                          <p className="text-[10px] text-stone-400 italic">Truy cập: {course.lastAccessed}</p>
                          <Button size="sm" className={cn(
                             "font-bold rounded-lg transition-all",
                             course.progress === 100 
                               ? "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-stone-900 dark:bg-transparent dark:border-stone-700 dark:text-stone-400"
                               : "bg-stone-900 text-white hover:bg-amber-600 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-amber-500 hover:shadow-lg hover:shadow-amber-500/20"
                          )}>
                             {course.progress === 0 ? "Bắt đầu học" : course.progress === 100 ? "Ôn tập lại" : "Tiếp tục"}
                             {course.progress !== 100 && <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />}
                          </Button>
                       </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in-95 duration-500">
               <div className="h-24 w-24 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mb-6">
                  <Search size={40} className="text-stone-300" />
               </div>
               <h3 className="text-xl font-bold text-stone-800 dark:text-stone-200">Không tìm thấy khóa học nào</h3>
               <p className="text-stone-500 mt-2 max-w-sm">
                 Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để tìm thấy kết quả phù hợp hơn nhé.
               </p>
               <Button variant="link" onClick={() => {setSearchQuery(""); setActiveTab("all")}} className="mt-4 text-amber-600 font-bold">
                 Xóa bộ lọc
               </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* --- 4. PROFESSIONAL FOOTER (New Addition) --- */}
      <div className="mt-20 border-t border-stone-200 dark:border-stone-800 pt-10 pb-6 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-1 md:col-span-2">
               <h3 className="text-lg font-black text-stone-800 dark:text-stone-100 mb-4 flex items-center gap-2">
                  <GraduationCap className="text-amber-600" /> EduTech Pro
               </h3>
               <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed max-w-md">
                  Nền tảng học tập thông minh hỗ trợ bởi AI. Giúp bạn chinh phục mọi mục tiêu kiến thức với lộ trình cá nhân hóa và công cụ hiện đại nhất.
               </p>
            </div>
            <div>
               <h4 className="font-bold text-stone-800 dark:text-stone-100 mb-4">Lối tắt</h4>
               <ul className="space-y-2 text-sm text-stone-500 dark:text-stone-400">
                  <li className="hover:text-amber-600 cursor-pointer flex items-center gap-1 transition-colors"><ArrowUpRight size={12}/> Thư viện đề thi</li>
                  <li className="hover:text-amber-600 cursor-pointer flex items-center gap-1 transition-colors"><ArrowUpRight size={12}/> AI Mentor</li>
                  <li className="hover:text-amber-600 cursor-pointer flex items-center gap-1 transition-colors"><ArrowUpRight size={12}/> Cộng đồng</li>
               </ul>
            </div>
            <div>
               <h4 className="font-bold text-stone-800 dark:text-stone-100 mb-4">Thống kê</h4>
               <ul className="space-y-2 text-sm text-stone-500 dark:text-stone-400">
                  <li>Tổng giờ học: <span className="font-bold text-stone-700 dark:text-stone-300">128h</span></li>
                  <li>Bài tập đã làm: <span className="font-bold text-stone-700 dark:text-stone-300">342</span></li>
                  <li>Chứng chỉ: <span className="font-bold text-stone-700 dark:text-stone-300">8</span></li>
               </ul>
            </div>
         </div>
         <div className="border-t border-stone-100 dark:border-stone-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-400">
            <p>© 2026 EduTech Platform. All rights reserved.</p>
            <div className="flex gap-4">
               <span className="hover:text-stone-600 cursor-pointer">Privacy Policy</span>
               <span className="hover:text-stone-600 cursor-pointer">Terms of Service</span>
            </div>
         </div>
      </div>

    </div>
  );
}