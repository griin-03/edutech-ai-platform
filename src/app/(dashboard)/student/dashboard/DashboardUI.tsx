"use client";

import { useState, useEffect } from "react"; 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BannerSlider } from "@/components/common/BannerSlider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress"; 
import { Calendar } from "@/components/ui/calendar"; 
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  BookOpen, Trophy, Clock, Sparkles, Zap, Activity, Target, ChevronDown, ChevronUp, User, Settings, LogOut, 
  Headphones, PenTool, PlayCircle, CheckCircle2, Bot, LayoutDashboard, Coffee, CalendarDays, MoreHorizontal,
  FileText, Mic, BarChart3, Star, Timer, AlertCircle, ChevronRight, GraduationCap, MapPin, Mail, Phone, Facebook, Twitter, Linkedin, Youtube,
  FileQuestion, Video, Edit3, Download
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardUI({ user }: { user: any }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const [examSubject, setExamSubject] = useState("toan");
  const [videoChapter, setVideoChapter] = useState("chap1");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const displayName = user?.name || user?.fullName || "Bạn mới";
  const displayInitials = displayName.substring(0, 2).toUpperCase();

  if (!isMounted) {
    return null; 
  }

  return (
    <div className="space-y-6 pb-0 relative min-h-screen flex flex-col bg-[#fdfbf7] dark:bg-[#1c1917]">
      
      {/* --- 1. HEADER --- */}
      <header className={cn(
        "sticky top-0 z-40 w-full transition-all duration-500 ease-in-out -mx-6 px-6 py-4 mb-4",
        "backdrop-blur-xl bg-[#fdfbf7]/80 dark:bg-[#1c1917]/80 border-b border-stone-200/50 dark:border-stone-800/50 shadow-sm",
        isHeaderCompact ? "py-2" : ""
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="relative cursor-pointer group">
                  <div className="absolute inset-0 bg-amber-500 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <Avatar className="h-12 w-12 border-2 border-white ring-2 ring-amber-500/20 transition-transform group-hover:scale-105 shadow-md">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>{displayInitials}</AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60 bg-[#fffbf2] dark:bg-[#292524] border-amber-100">
                <DropdownMenuLabel className="text-amber-800">Tài khoản học viên</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-amber-100" />
                <DropdownMenuItem className="cursor-pointer"><User className="mr-2 h-4 w-4" /> Hồ sơ cá nhân</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer"><BarChart3 className="mr-2 h-4 w-4" /> Bảng điểm</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer"><Settings className="mr-2 h-4 w-4" /> Cài đặt hệ thống</DropdownMenuItem>
                <DropdownMenuSeparator className="bg-amber-100" />
                <DropdownMenuItem className="text-red-500 cursor-pointer"><LogOut className="mr-2 h-4 w-4" /> Đăng xuất</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className={cn("transition-all duration-500 overflow-hidden", isHeaderCompact ? "opacity-0 w-0 h-0" : "opacity-100 w-auto h-auto")}>
              <h2 className="text-2xl font-black text-stone-800 dark:text-stone-100 tracking-tight">
                Chào buổi chiều, <span className="text-amber-600">{displayName}</span>
              </h2>
              <p className="text-stone-500 text-sm font-medium mt-0.5 flex items-center gap-2">
                Hôm nay bạn có 2 bài tập cần hoàn thành <Coffee size={14} className="text-amber-600" />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <Button className="btn-milk-tea rounded-full px-5 h-9 text-xs font-bold shadow-amber-500/20 hidden md:flex">
                <Zap className="mr-1 h-3 w-3 text-yellow-200" /> Daily Streak: 12
             </Button>
             <Button variant="ghost" size="icon" onClick={() => setIsHeaderCompact(!isHeaderCompact)} className="rounded-full text-stone-500 hover:bg-amber-100">
                {isHeaderCompact ? <ChevronDown /> : <ChevronUp />}
             </Button>
          </div>
        </div>
      </header>

      {/* --- 2. MAIN CONTENT TABS --- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col space-y-6">
        
        {/* Main Tab Navigation */}
        <div className="flex justify-between items-center overflow-x-auto pb-2 scrollbar-hide">
          <TabsList className="bg-stone-200/50 dark:bg-stone-800/50 p-1 h-auto rounded-2xl border border-stone-100 inline-flex">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-sm font-bold px-5 py-2.5 rounded-xl transition-all gap-2">
              <LayoutDashboard size={18} /> Tổng quan
            </TabsTrigger>
            <TabsTrigger value="exam" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm font-bold px-5 py-2.5 rounded-xl transition-all gap-2">
              <FileQuestion size={18} /> Luyện Đề Trắc Nghiệm
            </TabsTrigger>
            <TabsTrigger value="video" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm font-bold px-5 py-2.5 rounded-xl transition-all gap-2">
              <Video size={18} /> Bài Giảng Video
            </TabsTrigger>
            <TabsTrigger value="essay" className="data-[state=active]:bg-white data-[state=active]:text-rose-700 data-[state=active]:shadow-sm font-bold px-5 py-2.5 rounded-xl transition-all gap-2">
              <Edit3 size={18} /> Tự Luận & Đánh Giá AI
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: OVERVIEW (Nội dung sửa thành 12 môn) */}
        <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="rounded-[2rem] overflow-hidden shadow-2xl shadow-orange-900/10 h-72 relative ring-4 ring-white dark:ring-stone-800">
             <BannerSlider />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3 space-y-6">
               <div className="grid grid-cols-1 gap-4">
                  {[
                    { title: "Điểm Thi Thử", value: "26.5", icon: Target, bg: "bg-rose-50 text-rose-600" },
                    { title: "Đề Đã Giải", value: "42", icon: FileText, bg: "bg-blue-50 text-blue-600" },
                    { title: "Mục Tiêu ĐH", value: "HUST", icon: GraduationCap, bg: "bg-amber-50 text-amber-600" },
                  ].map((item, i) => (
                    <Card key={i} className="border-0 shadow-sm bg-white/80 backdrop-blur">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-stone-400 uppercase">{item.title}</p>
                          <p className="text-2xl font-black text-stone-800">{item.value}</p>
                        </div>
                        <div className={`p-3 rounded-xl ${item.bg}`}>
                          <item.icon size={20} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
               </div>

               <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                 <CardHeader className="pb-2">
                   <CardTitle className="text-sm font-bold flex items-center gap-2"><Trophy size={16} className="text-yellow-300" /> Bảng Xếp Hạng Khối A00</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-3">
                     {[1, 2, 3].map((rank) => (
                       <div key={rank} className="flex items-center gap-3 bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                         <span className="font-bold text-yellow-300">#{rank}</span>
                         <Avatar className="h-6 w-6"><AvatarImage src={`https://i.pravatar.cc/150?u=${rank}`} /></Avatar>
                         <span className="text-xs font-medium">Học sinh xuất sắc {rank}</span>
                         <span className="ml-auto text-xs font-bold bg-white/20 px-1.5 py-0.5 rounded">28.{9-rank}</span>
                       </div>
                     ))}
                   </div>
                   <Button size="sm" variant="secondary" className="w-full mt-4 text-xs h-7 bg-white text-orange-600 hover:bg-orange-50">Xem chi tiết</Button>
                 </CardContent>
               </Card>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="text-stone-800">Lộ Trình Học Tập</CardTitle>
                  <CardDescription>Tiến độ hoàn thành các chuyên đề trọng tâm THPT Quốc Gia</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { name: "Toán Học: Giải Tích 12", unit: "Chuyên đề: Khảo sát Hàm số", prog: 85, color: "bg-emerald-500" },
                    { name: "Vật Lý: Dao Động Cơ", unit: "Chuyên đề: Con lắc lò xo", prog: 60, color: "bg-blue-500" },
                    { name: "Hóa Học: Este - Lipit", unit: "Chuyên đề: Bài toán đốt cháy", prog: 30, color: "bg-amber-500" },
                  ].map((course, idx) => (
                    <div key={idx} className="group cursor-pointer">
                       <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-stone-700 group-hover:text-amber-600 transition-colors">{course.name}</h4>
                            <p className="text-xs text-stone-500">{course.unit}</p>
                          </div>
                          <Badge variant="outline">{course.prog}%</Badge>
                       </div>
                       <Progress value={course.prog} className={cn("h-2", `[&>div]:${course.color}`)} />
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full text-stone-500 hover:text-amber-600 hover:bg-amber-50">Xem tất cả môn học <ChevronRight size={16} /></Button>
                </CardFooter>
              </Card>

              <div className="grid grid-cols-7 gap-2 p-4 bg-white rounded-xl shadow-sm border border-stone-100">
                 {Array.from({ length: 14 }).map((_, i) => (
                   <div key={i} className="flex flex-col items-center gap-1">
                      <div className={`w-full h-16 rounded-lg ${i % 3 === 0 ? "bg-amber-500" : i % 2 === 0 ? "bg-amber-200" : "bg-stone-100"}`}></div>
                      <span className="text-[10px] text-stone-400">T{i+2}</span>
                   </div>
                 ))}
              </div>
            </div>

            <div className="lg:col-span-3 space-y-6">
              <Card className="border-0 shadow-sm bg-white">
                 <CardHeader className="pb-2"><CardTitle className="text-sm">Lịch học tập</CardTitle></CardHeader>
                 <CardContent className="flex justify-center">
                    <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border-0" />
                 </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm bg-blue-50/50">
                <CardContent className="p-4 flex gap-3 items-start">
                  <div className="bg-blue-100 p-2 rounded-full"><AlertCircle size={16} className="text-blue-600"/></div>
                  <div>
                    <h5 className="text-sm font-bold text-blue-900">Thi Thử Khối A00</h5>
                    <p className="text-xs text-blue-700 mt-1">Đề thi của Bộ GD&ĐT. Bắt đầu vào 8:00 AM Chủ nhật.</p>
                    <Button size="sm" className="h-6 text-xs mt-2 bg-blue-600 hover:bg-blue-700">Đăng ký ngay</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: LUYỆN ĐỀ TRẮC NGHIỆM */}
        <TabsContent value="exam" className="space-y-4 h-[700px] flex flex-col">
          <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-2">
               <span className="text-xs font-bold text-stone-400 uppercase px-3">Môn thi:</span>
               <DropdownMenu>
                 <DropdownMenuTrigger asChild><Button variant="outline" size="sm">Toán Học <ChevronDown size={14} className="ml-2"/></Button></DropdownMenuTrigger>
                 <DropdownMenuContent>
                    <DropdownMenuItem>Vật Lý</DropdownMenuItem>
                    <DropdownMenuItem>Hóa Học</DropdownMenuItem>
                    <DropdownMenuItem>Tiếng Anh</DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
               <div className="h-4 w-[1px] bg-stone-300 mx-2"></div>
               <div className="flex bg-stone-100 rounded-lg p-1">
                 {["toan", "ly", "hoa"].map((subject) => (
                   <button 
                     key={subject} 
                     onClick={() => setExamSubject(subject)}
                     className={cn(
                       "px-4 py-1 text-xs font-bold rounded-md transition-all uppercase",
                       examSubject === subject ? "bg-white text-emerald-600 shadow-sm" : "text-stone-500 hover:bg-stone-200"
                     )}
                   >
                     Đề thi {subject}
                   </button>
                 ))}
               </div>
            </div>
            <div className="flex items-center gap-2 px-3">
               <Badge variant="outline" className="gap-1 bg-stone-50"><Timer size={14} className="text-red-500" /> 88:45 left</Badge>
               <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Nộp bài</Button>
            </div>
          </div>

          <div className="flex gap-6 flex-1 h-full overflow-hidden">
            {/* Cột hiển thị Câu hỏi (Có thể tích hợp Latex vào đây sau) */}
            <Card className="flex-1 h-full flex flex-col border-stone-200 shadow-sm bg-[#fffbf2]/50">
              <CardHeader className="bg-stone-50/80 py-3 border-b border-stone-100 flex flex-row justify-between items-center sticky top-0 backdrop-blur-sm z-10">
                <CardTitle className="text-stone-800 text-lg">Câu 45 (Mức độ Vận dụng cao)</CardTitle>
                <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">Toán Giải Tích</Badge>
              </CardHeader>
              <ScrollArea className="flex-1 p-8">
                <article className="prose dark:prose-invert max-w-none text-stone-800 text-lg font-medium">
                  <p>Cho hàm số y = f(x) có đồ thị như hình vẽ bên. Gọi S là tập hợp tất cả các giá trị nguyên của tham số m để phương trình f(f(x) - m) = 0 có đúng 6 nghiệm phân biệt. Tổng các phần tử của S bằng:</p>
                  
                  <div className="my-8 flex justify-center p-6 bg-white border border-stone-200 rounded-xl shadow-sm">
                     {/* Giả lập đồ thị hàm số */}
                     <div className="w-64 h-64 border-l-2 border-b-2 border-stone-800 relative">
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-stone-300"></div>
                        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-stone-300"></div>
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                           <path d="M 10 90 Q 30 10 50 50 T 90 10" fill="none" stroke="#d97706" strokeWidth="2" />
                        </svg>
                     </div>
                  </div>

                  <RadioGroup className="grid grid-cols-2 gap-4 mt-8">
                    {["A. 4", "B. 5", "C. 6", "D. 7"].map((ans, i) => (
                      <div key={i} className="flex items-center space-x-3 p-4 bg-white border border-stone-200 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
                        <RadioGroupItem value={`ans-${i}`} id={`ans-${i}`} />
                        <Label htmlFor={`ans-${i}`} className="cursor-pointer font-bold">{ans}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </article>
              </ScrollArea>
            </Card>
            
            {/* Cột Danh sách câu hỏi */}
            <Card className="w-80 h-full flex flex-col border-stone-200 shadow-sm bg-white">
              <CardHeader className="py-3 border-b border-stone-100 bg-white sticky top-0 z-10">
                <CardTitle className="text-stone-800">Danh sách câu hỏi (50)</CardTitle>
              </CardHeader>
              <ScrollArea className="flex-1 p-4 bg-stone-50/30">
                 <div className="grid grid-cols-5 gap-2">
                    {Array.from({length: 50}).map((_, i) => (
                      <button key={i} className={cn(
                        "h-10 w-full rounded-md flex items-center justify-center text-sm font-bold border transition-all hover:scale-105",
                        i === 44 ? 'bg-amber-500 text-white border-amber-600 shadow-md' : 
                        i < 15 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                        'bg-white text-stone-500 border-stone-200 hover:border-amber-400'
                      )}>
                        {i+1}
                      </button>
                    ))}
                 </div>
              </ScrollArea>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: BÀI GIẢNG VIDEO */}
        <TabsContent value="video" className="space-y-4 h-[700px] flex flex-col">
          <div className="bg-stone-900 text-white overflow-hidden rounded-2xl flex flex-col lg:flex-row shadow-xl shadow-stone-900/10">
            {/* Khung phát Video */}
            <div className="w-full lg:w-2/3 h-[400px] bg-black relative group flex items-center justify-center">
               <div className="absolute inset-0 bg-stone-800 opacity-50"></div>
               <PlayCircle size={64} className="text-white/80 hover:text-amber-500 transition-colors cursor-pointer z-10 relative" />
               <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex justify-between text-xs font-bold text-stone-300 mb-2">
                     <span>Khảo sát sự biến thiên và vẽ đồ thị hàm số</span>
                     <span>12:45 / 45:30</span>
                  </div>
                  <div className="h-1.5 bg-stone-700 rounded-full cursor-pointer">
                     <div className="h-full w-1/4 bg-amber-500 rounded-full relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                     </div>
                  </div>
               </div>
            </div>
            
            {/* Danh sách bài giảng bên cạnh */}
            <div className="w-full lg:w-1/3 bg-stone-900 border-l border-stone-800 flex flex-col h-[400px]">
               <div className="p-4 border-b border-stone-800">
                  <h3 className="font-bold text-white">Chương 1: Ứng dụng Đạo Hàm</h3>
                  <p className="text-xs text-stone-400 mt-1">Hoàn thành 1/5 bài giảng</p>
               </div>
               <ScrollArea className="flex-1">
                  <div className="p-2 space-y-1">
                     {[
                        { title: "Sự đồng biến, nghịch biến", time: "30:00", done: true },
                        { title: "Cực trị của hàm số", time: "45:30", active: true },
                        { title: "Giá trị lớn nhất, nhỏ nhất", time: "25:15" },
                        { title: "Đường tiệm cận", time: "35:00" },
                        { title: "Khảo sát và vẽ đồ thị", time: "50:00" },
                     ].map((vid, i) => (
                        <div key={i} className={cn(
                           "p-3 rounded-lg flex gap-3 cursor-pointer transition-colors",
                           vid.active ? "bg-stone-800" : "hover:bg-stone-800/50"
                        )}>
                           <div className="mt-0.5">
                              {vid.done ? <CheckCircle2 size={16} className="text-emerald-500"/> : <PlayCircle size={16} className={vid.active ? "text-amber-500" : "text-stone-500"}/>}
                           </div>
                           <div>
                              <p className={cn("text-sm font-medium line-clamp-2", vid.active ? "text-amber-400" : "text-stone-300")}>{i+1}. {vid.title}</p>
                              <p className="text-xs text-stone-500 mt-1">{vid.time}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </ScrollArea>
            </div>
          </div>

          <div className="flex gap-6 flex-1 overflow-hidden mt-4">
             <Card className="w-full h-full overflow-hidden border-stone-200 bg-white">
                <CardHeader className="bg-stone-50 py-3 border-b border-stone-100">
                  <Tabs defaultValue="notes" className="w-full">
                    <TabsList className="grid grid-cols-2 w-64 h-9 p-1 bg-stone-200/50 rounded-lg">
                       <TabsTrigger value="notes" className="text-xs font-bold rounded-md">Tài liệu đính kèm</TabsTrigger>
                       <TabsTrigger value="qa" className="text-xs font-bold rounded-md">Hỏi đáp (Q&A)</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <ScrollArea className="flex-1 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="p-4 border border-stone-200 rounded-xl flex items-center justify-between hover:border-amber-500 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                           <div className="p-3 bg-red-100 text-red-600 rounded-lg"><FileText size={20}/></div>
                           <div>
                              <p className="font-bold text-stone-800 group-hover:text-amber-600">File lý thuyết cực trị (PDF)</p>
                              <p className="text-xs text-stone-500">2.4 MB</p>
                           </div>
                        </div>
                        <Button variant="ghost" size="icon"><Download size={18} className="text-stone-400 group-hover:text-amber-600"/></Button>
                     </div>
                     <div className="p-4 border border-stone-200 rounded-xl flex items-center justify-between hover:border-amber-500 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                           <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><FileText size={20}/></div>
                           <div>
                              <p className="font-bold text-stone-800 group-hover:text-amber-600">Bài tập tự luyện (Word)</p>
                              <p className="text-xs text-stone-500">1.1 MB</p>
                           </div>
                        </div>
                        <Button variant="ghost" size="icon"><Download size={18} className="text-stone-400 group-hover:text-amber-600"/></Button>
                     </div>
                  </div>
                </ScrollArea>
             </Card>
          </div>
        </TabsContent>

        {/* TAB 4: TỰ LUẬN & ĐÁNH GIÁ AI */}
        <TabsContent value="essay" className="space-y-4 h-[700px] flex gap-6">
          <div className="w-1/3 flex flex-col gap-4">
             <Card className="border-stone-200 shadow-sm bg-blue-50/50">
               <CardHeader className="py-3 border-b border-blue-100">
                 <CardTitle className="text-blue-800 text-sm flex justify-between items-center">
                    <span>Đề bài Tự Luận</span>
                    <Badge variant="outline" className="bg-white text-blue-600 border-blue-200">120 phút</Badge>
                 </CardTitle>
               </CardHeader>
               <CardContent className="p-5">
                  <div className="p-4 bg-white border border-blue-100 rounded-lg text-stone-800 font-medium shadow-sm mb-4 leading-relaxed">
                     Cho hình chóp S.ABCD có đáy ABCD là hình vuông cạnh a, cạnh bên SA vuông góc với mặt phẳng đáy và SA = a√2. Gọi H, K lần lượt là hình chiếu vuông góc của A lên SB, SD. Tính thể tích khối chóp S.AHK theo a.
                  </div>
                  <Button variant="outline" size="sm" className="w-full text-stone-500 hover:text-blue-600">Xem gợi ý giải</Button>
               </CardContent>
             </Card>

             <Card className="flex-1 border-stone-200 shadow-sm bg-white overflow-hidden flex flex-col">
                <CardHeader className="py-3 bg-stone-50 border-b border-stone-100">
                   <CardTitle className="text-sm font-bold text-stone-600">Tiêu chí chấm điểm AI</CardTitle>
                </CardHeader>
                <ScrollArea className="flex-1 p-4">
                   <div className="space-y-3">
                      {[
                        { title: "Vẽ hình chuẩn xác", desc: "Nhận diện và xác định đúng các góc, mặt phẳng." },
                        { title: "Lập luận logic", desc: "Các bước chứng minh vuông góc hợp lý." },
                        { title: "Tính toán kết quả", desc: "Sử dụng đúng công thức thể tích và hệ thức lượng." },
                      ].map((crit, i) => (
                        <div key={i} className="flex gap-3 items-start p-2 hover:bg-stone-50 rounded-lg transition-colors cursor-help group">
                           <div className="bg-stone-100 p-1.5 rounded text-stone-400 group-hover:text-amber-600 group-hover:bg-amber-100"><Bot size={14}/></div>
                           <div>
                              <p className="text-sm font-bold text-stone-700">{crit.title}</p>
                              <p className="text-xs text-stone-500">{crit.desc}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </ScrollArea>
             </Card>
          </div>

          <Card className="flex-1 h-full flex flex-col border-stone-200 shadow-md relative bg-white">
             <div className="absolute top-0 right-0 left-0 h-10 bg-stone-100 border-b border-stone-200 flex items-center justify-between px-4 z-10 rounded-t-xl">
                <span className="text-xs font-bold text-stone-500">Bài làm của học sinh</span>
                <span className="text-xs text-stone-400 font-mono">Autosaved 2m ago</span>
             </div>
             
             <Textarea 
                placeholder="Trình bày bài giải chi tiết tại đây (Hệ thống hỗ trợ tự động nhận diện công thức Toán học)..." 
                className="flex-1 resize-none border-0 focus-visible:ring-0 text-lg p-8 pt-14 leading-relaxed font-serif bg-[#fffbf2] text-stone-800 placeholder:text-stone-300" 
             />
             
             <div className="p-4 border-t border-stone-100 bg-white flex justify-between items-center rounded-b-xl">
                <Button variant="ghost" className="text-stone-500"><FileText size={16} className="mr-2"/> Upload ảnh bài giải</Button>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20 font-bold px-8">
                  <Bot className="mr-2 h-4 w-4" /> AI Chấm Điểm
                </Button>
             </div>
          </Card>
        </TabsContent>

      </Tabs>

      {/* FOOTER ĐÃ CHUYỂN HƯỚNG SANG THPT QUỐC GIA */}
      <footer className="bg-stone-900 text-stone-400 pt-16 pb-8 mt-20 rounded-t-3xl border-t border-stone-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            <div className="col-span-1 md:col-span-1.5">
              <div className="flex items-center gap-2 mb-4 text-white">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-lg">
                  <GraduationCap size={24} className="text-white" />
                </div>
                <span className="text-2xl font-black tracking-tight">EduTech<span className="text-amber-500">.AI</span></span>
              </div>
              <p className="text-sm leading-relaxed mb-6">
                Nền tảng Luyện thi THPT Quốc Gia & Đánh giá năng lực thông minh. Áp dụng AI phân tích dữ liệu giúp tối ưu điểm số 12 môn học và cá nhân hóa lộ trình đỗ Đại học.
              </p>
              <div className="flex gap-4">
                {[Facebook, Twitter, Linkedin, Youtube].map((Icon, i) => (
                  <a key={i} href="#" className="h-8 w-8 rounded-full bg-stone-800 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all">
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Học tập</h4>
              <ul className="space-y-3 text-sm">
                <li className="hover:text-amber-500 cursor-pointer transition-colors">Thi thử THPT Quốc Gia</li>
                <li className="hover:text-amber-500 cursor-pointer transition-colors">Ngân hàng Đề Toán/Lý/Hóa</li>
                <li className="hover:text-amber-500 cursor-pointer transition-colors">AI Chấm điểm Tự Luận</li>
                <li className="hover:text-amber-500 cursor-pointer transition-colors">Khóa học Chuyên đề Video</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Hỗ trợ</h4>
              <ul className="space-y-3 text-sm">
                <li className="hover:text-amber-500 cursor-pointer transition-colors">Định hướng khối thi</li>
                <li className="hover:text-amber-500 cursor-pointer transition-colors">Tuyển sinh Đại học</li>
                <li className="hover:text-amber-500 cursor-pointer transition-colors">Trung tâm trợ giúp</li>
                <li className="hover:text-amber-500 cursor-pointer transition-colors">Liên hệ Giáo viên</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Liên hệ</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="text-amber-600 shrink-0 mt-1" />
                  <span>Tòa nhà Bách Khoa, Đại học UTC, Hà Nội</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={16} className="text-amber-600 shrink-0" />
                  <span>(024) 7300 8888</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-amber-600 shrink-0" />
                  <span>support@edutech.ai.vn</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-stone-500">
            <p>© 2026 EduTech AI Platform. Vận hành bởi Tùng Lê Thanh.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <span className="hover:text-white cursor-pointer">Chính sách bảo mật</span>
              <span className="hover:text-white cursor-pointer">Điều khoản dịch vụ</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}