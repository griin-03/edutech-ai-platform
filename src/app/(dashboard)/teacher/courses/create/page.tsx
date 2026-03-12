"use client";

import { useState } from "react";
import { createCourse, generateExamQuestionsAI } from "./actions"; 
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner"; 
import { Loader2, Sparkles, FileText, ArrowRight, Bot, Crown, Unlock, X } from "lucide-react";
import Link from "next/link";

export default function CreateExamPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState(""); 
  const [tier, setTier] = useState("FREE"); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !topic.trim()) return toast.error("Vui lòng nhập Tên và Yêu cầu AI!");
    
    setIsLoading(true);
    toast.info("Đang khởi tạo khung đề thi...");

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
    toast.info("🤖 AI đang biên soạn câu hỏi. Vui lòng đợi...");

    const aiQuestions = await generateExamQuestionsAI(title, topic);
    
    if (aiQuestions && aiQuestions.length > 0) {
       localStorage.setItem(`ai_draft_questions_${courseId}`, JSON.stringify(aiQuestions));
       toast.success("🎉 AI đã tạo xong! Chuyển sang giao diện Sửa Đề.");
    } else {
       toast.error("AI không thể tạo đề. Bạn có thể tự thêm thủ công.");
       localStorage.setItem(`ai_draft_questions_${courseId}`, JSON.stringify([])); 
    }

    setTimeout(() => {
      router.push(`/teacher/courses/${courseId}`); 
    }, 1500); 
  };

  return (
    // Xóa min-h-screen, dùng max-w để form tự căn chỉnh gọn gàng bên trong Dashboard
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      
      {/* THẺ NẰM NGANG (HORIZONTAL CARD) */}
      <Card className="flex flex-col lg:flex-row w-full shadow-2xl shadow-amber-900/5 dark:shadow-none border border-stone-200/60 dark:border-stone-800 overflow-hidden rounded-[2rem] bg-white dark:bg-stone-900/90 transition-all">
        
        {/* ========================================== */}
        {/* NỬA BÊN TRÁI: THÔNG TIN & HIỆU ỨNG */}
        {/* ========================================== */}
        <div className="lg:w-2/5 p-8 md:p-12 relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50/30 dark:from-stone-900 dark:to-stone-800 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-stone-200/60 dark:border-stone-700/50">
          
          {/* Hiệu ứng Glow nền */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-200/50 dark:bg-amber-900/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 -right-10 w-40 h-40 bg-orange-200/50 dark:bg-orange-900/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <div className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mb-8 text-amber-600 dark:text-amber-400 shadow-sm border border-stone-200/50 dark:border-stone-700">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight leading-tight mb-4">
              Tạo Đề Thi Bằng <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500">AI</span>
            </h1>
            <p className="text-stone-500 dark:text-stone-400 text-base leading-relaxed">
              Trợ lý AI sẽ tự động phân tích yêu cầu chuyên môn của bạn để thiết kế một bản nháp đề thi hoàn chỉnh. Bạn có thể kiểm duyệt và chỉnh sửa lại trước khi xuất bản.
            </p>
          </div>
        </div>

        {/* ========================================== */}
        {/* NỬA BÊN PHẢI: FORM NHẬP LIỆU */}
        {/* ========================================== */}
        <div className="lg:w-3/5 p-8 md:p-12 bg-white dark:bg-stone-900/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* INPUT TÊN ĐỀ (Đã thu gọn kích thước) */}
            <div className="space-y-2.5 group">
              <Label className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">Tên bộ đề thi</Label>
              <div className="relative transition-all duration-300 group-focus-within:shadow-md group-focus-within:shadow-amber-500/5 rounded-xl">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5 transition-colors group-focus-within:text-amber-500" />
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="VD: Đề thi thử THPT Quốc gia môn Toán..." 
                  className="pl-12 h-14 text-base bg-stone-50 dark:bg-stone-950/50 border-stone-200 dark:border-stone-800 rounded-xl focus-visible:ring-2 focus-visible:ring-amber-500/30 focus-visible:border-amber-500 transition-all dark:text-stone-100" 
                />
              </div>
            </div>

            {/* TEXTAREA YÊU CẦU AI */}
            <div className="space-y-2.5 group">
              <Label className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider flex items-center gap-2">
                <Bot className="w-4 h-4 text-amber-500"/> Yêu cầu độ khó
              </Label>
              <div className="transition-all duration-300 group-focus-within:shadow-md group-focus-within:shadow-amber-500/5 rounded-xl">
                <Textarea 
                  value={topic} 
                  onChange={(e) => setTopic(e.target.value)} 
                  placeholder="VD: Tạo 5 câu trắc nghiệm, 2 câu tự luận ở mức độ vận dụng cao..." 
                  className="min-h-[110px] p-4 text-base bg-stone-50 dark:bg-stone-950/50 border-stone-200 dark:border-stone-800 rounded-xl focus-visible:ring-2 focus-visible:ring-amber-500/30 focus-visible:border-amber-500 transition-all dark:text-stone-100 resize-none" 
                />
              </div>
            </div>

            {/* THANH CHỌN QUYỀN (Thu gọn chiều cao) */}
            <div className="space-y-2.5">
               <Label className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">Phân quyền</Label>
               <div className="flex w-full items-center p-1.5 bg-stone-100 dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800 relative">
                  <button 
                    type="button" 
                    onClick={() => setTier("FREE")} 
                    className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-lg text-sm font-bold transition-all duration-300 z-10 ${tier === "FREE" ? "text-amber-700 dark:text-amber-400 bg-white dark:bg-stone-800 shadow-sm border border-stone-200/50 dark:border-stone-700" : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-300"}`}
                  >
                    <Unlock className={`w-4 h-4 ${tier === "FREE" ? "text-amber-500" : ""}`} /> Miễn phí
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setTier("PRO")} 
                    className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-lg text-sm font-bold transition-all duration-300 z-10 ${tier === "PRO" ? "text-orange-600 dark:text-orange-400 bg-white dark:bg-stone-800 shadow-sm border border-stone-200/50 dark:border-stone-700" : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-300"}`}
                  >
                    <Crown className={`w-4 h-4 ${tier === "PRO" ? "text-orange-500" : ""}`} /> Gói PRO
                  </button>
               </div>
            </div>

            {/* NÚT SUBMIT */}
            <div className="flex gap-3 pt-4">
              <Link href="/teacher/courses" className="w-[120px]">
                <Button type="button" variant="outline" className="w-full h-14 text-sm rounded-xl border-stone-200 dark:border-stone-700 bg-transparent text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold transition-all">
                    <X className="w-4 h-4 mr-1.5" /> Hủy
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={!title.trim() || !topic.trim() || isLoading} 
                className="flex-1 h-14 text-base rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-bold shadow-lg shadow-orange-500/25 border-none transition-all duration-300 hover:shadow-orange-500/40"
              >
                {isLoading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang xử lý...</> : <>Khởi Tạo Đề Thi <ArrowRight className="w-5 h-5 ml-2" /></>}
              </Button>
            </div>

          </form>
        </div>

      </Card>
    </div>
  );
}