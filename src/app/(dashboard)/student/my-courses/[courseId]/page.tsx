"use client";

import { useState, useEffect, useRef, use } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Bot, ArrowLeft, Volume2, Save, RotateCcw, Clock, AlertTriangle, ShieldAlert, Lock, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const STORAGE_KEY_PREFIX = "exam_progress_";
const MAX_VIOLATIONS = 3;

export default function ExamPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();
  const storageKey = `${STORAGE_KEY_PREFIX}${courseId}`;

  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0); // Thanh loading 0-100%
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // --- STATE GIAN LẬN ---
  const [violations, setViolations] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);

  const isLoaded = useRef(false);

  // 1. LOAD TIẾN TRÌNH CŨ
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

  // 2. GIÁM THỊ AI
  useEffect(() => {
    if (submitted || questions.length === 0 || loading) return; // Không bắt lỗi khi đang loading

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
           setShowWarning(true);
           setTimeout(() => setShowWarning(false), 5000);
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
  }, [submitted, questions, storageKey, loading]);

  // 3. ĐẾM NGƯỢC
  useEffect(() => {
    // Chỉ đếm khi đã load xong câu hỏi (questions.length > 0) và không còn loading
    if (questions.length > 0 && !submitted && timeLeft > 0 && !loading) {
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
  }, [timeLeft, submitted, questions, answers, violations, storageKey, loading]);

  // --- CÁC HÀM XỬ LÝ ---

  const handleStartExam = async () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    localStorage.removeItem(storageKey);
    setQuestions([]); setAnswers({}); setSubmitted(false); setScore(0);
    setTimeLeft(600); setViolations(0); setIsSuspended(false); setError("");
    
    setLoading(true);
    setLoadingProgress(0);
    setIsFocusMode(true);

    // Hiệu ứng Loading giả lập cho mượt
    const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
            if(prev >= 90) return prev; // Dừng ở 90% đợi API
            return prev + Math.floor(Math.random() * 10) + 1;
        });
    }, 300);

    try {
      const res = await fetch("/api/ai/exam", {
        method: "POST",
        body: JSON.stringify({ action: "GENERATE", courseId }),
      });
      const data = await res.json();
      
      clearInterval(progressInterval); // Dừng loading giả

      if (!res.ok) throw new Error(data.error || "Lỗi kết nối");
      
      if (data.questions && data.questions.length > 0) {
        setLoadingProgress(100); // API xong -> vọt lên 100%
        
        // Delay 1 xíu cho user thấy 100% rồi mới hiện đề
        setTimeout(() => {
            setQuestions(data.questions);
            setLoading(false); // Tắt màn hình loading -> Bắt đầu tính giờ
            localStorage.setItem(storageKey, JSON.stringify({
                questions: data.questions, answers: {}, timeLeft: 600, submitted: false, violations: 0
            }));
        }, 800);
        
      } else throw new Error("Dữ liệu trống");
    } catch (e: any) {
      clearInterval(progressInterval);
      setError(e.message); setIsFocusMode(false); setLoading(false);
    }
  };

  const handleAutoSubmit = (suspended = false) => handleSubmit(true, suspended);

  const handleSubmit = async (force = false, suspended = false) => {
    if (!force && !suspended) {
      const unanswered = questions.length - Object.keys(answers).length;
      if (unanswered > 0 && !confirm(`Còn ${unanswered} câu chưa làm. Nộp bài?`)) return;
    }
    
    // setLoading(true); // Không set loading ở đây để tránh mất giao diện kết quả
    let correct = 0;
    questions.forEach(q => { if (answers[q.id] === q.correct) correct++; });
    const finalScore = (questions.length > 0) ? (correct / questions.length) * 10 : 0;
    
    setScore(finalScore);
    setSubmitted(true);
    localStorage.removeItem(storageKey);
    if (document.exitFullscreen) document.exitFullscreen().catch(()=> {});

    try {
      await fetch("/api/ai/exam", {
        method: "POST",
        body: JSON.stringify({ 
            action: "GRADE", courseId, scoreFromClient: finalScore,
            violationCount: violations, isSuspended: suspended
        }),
      });
    } catch(e) { console.error(e); }
    
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToQuestion = (index: number) => {
    const el = document.getElementById(`question-${index}`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const speak = (txt: string) => {
    if(window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(txt);
      u.lang = "en-US";
      window.speechSynthesis.speak(u);
    }
  };

  // Class Fullscreen
  const containerClass = isFocusMode ? "fixed inset-0 z-50 bg-stone-50 overflow-y-auto select-none" : "max-w-7xl mx-auto space-y-6 p-6 pb-24 select-none"; 

  return (
    <div className={containerClass} onContextMenu={(e) => e.preventDefault()}>
      <div className={isFocusMode ? "max-w-7xl mx-auto p-4 min-h-screen" : ""}>
        
        {(!isFocusMode || (submitted && !isSuspended)) && (
            <Link href="/student/my-courses" className="flex items-center text-stone-500 hover:text-amber-600 mb-6 font-medium w-fit">
                <ArrowLeft size={18} className="mr-2" /> Quay lại khóa học
            </Link>
        )}

        {/* 1. MÀN HÌNH CHỜ & LOADING BAR */}
        {questions.length === 0 && !error && (
            <Card className="p-12 text-center border-dashed border-2 mt-6 max-w-2xl mx-auto">
                {!loading ? (
                    <>
                        <div className="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <ShieldAlert size={48} className="text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Bài Thi Có Giám Sát AI</h2>
                        <div className="text-stone-500 mb-8 space-y-1 text-sm bg-stone-50 p-4 rounded-xl text-left">
                            <p className="font-bold text-stone-800 mb-2">🚫 QUY CHẾ THI:</p>
                            <p>• Không chuyển tab, click ra ngoài.</p>
                            <p>• Chặn Copy/Paste/Chuột phải.</p>
                            <p className="text-red-600 font-bold mt-2">⚠️ Vi phạm 3 lần = ĐÌNH CHỈ THI.</p>
                        </div>
                        <Button onClick={handleStartExam} size="lg" className="bg-red-600 text-white hover:bg-red-700 font-bold px-8 h-12 rounded-xl shadow-lg">
                            Đồng ý & Bắt đầu
                        </Button>
                    </>
                ) : (
                    <div className="py-10">
                        <div className="mx-auto w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
                             <Bot size={40} className="text-amber-600" />
                        </div>
                        <h3 className="text-xl font-bold text-stone-800 mb-2">AI đang sinh đề thi...</h3>
                        <p className="text-stone-500 text-sm mb-6">Đang phân tích dữ liệu và tạo câu hỏi</p>
                        
                        {/* LOADING BAR */}
                        <div className="w-full h-4 bg-stone-200 rounded-full overflow-hidden relative">
                            <div 
                                className="h-full bg-amber-500 transition-all duration-300 ease-out"
                                style={{ width: `${loadingProgress}%` }}
                            />
                        </div>
                        <p className="mt-2 font-mono font-bold text-amber-600">{loadingProgress}%</p>
                    </div>
                )}
            </Card>
        )}

        {/* 2. GIAO DIỆN LÀM BÀI (GRID 2 CỘT) */}
        {!loading && questions.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in">
                
                {/* CỘT TRÁI: DANH SÁCH CÂU HỎI (Chiếm 3/4) */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Header Mobile (Chỉ hiện khi màn hình nhỏ) */}
                    <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border">
                         <h2 className="font-bold">Thời gian còn lại:</h2>
                         <span className="font-mono text-xl font-black text-amber-600">
                            {Math.floor(timeLeft/60).toString().padStart(2,'0')}:{ (timeLeft%60).toString().padStart(2,'0') }
                         </span>
                    </div>

                    {questions.map((q, idx) => {
                        const isCorrect = answers[q.id] === q.correct;
                        return (
                        <div key={idx} id={`question-${idx}`} className="scroll-mt-24">
                            <Card className={`overflow-hidden border-2 transition-all ${submitted ? (isCorrect ? 'border-green-500 ring-1 ring-green-500' : 'border-red-200 ring-1 ring-red-200') : 'border-stone-100 shadow-sm'}`}>
                                <div className="grid grid-cols-1 md:grid-cols-3">
                                    <div className="bg-stone-100 relative h-48 md:h-auto min-h-[200px]">
                                        <img src={`https://picsum.photos/seed/${q.id}${q.text.length}/400/300`} className="absolute inset-0 w-full h-full object-cover" loading="lazy" alt="img"/>
                                    </div>
                                    <div className="col-span-2 p-5 bg-white">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-bold text-stone-800 text-lg flex-1">
                                                <span className="text-amber-600 mr-2 bg-amber-50 px-2 py-0.5 rounded text-sm">Câu {idx+1}</span> 
                                                {q.text}
                                            </h3>
                                            <Button size="icon" variant="ghost" onClick={() => speak(q.text)} className="shrink-0 text-stone-400 hover:text-amber-600"><Volume2 size={20}/></Button>
                                        </div>
                                        <div className="space-y-2">
                                            {q.options.map((opt:string, i:number) => (
                                                <div key={i} onClick={() => !submitted && setAnswers(p => ({...p, [q.id]: i}))}
                                                    className={`p-3 rounded-lg border cursor-pointer flex gap-3 items-center transition-all ${
                                                        submitted ? (i===q.correct ? 'bg-green-100 border-green-500 font-bold' : (i===answers[q.id] ? 'bg-red-50 border-red-500 line-through opacity-70' : 'opacity-40')) 
                                                        : (answers[q.id]===i ? 'bg-amber-100 border-amber-500 font-bold shadow-sm' : 'hover:bg-stone-50')
                                                    }`}>
                                                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${answers[q.id]===i && !submitted ? 'bg-amber-500 text-white border-amber-500' : 'bg-white'}`}>
                                                        {String.fromCharCode(65+i)}
                                                    </div>
                                                    <span className="text-sm md:text-base">{opt}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                        )
                    })}
                </div>

                {/* CỘT PHẢI: BẢNG ĐIỀU KHIỂN (Sticky) */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6 space-y-4">
                        
                        {/* 1. THÔNG TIN BÀI THI & ĐỒNG HỒ */}
                        <Card className={`p-5 border-t-4 ${isSuspended ? 'border-t-red-600' : submitted ? 'border-t-green-500' : 'border-t-amber-500'} shadow-lg`}>
                            <div className="text-center mb-4">
                                <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider">Thời gian còn lại</h3>
                                {!submitted ? (
                                    <div className={`text-4xl font-mono font-black mt-2 ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-stone-800'}`}>
                                        {Math.floor(timeLeft/60).toString().padStart(2,'0')}:{ (timeLeft%60).toString().padStart(2,'0') }
                                    </div>
                                ) : (
                                    <div className="mt-2">
                                        <span className="px-3 py-1 bg-stone-100 text-stone-600 font-bold rounded-full text-sm">Đã kết thúc</span>
                                    </div>
                                )}
                            </div>

                            {/* Cảnh báo vi phạm */}
                            <div className="flex items-center justify-between bg-red-50 p-2 rounded-lg border border-red-100 text-xs text-red-700 font-bold">
                                <span className="flex items-center gap-1"><ShieldAlert size={14}/> Vi phạm:</span>
                                <span>{violations}/{MAX_VIOLATIONS}</span>
                            </div>

                            {/* Điểm số (Hiện khi nộp) */}
                            {submitted && (
                                <div className="mt-4 pt-4 border-t text-center">
                                    <p className="text-stone-500 text-xs uppercase mb-1">Điểm số của bạn</p>
                                    <div className={`text-5xl font-black ${score >= 5 ? 'text-green-600' : 'text-red-600'}`}>
                                        {score.toFixed(1)}
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* 2. BẢN ĐỒ CÂU HỎI (QUESTION MAP) */}
                        <Card className="p-4 shadow-md">
                            <div className="flex items-center gap-2 mb-3 text-sm font-bold text-stone-700">
                                <MapPin size={16}/> Danh sách câu hỏi
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                                {questions.map((_, idx) => {
                                    const isAnswered = answers.hasOwnProperty(questions[idx].id);
                                    let bgClass = "bg-stone-100 text-stone-400 hover:bg-stone-200"; // Mặc định
                                    
                                    if (submitted) {
                                        // Khi nộp: Xanh nếu đúng, Đỏ nếu sai
                                        const isCorrect = answers[questions[idx].id] === questions[idx].correct;
                                        bgClass = isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white";
                                    } else if (isAnswered) {
                                        // Đang làm: Vàng nếu đã chọn
                                        bgClass = "bg-amber-500 text-white shadow-md shadow-amber-200";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => scrollToQuestion(idx)}
                                            className={`aspect-square rounded-full flex items-center justify-center text-sm font-bold transition-all ${bgClass}`}
                                        >
                                            {idx + 1}
                                        </button>
                                    )
                                })}
                            </div>
                            
                            {/* Chú thích */}
                            {!submitted && (
                                <div className="mt-4 flex gap-4 text-[10px] text-stone-500 justify-center">
                                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-stone-200"></div> Chưa làm</div>
                                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Đã làm</div>
                                </div>
                            )}
                        </Card>

                        {/* 3. NÚT NỘP BÀI (Ở CỘT PHẢI) */}
                        {!submitted ? (
                            <Button 
                                onClick={() => handleSubmit(false)} 
                                className="w-full h-14 text-lg font-bold bg-stone-900 text-white hover:bg-black shadow-xl rounded-xl transition-transform hover:scale-[1.02]"
                            >
                                <Save className="mr-2"/> NỘP BÀI
                            </Button>
                        ) : (
                            <div className="space-y-2">
                                <Button onClick={handleStartExam} variant="outline" className="w-full h-12 font-bold border-stone-300">
                                    <RotateCcw className="mr-2 h-4 w-4"/> Làm đề mới
                                </Button>
                                <Button onClick={() => { setIsFocusMode(false); router.push("/student/dashboard"); }} className="w-full h-12 font-bold bg-amber-600 text-white hover:bg-amber-700">
                                    Về Dashboard
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* MODAL CẢNH BÁO VI PHẠM */}
        {showWarning && !isSuspended && !submitted && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
                <Card className="p-8 max-w-md text-center bg-red-600 text-white border-4 border-white shadow-2xl animate-bounce">
                    <ShieldAlert size={64} className="mx-auto mb-4"/>
                    <h2 className="text-3xl font-black uppercase mb-2">CẢNH BÁO!</h2>
                    <p className="font-medium mb-4">Phát hiện rời khỏi màn hình thi.</p>
                </Card>
            </div>
        )}

        {/* MÀN HÌNH ĐÌNH CHỈ */}
        {isSuspended && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/90 backdrop-blur">
                <Card className="p-8 text-center bg-red-50 border-red-600 border-4 max-w-lg w-full shadow-2xl">
                    <Lock size={64} className="mx-auto text-red-600 mb-4"/>
                    <h2 className="text-3xl font-black text-red-700 mb-2">ĐÌNH CHỈ THI</h2>
                    <p className="text-stone-700 mb-6 font-medium">Bạn đã vi phạm quy chế thi quá 3 lần.</p>
                    <div className="bg-white p-4 rounded-xl border border-red-200 mb-6">
                        <p className="text-sm text-stone-500 uppercase">Điểm số ghi nhận</p>
                        <p className="text-4xl font-black text-stone-800">{score.toFixed(1)}</p>
                    </div>
                    <Button onClick={() => {setIsFocusMode(false); router.push("/student/dashboard")}} className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold">
                        THOÁT RA
                    </Button>
                </Card>
            </div>
        )}
      </div>
    </div>
  );
}