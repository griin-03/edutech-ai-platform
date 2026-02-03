// FILE: src/app/(dashboard)/student/dashboard/DashboardUI.tsx
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
  FileText, Mic, BarChart3, Star, Timer, AlertCircle, ChevronRight, GraduationCap, MapPin, Mail, Phone, Facebook, Twitter, Linkedin, Youtube
} from "lucide-react";
import { cn } from "@/lib/utils";

// Component nhận props 'user' từ file page.tsx truyền sang
export default function DashboardUI({ user }: { user: any }) {
  // 1. KHAI BÁO TẤT CẢ CÁC HOOKS TRƯỚC (QUAN TRỌNG)
  const [isMounted, setIsMounted] = useState(false);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // State cho Menu con (Sub-menus)
  const [readingPart, setReadingPart] = useState("part1");
  const [listeningSection, setListeningSection] = useState("sec1");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 2. XỬ LÝ LOGIC HIỂN THỊ
  const displayName = user?.name || user?.fullName || "Bạn mới";
  const displayInitials = displayName.substring(0, 2).toUpperCase();

  // 3. KIỂM TRA MOUNTED Ở ĐÂY (SAU KHI ĐÃ KHAI BÁO HẾT HOOKS)
  if (!isMounted) {
    return null; 
  }

  // 4. RENDER GIAO DIỆN
  return (
    <div className="space-y-6 pb-0 relative min-h-screen flex flex-col bg-[#fdfbf7] dark:bg-[#1c1917]">
      
      {/* --- 1. HEADER TRÀ SỮA (Sticky & Transparent) --- */}
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
                {/* --- Hiển thị tên thật --- */}
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
            <TabsTrigger value="reading" className="data-[state=active]:bg-white data-[state=active]:text-stone-700 data-[state=active]:shadow-sm font-bold px-5 py-2.5 rounded-xl transition-all gap-2">
              <BookOpen size={18} /> Reading
            </TabsTrigger>
            <TabsTrigger value="listening" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm font-bold px-5 py-2.5 rounded-xl transition-all gap-2">
              <Headphones size={18} /> Listening
            </TabsTrigger>
            <TabsTrigger value="writing" className="data-[state=active]:bg-white data-[state=active]:text-rose-700 data-[state=active]:shadow-sm font-bold px-5 py-2.5 rounded-xl transition-all gap-2">
              <PenTool size={18} /> Writing
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="rounded-[2rem] overflow-hidden shadow-2xl shadow-orange-900/10 h-72 relative ring-4 ring-white dark:ring-stone-800">
             <BannerSlider />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3 space-y-6">
               <div className="grid grid-cols-1 gap-4">
                  {[
                    { title: "Target Band", value: "8.0", icon: Target, bg: "bg-rose-50 text-rose-600" },
                    { title: "Bài đã làm", value: "24", icon: FileText, bg: "bg-blue-50 text-blue-600" },
                    { title: "Từ vựng mới", value: "150+", icon: Sparkles, bg: "bg-amber-50 text-amber-600" },
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
                   <CardTitle className="text-sm font-bold flex items-center gap-2"><Trophy size={16} className="text-yellow-300" /> Leaderboard</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-3">
                     {[1, 2, 3].map((rank) => (
                       <div key={rank} className="flex items-center gap-3 bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                         <span className="font-bold text-yellow-300">#{rank}</span>
                         <Avatar className="h-6 w-6"><AvatarImage src={`https://i.pravatar.cc/150?u=${rank}`} /></Avatar>
                         <span className="text-xs font-medium">Student User {rank}</span>
                         <span className="ml-auto text-xs font-bold bg-white/20 px-1.5 py-0.5 rounded">9.0</span>
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
                  <CardTitle className="text-stone-800">Khóa học của tôi</CardTitle>
                  <CardDescription>Tiếp tục học để duy trì chuỗi ngày (Streak)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { name: "IELTS Reading Masterclass", unit: "Unit 5: Skimming & Scanning", prog: 75, color: "bg-emerald-500" },
                    { name: "Advanced Listening Strategies", unit: "Unit 3: Multiple Choice", prog: 40, color: "bg-blue-500" },
                    { name: "Writing Task 2: Environment", unit: "Unit 1: Brainstorming", prog: 15, color: "bg-rose-500" },
                  ].map((course, idx) => (
                    <div key={idx} className="group cursor-pointer">
                       <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-stone-700 group-hover:text-amber-600 transition-colors">{course.name}</h4>
                            <p className="text-xs text-stone-500">{course.unit}</p>
                          </div>
                          <Badge variant="outline">{course.prog}%</Badge>
                       </div>
                       {/* Sửa lỗi indicatorColor ở đây */}
                       <Progress 
                         value={course.prog} 
                         className={cn("h-2", `[&>div]:${course.color}`)} 
                       />
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full text-stone-500 hover:text-amber-600 hover:bg-amber-50">Xem tất cả khóa học <ChevronRight size={16} /></Button>
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
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border-0"
                    />
                 </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm bg-blue-50/50">
                <CardContent className="p-4 flex gap-3 items-start">
                  <div className="bg-blue-100 p-2 rounded-full"><AlertCircle size={16} className="text-blue-600"/></div>
                  <div>
                    <h5 className="text-sm font-bold text-blue-900">Thi thử tháng 2</h5>
                    <p className="text-xs text-blue-700 mt-1">Sắp diễn ra vào 9:00 AM Chủ nhật tuần này.</p>
                    <Button size="sm" className="h-6 text-xs mt-2 bg-blue-600 hover:bg-blue-700">Đăng ký</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: READING */}
        <TabsContent value="reading" className="space-y-4 h-[700px] flex flex-col">
          <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-2">
               <span className="text-xs font-bold text-stone-400 uppercase px-3">Chọn bài thi:</span>
               <DropdownMenu>
                 <DropdownMenuTrigger asChild><Button variant="outline" size="sm">Cambridge IELTS 18 <ChevronDown size={14} className="ml-2"/></Button></DropdownMenuTrigger>
                 <DropdownMenuContent><DropdownMenuItem>Cambridge IELTS 17</DropdownMenuItem><DropdownMenuItem>Cambridge IELTS 16</DropdownMenuItem></DropdownMenuContent>
               </DropdownMenu>
               <div className="h-4 w-[1px] bg-stone-300 mx-2"></div>
               <div className="flex bg-stone-100 rounded-lg p-1">
                 {["part1", "part2", "part3"].map((part) => (
                   <button 
                     key={part} 
                     onClick={() => setReadingPart(part)}
                     className={cn(
                       "px-4 py-1 text-xs font-bold rounded-md transition-all",
                       readingPart === part ? "bg-white text-emerald-600 shadow-sm" : "text-stone-500 hover:bg-stone-200"
                     )}
                   >
                     Passage {part.replace("part", "")}
                   </button>
                 ))}
               </div>
            </div>
            <div className="flex items-center gap-2 px-3">
               <Badge variant="outline" className="gap-1 bg-stone-50"><Timer size={14} className="text-red-500" /> 18:45 left</Badge>
               <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Nộp bài</Button>
            </div>
          </div>

          <div className="flex gap-6 flex-1 h-full overflow-hidden">
            <Card className="w-1/2 h-full flex flex-col border-stone-200 shadow-sm bg-[#fffbf2]/50">
              <CardHeader className="bg-stone-50/80 py-3 border-b border-stone-100 flex flex-row justify-between items-center sticky top-0 backdrop-blur-sm z-10">
                <CardTitle className="text-stone-800 text-lg font-serif">The History of Coffee Beans</CardTitle>
                <div className="flex gap-1">
                   <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal size={16}/></Button>
                </div>
              </CardHeader>
              <ScrollArea className="flex-1 p-8">
                <article className="prose dark:prose-invert max-w-none text-stone-700 leading-loose font-serif text-lg selection:bg-yellow-200">
                  <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-amber-800 first-letter:float-left first-letter:mr-3">C</p>
                  <p>offee is a brewed drink prepared from roasted coffee beans, the seeds of berries from certain Coffea species. From the coffee fruit, the seeds are separated to produce a stable, raw product: unroasted green coffee. The seeds are then roasted, a process which transforms them into a consumable product: roasted coffee, which is ground into fine particles that are typically steeped in hot water.</p>
                  
                  <h3 className="text-amber-800 font-bold mt-6 mb-2">1. Origins and Legends</h3>
                  <p>The history of coffee dates back to the 15th century, and possibly earlier with a number of reports and legends surrounding its first use. The earliest substantiated evidence of either coffee drinking or knowledge of the coffee tree is from the early 15th century, in the Sufi monasteries of Yemen.</p>
                  
                  <div className="my-6 p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-900 italic">
                     "Coffee was initially used in religious ceremonies to help people stay awake during late-night prayers."
                  </div>
                  
                  <p>By the 16th century, it had reached the rest of the Middle East, Persia, Turkey, and northern Africa. Coffee seeds were first exported from East Africa to Yemen, as the Coffea arabica plant is thought to have been indigenous to the former.</p>
                  <p className="mt-4">[... Text continues for scrolling simulation ...]</p>
                  <p className="mt-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                </article>
              </ScrollArea>
            </Card>
            
            <Card className="w-1/2 h-full flex flex-col border-stone-200 shadow-sm bg-white">
              <CardHeader className="py-3 border-b border-stone-100 flex justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2">
                   <CardTitle className="text-stone-800">Questions 1-5</CardTitle>
                   <Badge variant="secondary" className="text-xs">True / False / NG</Badge>
                </div>
              </CardHeader>
              <ScrollArea className="flex-1 p-6 bg-stone-50/30">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <p className="text-sm italic text-stone-500">Do the following statements agree with the information given in Reading Passage 1?</p>
                    <div className="space-y-6">
                      {[
                        { q: "1. Coffee was first discovered in Brazil.", id: "q1" },
                        { q: "2. Sufi monks used coffee to stay awake.", id: "q2" },
                        { q: "3. Coffee beans are roasted before being separated from the fruit.", id: "q3" }
                      ].map((item, i) => (
                        <div key={i} className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm">
                           <p className="font-medium text-stone-800 mb-3">{item.q}</p>
                           <RadioGroup className="flex gap-4">
                              {["TRUE", "FALSE", "NOT GIVEN"].map((opt) => (
                                <div key={opt} className="flex items-center space-x-2">
                                  <RadioGroupItem value={opt} id={`${item.id}-${opt}`} className="text-emerald-600" />
                                  <Label htmlFor={`${item.id}-${opt}`} className="text-xs font-bold text-stone-500 cursor-pointer hover:text-emerald-600">{opt}</Label>
                                </div>
                              ))}
                           </RadioGroup>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <div className="p-3 border-t border-stone-100 bg-white flex gap-2 overflow-x-auto">
                 {Array.from({length: 13}).map((_, i) => (
                   <button key={i} className={`h-8 w-8 rounded-md flex items-center justify-center text-xs font-bold border ${i < 3 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-stone-50 text-stone-400'}`}>
                     {i+1}
                   </button>
                 ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: LISTENING */}
        <TabsContent value="listening" className="space-y-4 h-[700px] flex flex-col">
          <div className="bg-stone-900 text-white p-5 rounded-2xl flex items-center gap-6 shadow-xl shadow-stone-900/10">
            <Button size="icon" className="h-12 w-12 rounded-full bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/30 border-4 border-stone-800">
              <PlayCircle size={28} className="ml-1" />
            </Button>
            <div className="flex-1 space-y-2">
               <div className="flex justify-between text-xs font-bold text-stone-400 uppercase tracking-widest">
                  <span>IELTS Practice Test 4 - Section 1</span>
                  <span>04:12 / 10:30</span>
               </div>
               <div className="h-2 bg-stone-700 rounded-full overflow-hidden cursor-pointer group">
                  <div className="h-full w-1/3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full group-hover:bg-amber-400 transition-all"></div>
               </div>
            </div>
            <div className="flex gap-2">
               <Button size="sm" variant="ghost" className="text-stone-400 hover:text-white">Speed 1.0x</Button>
               <Button size="sm" variant="ghost" className="text-stone-400 hover:text-white">Volume</Button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2 px-2">
             <span className="text-xs font-bold text-stone-400 uppercase">Section:</span>
             {[1, 2, 3, 4].map(sec => (
               <Button key={sec} variant={listeningSection === `sec${sec}` ? "secondary" : "ghost"} size="sm" onClick={() => setListeningSection(`sec${sec}`)} className="h-7 text-xs">
                 Section {sec}
               </Button>
             ))}
          </div>
          
          <div className="flex gap-6 flex-1 overflow-hidden">
             <Card className="w-1/3 h-full overflow-hidden border-stone-200 bg-stone-50 flex flex-col">
                <CardHeader className="bg-stone-100 py-3 border-b border-stone-200">
                  <Tabs defaultValue="notes" className="w-full">
                    <TabsList className="w-full grid grid-cols-2 h-8 p-0 bg-stone-200">
                       <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
                       <TabsTrigger value="transcript" className="text-xs">Transcript</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border border-stone-200 shadow-sm">
                      <p className="text-xs text-stone-400 font-bold uppercase mb-2">Context</p>
                      <h4 className="font-bold text-stone-800">Accommodation Enquiry</h4>
                      <p className="text-sm text-stone-600 mt-1">A conversation between a student and an accommodation officer.</p>
                    </div>
                    <div className="space-y-2 text-sm text-stone-600">
                       <p><strong>Caller:</strong> Is that the Student Accommodation Office?</p>
                       <p><strong>Officer:</strong> Yes, how can I help you?</p>
                       <p><strong>Caller:</strong> Im calling to ask about...</p>
                    </div>
                  </div>
                </ScrollArea>
             </Card>

             <Card className="flex-1 h-full overflow-hidden border-stone-200">
                <CardHeader className="py-3 bg-white border-b border-stone-100"><CardTitle>Questions 1-10</CardTitle></CardHeader>
                <ScrollArea className="h-full p-8 bg-white">
                   <div className="space-y-8 max-w-2xl mx-auto">
                      <div className="space-y-4">
                         <h3 className="font-bold text-stone-800 border-b pb-2">Complete the form below. Write ONE WORD AND/OR A NUMBER.</h3>
                         
                         <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 space-y-4">
                            <h4 className="text-center font-bold text-xl text-blue-800 mb-4">Student Accommodation Form</h4>
                            
                            <div className="grid grid-cols-[150px_1fr] gap-4 items-center">
                               <label className="font-bold text-stone-600 text-right">Student Name:</label>
                               <div className="font-serif text-lg">Mark <span className="text-blue-600 font-bold border-b-2 border-blue-200 px-2 min-w-[100px] inline-block">______________</span> (1)</div>
                            </div>
                            
                            <div className="grid grid-cols-[150px_1fr] gap-4 items-center">
                               <label className="font-bold text-stone-600 text-right">Date of Birth:</label>
                               <div className="font-serif text-lg"><span className="text-blue-600 font-bold border-b-2 border-blue-200 px-2 min-w-[100px] inline-block">______________</span> (2) 1998</div>
                            </div>

                            <div className="grid grid-cols-[150px_1fr] gap-4 items-center">
                               <label className="font-bold text-stone-600 text-right">Course:</label>
                               <div className="font-serif text-lg">Modern <span className="text-blue-600 font-bold border-b-2 border-blue-200 px-2 min-w-[100px] inline-block">______________</span> (3)</div>
                            </div>
                         </div>
                      </div>
                   </div>
                </ScrollArea>
             </Card>
          </div>
        </TabsContent>

        {/* TAB 4: WRITING */}
        <TabsContent value="writing" className="space-y-4 h-[700px] flex gap-6">
          <div className="w-1/3 flex flex-col gap-4">
             <Card className="border-stone-200 shadow-sm bg-orange-50/50">
               <CardHeader className="py-3 border-b border-orange-100">
                 <CardTitle className="text-orange-800 text-sm flex justify-between items-center">
                    <span>Task 2 Prompt</span>
                    <Badge variant="outline" className="bg-white text-orange-600 border-orange-200">40 mins</Badge>
                 </CardTitle>
               </CardHeader>
               <CardContent className="p-5">
                  <div className="p-4 bg-white border border-orange-100 rounded-lg text-stone-800 font-medium shadow-sm mb-4">
                     "Some people believe that the best way to solve environmental problems is to increase the price of fuel. To what extent do you agree or disagree?"
                  </div>
                  <Button variant="outline" size="sm" className="w-full text-stone-500 hover:text-orange-600">Xem bài mẫu Band 9.0</Button>
               </CardContent>
             </Card>

             <Card className="flex-1 border-stone-200 shadow-sm bg-white overflow-hidden flex flex-col">
                <CardHeader className="py-3 bg-stone-50 border-b border-stone-100">
                   <CardTitle className="text-sm font-bold text-stone-600">Grading Criteria</CardTitle>
                </CardHeader>
                <ScrollArea className="flex-1 p-4">
                   <div className="space-y-3">
                      {[
                        { title: "Task Response", desc: "Fully addresses all parts of the task." },
                        { title: "Coherence & Cohesion", desc: "Logically organizes information." },
                        { title: "Lexical Resource", desc: "Uses a wide range of vocabulary." },
                        { title: "Grammar Range", desc: "Uses a wide range of structures." },
                      ].map((crit, i) => (
                        <div key={i} className="flex gap-3 items-start p-2 hover:bg-stone-50 rounded-lg transition-colors cursor-help group">
                           <div className="bg-stone-100 p-1.5 rounded text-stone-400 group-hover:text-amber-600 group-hover:bg-amber-100"><Star size={14}/></div>
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
             <div className="absolute top-0 right-0 left-0 h-10 bg-stone-100 border-b border-stone-200 flex items-center justify-end px-4 gap-3 z-10 rounded-t-xl">
                <span className="text-xs text-stone-400 font-mono">Autosaved 2m ago</span>
                <Badge variant="secondary" className="bg-white border text-stone-600">Words: 124</Badge>
             </div>
             
             <Textarea 
                placeholder="Start typing your essay here..." 
                className="flex-1 resize-none border-0 focus-visible:ring-0 text-lg p-8 pt-14 leading-relaxed font-serif bg-[#fffbf2] text-stone-800 placeholder:text-stone-300" 
             />
             
             <div className="p-4 border-t border-stone-100 bg-white flex justify-between items-center rounded-b-xl">
                <Button variant="ghost" className="text-stone-500"><Mic size={16} className="mr-2"/> Voice Input</Button>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20 font-bold px-8">
                  <Bot className="mr-2 h-4 w-4" /> AI Grading
                </Button>
             </div>
          </Card>
        </TabsContent>

      </Tabs>

      {/* FOOTER */}
      <footer className="bg-stone-900 text-stone-400 pt-16 pb-8 mt-20 rounded-t-3xl border-t border-stone-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            {/* Cột 1: Logo & Slogan */}
            <div className="col-span-1 md:col-span-1.5">
              <div className="flex items-center gap-2 mb-4 text-white">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-lg">
                  <GraduationCap size={24} className="text-white" />
                </div>
                <span className="text-2xl font-black tracking-tight">EduTech<span className="text-amber-500">.AI</span></span>
              </div>
              <p className="text-sm leading-relaxed mb-6">
                Nền tảng ôn luyện thi IELTS và Ngoại ngữ thông minh hàng đầu Việt Nam. Áp dụng công nghệ AI giúp cá nhân hóa lộ trình học tập, tối ưu điểm số trong thời gian ngắn nhất.
              </p>
              <div className="flex gap-4">
                {[Facebook, Twitter, Linkedin, Youtube].map((Icon, i) => (
                  <a key={i} href="#" className="h-8 w-8 rounded-full bg-stone-800 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all">
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Cột 2: Liên kết */}
            <div>
              <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Học tập</h4>
              <ul className="space-y-3 text-sm">
                <li className="hover:text-amber-500 cursor-pointer transition-colors">IELTS Reading</li>
                <li className="hover:text-amber-500 cursor-pointer transition-colors">IELTS Listening</li>
                <li className="hover:text-amber-500 cursor-pointer transition-colors">Writing Correction</li>
                <li className="hover:text-amber-500 cursor-pointer transition-colors">Speaking Partner AI</li>
                <li className="hover:text-amber-500 cursor-pointer transition-colors">Thi thử Online</li>
              </ul>
            </div>

            {/* Cột 3: Hỗ trợ */}
            <div>
              <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Hỗ trợ</h4>
              <ul className="space-y-3 text-sm">
                <li className="hover:text-amber-500 cursor-pointer transition-colors">Trung tâm trợ giúp</li>
                <li className="hover:text-amber-500 cursor-pointer transition-colors">Điều khoản sử dụng</li>
                <li className="hover:text-amber-500 cursor-pointer transition-colors">Chính sách bảo mật</li>
                <li className="hover:text-amber-500 cursor-pointer transition-colors">Liên hệ hợp tác</li>
              </ul>
            </div>

            {/* Cột 4: Liên hệ */}
            <div>
              <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Liên hệ</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="text-amber-600 shrink-0 mt-1" />
                  <span>Tầng 12, Tòa nhà Bitexco, Quận 1, TP. Hồ Chí Minh</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={16} className="text-amber-600 shrink-0" />
                  <span>(028) 7300 9999</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-amber-600 shrink-0" />
                  <span>support@edutech.ai</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-stone-500">
            <p>© 2026 EduTech AI Platform. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <span className="hover:text-white cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer">Terms of Service</span>
              <span className="hover:text-white cursor-pointer">Cookie Settings</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}