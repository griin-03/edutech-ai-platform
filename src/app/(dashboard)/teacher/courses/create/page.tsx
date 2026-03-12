"use client";

import { useState, useRef } from "react";
import { createCourse, generateExamQuestionsAI } from "./actions"; 
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner"; 
import { Loader2, Sparkles, FileText, ArrowRight, Bot, Crown, Unlock, X, AlertTriangle, Info, BookOpen, Calculator, LineChart, Target, RefreshCcw } from "lucide-react";
import Link from "next/link";

// =======================================================================
// 📚 THƯ VIỆN PROMPT ĐƠN GIẢN - CHỈ 5 CÂU TRẮC NGHIỆM
// =======================================================================
const PROMPT_LIBRARY = [
  { category: "Giải Tích 12", icon: <LineChart className="w-4 h-4"/>, title: "Khảo sát hàm số", topic: "Tạo 5 câu trắc nghiệm về tính đồng biến, nghịch biến của hàm số bậc 3. Mỗi câu có 4 đáp án A,B,C,D." },
  { category: "Giải Tích 12", icon: <Calculator className="w-4 h-4"/>, title: "Tích phân cơ bản", topic: "Tạo 5 câu trắc nghiệm tính tích phân đơn giản. Mỗi câu có 4 đáp án A,B,C,D." },
  { category: "Giải Tích 12", icon: <Calculator className="w-4 h-4"/>, title: "Logarit cơ bản", topic: "Tạo 5 câu trắc nghiệm giải phương trình logarit đơn giản. Mỗi câu có 4 đáp án." },
  { category: "Giải Tích 12", icon: <Calculator className="w-4 h-4"/>, title: "Số phức cơ bản", topic: "Tạo 5 câu trắc nghiệm tìm phần thực, phần ảo của số phức. Mỗi câu có 4 đáp án." },
  { category: "Hình Học 12", icon: <Target className="w-4 h-4"/>, title: "Thể tích khối chóp", topic: "Tạo 5 câu trắc nghiệm tính thể tích khối chóp đều. Mỗi câu có 4 đáp án A,B,C,D." },
  { category: "Hình Học 12", icon: <Target className="w-4 h-4"/>, title: "Mặt cầu - Mặt trụ", topic: "Tạo 5 câu trắc nghiệm tính diện tích, thể tích mặt cầu và hình trụ. Mỗi câu 4 đáp án." },
  { category: "Hình Học 12", icon: <Target className="w-4 h-4"/>, title: "Oxyz - Mặt phẳng", topic: "Tạo 5 câu trắc nghiệm viết phương trình mặt phẳng trong không gian. Mỗi câu 4 đáp án." },
  { category: "Đại Số 11", icon: <Calculator className="w-4 h-4"/>, title: "Tổ hợp cơ bản", topic: "Tạo 5 câu trắc nghiệm tính số hoán vị, chỉnh hợp, tổ hợp. Mỗi câu 4 đáp án." },
  { category: "Đại Số 11", icon: <Calculator className="w-4 h-4"/>, title: "Xác suất cơ bản", topic: "Tạo 5 câu trắc nghiệm tính xác suất của biến cố. Mỗi câu 4 đáp án." },
  { category: "Đại Số 11", icon: <Calculator className="w-4 h-4"/>, title: "Cấp số cộng", topic: "Tạo 5 câu trắc nghiệm tìm số hạng và tổng cấp số cộng. Mỗi câu 4 đáp án." },
  { category: "Đại Số 11", icon: <Calculator className="w-4 h-4"/>, title: "Cấp số nhân", topic: "Tạo 5 câu trắc nghiệm tìm số hạng và tổng cấp số nhân. Mỗi câu 4 đáp án." },
  { category: "Giải Tích 11", icon: <LineChart className="w-4 h-4"/>, title: "Giới hạn dãy số", topic: "Tạo 5 câu trắc nghiệm tính giới hạn của dãy số. Mỗi câu 4 đáp án." },
  { category: "Giải Tích 11", icon: <LineChart className="w-4 h-4"/>, title: "Giới hạn hàm số", topic: "Tạo 5 câu trắc nghiệm tính giới hạn của hàm số. Mỗi câu 4 đáp án." },
  { category: "Giải Tích 11", icon: <LineChart className="w-4 h-4"/>, title: "Đạo hàm cơ bản", topic: "Tạo 5 câu trắc nghiệm tính đạo hàm hàm số đa thức. Mỗi câu 4 đáp án." },
  { category: "Đại Số 10", icon: <Calculator className="w-4 h-4"/>, title: "Hàm số bậc 2", topic: "Tạo 5 câu trắc nghiệm tìm đỉnh và giá trị lớn nhất của parabol. Mỗi câu 4 đáp án." },
  { category: "Hình Học 10", icon: <Target className="w-4 h-4"/>, title: "Vectơ cơ bản", topic: "Tạo 5 câu trắc nghiệm về phép cộng, trừ vectơ. Mỗi câu 4 đáp án." },
  { category: "Hình Học 10", icon: <Target className="w-4 h-4"/>, title: "Tọa độ mặt phẳng", topic: "Tạo 5 câu trắc nghiệm tính tọa độ điểm và vectơ trong Oxy. Mỗi câu 4 đáp án." },
  { category: "THPT Quốc Gia", icon: <BookOpen className="w-4 h-4"/>, title: "Ôn tập Logarit", topic: "Tạo 5 câu trắc nghiệm ôn tập logarit mức độ cơ bản. Mỗi câu 4 đáp án." },
  { category: "THPT Quốc Gia", icon: <BookOpen className="w-4 h-4"/>, title: "Ôn tập Tích phân", topic: "Tạo 5 câu trắc nghiệm ôn tập tích phân cơ bản. Mỗi câu 4 đáp án." },
  { category: "THPT Quốc Gia", icon: <BookOpen className="w-4 h-4"/>, title: "Ôn tập Số phức", topic: "Tạo 5 câu trắc nghiệm ôn tập số phức cơ bản. Mỗi câu 4 đáp án." },
];

