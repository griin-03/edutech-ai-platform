'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Loader2, AlertTriangle, CheckCircle2, XCircle, 
  Clock, ChevronLeft, ChevronRight, LayoutGrid 
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { getExamData, submitExam } from './actions'; 

import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

const MAX_WARNINGS = 3;
const EXAM_DURATION_SECONDS = 10 * 60; // Set cứng 10 phút (600 giây) theo yêu cầu

interface MobileQuizPageProps {
  params: Promise<{ quizId: string }>;
}

export default function MobileQuizPage({ params }: MobileQuizPageProps) {
  const resolvedParams = use(params);
  const quizId = resolvedParams.quizId;

  const router = useRouter();
  const { data: session } = useSession();
  
  // States dữ liệu
  const [questions, setQuestions] = useState<any[]>([]);
  const [quizInfo, setQuizInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoreResult, setScoreResult] = useState<any>(null);

  // States làm bài
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // States UI Modals (Thay thế alert/confirm)
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showCheatModal, setShowCheatModal] = useState(false);
  const [cheatWarningText, setCheatWarningText] = useState("");

  // States Anti-Cheat
  const warningsRef = useRef(0);
  const [cheatLogs, setCheatLogs] = useState<{ time: string; type: string }[]>([]);
  const hasAlertedRef = useRef(false);

  // --------------------------------------------------------
  // 1. TẢI DỮ LIỆU ĐỀ THI VÀ XỬ LÝ QUYỀN PRO
  // --------------------------------------------------------
  useEffect(() => {
    async function loadQuiz() {
      if (!session?.user) return;

      try {
        // 1. Lấy userId và role từ session để gửi xuống Backend
        const userId = parseInt((session.user as any).id);
        const role = ((session.user as any).role || "STUDENT").toUpperCase();

        // 2. Gọi API với ĐẦY ĐỦ 3 THAM SỐ
        const data = await getExamData(quizId, userId, role);

        // 3. Xử lý phản hồi từ Backend: Chặn Học sinh FREE thi đề PRO
        if (data?.error === "PRO_REQUIRED") {
          alert("Bài thi này thuộc khóa học PRO VIP. Vui lòng nâng cấp tài khoản để làm bài!");
          router.push('/mobile-app');
          return;
        }

        if (!data || !data.questions) {
          alert("Không tìm thấy bài thi hoặc bài thi chưa có câu hỏi!");
          router.push('/mobile-app');
          return;
        }

        // 4. Nếu hợp lệ, load dữ liệu vào màn hình
        setQuizInfo({ title: data.title });
        setQuestions(data.questions); 
        setTimeLeft(EXAM_DURATION_SECONDS); 
        
      } catch (error) {
        console.error("Lỗi tải bài thi:", error);
        alert("Lỗi kết nối CSDL. Vui lòng thử lại.");
        router.push('/mobile-app');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadQuiz();
  }, [quizId, session, router]);
  // --------------------------------------------------------
  // 2. ĐỒNG HỒ ĐẾM NGƯỢC & TỰ ĐỘNG NỘP
  // --------------------------------------------------------
  useEffect(() => {
    if (isLoading || isFinished || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleForceSubmit("Đã hết thời gian làm bài 10 phút!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isLoading, isFinished]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --------------------------------------------------------
  // 3. MẮT THẦN CHỐNG GIAN LẬN (CUSTOM MODAL)
  // --------------------------------------------------------
  useEffect(() => {
    if (isLoading || isFinished || !questions || questions.length === 0) return;

    const recordCheat = (type: string) => {
      const timeStr = new Date().toLocaleTimeString('vi-VN');
      setCheatLogs(prev => [...prev, { time: timeStr, type }]);
      
      warningsRef.current += 1;
      
      if (warningsRef.current >= MAX_WARNINGS) {
        setShowCheatModal(false);
        handleForceSubmit(`Vi phạm quy chế quá ${MAX_WARNINGS} lần.`);
      } else {
        setCheatWarningText(`Hành vi: ${type}. Lần vi phạm: ${warningsRef.current}/${MAX_WARNINGS}`);
        setShowCheatModal(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !hasAlertedRef.current) {
        hasAlertedRef.current = true;
        recordCheat('Rời khỏi ứng dụng / Chuyển tab');
        setTimeout(() => { hasAlertedRef.current = false; }, 2000);
      }
    };

    const handleBlur = () => {
      if (!hasAlertedRef.current) {
         hasAlertedRef.current = true;
         recordCheat('Mất tiêu điểm màn hình / Mở ứng dụng khác');
         setTimeout(() => { hasAlertedRef.current = false; }, 2000);
      }
    };

    const preventAction = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', preventAction);
    document.addEventListener('copy', preventAction);
    document.addEventListener('paste', preventAction);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', preventAction);
      document.removeEventListener('copy', preventAction);
      document.removeEventListener('paste', preventAction);
    };
  }, [isLoading, isFinished, questions]);

  // --------------------------------------------------------
  // 4. LOGIC CHỌN ĐÁP ÁN & ĐIỀU HƯỚNG
  // --------------------------------------------------------
  const handleSelectOption = (optionIndex: number) => {
    // 🛡️ LỚP BẢO VỆ 2: Kiểm tra currentQuestion có tồn tại trước khi lấy ID
    const currentQuestionId = questions?.[currentQuestionIdx]?.id;
    if (currentQuestionId !== undefined) {
      setSelectedAnswers({ ...selectedAnswers, [currentQuestionId]: optionIndex });
    }
  };

  const handleNext = () => {
    if (currentQuestionIdx < (questions?.length || 0) - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setShowSubmitModal(true); 
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  const handleForceSubmit = (reason: string) => {
    setShowSubmitModal(false);
    setShowCheatModal(false);
    submitQuiz(true, reason);
  };

  const submitQuiz = async (isForced: boolean, forcedReason?: string) => {
    setIsFinished(true);
    setIsSubmitting(true);

    try {
      const userId = parseInt((session?.user as any)?.id);
      if (!userId) throw new Error("Lỗi xác thực người dùng");

      const result = await submitExam(
        quizId, 
        userId, 
        selectedAnswers, 
        warningsRef.current, 
        isForced
      );

      if (result.success) {
        setScoreResult({
          score: result.score,
          correctAnswers: result.correctCount,
          totalQuestions: result.totalQuestions,
          status: isForced ? "FAILED (Gian lận)" : "COMPLETED",
          reason: forcedReason
        });
      }
    } catch (error) {
      console.error("Lỗi nộp bài:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getParsedOptions = (optionsRaw: any) => {
    if (Array.isArray(optionsRaw)) return optionsRaw;
    if (typeof optionsRaw === 'string') {
      try { return JSON.parse(optionsRaw); } catch { return optionsRaw.split(','); }
    }
    return [];
  };

  // --------------------------------------------------------
  // 5. RENDER GIAO DIỆN
  // --------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center max-w-md mx-auto">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
        <p className="text-stone-500 font-bold">Đang cấu hình đề thi...</p>
      </div>
    );
  }

  // --- MÀN HÌNH KẾT QUẢ ---
  if (isFinished) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 max-w-md mx-auto flex flex-col items-center p-6 animate-in fade-in zoom-in-95 duration-500">
        {isSubmitting ? (
           <div className="flex-1 flex flex-col justify-center items-center w-full">
             <div className="w-24 h-24 relative mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-amber-100 dark:border-amber-900/30"></div>
                <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
             </div>
             <h2 className="text-xl font-black text-stone-800 dark:text-stone-100">Đang chấm điểm...</h2>
             <p className="text-stone-500 mt-2 text-sm text-center">Server đang ghi nhận dữ liệu bảo mật.</p>
           </div>
        ) : (
          <div className="w-full flex-1 flex flex-col mt-10">
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 shadow-xl text-center border border-stone-100 dark:border-stone-800 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>
               {scoreResult?.status?.includes("FAILED") ? (
                  <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                     <XCircle size={32} />
                  </div>
               ) : (
                  <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                     <CheckCircle2 size={32} />
                  </div>
               )}
               
               <p className="text-stone-500 font-bold text-sm uppercase tracking-wider mb-1">Điểm hệ số 10</p>
               <h1 className="text-6xl font-black text-stone-800 dark:text-stone-100 mb-2">{scoreResult?.score || 0}</h1>
               <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                 Đúng <span className="text-emerald-600 font-bold">{scoreResult?.correctAnswers}</span> / {scoreResult?.totalQuestions} câu
               </p>
               {scoreResult?.reason && (
                 <p className="text-xs text-red-500 mt-3 font-medium bg-red-50 p-2 rounded-lg">{scoreResult.reason}</p>
               )}
            </div>

            <button 
              onClick={() => router.push('/mobile-app')}
              className="mt-auto mb-8 w-full py-4 bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 font-bold rounded-2xl shadow-lg hover:bg-stone-700 active:scale-95 transition-all"
            >
              Hoàn tất & Quay lại
            </button>
          </div>
        )}
      </div>
    );
  }

  // 🛡️ LỚP BẢO VỆ 3: Đảm bảo currentQuestion không bao giờ sập trang
  const currentQuestion = questions?.[currentQuestionIdx] || {};
  const questionOptions = getParsedOptions(currentQuestion?.options);

  // --- MÀN HÌNH LÀM BÀI ---
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col select-none max-w-md mx-auto relative shadow-2xl overflow-hidden">
      
      {/* 🔴 MODAL CHỐNG GIAN LẬN */}
      {showCheatModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-red-950/60 backdrop-blur-sm px-4">
           {/* ... code giữ nguyên ... */}
           <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 border-2 border-red-500">
             <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
               <AlertTriangle size={32} />
             </div>
             <h3 className="text-xl font-black text-center text-stone-800 dark:text-stone-100 mb-2">Cảnh báo gian lận!</h3>
             <p className="text-stone-500 text-center mb-6 text-sm">{cheatWarningText}</p>
             <button 
               onClick={() => setShowCheatModal(false)} 
               className="w-full py-4 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-600/30 active:scale-95 transition-all"
             >
               Đã hiểu và Tiếp tục
             </button>
           </div>
        </div>
      )}

      {/* 🟡 MODAL XÁC NHẬN NỘP BÀI */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
           <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in-95">
             <h3 className="text-xl font-black text-stone-800 dark:text-stone-100 mb-2">Xác nhận nộp bài</h3>
             <p className="text-stone-500 mb-6 text-sm">
               Bạn đã làm <strong className="text-amber-600">{Object.keys(selectedAnswers).length}/{(questions || []).length}</strong> câu hỏi. 
               Bạn có chắc chắn muốn nộp bài ngay bây giờ?
             </p>
             <div className="flex gap-3">
               <button 
                 onClick={() => setShowSubmitModal(false)} 
                 className="flex-1 py-3.5 font-bold text-stone-600 bg-stone-100 dark:bg-stone-800 dark:text-stone-300 rounded-xl active:scale-95 transition-all"
               >
                 Xem lại đề
               </button>
               <button 
                 onClick={() => { setShowSubmitModal(false); submitQuiz(false); }} 
                 className="flex-1 py-3.5 font-bold text-white bg-amber-500 rounded-xl shadow-lg shadow-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                 <CheckCircle2 size={18} /> Nộp bài
               </button>
             </div>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-stone-900 px-4 py-3 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center sticky top-0 z-40">
        <div className="flex flex-col">
           <p className="text-[10px] text-stone-500 font-bold uppercase line-clamp-1">{quizInfo?.title}</p>
           <h1 className="text-lg font-black text-stone-800 dark:text-stone-100">
             Câu {currentQuestionIdx + 1} <span className="text-stone-400 text-sm">/ {(questions || []).length}</span>
           </h1>
        </div>
        
        {/* Đồng hồ */}
        <div className={`text-xl font-mono font-black flex items-center gap-1.5 ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-amber-500'}`}>
          <Clock size={20} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Thanh Nav Số Câu Hỏi Nằm Ngang */}
      <div className="bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 py-3">
        <div className="flex overflow-x-auto gap-2 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* 🛡️ LỚP BẢO VỆ CHÍNH GIẢI QUYẾT LỖI UNDEFINED .MAP() */}
          {(questions || []).map((_, idx) => {
            const isAnswered = questions[idx]?.id && selectedAnswers[questions[idx].id] !== undefined;
            const isCurrent = currentQuestionIdx === idx;
            return (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIdx(idx)}
                className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-sm font-bold transition-all ${
                  isCurrent ? 'ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-stone-900' : ''
                } ${
                  isAnswered 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500 hover:bg-stone-200'
                }`}
              >
                {idx + 1}
              </button>
            )
          })}
        </div>
      </div>

      {/* Vùng Câu Hỏi & Đáp Án */}
      <div className="flex-1 p-5 overflow-y-auto">
        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 mb-6">
          <div className="text-[17px] leading-relaxed text-stone-800 dark:text-stone-200 font-medium whitespace-pre-line">
            <Latex>{currentQuestion?.text || currentQuestion?.title || "Nội dung câu hỏi bị trống."}</Latex>
          </div>
        </div>

        <div className="space-y-3 pb-24"> 
          {questionOptions.length > 0 ? questionOptions.map((option: string, idx: number) => {
            const isSelected = selectedAnswers[currentQuestion?.id] === idx;
            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-3 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 shadow-sm'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:border-amber-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                   isSelected ? 'bg-amber-500 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                }`}>
                   {String.fromCharCode(65 + idx)}
                </div>
                <div className="font-medium text-[15px] overflow-hidden">
                   <Latex>{option}</Latex>
                </div>
              </button>
            )
          }) : (
            <p className="text-center text-sm text-stone-500 italic">Không có đáp án / Đề trống</p>
          )}
        </div>
      </div>

      {/* Footer Nút Tới / Lùi */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 p-4 z-40 pb-safe flex gap-3">
        <button
          onClick={handlePrev}
          disabled={currentQuestionIdx === 0}
          className="w-[70px] shrink-0 h-14 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-2xl flex items-center justify-center disabled:opacity-40 transition-opacity"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={handleNext}
          className={`flex-1 h-14 font-black rounded-2xl transition-all flex items-center justify-center gap-2 ${
            currentQuestionIdx === (questions?.length || 1) - 1
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-[0_4px_20px_rgba(22,163,74,0.3)] active:scale-[0.98]'
              : 'bg-amber-500 hover:bg-amber-600 text-white shadow-[0_4px_20px_rgba(245,158,11,0.3)] active:scale-[0.98]'
          }`}
        >
          {currentQuestionIdx === (questions?.length || 1) - 1 ? (
             <><CheckCircle2 size={20}/> Nộp bài ngay</>
          ) : (
             <>Câu tiếp theo <ChevronRight size={20}/></>
          )}
        </button>
      </div>

    </div>
  );
}