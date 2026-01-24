"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BrainCircuit, Target, TrendingUp, Clock, 
  CheckCircle2, Lightbulb, Map, Award, Play, Pause, RotateCcw, Sparkles,
  Zap, Trophy, Flame, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- DỮ LIỆU MẪU ---
const ROADMAP = [
  { id: 1, title: "Nền tảng ReactJS", status: "completed", desc: "Components, Props, State", score: 95 },
  { id: 2, title: "Hooks chuyên sâu", status: "completed", desc: "useEffect, useMemo, useCallback", score: 88 },
  { id: 3, title: "Next.js 14 App Router", status: "current", desc: "Server Components, Server Actions", progress: 65 },
  { id: 4, title: "State Management", status: "locked", desc: "Redux Toolkit / Zustand", progress: 0 },
  { id: 5, title: "Performance Optimization", status: "locked", desc: "Lazy loading, Caching", progress: 0 },
];

const SKILLS = [
  { name: "Frontend", val: 85, color: "bg-blue-500" },
  { name: "Backend", val: 60, color: "bg-emerald-500" },
  { name: "DevOps", val: 40, color: "bg-purple-500" },
  { name: "English", val: 75, color: "bg-rose-500" },
  { name: "Soft Skills", val: 90, color: "bg-amber-500" },
];

const POMODORO_TIME = 25 * 60;

