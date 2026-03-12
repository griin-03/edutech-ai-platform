"use client";

import React, { useState, useEffect, use } from "react";
import { applyAiQuestions, generateExamQuestionsAI, getQuestionsByCourseId } from "../create/actions"; 
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Send, Trash2, CheckCircle2, RotateCcw, Plus, PartyPopper, ListChecks, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// 🔥 Nhúng thư viện LaTeX để render Toán học cơ bản
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

// =======================================================================
// 🔥 COMPONENT RENDER TOÁN HỌC TỐI THƯỢNG (HỖ TRỢ TIKZ)
// =======================================================================
const MathPreview = ({ content }: { content: string }) => {
  if (!content) return null;
  
  // Sửa lỗi replace cú pháp LaTeX đôi khi bị AI gõ nhầm
  const cleanContent = content.replace(/\/frac/g, "\\frac");

  // Regex thông minh để bóc tách riêng khối mã vẽ hình TikZ
  const tikzRegex = /(\\begin{tikzpicture}[\s\S]*?\\end{tikzpicture})/g;
  const parts = cleanContent.split(tikzRegex);

  return (
    <div className="w-full overflow-x-auto text-lg font-medium text-slate-800 dark:text-slate-200">
      {parts.map((part, index) => {
        // Nếu là đoạn mã vẽ hình -> Gói vào thẻ script cho TikZJax xử lý
        if (part.startsWith("\\begin{tikzpicture}")) {
          return (
            <div key={index} className="my-4 flex justify-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <script type="text/tikz" dangerouslySetInnerHTML={{ __html: part }} />
            </div>
          );
        }
        // Nếu là văn bản thường hoặc công thức đại số -> Dùng thẻ Latex
        return <Latex key={index}>{part}</Latex>;
      })}
    </div>
  );
};