export default function CreateExamPage() {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState(""); 
  const [tier, setTier] = useState("FREE"); 
  
  // 🔥 TÍNH NĂNG BÁO LỖI
  const [giantError, setGiantError] = useState<string | null>(null);

  const handleSelectPrompt = (pTitle: string, pTopic: string) => {
    setTitle(pTitle);
    setTopic(pTopic);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    toast.success("Đã nạp Prompt!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGiantError(null); 
    
    if (!title.trim() || !topic.trim()) return toast.error("Vui lòng nhập Tên và Yêu cầu AI!");
    
    // Kiểm tra số lượng câu trong prompt
    if (topic.includes("10 câu") || topic.includes("8 câu") || topic.includes("7 câu")) {
      setGiantError(
        "❌ LỖI: Bạn đang yêu cầu quá nhiều câu hỏi!\n\n" +
        "AI chỉ có thể tạo TỐI ĐA 5 CÂU mỗi lần.\n\n" +
        "👉 Hãy sửa lại yêu cầu: thay '10 câu' thành '5 câu'"
      );
      return;
    }

    // Đếm số chữ số trong topic để ước lượng
    const numberMatch = topic.match(/\d+/g);
    if (numberMatch) {
      const maxNumber = Math.max(...numberMatch.map(Number));
      if (maxNumber > 5) {
        setGiantError(
          `❌ LỖI: Phát hiện yêu cầu ${maxNumber} câu hỏi!\n\n` +
          `AI chỉ có thể tạo TỐI ĐA 5 CÂU mỗi lần.\n\n` +
          `👉 Hãy sửa lại yêu cầu thành "5 câu"`
        );
        return;
      }
    }
    
    setIsLoading(true);
    toast.info("Đang tạo đề thi...");

    // 1. Tạo khóa học
    const formData = new FormData();
    formData.append("title", title);
    formData.append("tier", tier); 

    const res = await createCourse(formData);
    if (!res.success) {
      toast.error(res.message); 
      setIsLoading(false);
      return;
    }

    const courseId = res.courseId;
    toast.info("🤖 AI đang tạo 5 câu hỏi...");

    // 2. Gọi AI tạo câu hỏi
    const aiQuestions = await generateExamQuestionsAI(title, topic);
    
    if (aiQuestions && aiQuestions.length > 0) {
       localStorage.setItem(`ai_draft_questions_${courseId}`, JSON.stringify(aiQuestions));
       toast.success("🎉 Tạo đề thành công!");
       
       setTimeout(() => {
         router.push(`/teacher/courses/${courseId}`); 
       }, 1500); 
    } else {
       setIsLoading(false);
       setGiantError(
         "❌ AI KHÔNG THỂ TẠO ĐỀ!\n\n" +
         "Nguyên nhân: AI bị quá tải vì yêu cầu quá phức tạp.\n\n" +
         "👉 CÁCH SỬA:\n" +
         "1. Chỉ yêu cầu 5 CÂU TRẮC NGHIỆM\n" +
         "2. Nội dung ĐƠN GIẢN, dễ hiểu\n" +
         "3. Không yêu cầu vẽ hình hay công thức phức tạp\n\n" +
         "Ví dụ: 'Tạo 5 câu trắc nghiệm về hàm số bậc 3'"
       );
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-500 space-y-8">
      
      {/* FORM CHÍNH */}
      <Card ref={formRef} className="flex flex-col lg:flex-row w-full shadow-2xl shadow-blue-900/5 dark:shadow-none border border-slate-200/60 dark:border-slate-800 overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900/90 transition-all">
        
        {/* BÊN TRÁI */}
        <div className="lg:w-2/5 p-8 md:p-12 relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50/30 dark:from-slate-900 dark:to-slate-800 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-200/60 dark:border-slate-700/50">
          <div className="relative z-10">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-700">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight mb-4">
              AI Tạo Đề <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Đơn Giản</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed mb-6">
              Tạo 5 câu trắc nghiệm nhanh chóng. AI chỉ xử lý được số lượng nhỏ, hãy tạo nhiều lần nếu cần nhiều câu.
            </p>
            
            {/* Hộp hướng dẫn */}
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50">
               <h3 className="text-sm font-extrabold text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5" /> QUAN TRỌNG
               </h3>
               <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1.5 font-medium ml-1">
                 <li>• ✅ CHỈ TẠO 5 CÂU MỖI LẦN</li>
                 <li>• ✅ Nội dung đơn giản, dễ hiểu</li>
                 <li>• ❌ Không yêu cầu vẽ hình</li>
               </ul>
            </div>
          </div>
        </div>

        {/* BÊN PHẢI - FORM */}
        <div className="lg:w-3/5 p-8 md:p-12 bg-white dark:bg-slate-900/50 relative">
          
          {/* MÀN HÌNH BÁO LỖI */}
          {giantError && (
             <div className="absolute inset-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-6">
                   <X className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-4">Tạo Đề Thất Bại!</h2>
                <p className="text-slate-600 dark:text-slate-300 text-base whitespace-pre-line mb-8 leading-relaxed font-medium bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/50">
                  {giantError}
                </p>
                <Button onClick={() => setGiantError(null)} className="h-14 px-8 text-lg font-bold bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl shadow-xl">
                  <RefreshCcw className="w-5 h-5 mr-2" /> Sửa lại yêu cầu
                </Button>
             </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2.5 group">
              <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Tên bộ đề</Label>
              <div className="relative transition-all duration-300 group-focus-within:shadow-md group-focus-within:shadow-blue-500/5 rounded-xl">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-blue-500" />
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="VD: Đề 5 câu Logarit..." 
                  className="pl-12 h-14 text-base font-medium bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all dark:text-slate-100" 
                />
              </div>
            </div>

            <div className="space-y-2.5 group">
              <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2"><Bot className="w-4 h-4 text-blue-500"/> Yêu cầu AI</span>
                <span className="text-[10px] bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-md">CHỈ 5 CÂU</span>
              </Label>
              <div className="transition-all duration-300 group-focus-within:shadow-md group-focus-within:shadow-blue-500/5 rounded-xl">
                <Textarea 
                  value={topic} 
                  onChange={(e) => setTopic(e.target.value)} 
                  placeholder="VD: Tạo 5 câu trắc nghiệm về hàm số bậc 3" 
                  className="min-h-[100px] p-4 text-base font-medium bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all dark:text-slate-100 resize-none leading-relaxed" 
                />
              </div>
            </div>

            <div className="space-y-2.5">
               <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Phân quyền</Label>
               <div className="flex w-full items-center p-1.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 relative">
                  <button type="button" onClick={() => setTier("FREE")} className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-lg text-sm font-bold transition-all duration-300 z-10 ${tier === "FREE" ? "text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-800 shadow-sm border border-slate-200/50 dark:border-slate-700" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}>
                    <Unlock className={`w-4 h-4 ${tier === "FREE" ? "text-blue-500" : ""}`} /> Miễn phí
                  </button>
                  <button type="button" onClick={() => setTier("PRO")} className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-lg text-sm font-bold transition-all duration-300 z-10 ${tier === "PRO" ? "text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 shadow-sm border border-slate-200/50 dark:border-slate-700" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}>
                    <Crown className={`w-4 h-4 ${tier === "PRO" ? "text-indigo-500" : ""}`} /> Gói PRO
                  </button>
               </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Link href="/teacher/courses" className="w-[120px]">
                <Button type="button" variant="outline" className="w-full h-14 text-sm rounded-xl border-slate-200 dark:border-slate-700 bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-all">
                    <X className="w-4 h-4 mr-1.5" /> Hủy
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={!title.trim() || !topic.trim() || isLoading} 
                className="flex-1 h-14 text-base rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/25 border-none transition-all duration-300 hover:shadow-blue-500/40"
              >
                {isLoading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang tạo 5 câu...</> : <>Tạo 5 Câu Hỏi <ArrowRight className="w-5 h-5 ml-2" /></>}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* THƯ VIỆN PROMPT ĐƠN GIẢN */}
      <div className="mt-12">
        <div className="flex items-center gap-3 mb-6">
           <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl text-blue-600 dark:text-blue-400">
             <BookOpen className="w-6 h-6" />
           </div>
           <div>
             <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Thư Viện Prompt 5 Câu</h2>
             <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Bấm vào chủ đề để tự động điền yêu cầu 5 câu</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {PROMPT_LIBRARY.map((prompt, idx) => (
            <div 
              key={idx} 
              onClick={() => handleSelectPrompt(prompt.title, prompt.topic)}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-green-400 dark:hover:border-green-500 hover:shadow-xl hover:shadow-green-500/10 transition-all cursor-pointer group flex flex-col justify-between"
            >
               <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-green-600 bg-green-50 dark:bg-green-500/10 dark:text-green-400 px-2.5 py-1 rounded-lg">
                      {prompt.icon} {prompt.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2 leading-tight group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {prompt.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {prompt.topic}
                  </p>
               </div>
               <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-bold text-slate-400 group-hover:text-green-500 transition-colors">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" /> 5 câu trắc nghiệm
               </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}