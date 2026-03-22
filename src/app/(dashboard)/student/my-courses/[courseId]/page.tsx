"use client";

import { useState, useEffect, useRef, use } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
// 🔥 Bổ sung thêm icon XCircle để làm nút tắt
import { Bot, ArrowLeft, Volume2, Save, RotateCcw, MapPin, ShieldAlert, Lock, AlertTriangle, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import ProctoringCamera from "@/components/ui/ProctoringCamera";

const STORAGE_KEY_PREFIX = "exam_progress_";
const MAX_VIOLATIONS = 3;

export default function ExamPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();
  const storageKey = `${STORAGE_KEY_PREFIX}${courseId}`;

  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0); 
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, any>>({}); 
  const [timeLeft, setTimeLeft] = useState(600);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const [violations, setViolations] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  // 🔥 Thêm State để lưu lý do vi phạm (hiển thị lên thanh thông báo)
  const [warningReason, setWarningReason] = useState(""); 
  const [isSuspended, setIsSuspended] = useState(false);

  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoaded = useRef(false);

  useEffect(() => {
    if (isLoaded.current) return;
    isLoaded.current = true;
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (!parsed.submitted && parsed.questions.length > 0) {
          setQuestions(parsed.questions);
          setAnswers(parsed.answers || {});
          setTimeLeft(parsed.timeLeft || 600);
          setViolations(parsed.violations || 0);
          setIsFocusMode(true);
        }
      } catch (e) { localStorage.removeItem(storageKey); }
    }
  }, [storageKey]);

  // GIÁM THỊ TAB/TRÌNH DUYỆT
  useEffect(() => {
    if (submitted || questions.length === 0 || loading || showSubmitConfirm) return; 

    const handleViolation = (reason: string) => {
      setViolations((prev) => {
        const newCount = prev + 1;
        const currentData = localStorage.getItem(storageKey);
        if (currentData) {
           const parsed = JSON.parse(currentData);
           parsed.violations = newCount;
           localStorage.setItem(storageKey, JSON.stringify(parsed));
        }

        if (newCount >= MAX_VIOLATIONS) {
           setIsSuspended(true);
           handleAutoSubmit(true);
        } else {
           // 🔥 DELAY 2 GIÂY MỚI HIỆN THÔNG BÁO
           setTimeout(() => {
               setWarningReason(reason);
               setShowWarning(true);
               // Tự động tắt sau 5s nếu user không tự bấm tắt
               setTimeout(() => setShowWarning(false), 5000);
           }, 2000);
        }
        return newCount;
      });
    };

    const onVisibilityChange = () => { if (document.hidden) handleViolation("Rời khỏi Tab thi"); };
    const onBlur = () => { handleViolation("Click chuột ra ngoài cửa sổ thi"); };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
    };
  }, [submitted, questions, storageKey, loading, showSubmitConfirm]); 

  // ĐẾM NGƯỢC
  useEffect(() => {
    if (questions.length > 0 && !submitted && timeLeft > 0 && !loading && !showSubmitConfirm) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          localStorage.setItem(storageKey, JSON.stringify({
            questions, answers, timeLeft: newTime, submitted: false, violations 
          }));
          return newTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0 && !submitted && questions.length > 0) handleAutoSubmit(false);
  }, [timeLeft, submitted, questions, answers, violations, storageKey, loading, showSubmitConfirm]);

  // TẢI ĐỀ THI TỪ DATABASE
  const handleStartExam = async () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    localStorage.removeItem(storageKey);
    setQuestions([]); setAnswers({}); setSubmitted(false); setScore(0);
    setTimeLeft(600); setViolations(0); setIsSuspended(false); setError("");
    setLoading(true); setLoadingProgress(0); setIsFocusMode(true);

    const progressInterval = setInterval(() => {
        setLoadingProgress(prev => prev >= 90 ? prev : prev + Math.floor(Math.random() * 10) + 1);
    }, 100);

    try {
      const res = await fetch(`/api/courses`);
      const allCourses = await res.json();
      
      clearInterval(progressInterval); 

      if (!res.ok) throw new Error("Lỗi kết nối máy chủ");
      
      const currentCourse = allCourses.find((c: any) => c.id === Number(courseId));
      const fetchedQuestions = currentCourse?.questions || [];
      
      if (fetchedQuestions.length > 0) {
        setLoadingProgress(100); 
        setTimeout(() => {
            setQuestions(fetchedQuestions);
            setLoading(false); 
            localStorage.setItem(storageKey, JSON.stringify({
                questions: fetchedQuestions, answers: {}, timeLeft: 600, submitted: false, violations: 0
            }));
        }, 800);
      } else {
          throw new Error("Đề thi này chưa có câu hỏi nào!");
      }
    } catch (e: any) {
      clearInterval(progressInterval);
      setError(e.message); setIsFocusMode(false); setLoading(false);
    }
  };

  const handleAutoSubmit = (suspended = false) => {
      setShowSubmitConfirm(false); 
      processSubmit(suspended);
  };

  const handleRequestSubmit = () => {
    const unanswered = questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
        setShowSubmitConfirm(true); 
    } else {
        processSubmit(false); 
    }
  };

  // XỬ LÝ KẾT QUẢ TỪ AI CAMERA
  const handleCameraViolation = (reason: string) => {
    if (submitted || questions.length === 0 || loading || showSubmitConfirm || isSuspended) return;

    console.warn("⚠️ [AI CAMERA] Gian lận:", reason);

    setViolations((prev) => {
      const newCount = prev + 1;
      const currentData = localStorage.getItem(storageKey);
      if (currentData) {
         const parsed = JSON.parse(currentData);
         parsed.violations = newCount;
         localStorage.setItem(storageKey, JSON.stringify(parsed));
      }

      if (newCount >= MAX_VIOLATIONS) {
         setIsSuspended(true);
         handleAutoSubmit(true); 
      } else {
         // 🔥 DELAY 2 GIÂY MỚI HIỆN THÔNG BÁO
         setTimeout(() => {
             setWarningReason(reason);
             setShowWarning(true);
             setTimeout(() => setShowWarning(false), 5000);
         }, 2000);
      }
      return newCount;
    });
  };

  const processSubmit = async (suspended = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowSubmitConfirm(false); 

    let correct = 0;
    questions.forEach(q => { 
        if (q.type === "SHORT_ANSWER") {
            const userAnswer = (answers[q.id] || "").toString().trim().toLowerCase();
            let correctArr = [];
            if (Array.isArray(q.correctAnswers)) {
                correctArr = q.correctAnswers;
            } else if (typeof q.correctAnswers === 'string') {
                try { correctArr = JSON.parse(q.correctAnswers); } catch(e) { correctArr = q.correctAnswers.split(','); }
            }
            const isMatch = correctArr.some((ans: string) => ans.trim().toLowerCase() === userAnswer);
            if (isMatch) correct++;
        } else {
            if (answers[q.id] === q.correct) correct++; 
        }
    });

    const finalScore = (questions.length > 0) ? (correct / questions.length) * 10 : 0;
    
    setScore(finalScore);
    setSubmitted(true);
    localStorage.removeItem(storageKey);
    if (document.exitFullscreen) document.exitFullscreen().catch(()=> {});

    try {
      const answersToSubmit: Record<string, any> = {};
      questions.forEach(q => {
        if (answers[q.id] !== undefined && answers[q.id] !== "") {
          answersToSubmit[q.id] = answers[q.id];
        }
      });

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            action: "GRADE", 
            courseId: Number(courseId), 
            answers: answersToSubmit, 
            violationCount: violations, 
            isSuspended: suspended
        }),
      });

      const data = await response.json();
      if (data.calculatedScore !== undefined && data.calculatedScore !== finalScore) {
        setScore(data.calculatedScore);
      }

    } catch(e) { 
      console.error("Lỗi khi gửi kết quả:", e);
    } finally {
      setIsSubmitting(false);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToQuestion = (index: number) => {
    const el = document.getElementById(`question-${index}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const speak = (txt: string) => {
    if(window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(txt.replace(/\$/g, '')); 
      u.lang = "vi-VN"; u.rate = 0.9;     
      window.speechSynthesis.speak(u);
    }
  };

  const containerClass = isFocusMode ? "fixed inset-0 z-50 bg-[#F5F5F7] overflow-y-auto select-none font-sans" : "max-w-7xl mx-auto space-y-6 p-6 pb-24 select-none font-sans"; 
  const unansweredCount = questions.length - Object.keys(answers).length;

  return (
    <div className={containerClass} onContextMenu={(e) => e.preventDefault()}>
      <div className={isFocusMode ? "max-w-6xl mx-auto p-6 md:p-8 min-h-screen" : ""}>
        
        {(!isFocusMode || (submitted && !isSuspended)) && (
            <Link href="/student/my-courses" className="flex items-center text-slate-500 hover:text-blue-600 mb-8 font-medium w-fit transition-colors">
                <ArrowLeft size={18} className="mr-2" /> Quay lại khóa học
            </Link>
        )}

        {/* 1. MÀN HÌNH CHỜ & LOADING BAR */}
        {questions.length === 0 && (
            <Card className="p-12 text-center border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-3xl mt-6 max-w-xl mx-auto">
                {!loading && !error ? (
                    <>
                        <div className="mx-auto w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                            <ShieldAlert size={40} className="text-rose-500" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Phòng Thi Giám Sát AI</h2>
                        <div className="text-slate-600 mb-8 space-y-2 text-sm bg-slate-50/50 p-6 rounded-2xl border border-slate-100 text-left">
                            <p className="font-bold text-slate-800 mb-3 text-base">Quy chế bắt buộc:</p>
                            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"/> Camera AI liên tục quét khuôn mặt & điện thoại.</div>
                            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"/> Không chuyển tab, click ra ngoài, dùng app chụp ảnh.</div>
                            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"/> Hệ thống chặn Copy/Paste/Chuột phải.</div>
                            <p className="text-rose-600 font-bold mt-4 pt-4 border-t border-rose-100">⚠️ Vi phạm 3 lần = ĐÌNH CHỈ THI LẬP TỨC.</p>
                        </div>
                        <Button onClick={handleStartExam} size="lg" className="bg-slate-900 text-white hover:bg-slate-800 font-medium px-8 h-12 rounded-full shadow-md w-full">
                            Đồng ý Bật Camera & Bắt đầu thi
                        </Button>
                    </>
                ) : loading ? (
                    <div className="py-8">
                        <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                             <Bot size={36} className="text-blue-600 animate-pulse" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-2">Đang tải đề thi & AI...</h3>
                        <p className="text-slate-500 text-sm mb-8">Hệ thống đang khởi động thuật toán chống gian lận</p>
                        
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden relative">
                            <div 
                                className="h-full bg-blue-600 transition-all duration-300 ease-out rounded-full"
                                style={{ width: `${loadingProgress}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="py-8">
                         <div className="mx-auto w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6"><ShieldAlert size={36} className="text-rose-500" /></div>
                         <h3 className="text-xl font-bold text-rose-600 mb-2">Lỗi tải đề</h3>
                         <p className="text-slate-500 mb-6">{error}</p>
                         <Button onClick={() => {setError(""); setLoading(false)}} variant="outline">Thử lại</Button>
                    </div>
                )}
            </Card>
        )}

        {/* 🔥 COMPONENT CAMERA GIÁM THỊ (GÓC DƯỚI BÊN PHẢI) */}
        {!loading && questions.length > 0 && !submitted && !isSuspended && (
            <div className="fixed bottom-8 right-8 z-[60] shadow-2xl rounded-xl transition-all hover:scale-105">
                <ProctoringCamera onViolationDetected={handleCameraViolation} />
            </div>
        )}

        {/* 2. GIAO DIỆN LÀM BÀI */}
        {!loading && questions.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in duration-700 mt-4">
                
                <div className="lg:col-span-3 space-y-8">
                    <div className="lg:hidden flex items-center justify-between bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-slate-100/50 sticky top-4 z-40">
                         <h2 className="font-medium text-slate-500">Thời gian:</h2>
                         <span className="font-mono text-2xl font-bold text-slate-900 tracking-tighter">
                            {Math.floor(timeLeft/60).toString().padStart(2,'0')}:{ (timeLeft%60).toString().padStart(2,'0') }
                         </span>
                    </div>

                    {questions.map((q, idx) => {
                        let isCorrect = false;
                        if (submitted) {
                            if (q.type === "SHORT_ANSWER") {
                                const userAns = (answers[q.id] || "").toString().trim().toLowerCase();
                                let correctArr = [];
                                if (Array.isArray(q.correctAnswers)) correctArr = q.correctAnswers;
                                else if (typeof q.correctAnswers === 'string') {
                                    try { correctArr = JSON.parse(q.correctAnswers); } catch(e) { correctArr = q.correctAnswers.split(','); }
                                }
                                isCorrect = correctArr.some((ans: string) => ans.trim().toLowerCase() === userAns);
                            } else {
                                isCorrect = answers[q.id] === q.correct;
                            }
                        }

                        let optionsArr = q.options;
                        if (typeof q.options === 'string') {
                             try { optionsArr = JSON.parse(q.options); } catch(e) { optionsArr = []; }
                        }

                        return (
                        <div key={idx} id={`question-${idx}`} className="scroll-mt-28">
                            <Card className={`overflow-hidden border transition-all duration-300 rounded-3xl bg-white shadow-[0_2px_20px_rgb(0,0,0,0.02)] p-6 md:p-8 
                                ${submitted ? (isCorrect ? 'border-emerald-200 bg-emerald-50/30' : 'border-rose-200 bg-rose-50/30') : 'border-slate-100'}`}>
                                
                                <div className="flex justify-between items-start mb-6 gap-4">
                                    <h3 className="font-medium text-slate-800 text-lg md:text-xl leading-relaxed">
                                        <span className="text-blue-600 font-bold mr-3 text-base">Câu {idx+1}.</span> 
                                        <Latex>{q.text ? q.text.replace(/\/frac/g, "\\frac") : ""}</Latex>
                                    </h3>
                                    <Button 
                                        size="icon" 
                                        variant="outline" 
                                        onClick={() => speak(q.text)} 
                                        className="shrink-0 rounded-full w-10 h-10 border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                    >
                                        <Volume2 size={18}/>
                                    </Button>
                                </div>

                                <div className="space-y-3 mt-4">
                                    {q.type === "SHORT_ANSWER" ? (
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                disabled={submitted}
                                                placeholder="Nhập câu trả lời ngắn của bạn..."
                                                value={answers[q.id] || ""}
                                                onChange={(e) => !submitted && setAnswers(p => ({...p, [q.id]: e.target.value}))}
                                                className={`w-full p-4 md:p-5 text-base rounded-2xl border transition-all outline-none 
                                                    ${submitted 
                                                        ? (isCorrect 
                                                            ? 'bg-emerald-50/50 border-emerald-500 text-emerald-700 font-medium' 
                                                            : 'bg-rose-50/50 border-rose-400 text-rose-700 font-medium')
                                                        : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                                                    }`}
                                            />
                                            {submitted && !isCorrect && q.correctAnswer && (
                                                <div className="mt-3 text-sm flex items-center gap-2 bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-100">
                                                    <span className="font-bold">Đáp án đúng: </span>
                                                    <span>{q.correctAnswer}</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        optionsArr?.map((opt:string, i:number) => (
                                            <div key={i} onClick={() => !submitted && setAnswers(p => ({...p, [q.id]: i}))}
                                                className={`p-4 md:p-5 rounded-2xl border cursor-pointer flex gap-4 items-center transition-all duration-200
                                                    ${submitted 
                                                        ? (i===q.correct 
                                                            ? 'bg-emerald-50/50 border-emerald-500 font-medium text-emerald-800 shadow-sm' 
                                                            : (i===answers[q.id] ? 'bg-rose-50/50 border-rose-300 text-rose-500 line-through' : 'border-slate-100 opacity-50 bg-slate-50/50 text-slate-500')) 
                                                        : (answers[q.id]===i ? 'bg-blue-50 border-blue-500 font-medium shadow-sm' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50')
                                                    }`}>
                                                <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 transition-colors
                                                    ${answers[q.id]===i && !submitted ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-300 text-slate-500'}`}>
                                                    {String.fromCharCode(65+i)}
                                                </div>
                                                <span className="text-base leading-relaxed">
                                                     <Latex>{opt ? opt.replace(/\/frac/g, "\\frac") : ""}</Latex>
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </Card>
                        </div>
                        )
                    })}
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-8 space-y-6">
                        
                        <Card className="p-6 md:p-8 rounded-3xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-xl">
                            <div className="text-center mb-6">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Thời gian còn lại</h3>
                                {!submitted ? (
                                    <div className={`text-5xl font-mono font-bold tracking-tighter ${timeLeft < 60 ? 'text-rose-500 animate-pulse' : 'text-slate-900'}`}>
                                        {Math.floor(timeLeft/60).toString().padStart(2,'0')}:{ (timeLeft%60).toString().padStart(2,'0') }
                                    </div>
                                ) : (
                                    <div className="mt-3">
                                        <span className="px-4 py-1.5 bg-slate-100 text-slate-500 font-medium rounded-full text-sm">Đã kết thúc</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between bg-rose-50/50 p-3 rounded-2xl border border-rose-100 text-xs text-rose-600 font-medium">
                                <span className="flex items-center gap-1.5"><ShieldAlert size={14}/> Vi phạm AI báo:</span>
                                <span className="font-bold">{violations}/{MAX_VIOLATIONS}</span>
                            </div>

                            {submitted && (
                                <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                                    <p className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-2">Điểm số</p>
                                    <div className={`text-6xl font-bold tracking-tighter ${score >= 5 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {score.toFixed(1)}
                                    </div>
                                </div>
                            )}
                        </Card>

                        <Card className="p-6 rounded-3xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-xl">
                            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-slate-700">
                                <MapPin size={16} className="text-blue-500"/> Tổng quan
                            </div>
                            <div className="grid grid-cols-5 gap-2.5">
                                {questions.map((q, idx) => {
                                    const isAnswered = answers.hasOwnProperty(q.id) && answers[q.id] !== "";
                                    let bgClass = "bg-slate-100 text-slate-400 hover:bg-slate-200 border border-transparent"; 
                                    
                                    if (submitted) {
                                        let isCorrect = false;
                                        if (q.type === "SHORT_ANSWER") {
                                            let correctArr = [];
                                            if (Array.isArray(q.correctAnswers)) correctArr = q.correctAnswers;
                                            else if (typeof q.correctAnswers === 'string') {
                                                try { correctArr = JSON.parse(q.correctAnswers); } catch(e) { correctArr = q.correctAnswers.split(','); }
                                            }
                                            isCorrect = correctArr.some((a: string) => a.trim().toLowerCase() === (answers[q.id] || "").toString().trim().toLowerCase());
                                        } else {
                                            isCorrect = answers[q.id] === q.correct;
                                        }
                                        bgClass = isCorrect ? "bg-emerald-500 text-white" : "bg-rose-500 text-white";
                                    } else if (isAnswered) {
                                        bgClass = "bg-blue-600 text-white shadow-md shadow-blue-200";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => scrollToQuestion(idx)}
                                            className={`aspect-square rounded-full flex items-center justify-center text-xs font-bold transition-all ${bgClass}`}
                                        >
                                            {idx + 1}
                                        </button>
                                    )
                                })}
                            </div>
                            
                            {!submitted && (
                                <div className="mt-6 flex gap-4 text-xs font-medium text-slate-500 justify-center">
                                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-200"></div> Chưa làm</div>
                                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-600"></div> Đã làm</div>
                                </div>
                            )}
                        </Card>

                        {!submitted ? (
                            <Button 
                                onClick={handleRequestSubmit} 
                                disabled={isSubmitting}
                                className="w-full h-14 text-base font-medium bg-slate-900 text-white hover:bg-black shadow-lg rounded-full transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="mr-2 w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                                        ĐANG XỬ LÝ...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 w-5 h-5"/> NỘP BÀI NGAY
                                    </>
                                )}
                            </Button>
                        ) : (
                            <div className="space-y-3">
                                <Button onClick={handleStartExam} variant="outline" className="w-full h-12 font-medium rounded-full border-slate-200 text-slate-600 hover:bg-slate-50">
                                    <RotateCcw className="mr-2 h-4 w-4"/> Làm lại đề này
                                </Button>
                                <Button onClick={() => { setIsFocusMode(false); router.push("/student/dashboard"); }} className="w-full h-12 font-medium bg-blue-600 rounded-full text-white hover:bg-blue-700">
                                    Về trang chủ
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* MODAL XÁC NHẬN NỘP BÀI KHI CHƯA LÀM HẾT CÂU */}
        {showSubmitConfirm && !submitted && !isSuspended && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
                <Card className="p-8 max-w-md w-full mx-4 text-center bg-white rounded-3xl shadow-2xl">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle size={40} className="text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Chưa làm xong!</h2>
                    <p className="text-slate-600 text-base mb-8">
                        Bạn vẫn còn <strong className="text-rose-500 text-xl mx-1">{unansweredCount}</strong> câu hỏi chưa hoàn thành. Bạn có chắc chắn muốn nộp bài và kết thúc bài thi ngay bây giờ không?
                    </p>
                    
                    <div className="flex gap-4">
                        <Button 
                            variant="outline" 
                            onClick={() => setShowSubmitConfirm(false)} 
                            className="flex-1 h-12 rounded-xl font-bold text-slate-600 border-slate-200 hover:bg-slate-50"
                        >
                            Làm tiếp
                        </Button>
                        <Button 
                            onClick={() => processSubmit(false)} 
                            disabled={isSubmitting}
                            className="flex-1 h-12 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg"
                        >
                            {isSubmitting ? "Đang xử lý..." : "Vẫn nộp bài"}
                        </Button>
                    </div>
                </Card>
            </div>
        )}

        {/* 🔥 THANH THÔNG BÁO VI PHẠM (TOAST NHỎ GỌN, KHÔNG LÀM MỜ MÀN HÌNH) */}
        {showWarning && !isSuspended && !submitted && (
            <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right-8 fade-in duration-300">
                <div className="bg-white border-l-4 border-rose-500 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-4 flex items-start gap-4 max-w-sm w-full">
                    <div className="bg-rose-50 rounded-full p-2 shrink-0 mt-0.5">
                        <ShieldAlert size={20} className="text-rose-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-800 text-sm">Cảnh báo vi phạm!</h3>
                        <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                            {warningReason || "Hệ thống AI vừa phát hiện hành vi đáng ngờ."} Vui lòng tập trung làm bài!
                        </p>
                    </div>
                    <button 
                        onClick={() => setShowWarning(false)} 
                        className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full p-1.5 transition-colors"
                        title="Đóng cảnh báo"
                    >
                        <XCircle size={16} />
                    </button>
                </div>
            </div>
        )}

        {/* MÀN HÌNH ĐÌNH CHỈ (Vẫn giữ nguyên Fullscreen vì đã bị đuổi thi) */}
        {isSuspended && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
                <Card className="p-10 text-center bg-white border-none rounded-[2rem] max-w-md w-full mx-4 shadow-2xl">
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock size={40} className="text-rose-500"/>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">ĐÌNH CHỈ THI</h2>
                    <p className="text-slate-500 mb-8 text-sm">Bạn đã vi phạm quy chế thi quá số lần quy định.</p>
                    
                    <div className="bg-slate-50 p-6 rounded-2xl mb-8">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-2">Điểm số ghi nhận</p>
                        <p className="text-5xl font-bold tracking-tighter text-slate-900">{score.toFixed(1)}</p>
                    </div>

                    <Button onClick={() => {setIsFocusMode(false); router.push("/student/dashboard")}} className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-full font-medium">
                        THOÁT PHÒNG THI
                    </Button>
                </Card>
            </div>
        )}
      </div>
    </div>
  );
}