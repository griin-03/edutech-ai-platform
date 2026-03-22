"use client";

import { useState, useRef } from "react";
import { createCourse, generateExamQuestionsAI } from "./actions"; 
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner"; 
import { 
  Loader2, Sparkles, FileText, ArrowRight, Bot, Crown, 
  Unlock, X, AlertTriangle, BookOpen, Calculator, 
  LineChart, Target, RefreshCcw, PanelRightOpen, PanelRightClose
} from "lucide-react";
import Link from "next/link";

// =======================================================================
// 📚 THƯ VIỆN PROMPT ĐƠN GIẢN - CHỈ 5 CÂU TRẮC NGHIỆM
// =======================================================================
const PROMPT_LIBRARY = [
  { category: "Giải Tích 12", icon: <LineChart className="w-3.5 h-3.5"/>, title: "Khảo sát hàm số", topic: "Tạo 5 câu trắc nghiệm về tính đồng biến, nghịch biến của hàm số bậc 3. Mỗi câu có 4 đáp án A,B,C,D." },
  { category: "Giải Tích 12", icon: <Calculator className="w-3.5 h-3.5"/>, title: "Tích phân cơ bản", topic: "Tạo 5 câu trắc nghiệm tính tích phân đơn giản. Mỗi câu có 4 đáp án A,B,C,D." },
  { category: "Giải Tích 12", icon: <Calculator className="w-3.5 h-3.5"/>, title: "Logarit cơ bản", topic: "Tạo 5 câu trắc nghiệm giải phương trình logarit đơn giản. Mỗi câu có 4 đáp án." },
  { category: "Giải Tích 12", icon: <Calculator className="w-3.5 h-3.5"/>, title: "Số phức cơ bản", topic: "Tạo 5 câu trắc nghiệm tìm phần thực, phần ảo của số phức. Mỗi câu có 4 đáp án." },
  { category: "Hình Học 12", icon: <Target className="w-3.5 h-3.5"/>, title: "Thể tích khối chóp", topic: "Tạo 5 câu trắc nghiệm tính thể tích khối chóp đều. Mỗi câu có 4 đáp án A,B,C,D." },
  { category: "Hình Học 12", icon: <Target className="w-3.5 h-3.5"/>, title: "Mặt cầu - Mặt trụ", topic: "Tạo 5 câu trắc nghiệm tính diện tích, thể tích mặt cầu và hình trụ. Mỗi câu 4 đáp án." },
  { category: "Đại Số 11", icon: <Calculator className="w-3.5 h-3.5"/>, title: "Tổ hợp & Xác suất", topic: "Tạo 5 câu trắc nghiệm tính số hoán vị, tổ hợp và xác suất cơ bản. Mỗi câu 4 đáp án." },
  { category: "Đại Số 11", icon: <Calculator className="w-3.5 h-3.5"/>, title: "Cấp số cộng, nhân", topic: "Tạo 5 câu trắc nghiệm tìm số hạng và tổng cấp số. Mỗi câu 4 đáp án." },
  { category: "Giải Tích 11", icon: <LineChart className="w-3.5 h-3.5"/>, title: "Giới hạn & Đạo hàm", topic: "Tạo 5 câu trắc nghiệm tính giới hạn và đạo hàm hàm số đa thức. Mỗi câu 4 đáp án." },
  { category: "THPT Quốc Gia", icon: <BookOpen className="w-3.5 h-3.5"/>, title: "Ôn tập Tích phân", topic: "Tạo 5 câu trắc nghiệm ôn tập tích phân mức độ cơ bản kỳ thi THPTQG. Mỗi câu 4 đáp án." },
];