export default function ExamEditorPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);
  
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  useEffect(() => {
    async function loadQuestions() {
      setIsLoadingDraft(true);
      
      const draftData = localStorage.getItem(`ai_draft_questions_${courseId}`);
      if (draftData) {
          try { 
              setQuestions(JSON.parse(draftData)); 
              setIsLoadingDraft(false); 
              return; 
          } catch (e) { console.error("Lỗi đọc nháp"); }
      }

      try {
          const dbQuestions = await getQuestionsByCourseId(Number(courseId));
          if (dbQuestions && dbQuestions.length > 0) {
              setQuestions(dbQuestions);
          } else {
              setQuestions([]);
          }
      } catch (error) {
          toast.error("Không thể tải câu hỏi từ cơ sở dữ liệu.");
      } finally {
          setIsLoadingDraft(false);
      }
    }

    loadQuestions();
  }, [courseId]);

  const updateQuestionText = (index: number, text: string) => { const newQs = [...questions]; newQs[index].text = text; setQuestions(newQs); };
  const updateOptionText = (qIndex: number, optIndex: number, text: string) => { const newQs = [...questions]; newQs[qIndex].options[optIndex] = text; setQuestions(newQs); };
  const setCorrectOption = (qIndex: number, optIndex: number) => { const newQs = [...questions]; newQs[qIndex].correct = optIndex; setQuestions(newQs); };
  const updateShortAnswers = (qIndex: number, text: string) => { const newQs = [...questions]; newQs[qIndex].correctAnswers = text.split(",").map((s: string) => s.trim()); setQuestions(newQs); };
  
  const removeQuestion = (index: number) => { 
      if(confirm("Xóa câu này?")) { const newQs = [...questions]; newQs.splice(index, 1); setQuestions(newQs); } 
  };
  
  const addQuestion = (type: "MULTIPLE_CHOICE" | "SHORT_ANSWER") => {
    const newQs = [...questions];
    if (type === "MULTIPLE_CHOICE") newQs.push({ type, text: "Câu trắc nghiệm (Gõ công thức vào trong ký hiệu $...$)", options: ["A", "B", "C", "D"], correct: 0 });
    else newQs.push({ type, text: "Câu tự luận (Gõ công thức vào trong ký hiệu $...$)", correctAnswers: ["đáp án"] });
    setQuestions(newQs);
  };

  const handleCancel = () => {
      if(confirm("Bạn có chắc chắn muốn hủy bài? Nếu là đề đang sửa, những thay đổi hiện tại sẽ không được lưu.")) {
          localStorage.removeItem(`ai_draft_questions_${courseId}`);
          router.push("/teacher/courses");
      }
  };

  const handleRegenerate = async () => {
    const topic = prompt("Nhập yêu cầu để AI tạo lại:");
    if(!topic) return;
    setIsRegenerating(true);
    toast.info("AI đang xử lý lại...");
    try {
        const newQs = await generateExamQuestionsAI("Đề Thi", topic);
        if (newQs.length > 0) {
            setQuestions(newQs);
            localStorage.setItem(`ai_draft_questions_${courseId}`, JSON.stringify(newQs));
            toast.success("Đã nạp bộ đề mới!");
        } else toast.error("AI lỗi. Hãy tạo thủ công.");
    } catch(e) { toast.error("Lỗi mạng."); }
    finally { setIsRegenerating(false); }
  };

  const handleSaveToDB = async () => {
    if (questions.length === 0) return toast.error("Chưa có câu hỏi!");
    setIsSaving(true);
    try {
      const res = await applyAiQuestions(Number(courseId), questions);
      if (res.success) {
        toast.success(res.message);
        localStorage.removeItem(`ai_draft_questions_${courseId}`); 
        setIsSubmittedSuccess(true);
      } else toast.error(res.message);
    } catch (e) { toast.error("Lỗi khi lưu"); } 
    finally { setIsSaving(false); }
  };

  if (isLoadingDraft) return <div className="p-20 flex flex-col items-center justify-center text-slate-500"><Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" /> Đang tải dữ liệu câu hỏi...</div>;

  if (isSubmittedSuccess) {
      return (
          <div className="max-w-3xl mx-auto p-6 flex flex-col items-center justify-center min-h-[70vh] animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
                  <PartyPopper className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-4 text-center">Gửi Duyệt Thành Công!</h2>
              <p className="text-slate-500 dark:text-slate-400 text-center text-lg mb-8 max-w-md">
                  Bộ đề của bạn đã được gửi lên hệ thống và đang chờ Admin phê duyệt. Bạn muốn làm gì tiếp theo?
              </p>
              <div className="flex gap-4">
                  <Link href="/teacher/courses">
                      <Button variant="outline" className="h-14 px-8 text-base font-bold rounded-2xl border-slate-200 dark:border-slate-800 dark:text-slate-300">
                          <ListChecks className="w-5 h-5 mr-2" /> Về Danh Sách
                      </Button>
                  </Link>
                  <Link href="/teacher/courses/create">
                      <Button className="h-14 px-8 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-600/20">
                          <Plus className="w-5 h-5 mr-2" /> Tạo Bộ Đề Khác
                      </Button>
                  </Link>
              </div>
          </div>
      )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-6 animate-in fade-in duration-500 font-sans dark:bg-slate-950 min-h-screen">
      <Link href="/teacher/courses" className="flex items-center text-slate-500 hover:text-blue-600 font-medium w-fit transition-colors">
        <ArrowLeft size={18} className="mr-2" /> Thoát và Quay lại danh sách
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 gap-4 sticky top-4 z-40">
        <div className="flex items-center gap-4">
            <span className="bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 text-xs font-bold px-4 py-1.5 rounded-full animate-pulse">CHỈNH SỬA ĐỀ</span>
            <h2 className="font-bold text-lg text-slate-800 dark:text-white">Kiểm duyệt Nội dung</h2>
        </div>
        <div className="flex flex-wrap gap-3">
            <Button onClick={handleCancel} variant="outline" className="font-bold border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent rounded-xl">
                <XCircle className="w-4 h-4 mr-2"/> Hủy Bỏ
            </Button>
            <Button onClick={handleRegenerate} disabled={isRegenerating} variant="outline" className="font-bold border-slate-200 dark:border-slate-700 bg-transparent dark:text-slate-300 rounded-xl">
                {isRegenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <RotateCcw className="w-4 h-4 mr-2"/>} Sinh Lại Bằng AI
            </Button>
            <Button onClick={handleSaveToDB} disabled={isSaving || questions.length === 0} className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-emerald-600/20 shadow-lg">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Send className="w-4 h-4 mr-2"/>} Chốt & Gửi Duyệt Lại
            </Button>
        </div>
      </div>

      <div className="space-y-6">
        {questions.length === 0 && <div className="text-center p-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500">Không có câu hỏi nào trong đề thi này. Hãy thêm mới nhé!</div>}
        
        {questions.map((q: any, qIdx: number) => (
            <Card key={qIdx} className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm relative group overflow-hidden">
                <button onClick={() => removeQuestion(qIdx)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors z-10"><Trash2 className="w-5 h-5" /></button>
                <CardContent className="p-6 md:p-8">
                    <div className="flex gap-4 mb-6 pr-10">
                        <span className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl">{qIdx + 1}</span>
                        
                        <div className="w-full">
                            <span className="text-xs font-bold text-slate-400 uppercase mb-2 block">{q.type === "MULTIPLE_CHOICE" ? "Câu Trắc Nghiệm" : "Câu Tự Luận"}</span>
                            
                            {/* 🔥 SỬ DỤNG MATH_PREVIEW ĐỂ RENDER CHUẨN XÁC CẢ ĐẠI SỐ VÀ HÌNH HỌC */}
                            <div className="mb-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 min-h-[3rem]">
                                <MathPreview content={q.text} />
                            </div>

                            <Input 
                                value={q.text} 
                                onChange={(e) => updateQuestionText(qIdx, e.target.value)} 
                                className="text-base font-normal border-slate-200 dark:border-slate-700 bg-transparent dark:text-slate-400 h-12 rounded-xl" 
                                placeholder="Gõ câu hỏi (Bao quanh công thức bằng ký hiệu $...$, mã TikZ bằng \begin{tikzpicture}...\end{tikzpicture})"
                            />
                        </div>
                    </div>

                    <div className="pl-16">
                        {q.type === "MULTIPLE_CHOICE" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {q.options?.map((opt: string, optIdx: number) => (
                                    <div key={optIdx} className={`flex flex-col gap-2 p-3 rounded-xl border-2 transition-all ${q.correct === optIdx ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'}`}>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setCorrectOption(qIdx, optIdx)} className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border-2 transition-colors ${q.correct === optIdx ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-transparent border-slate-300 dark:border-slate-600 text-slate-400'}`}>
                                                <CheckCircle2 className="w-5 h-5" />
                                            </button>
                                            
                                            {/* 🔥 SỬ DỤNG MATH_PREVIEW CHO TỪNG ĐÁP ÁN */}
                                            <div className="w-full">
                                                <MathPreview content={opt} />
                                            </div>
                                        </div>

                                        <Input 
                                            value={opt} 
                                            onChange={(e) => updateOptionText(qIdx, optIdx, e.target.value)} 
                                            className="h-10 border-slate-200 dark:border-slate-700 bg-transparent shadow-none dark:text-slate-400 text-sm mt-1" 
                                            placeholder="Gõ đáp án..." 
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                        {q.type === "SHORT_ANSWER" && (
                            <div className="bg-amber-50 dark:bg-amber-500/10 p-5 rounded-2xl border border-amber-200 dark:border-amber-500/30">
                                <label className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-3 block">Đáp án đúng (ngăn cách bởi dấu phẩy):</label>
                                <Input value={q.correctAnswers?.join(", ") || ""} onChange={(e) => updateShortAnswers(qIdx, e.target.value)} className="h-12 border-amber-300 dark:border-amber-500/50 bg-white dark:bg-slate-900 font-medium" placeholder="VD: 5, năm, nam" />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        ))}

        <div className="flex justify-center gap-4 pt-4">
            <Button onClick={() => addQuestion("MULTIPLE_CHOICE")} variant="outline" className="h-12 border-dashed border-2 dark:border-slate-700 bg-transparent dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-bold rounded-xl"><Plus className="w-5 h-5 mr-2" /> Thêm Trắc Nghiệm</Button>
            <Button onClick={() => addQuestion("SHORT_ANSWER")} variant="outline" className="h-12 border-dashed border-2 dark:border-slate-700 bg-transparent dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-bold rounded-xl"><Plus className="w-5 h-5 mr-2" /> Thêm Tự Luận</Button>
        </div>
      </div>
    </div>
  );
}