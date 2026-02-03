"use client";

import { useEffect, useState } from "react";
import { useExamGuard } from "@/hooks/use-exam-guard"; // Hook mắt thần
import { getExamData, submitExam } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ExamPage({ params }: { params: { examId: string } }) {
  const router = useRouter();
  const [exam, setExam] = useState<any>(null);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // --- KÍCH HOẠT MẮT THẦN ---
  // Chỉ kích hoạt khi đã load đề và chưa nộp bài
  const isExamActive = !!exam && !isSubmitting; 
  const { violationCount } = useExamGuard(params.examId, isExamActive);

  useEffect(() => {
    // Load đề thi
    getExamData(params.examId).then(data => {
      setExam(data);
      setTimeLeft(data.duration * 60);
    });
  }, [params.examId]);

  // Bộ đếm ngược thời gian
  useEffect(() => {
    if (!exam || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // Hết giờ tự nộp
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [exam, timeLeft]);

  // Xử lý chọn đáp án
  const handleSelect = (qId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  // Xử lý nộp bài
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const res = await submitExam(params.examId, answers);
    if (res.success) {
      toast.success("Nộp bài thành công!");
      router.push("/student/dashboard"); // Quay về trang chủ
    } else {
      toast.error("Lỗi nộp bài");
      setIsSubmitting(false);
    }
  };

  // Format thời gian mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!exam) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 select-none"> {/* select-none để chặn bôi đen */}
      
      {/* 1. THANH CẢNH BÁO VI PHẠM (Chỉ hiện khi có lỗi) */}
      {violationCount > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-bold">CẢNH BÁO: Phát hiện {violationCount} hành vi gian lận!</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER: THÔNG TIN & ĐỒNG HỒ */}
        <Card className="sticky top-4 z-40 border-l-4 border-l-violet-600 shadow-md">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <h1 className="font-bold text-lg text-slate-800">{exam.title}</h1>
              <p className="text-sm text-slate-500">Mã đề: {params.examId}</p>
            </div>
            <div className={`text-2xl font-mono font-bold flex items-center gap-2 ${timeLeft < 300 ? 'text-red-600' : 'text-violet-600'}`}>
              <Clock className="w-6 h-6" />
              {formatTime(timeLeft)}
            </div>
          </CardContent>
        </Card>

        {/* DANH SÁCH CÂU HỎI */}
        <div className="space-y-4">
          {exam.questions.map((q: any, index: number) => (
            <Card key={q.id} className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex gap-2">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">Câu {index + 1}</span>
                  {q.text}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup onValueChange={(val) => handleSelect(q.id, val)} value={answers[q.id]}>
                  {q.options.map((opt: string, i: number) => (
                    <div key={i} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer">
                      <RadioGroupItem value={opt} id={`q${q.id}-${i}`} />
                      <Label htmlFor={`q${q.id}-${i}`} className="flex-1 cursor-pointer font-normal text-slate-700">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* NÚT NỘP BÀI */}
        <div className="flex justify-end pt-4 pb-10">
          <Button 
            size="lg" 
            className="bg-green-600 hover:bg-green-700 min-w-[200px]"
            onClick={() => {
              if (confirm("Bạn có chắc chắn muốn nộp bài?")) handleSubmit();
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2" />}
            Nộp bài thi
          </Button>
        </div>
      </div>
    </div>
  );
}