export default function CreateExamPage() {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState(""); 
  const [tier, setTier] = useState("FREE"); 
  
  const [giantError, setGiantError] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false); // Trạng thái đóng/mở thư viện

  const handleSelectPrompt = (pTitle: string, pTopic: string) => {
    setTitle(pTitle);
    setTopic(pTopic);
    toast.success("Đã nạp Mẫu yêu cầu!");
    // Trên mobile, chọn xong tự đóng thư viện cho gọn
    if (window.innerWidth < 1024) setShowLibrary(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGiantError(null); 
    
    if (!title.trim() || !topic.trim()) return toast.error("Vui lòng nhập Tên và Yêu cầu AI!");
    
    // Kiểm tra số lượng câu trong prompt
    if (topic.includes("20 câu") || topic.includes("8 câu") || topic.includes("7 câu")) {
      setGiantError(
        "❌ LỖI: Bạn đang yêu cầu quá nhiều câu hỏi!\n\n" +
        "AI chỉ có thể tạo TỐI ĐA 10 CÂU mỗi lần.\n👉 Hãy sửa lại yêu cầu: thay '20 câu' thành '10 câu'"
      );
      return;
    }

    const numberMatch = topic.match(/\d+/g);
    if (numberMatch) {
      const maxNumber = Math.max(...numberMatch.map(Number));
      if (maxNumber > 10) {
        setGiantError(
          `❌ LỖI: Phát hiện yêu cầu ${maxNumber} câu hỏi!\n\n` +
          `AI chỉ có thể tạo TỐI ĐA 10 CÂU mỗi lần.\n👉 Hãy sửa lại yêu cầu thành "10 câu"`
        );
        return;
      }
    }
    
    setIsLoading(true);
    toast.info("Đang khởi tạo đề thi...");

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
    toast.info("🤖 AI đang suy luận 5 câu hỏi...");

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
         "Nguyên nhân: Yêu cầu quá phức tạp gây ảo giác AI.\n\n" +
         "👉 CÁCH SỬA:\n" +
         "1. Chỉ yêu cầu 5 CÂU TRẮC NGHIỆM\n" +
         "2. Nội dung ĐƠN GIẢN, dễ hiểu\n" +
         "3. Không yêu cầu vẽ hình học không gian"
       );
    }
  };

  return (
    <div className="p-4 md:p-6 mx-auto animate-in fade-in zoom-in-95 duration-500 min-h-[calc(100vh-4rem)] flex flex-col font-sans">
      
      {/* KHUNG CHÍNH (Unified Frame) */}
      <Card ref={formRef} className="flex flex-col lg:flex-row w-full flex-1 shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden rounded-2xl bg-white dark:bg-stone-900 transition-all duration-500 relative">
        
        {/* ========================================== */}
        {/* KHU VỰC TRÁI: FORM TẠO ĐỀ */}
        {/* ========================================== */}
        <div className={`flex flex-col p-6 md:p-8 transition-all duration-500 ease-in-out relative ${showLibrary ? 'lg:w-[50%] xl:w-[45%] border-b lg:border-b-0 lg:border-r border-stone-200 dark:border-stone-800' : 'w-full max-w-3xl mx-auto'}`}>
          
          {/* HEADER FORM */}
          <div className="flex justify-between items-start mb-6">
             <div>
                <h1 className="text-2xl font-black text-stone-800 dark:text-stone-50 tracking-tight flex items-center gap-2">
                   <Sparkles className="w-6 h-6 text-amber-500" /> AI Tạo Đề
                </h1>
                <p className="text-stone-500 dark:text-stone-400 text-sm mt-1 font-medium">Khởi tạo nhanh 5 câu trắc nghiệm tự động.</p>
             </div>
             <Button 
                variant="outline" 
                onClick={() => setShowLibrary(!showLibrary)}
                className={`h-9 px-3 text-xs font-bold rounded-lg transition-colors border-stone-200 dark:border-stone-700 ${showLibrary ? 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300' : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-500 dark:border-amber-500/20 dark:hover:bg-amber-500/20'}`}
             >
                {showLibrary ? <><PanelRightClose className="w-4 h-4 mr-1.5"/> Đóng mẫu</> : <><PanelRightOpen className="w-4 h-4 mr-1.5"/> Xem mẫu AI</>}
             </Button>
          </div>

          {/* CẢNH BÁO NHANH */}
          <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-100 dark:border-amber-800/30 flex items-start gap-2.5 mb-6">
             <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
             <p className="text-xs text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
               Để đảm bảo chất lượng và tránh lỗi, AI hiện chỉ hỗ trợ tạo tối đa <strong className="font-black">5 câu hỏi</strong> mỗi lần. Hãy chia nhỏ nội dung nếu cần tạo đề dài.
             </p>
          </div>

          {/* OVERLAY BÁO LỖI */}
          {giantError && (
             <div className="absolute inset-0 z-50 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-4">
                   <X className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black text-stone-800 dark:text-white mb-2">Đã xảy ra lỗi!</h2>
                <p className="text-stone-600 dark:text-stone-300 text-sm whitespace-pre-line mb-6 leading-relaxed font-medium bg-stone-50 dark:bg-stone-950 p-4 rounded-xl border border-stone-200 dark:border-stone-800 text-left w-full max-w-md">
                  {giantError}
                </p>
                <Button onClick={() => setGiantError(null)} className="h-11 px-6 text-sm font-bold bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white rounded-xl shadow-md">
                  <RefreshCcw className="w-4 h-4 mr-2" /> Điều chỉnh lại yêu cầu
                </Button>
             </div>
          )}

          {/* FORM NHẬP LIỆU */}
          <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
            
            <div className="space-y-2 group">
              <Label className="text-[11px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-wider">Tên Đề thi</Label>
              <div className="relative rounded-xl">
                <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4 transition-colors group-focus-within:text-amber-500" />
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="VD: Kiểm tra 15p Logarit..." 
                  className="pl-10 h-11 text-sm font-semibold bg-stone-50 dark:bg-stone-950/50 border-stone-200 dark:border-stone-800 rounded-xl focus-visible:ring-1 focus-visible:ring-amber-500 focus-visible:border-amber-500 transition-all dark:text-stone-100 shadow-sm" 
                />
              </div>
            </div>

            <div className="space-y-2 group flex-1 flex flex-col">
              <Label className="text-[11px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Bot className="w-3.5 h-3.5 text-amber-500"/> Nội dung AI cần tạo</span>
              </Label>
              <Textarea 
                value={topic} 
                onChange={(e) => setTopic(e.target.value)} 
                placeholder="Mô tả chi tiết nội dung. VD: Tạo 5 câu trắc nghiệm tìm tập xác định của hàm số mũ." 
                className="flex-1 min-h-[140px] p-3.5 text-sm font-medium bg-stone-50 dark:bg-stone-950/50 border-stone-200 dark:border-stone-800 rounded-xl focus-visible:ring-1 focus-visible:ring-amber-500 focus-visible:border-amber-500 transition-all dark:text-stone-100 resize-none leading-relaxed shadow-sm" 
              />
            </div>

            <div className="space-y-2">
               <Label className="text-[11px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-wider">Loại Đề thi (Giá bán)</Label>
               <div className="flex w-full items-center p-1 bg-stone-100 dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800">
                  <button type="button" onClick={() => setTier("FREE")} className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-lg text-xs font-bold transition-all duration-300 ${tier === "FREE" ? "text-emerald-600 dark:text-emerald-400 bg-white dark:bg-stone-800 shadow-sm border border-stone-200/50 dark:border-stone-700" : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-300"}`}>
                    <Unlock className={`w-3.5 h-3.5 ${tier === "FREE" ? "text-emerald-500" : ""}`} /> MIỄN PHÍ • 0đ
                  </button>
                  <button type="button" onClick={() => setTier("PRO")} className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-lg text-xs font-bold transition-all duration-300 ${tier === "PRO" ? "text-white bg-gradient-to-r from-amber-500 to-orange-500 shadow-sm" : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-300"}`}>
                    <Crown className={`w-3.5 h-3.5 ${tier === "PRO" ? "text-white" : ""}`} /> GÓI PRO • 50.000đ
                  </button>
               </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Link href="/teacher/courses" className="w-[100px]">
                <Button type="button" variant="outline" className="w-full h-12 text-sm rounded-xl border-stone-200 dark:border-stone-700 bg-transparent text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold transition-all">
                    Hủy
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={!title.trim() || !topic.trim() || isLoading} 
                className="flex-1 h-12 text-sm rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold shadow-md shadow-amber-600/20 border-none transition-all duration-300"
              >
                {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang xử lý...</> : <>Tiến hành Tạo Đề <ArrowRight className="w-4 h-4 ml-2" /></>}
              </Button>
            </div>
          </form>
        </div>

        {/* ========================================== */}
        {/* KHU VỰC PHẢI: THƯ VIỆN PROMPT (Có thể ẩn/hiện) */}
        {/* ========================================== */}
        <div className={`bg-stone-50/50 dark:bg-stone-950/50 transition-all duration-500 ease-in-out overflow-y-auto custom-scrollbar ${showLibrary ? 'lg:w-[50%] xl:w-[55%] p-6 md:p-8 opacity-100' : 'w-0 p-0 opacity-0 hidden lg:block'}`}>
           <div className="flex items-center gap-3 mb-5">
             <div className="bg-white dark:bg-stone-800 p-2 rounded-lg text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 shadow-sm">
               <BookOpen className="w-5 h-5" />
             </div>
             <div>
               <h2 className="text-lg font-black text-stone-800 dark:text-stone-100">Thư Viện Mẫu AI</h2>
               <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Bấm vào thẻ để tự động điền yêu cầu</p>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4">
             {PROMPT_LIBRARY.map((prompt, idx) => (
               <div 
                 key={idx} 
                 onClick={() => handleSelectPrompt(prompt.title, prompt.topic)}
                 className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
               >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-stone-500 bg-stone-100 dark:bg-stone-800 dark:text-stone-400 px-2 py-0.5 rounded-md">
                      {prompt.icon} {prompt.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-stone-800 dark:text-stone-100 mb-1.5 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors line-clamp-1">
                    {prompt.title}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed flex-1">
                    {prompt.topic}
                  </p>
               </div>
             ))}
           </div>
        </div>
      </Card>
      
      {/* Thêm CSS cho thanh cuộn đẹp hơn */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #d6d3d1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #44403c; }
      `}} />
    </div>
  );
}