export default function AiMentorPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [timer, setTimer] = useState(POMODORO_TIME);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("roadmap");

  // Logic Pomodoro
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Tính phần trăm thời gian cho vòng tròn SVG
  const progressPercentage = ((POMODORO_TIME - timer) / POMODORO_TIME) * 100;

  const handleGeneratePlan = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    // CONTAINER CHÍNH
    <div className="flex h-[calc(100vh-8rem)] w-full flex-col overflow-hidden bg-[#fdfbf7] dark:bg-[#0c0a09] transition-colors duration-500 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl relative animate-in fade-in zoom-in-95 duration-500 group/page">
      
      {/* --- HEADER: GLASSMORPHISM & NEON --- */}
      <div className="shrink-0 p-6 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-[#0c0a09]/80 backdrop-blur-xl z-20 relative overflow-hidden">
        {/* Hiệu ứng nền mờ phía sau */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative z-10">
          <div>
            <h1 className="text-3xl font-black text-stone-800 dark:text-stone-100 flex items-center gap-2 tracking-tight">
              <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">AI Mentor</span>
              <Sparkles className="text-amber-500 fill-amber-500 animate-pulse" size={24} />
            </h1>
            <p className="text-stone-500 text-sm font-medium mt-1">
              Trợ lý ảo tối ưu hóa hiệu suất học tập của bạn.
            </p>
          </div>
          
          <Button 
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-amber-600 dark:hover:bg-amber-400 font-bold shadow-lg shadow-stone-500/20 dark:shadow-none transition-all hover:scale-105 active:scale-95"
          >
            {isGenerating ? (
              <>Đang phân tích <Zap className="ml-2 h-4 w-4 animate-bounce text-yellow-400 fill-yellow-400" /></>
            ) : (
              <><BrainCircuit className="mr-2 h-4 w-4" /> Tối ưu lộ trình ngay</>
            )}
          </Button>
        </div>

        {/* AI Insight Box */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-2xl flex gap-4 items-start animate-in slide-in-from-top-4 shadow-sm">
           <div className="bg-white dark:bg-blue-950 p-2.5 rounded-xl text-blue-600 shadow-sm shrink-0">
              <Lightbulb size={24} className="fill-blue-100 dark:fill-blue-900" />
           </div>
           <div>
              <h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm flex items-center gap-2">
                 AI Insight tuần này <Badge className="bg-blue-200 text-blue-800 hover:bg-blue-300 border-0 h-5 text-[10px]">Mới</Badge>
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 leading-relaxed font-medium">
                "Chào Tuấn Anh! Dựa trên kết quả bài kiểm tra gần nhất, mình thấy bạn đang làm rất tốt phần <strong>React Hooks</strong> (Top 10% lớp). Tuy nhiên, kỹ năng <strong>Writing Task 2</strong> đang có dấu hiệu chững lại. Hãy dành thêm 30 phút mỗi ngày cho nó nhé!"
              </p>
           </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden bg-stone-50/50 dark:bg-[#0c0a09]">
        
        {/* CỘT TRÁI: SCROLLABLE CONTENT */}
        <ScrollArea className="flex-1 h-full px-6 custom-scrollbar">
           <div className="py-6 space-y-8 pb-24">
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-white dark:bg-stone-900 p-1.5 rounded-2xl mb-6 shadow-sm border border-stone-200 dark:border-stone-800 w-full md:w-auto inline-flex">
                   <TabsTrigger value="roadmap" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-stone-100 dark:data-[state=active]:bg-stone-800 data-[state=active]:text-stone-900 dark:data-[state=active]:text-white font-bold transition-all"><Map size={16} className="mr-2"/> Lộ trình học tập</TabsTrigger>
                   <TabsTrigger value="skills" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-stone-100 dark:data-[state=active]:bg-stone-800 data-[state=active]:text-emerald-600 font-bold transition-all"><TrendingUp size={16} className="mr-2"/> Biểu đồ kỹ năng</TabsTrigger>
                </TabsList>

                {/* TAB 1: ROADMAP */}
                <TabsContent value="roadmap" className="space-y-6 mt-0 animate-in fade-in slide-in-from-left-4 duration-500">
                   <div className="relative border-l-2 border-stone-200 dark:border-stone-800 ml-4 space-y-10 pl-8 py-4">
                      {ROADMAP.map((step) => (
                        <div key={step.id} className="relative group">
                           {/* Connecting Line Effect */}
                           <div className="absolute -left-[43px] top-8 bottom-[-40px] w-0.5 bg-stone-200 dark:bg-stone-800 group-last:hidden"></div>

                           {/* Dot Indicator */}
                           <div className={cn(
                             "absolute -left-[50px] top-1 h-6 w-6 rounded-full border-4 border-[#fdfbf7] dark:border-[#0c0a09] transition-all duration-500 z-10",
                             step.status === "completed" ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" :
                             step.status === "current" ? "bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-125 ring-4 ring-amber-100 dark:ring-amber-900/30" :
                             "bg-stone-300 dark:bg-stone-700"
                           )}>
                              {step.status === "completed" && <CheckCircle2 size={12} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                           </div>

                           {/* Card */}
                           <Card className={cn(
                             "transition-all duration-300 border-0 shadow-sm hover:shadow-lg hover:-translate-y-1 overflow-hidden relative",
                             step.status === "current" 
                               ? "bg-white dark:bg-[#1c1917] ring-2 ring-amber-500/20 dark:ring-amber-500/40" 
                               : "bg-white dark:bg-[#1c1917] opacity-90 hover:opacity-100"
                           )}>
                              {step.status === "current" && <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>}
                              
                              <CardHeader className="p-5 pb-2">
                                 <div className="flex justify-between items-start">
                                    <div className="space-y-1.5">
                                       <Badge variant="secondary" className={cn(
                                          "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md",
                                          step.status === "completed" ? "text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                          step.status === "current" ? "text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 animate-pulse" :
                                          "text-stone-500 bg-stone-100 dark:bg-stone-800"
                                       )}>{step.status === 'current' ? 'Đang học' : step.status}</Badge>
                                       <CardTitle className="text-lg font-bold text-stone-800 dark:text-stone-100 group-hover:text-amber-600 transition-colors">{step.title}</CardTitle>
                                    </div>
                                    {step.status === "completed" && (
                                       <div className="flex flex-col items-end">
                                          <span className="text-2xl font-black text-emerald-500">{step.score}</span>
                                          <span className="text-[10px] text-stone-400 font-bold uppercase">Điểm số</span>
                                       </div>
                                    )}
                                 </div>
                              </CardHeader>
                              <CardContent className="p-5 pt-2">
                                 <p className="text-sm text-stone-500 mb-4 font-medium">{step.desc}</p>
                                 {step.status === "current" && (
                                    <div className="space-y-2">
                                       <div className="flex justify-between text-xs font-bold text-stone-500">
                                          <span>Tiến độ</span>
                                          <span className="text-amber-600">{step.progress}%</span>
                                       </div>
                                       
                                       {/* --- FIX LỖI Ở ĐÂY: DÙNG CLASSNAME ĐỂ CHỈNH MÀU --- */}
                                       <Progress 
                                         value={step.progress} 
                                         className="h-2 bg-stone-100 dark:bg-stone-800 [&>*]:bg-gradient-to-r [&>*]:from-amber-500 [&>*]:to-orange-500" 
                                       />
                                       
                                    </div>
                                 )}
                              </CardContent>
                           </Card>
                        </div>
                      ))}
                   </div>
                </TabsContent>

                {/* TAB 2: SKILLS */}
                <TabsContent value="skills" className="mt-0 animate-in fade-in slide-in-from-right-4 duration-500">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="border-0 shadow-lg bg-white dark:bg-[#1c1917] overflow-hidden">
                         <CardHeader className="border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/20">
                            <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="text-blue-500"/> Bộ kỹ năng tích lũy</CardTitle>
                         </CardHeader>
                         <CardContent className="space-y-6 p-6">
                            {SKILLS.map((skill, i) => (
                               <div key={i} className="space-y-2 group">
                                  <div className="flex justify-between text-sm font-bold text-stone-700 dark:text-stone-300">
                                     <span>{skill.name}</span>
                                     <span className="group-hover:text-amber-600 transition-colors">{skill.val}%</span>
                                  </div>
                                  <div className="h-2.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden shadow-inner">
                                     <div 
                                       className={`h-full ${skill.color} rounded-full transition-all duration-1000 ease-out group-hover:shadow-[0_0_10px_currentColor] relative`} 
                                       style={{ width: `${skill.val}%` }}
                                     >
                                        <div className="absolute top-0 right-0 h-full w-1 bg-white/50"></div>
                                     </div>
                                  </div>
                               </div>
                            ))}
                         </CardContent>
                      </Card>

                      <Card className="border-0 shadow-lg bg-gradient-to-br from-stone-900 to-stone-800 dark:from-white dark:to-stone-200 text-white dark:text-stone-900 flex flex-col justify-center items-center text-center p-8 space-y-6 relative overflow-hidden group">
                         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                         <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl group-hover:bg-yellow-500/40 transition-all duration-500"></div>
                         
                         <div className="h-24 w-24 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/30 transform group-hover:scale-110 transition-transform duration-500 rotate-3 group-hover:rotate-6">
                            <Award size={48} className="text-white drop-shadow-md" />
                         </div>
                         <div className="relative z-10">
                            <Badge className="bg-white/20 text-white dark:text-stone-800 border-0 mb-3 backdrop-blur-sm">DỰ ĐOÁN AI</Badge>
                            <h3 className="font-black text-2xl mb-1">Chứng chỉ IELTS</h3>
                            <p className="text-sm text-stone-300 dark:text-stone-600">Khả năng đạt <span className="font-black text-yellow-400 dark:text-amber-600 text-lg">7.5+</span> trong tháng tới.</p>
                         </div>
                         <Button className="w-full bg-white text-stone-900 hover:bg-stone-200 dark:bg-stone-900 dark:text-white font-bold h-11 relative z-10">
                            Xem phân tích chi tiết <ArrowRight size={16} className="ml-2"/>
                         </Button>
                      </Card>
                   </div>
                </TabsContent>
              </Tabs>

           </div>
        </ScrollArea>

        {/* CỘT PHẢI: WIDGETS (FIXED) */}
        <div className="w-full lg:w-80 border-l border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-[#12100e] shrink-0 flex flex-col backdrop-blur-md">
           
           {/* POMODORO TIMER REDESIGNED */}
           <div className="p-6 border-b border-stone-200 dark:border-stone-800 shrink-0">
              <h3 className="font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2 mb-5">
                 <Clock size={18} className="text-rose-500" /> Focus Mode
              </h3>
              <Card className="bg-stone-900 text-white border-0 shadow-2xl overflow-hidden relative group">
                 {/* Timer Circle Effect */}
                 <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none opacity-20" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
                    <circle 
                        cx="50" cy="50" r="45" fill="none" stroke="#f43f5e" strokeWidth="4" 
                        strokeDasharray="283" strokeDashoffset={283 - (283 * progressPercentage) / 100}
                        className="transition-all duration-1000 ease-linear"
                    />
                 </svg>

                 <CardContent className="p-8 flex flex-col items-center justify-center space-y-6 relative z-10">
                    <div className="text-6xl font-black font-mono tracking-tighter tabular-nums text-transparent bg-clip-text bg-gradient-to-b from-white to-stone-400">
                       {formatTime(timer)}
                    </div>
                    <div className="flex gap-3 w-full">
                       <Button 
                         onClick={() => setIsTimerRunning(!isTimerRunning)}
                         className={cn(
                           "flex-1 font-bold h-12 text-base transition-all active:scale-95",
                           isTimerRunning 
                             ? "bg-rose-500 hover:bg-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.4)]" 
                             : "bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                         )}
                       >
                          {isTimerRunning ? <Pause size={20} className="mr-2"/> : <Play size={20} className="mr-2"/>}
                          {isTimerRunning ? "Dừng lại" : "Bắt đầu"}
                       </Button>
                       <Button 
                         variant="secondary" size="icon" 
                         onClick={() => {setIsTimerRunning(false); setTimer(POMODORO_TIME)}} 
                         className="h-12 w-12 bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white transition-colors"
                       >
                          <RotateCcw size={20}/>
                       </Button>
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* DAILY QUESTS */}
           <ScrollArea className="flex-1 p-6">
              <h3 className="font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2 mb-4">
                 <Target size={18} className="text-blue-500" /> Nhiệm vụ ngày
              </h3>
              <div className="space-y-3">
                 {[
                   { task: "Hoàn thành 1 bài Reading", xp: "50 XP", done: true, type: "daily" },
                   { task: "Học 20 từ vựng mới", xp: "30 XP", done: true, type: "daily" },
                   { task: "Nghe Podcast 15 phút", xp: "20 XP", done: false, type: "daily" },
                   { task: "Đạt Top 3 BXH tuần", xp: "100 XP", done: false, type: "weekly" },
                 ].map((quest, i) => (
                   <div key={i} className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group",
                      quest.done 
                        ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30" 
                        : "bg-white dark:bg-[#1c1917] border-stone-200 dark:border-stone-800 hover:border-amber-400 hover:shadow-md"
                   )}>
                      <div className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center border transition-colors",
                        quest.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-stone-300 group-hover:border-amber-400"
                      )}>
                         {quest.done ? <CheckCircle2 size={14} /> : <div className="w-2 h-2 rounded-full bg-stone-300 group-hover:bg-amber-400"></div>}
                      </div>
                      <div className="flex-1">
                         <p className={cn("text-xs font-bold transition-all", quest.done ? "text-stone-400 line-through" : "text-stone-700 dark:text-stone-200")}>{quest.task}</p>
                         {quest.type === 'weekly' && <span className="text-[9px] text-purple-500 font-bold uppercase">Nhiệm vụ tuần</span>}
                      </div>
                      <Badge variant="secondary" className={cn("text-[10px] font-bold border-0", quest.done ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-600 group-hover:bg-amber-100 group-hover:text-amber-700")}>
                        {quest.xp}
                      </Badge>
                   </div>
                 ))}
              </div>
              
              {/* Leaderboard Mini */}
              <div className="mt-6 pt-6 border-t border-stone-200 dark:border-stone-800">
                 <h3 className="font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2 mb-4">
                    <Trophy size={18} className="text-yellow-500" /> Bảng vàng hôm nay
                 </h3>
                 <div className="flex items-center justify-between bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 p-3 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                    <div className="flex items-center gap-3">
                       <div className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center text-white font-black shadow-md border-2 border-white">1</div>
                       <div>
                          <p className="text-xs font-bold text-stone-800 dark:text-stone-200">Minh Tú</p>
                          <p className="text-[10px] text-stone-500">2400 XP</p>
                       </div>
                    </div>
                    <Flame size={16} className="text-orange-500 animate-pulse" />
                 </div>
              </div>
           </ScrollArea>
        </div>

      </div>
    </div>
  );
}