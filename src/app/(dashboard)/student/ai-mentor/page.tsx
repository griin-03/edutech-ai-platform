"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, BrainCircuit, Target, TrendingUp, 
  CheckCircle2, Clock, Zap, BarChart3, Radar, 
  Microscope, Sparkles, Loader2, RefreshCw
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RechartRadar
} from 'recharts';
import { cn } from "@/lib/utils";

export default function AiMentorPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  
  // State cho AI Advice
  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // 1. FETCH DỮ LIỆU BAN ĐẦU
  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/mentor");
      const json = await res.json();
      setData(json);
      // Lấy lời khuyên mặc định từ thuật toán (nếu chưa xin AI)
      if (json.prediction?.advice) {
        setAiAdvice(json.prediction.advice);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 2. GỌI AI THẬT (COHERE)
  const handleGetAiAdvice = async () => {
    setIsAiLoading(true);
    try {
        const res = await fetch("/api/mentor/advice", { method: "POST" });
        const json = await res.json();
        // Cập nhật lời khuyên mới từ AI
        setAiAdvice(json.advice);
    } catch (e) {
        console.error(e);
    } finally {
        setIsAiLoading(false);
    }
  };

  // 3. XỬ LÝ CHECK NHIỆM VỤ
  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
      // Optimistic Update (Cập nhật giao diện trước khi gọi API cho mượt)
      setData((prev: any) => ({
          ...prev,
          tasks: prev.tasks.map((t: any) => t.id === taskId ? {...t, isCompleted: !currentStatus} : t)
      }));

      // Gọi API lưu xuống DB
      await fetch("/api/mentor", {
          method: "POST",
          body: JSON.stringify({ taskId, isCompleted: !currentStatus })
      });
  };

  if (loading) {
      return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="animate-spin text-amber-500 w-10 h-10"/></div>;
  }

  return (
    <div className="flex flex-col space-y-6 pb-20 p-6 max-w-[1600px] mx-auto animate-in fade-in zoom-in-95 duration-500">
      
      {/* 1. HEADER: TỔNG QUAN */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-800 dark:text-stone-100 flex items-center gap-2">
            AI Analytics Center <Microscope className="text-amber-600" />
          </h1>
          <p className="text-stone-500 mt-1">Trung tâm phân tích dữ liệu học tập và dự báo hiệu suất.</p>
        </div>
        <div className="flex gap-2">
           <Button onClick={fetchDashboard} variant="outline" size="icon" title="Tải lại dữ liệu">
              <RefreshCw size={16}/>
           </Button>
           <Button 
             onClick={handleGetAiAdvice} 
             disabled={isAiLoading} 
             size="sm" 
             className="bg-stone-900 text-white hover:bg-amber-600 font-bold transition-all shadow-lg"
           >
              {isAiLoading ? (
                <><Loader2 className="animate-spin mr-2 h-4 w-4"/> Đang suy nghĩ...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4 text-yellow-400" /> Xin lời khuyên AI</>
              )}
           </Button>
        </div>
      </div>

      {/* 2. KPI CARDS (CHỈ SỐ CHÍNH) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <KpiCard 
            title="Điểm trung bình" 
            value={data?.stats?.avgScore || "0.0"} 
            sub="/ 10.0" 
            icon={Target} 
            color="text-emerald-600" 
         />
         <KpiCard 
            title="Giờ học tập" 
            value={data?.stats?.studyHours || "0"} 
            sub="giờ" 
            icon={Clock} 
            color="text-blue-600" 
         />
         <KpiCard 
            title="Số bài đã thi" 
            value={data?.stats?.totalExams || "0"} 
            sub="đề" 
            icon={BarChart3} 
            color="text-purple-600" 
         />
         <KpiCard 
            title="Tỉ lệ đỗ dự báo" 
            value={`${Math.round(data?.prediction?.passProbability || 0)}%`} 
            sub="" 
            icon={BrainCircuit} 
            color="text-amber-600" 
            bg="bg-amber-50 dark:bg-amber-900/20"
         />
      </div>

      {/* 3. CHARTS SECTION (TRÁI TIM CỦA DASHBOARD) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
         
         {/* Cột Trái: Biểu đồ xu hướng + AI Box (Chiếm 2/3) */}
         <div className="lg:col-span-2 space-y-6">
            
            {/* AI Analysis Box */}
            <Card className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white border-0 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-1000"></div>
                <CardHeader>
                   <CardTitle className="flex items-center gap-2 relative z-10">
                      <BrainCircuit className="text-amber-300" /> AI Nhận định hành vi
                   </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                   <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-inner">
                      <p className="text-sm font-medium leading-relaxed opacity-95 min-h-[40px] flex items-center">
                         {isAiLoading ? "Đang kết nối với Cohere AI để phân tích dữ liệu của bạn..." : `"${aiAdvice}"`}
                      </p>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="bg-black/20 p-3 rounded-lg">
                         <p className="text-[10px] text-stone-300 uppercase font-bold tracking-wider">Điểm yếu nhất</p>
                         <p className="font-bold text-rose-300 mt-1">Reading - Task 2</p>
                      </div>
                      <div className="bg-black/20 p-3 rounded-lg">
                         <p className="text-[10px] text-stone-300 uppercase font-bold tracking-wider">Tốc độ làm bài</p>
                         <p className="font-bold text-emerald-300 mt-1">Ổn định</p>
                      </div>
                   </div>
                </CardContent>
            </Card>

            <Card className="border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
                <CardHeader>
                   <CardTitle className="flex items-center gap-2 text-stone-800 dark:text-stone-100">
                      <Activity className="text-rose-500" /> Biểu đồ phong độ
                   </CardTitle>
                   <CardDescription>Biến động điểm số qua các bài thi gần nhất.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                   {data?.scoreTrend?.length > 0 ? (
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={data.scoreTrend}>
                             <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                             <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                             <YAxis axisLine={false} tickLine={false} domain={[0, 10]} />
                             <Tooltip 
                                contentStyle={{backgroundColor: '#fff', borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                                itemStyle={{color: '#333', fontWeight: 'bold'}}
                             />
                             <Area 
                                type="monotone" 
                                dataKey="score" 
                                stroke="#d97706" 
                                strokeWidth={3} 
                                fillOpacity={1} 
                                fill="url(#colorScore)" 
                             />
                          </AreaChart>
                       </ResponsiveContainer>
                   ) : (
                       <div className="h-full flex flex-col items-center justify-center text-stone-400 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                           <BarChart3 size={40} className="mb-2 opacity-50"/>
                           <p>Chưa có dữ liệu bài thi để vẽ biểu đồ</p>
                       </div>
                   )}
                </CardContent>
            </Card>
         </div>

         {/* Cột Phải: Radar Chart & Tasks */}
         <div className="space-y-6">
            <Card className="border-stone-200 dark:border-stone-800 shadow-sm">
                <CardHeader>
                   <CardTitle className="flex items-center gap-2 text-stone-800 dark:text-stone-100">
                      <Radar className="text-blue-500" /> Bản đồ năng lực
                   </CardTitle>
                   <CardDescription>Điểm mạnh & yếu.</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] flex items-center justify-center">
                   <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data?.skillRadar || []}>
                         <PolarGrid stroke="#e5e5e5" />
                         <PolarAngleAxis dataKey="subject" tick={{fontSize: 11, fill: '#78716c'}} />
                         <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                         <RechartRadar
                            name="Kỹ năng"
                            dataKey="A"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="#3b82f6"
                            fillOpacity={0.4}
                         />
                         <Tooltip />
                      </RadarChart>
                   </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="border-stone-200 dark:border-stone-800 shadow-sm flex-1">
                <CardHeader>
                   <CardTitle className="flex items-center gap-2 text-stone-800 dark:text-stone-100">
                      <Zap className="text-yellow-500" /> Nhiệm vụ hôm nay
                   </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                   {data?.tasks?.map((task: any) => (
                      <div 
                         key={task.id} 
                         onClick={() => handleToggleTask(task.id, task.isCompleted)}
                         className={cn(
                            "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer hover:shadow-md", 
                            task.isCompleted ? "bg-emerald-50 border-emerald-200" : "bg-white border-stone-100 hover:border-amber-400"
                         )}
                      >
                         <div className="flex items-center gap-3">
                            <div className={cn(
                               "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors", 
                               task.isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-stone-300"
                            )}>
                               {task.isCompleted && <CheckCircle2 size={12} />}
                            </div>
                            <span className={cn("text-sm font-bold", task.isCompleted ? "text-emerald-700 line-through opacity-70" : "text-stone-700")}>
                               {task.title}
                            </span>
                         </div>
                         <Badge variant="secondary" className="bg-white shadow-sm border border-stone-200 text-[10px]">
                            +{task.xp} XP
                         </Badge>
                      </div>
                   ))}
                   <Button variant="outline" className="w-full text-xs h-9 border-dashed border-stone-300 text-stone-500 hover:text-stone-700">
                      Tải thêm nhiệm vụ...
                   </Button>
                </CardContent>
            </Card>
         </div>
      </div>

    </div>
  );
}

// Component phụ: KPI Card
function KpiCard({ title, value, sub, icon: Icon, trend, color, bg }: any) {
   return (
      <Card className={cn("border-stone-200 dark:border-stone-800 shadow-sm relative overflow-hidden", bg)}>
         <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
               <div className={cn("p-2 rounded-lg bg-stone-100 dark:bg-stone-800", color)}>
                  <Icon size={20} />
               </div>
               {trend && (
                  <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full", trend.includes("-") ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600")}>
                     {trend}
                  </span>
               )}
            </div>
            <div>
               <p className="text-sm font-medium text-stone-500 dark:text-stone-400">{title}</p>
               <h3 className="text-3xl font-black text-stone-800 dark:text-stone-100 mt-1">
                  {value} <span className="text-sm text-stone-400 font-medium">{sub}</span>
               </h3>
            </div>
         </CardContent>
      </Card>
   )
}