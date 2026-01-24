"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { 
  Search, Filter, Clock, AlertCircle, CheckCircle2, Trophy, Zap, 
  MoreVertical, Star, ArrowRight, BookOpen, Code, 
  Globe, Calculator, PenTool, BrainCircuit, BarChart3, SlidersHorizontal, Layers, X
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- 1. DUMMY DATA GENERATOR ---
const SUBJECTS = [
  { name: "English", icon: Globe, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20", grad: "from-blue-500 to-cyan-500" },
  { name: "IT & Programming", icon: Code, color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20", grad: "from-cyan-500 to-teal-500" },
  { name: "Mathematics", icon: Calculator, color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20", grad: "from-rose-500 to-red-600" },
  { name: "Design", icon: PenTool, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20", grad: "from-purple-500 to-violet-600" },
  { name: "Business", icon: BarChart3, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20", grad: "from-amber-500 to-orange-600" },
];

const DIFFICULTIES = ["Easy", "Medium", "Hard", "Expert"];
const STATUSES = ["Not Started", "In Progress", "Completed"];

const GENERATE_EXAMS = Array.from({ length: 24 }).map((_, i) => {
  const subject = SUBJECTS[i % SUBJECTS.length];
  const difficulty = DIFFICULTIES[i % DIFFICULTIES.length];
  const status = STATUSES[i % STATUSES.length];
  
  return {
    id: i + 1,
    title: `${subject.name} Test ${i + 1}: ${difficulty} Level Challenge`,
    subject: subject.name,
    icon: subject.icon,
    color: subject.color,
    gradient: subject.grad,
    difficulty: difficulty,
    questions: (i + 1) * 5 + 10,
    time: `${(i + 1) * 2 + 15} mins`,
    rating: (4 + Math.random()).toFixed(1),
    participants: `${(Math.random() * 10 + 1).toFixed(1)}k`,
    status: status,
    progress: status === "In Progress" ? Math.floor(Math.random() * 80) + 10 : status === "Completed" ? 100 : 0,
    score: status === "Completed" ? Math.floor(Math.random() * 30) + 70 : null,
  };
});

export default function TakeExamPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const filteredExams = useMemo(() => {
    return GENERATE_EXAMS.filter((exam) => {
      const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || exam.subject === selectedCategory;
      const matchesDifficulty = selectedDifficulty ? exam.difficulty === selectedDifficulty : true;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchTerm, selectedCategory, selectedDifficulty]);

  return (
    <div className="space-y-8 pb-20 min-h-screen bg-[#fdfbf7] dark:bg-[#0c0a09] transition-colors duration-500">
      
      {/* --- HERO SECTION --- */}
      <div className="relative overflow-hidden rounded-3xl bg-[#1c1917] dark:bg-black text-white shadow-2xl p-8 md:p-12 mb-8 border border-stone-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-700/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4 max-w-2xl">
            <Badge variant="outline" className="text-amber-400 border-amber-500/50 bg-amber-500/10 px-3 py-1 mb-2 backdrop-blur-md">
              <Zap size={14} className="mr-2 fill-amber-400" /> Exam Portal Pro
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Sảnh thi đấu <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Trí tuệ nhân tạo</span>
            </h1>
            <p className="text-stone-400 text-lg font-medium">
              Hơn 20+ bài thi mẫu đang chờ bạn. Hãy chọn một thử thách và bắt đầu ngay!
            </p>
          </div>

          <div className="flex gap-4">
             <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center min-w-[100px] hover:bg-white/10 transition-colors">
                <Trophy size={24} className="mx-auto mb-2 text-yellow-400" />
                <div className="text-2xl font-bold">24</div>
                <div className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Đề thi</div>
             </div>
             <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center min-w-[100px] hover:bg-white/10 transition-colors">
                <Star size={24} className="mx-auto mb-2 text-amber-400" />
                <div className="text-2xl font-bold">TOP 1</div>
                <div className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Rank Tuần</div>
             </div>
          </div>
        </div>
      </div>

      {/* --- TOOLBAR --- */}
      <div className="sticky top-[80px] z-30 bg-[#fdfbf7]/90 dark:bg-[#0c0a09]/90 backdrop-blur-xl p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between transition-all">
        
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
          </div>
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm đề thi (VD: English, IT...)" 
            className="pl-10 h-11 bg-white dark:bg-[#1c1917] border-stone-200 dark:border-stone-800 focus-visible:ring-amber-500 rounded-xl"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute inset-y-0 right-3 flex items-center text-stone-400 hover:text-stone-600">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className={cn(
                "h-11 border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1917] rounded-xl hover:text-amber-600 hover:border-amber-200",
                selectedDifficulty && "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20"
              )}>
                <SlidersHorizontal className="mr-2 h-4 w-4" /> 
                {selectedDifficulty ? selectedDifficulty : "Độ khó"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-white dark:bg-[#1c1917] border-stone-200 dark:border-stone-800">
              <DropdownMenuLabel>Chọn mức độ</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={selectedDifficulty === null} onCheckedChange={() => setSelectedDifficulty(null)}>
                Tất cả
              </DropdownMenuCheckboxItem>
              {DIFFICULTIES.map(diff => (
                <DropdownMenuCheckboxItem key={diff} checked={selectedDifficulty === diff} onCheckedChange={() => setSelectedDifficulty(diff)}>
                  {diff}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-8 w-[1px] bg-stone-300 dark:bg-stone-700 mx-1 hidden md:block"></div>

          <Tabs defaultValue="grid" className="hidden md:block">
             <TabsList className="bg-stone-100 dark:bg-stone-900 p-1 h-11 rounded-xl">
                <TabsTrigger value="grid" className="h-9 px-3 rounded-lg"><Layers size={16}/></TabsTrigger>
                <TabsTrigger value="list" className="h-9 px-3 rounded-lg"><MoreVertical size={16}/></TabsTrigger>
             </TabsList>
          </Tabs>
        </div>
      </div>

      {/* --- CATEGORY TABS --- */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
        <TabsList className="bg-transparent p-0 h-auto gap-2 flex-wrap justify-start">
          {["All", "English", "IT & Programming", "Mathematics", "Design", "Business"].map((cat) => (
            <TabsTrigger 
              key={cat} 
              value={cat} 
              className={cn(
                "rounded-full border border-stone-200 dark:border-stone-800 px-5 py-2 font-bold transition-all",
                "data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:border-amber-600 data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/30",
                "bg-white dark:bg-[#1c1917] text-stone-600 dark:text-stone-400 hover:border-amber-300 hover:text-amber-600"
              )}
            >
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* --- EXAM GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
        {filteredExams.length > 0 ? (
          filteredExams.map((exam) => (
            <Card key={exam.id} className="group flex flex-col h-full relative overflow-hidden border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1917] hover:shadow-2xl hover:shadow-amber-900/5 dark:hover:shadow-black/50 hover:-translate-y-1.5 transition-all duration-300 rounded-3xl">
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${exam.gradient}`}></div>
              
              <CardHeader className="pb-3 pt-6 px-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${exam.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <exam.icon size={24} />
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "border-0 font-bold px-3 py-1 uppercase text-[10px] tracking-wider",
                      exam.difficulty === "Easy" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                      exam.difficulty === "Medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                      exam.difficulty === "Hard" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" :
                      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                    )}
                  >
                    {exam.difficulty}
                  </Badge>
                </div>
                
                <div className="min-h-[3.5rem] flex items-center">
                  <CardTitle className="text-lg font-bold text-stone-800 dark:text-stone-100 leading-tight group-hover:text-amber-600 transition-colors">
                    {exam.title}
                  </CardTitle>
                </div>

                <CardDescription className="flex items-center gap-2 pt-2 text-stone-500">
                  <span className="font-medium text-stone-400">{exam.subject}</span>
                  <span className="text-stone-300">•</span>
                  <span className="flex items-center gap-1"><Star size={12} className="fill-yellow-400 text-yellow-400"/> {exam.rating}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-4 px-6 space-y-4 flex-grow">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-800 p-2 rounded-lg">
                    <Clock size={14} className="text-stone-400"/> {exam.time}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-800 p-2 rounded-lg">
                    <AlertCircle size={14} className="text-stone-400"/> {exam.questions} Qs
                  </div>
                </div>

                {exam.status === "In Progress" ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-stone-500 uppercase">
                      <span>Tiến độ</span>
                      <span className="text-amber-600">{exam.progress}%</span>
                    </div>
                    {/* ĐÃ FIX: Dùng className [&>*]:bg-amber-500 thay vì prop indicatorColor */}
                    <Progress value={exam.progress} className="h-1.5 bg-stone-100 dark:bg-stone-800 [&>*]:bg-amber-500" />
                  </div>
                ) : exam.status === "Completed" ? (
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg justify-center border border-emerald-100 dark:border-emerald-900/30">
                    <CheckCircle2 size={16} /> Score: {exam.score}/100
                  </div>
                ) : (
                  <div className="text-xs text-stone-400 pt-2 flex items-center gap-1">
                     <Trophy size={12} /> {exam.participants} người đã thi
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-0 px-6 pb-6">
                <Button className={cn(
                  "w-full font-bold shadow-md transition-all h-10 rounded-xl",
                  exam.status === "Completed" 
                    ? "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 dark:bg-transparent dark:border-stone-700 dark:text-stone-400"
                    : "bg-stone-900 text-white hover:bg-amber-600 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-amber-500 hover:shadow-amber-500/20"
                )}>
                  {exam.status === "Not Started" ? "Bắt đầu làm bài" : 
                    exam.status === "In Progress" ? "Tiếp tục thi" : "Xem chi tiết"}
                  {exam.status !== "Completed" && <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />}
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
             <p className="text-stone-500">Thử thay đổi từ khóa hoặc bộ lọc xem sao nhé.</p>
             <Button 
               variant="link" 
               onClick={() => {setSearchTerm(""); setSelectedCategory("All"); setSelectedDifficulty(null)}}
               className="text-amber-600 font-bold mt-2"
             >
               Xóa bộ lọc
             </Button>
          </div>
        )}
      </div>

    </div>
  );
}