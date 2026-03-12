"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
    getCourseDetailForAdmin, 
    approveCourseByAdmin, 
    rejectCourseByAdmin, 
    deleteCourseByAdmin 
} from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
    ArrowLeft, CheckCircle, XCircle, Trash2, 
    Loader2, User, BookOpen, AlertTriangle 
} from "lucide-react";

import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

export default function AdminPreviewCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 🔥 QUẢN LÝ CÁC CỬA SỔ HIỆN LÊN (MODAL) ĐẸP MẮT THAY VÌ CONFIRM MẶC ĐỊNH
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [confirmAction, setConfirmAction] = useState<'APPROVE' | 'DELETE' | null>(null);

  useEffect(() => {
    fetchCourseDetail();
  }, [courseId]);

  const fetchCourseDetail = async () => {
    const res = await getCourseDetailForAdmin(Number(courseId));
    if (res.success) {
      setCourse(res.data);
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  // CÁC HÀM XỬ LÝ KHI BẤM NÚT XÁC NHẬN TRONG MODAL
  const handleApprove = async () => {
    setIsProcessing(true);
    const res = await approveCourseByAdmin(Number(courseId));
    setIsProcessing(false);
    if (res.success) {
        toast.success(res.message);
        router.push("/admin/moderation");
    } else toast.error(res.message);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return toast.error("Vui lòng nhập lý do từ chối!");
    setIsProcessing(true);
    const res = await rejectCourseByAdmin(Number(courseId), rejectReason);
    setIsProcessing(false);
    if (res.success) {
        toast.success(res.message);
        router.push("/admin/moderation");
    } else toast.error(res.message);
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    const res = await deleteCourseByAdmin(Number(courseId));
    setIsProcessing(false);
    if (res.success) {
        toast.success(res.message);
        router.push("/admin/moderation");
    } else toast.error(res.message);
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500"/></div>;
  if (!course) return <div className="p-20 text-center text-slate-500">Không tìm thấy dữ liệu đề thi.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-6 animate-in fade-in duration-500 font-sans dark:bg-slate-950 min-h-screen relative">
      
      {/* NÚT THOÁT QUAY LẠI */}
      <button onClick={() => router.push("/admin/moderation")} className="flex items-center text-slate-500 hover:text-blue-600 font-medium w-fit mb-4 transition-colors">
        <ArrowLeft size={18} className="mr-2" /> Thoát & Quay lại danh sách
      </button>

      {/* ========================================================= */}
      {/* 1. MODAL XÁC NHẬN: DUYỆT VÀ XÓA BÀI CỰC ĐẸP */}
      {/* ========================================================= */}
      {confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in zoom-in duration-200">
            <Card className="w-full max-w-md shadow-2xl border-none overflow-hidden rounded-2xl">
              <CardHeader className={`text-white ${confirmAction === 'APPROVE' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                <CardTitle className="flex items-center gap-2 text-xl">
                  {confirmAction === 'APPROVE' ? <CheckCircle className="w-6 h-6"/> : <AlertTriangle className="w-6 h-6"/>}
                  {confirmAction === 'APPROVE' ? 'Xác nhận Phê duyệt' : 'Cảnh báo Xóa Đề thi'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 bg-white dark:bg-slate-900">
                <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                  {confirmAction === 'APPROVE' 
                    ? "Bạn có chắc chắn muốn DUYỆT bộ đề này? Sau khi duyệt, đề thi sẽ được xuất bản công khai để học sinh có thể vào làm bài." 
                    : "Hành động này sẽ XÓA VĨNH VIỄN bộ đề thi khỏi hệ thống và không thể hoàn tác. Bạn có thực sự muốn tiếp tục?"}
                </p>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setConfirmAction(null)} disabled={isProcessing} className="rounded-xl dark:text-slate-300">
                    Hủy bỏ
                  </Button>
                  <Button 
                    className={`rounded-xl font-bold ${confirmAction === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                    onClick={confirmAction === 'APPROVE' ? handleApprove : handleDelete} 
                    disabled={isProcessing}
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                    {confirmAction === 'APPROVE' ? "Có, Phê duyệt ngay" : "Xóa vĩnh viễn"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
      )}

      {/* ========================================================= */}
      {/* 2. MODAL NHẬP LÝ DO TỪ CHỐI */}
      {/* ========================================================= */}
      {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in zoom-in duration-200">
              <Card className="w-full max-w-lg shadow-2xl border-none overflow-hidden rounded-2xl">
                  <CardHeader className="bg-amber-500 text-white">
                      <CardTitle className="flex items-center gap-2 text-xl"><AlertTriangle className="w-6 h-6"/> Trả bài & Yêu cầu sửa</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4 bg-white dark:bg-slate-900">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Vui lòng nhập rõ lý do (sai kiến thức, thiếu đáp án, v.v...) để Giảng viên <strong>{course.author?.name}</strong> biết và sửa lại:</p>
                      <Textarea 
                          value={rejectReason} 
                          onChange={(e) => setRejectReason(e.target.value)} 
                          placeholder="VD: Câu số 3 bị sai công thức Toán học, vui lòng kiểm tra lại..."
                          className="min-h-[120px] rounded-xl text-base dark:bg-slate-950 dark:border-slate-800"
                          autoFocus
                      />
                      <div className="flex justify-end gap-3 pt-2">
                          <Button variant="outline" onClick={() => setShowRejectModal(false)} className="rounded-xl dark:text-slate-300">Hủy</Button>
                          <Button className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold" onClick={handleReject} disabled={isProcessing}>
                              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : "Gửi thông báo Từ chối"}
                          </Button>
                      </div>
                  </CardContent>
              </Card>
          </div>
      )}

      {/* BANNER THÔNG TIN ĐỀ THI & THANH CÔNG CỤ ADMIN */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sticky top-4 z-40">
        <div className="space-y-2">
            <div className="flex items-center gap-3">
                <Badge className={course.approvalStatus === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}>
                    {course.approvalStatus === "PENDING" ? "Đang chờ duyệt" : course.approvalStatus}
                </Badge>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{course.category}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{course.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                <span className="flex items-center gap-1"><User className="w-4 h-4"/> GV: {course.author?.name || course.author?.email}</span>
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4"/> {course.questions.length} câu hỏi</span>
                <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md">Giá: {course.price > 0 ? `${course.price.toLocaleString()}đ` : 'Miễn phí'}</span>
            </div>
        </div>

        {/* CÁC NÚT QUYỀN LỰC CỦA ADMIN (Gọi Modal thay vì confirm) */}
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <Button onClick={() => setConfirmAction('DELETE')} variant="outline" disabled={isProcessing} className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20 rounded-xl font-bold">
                <Trash2 className="w-4 h-4 mr-2"/> Xóa bỏ
            </Button>
            <Button onClick={() => setShowRejectModal(true)} variant="outline" disabled={isProcessing} className="border-amber-300 text-amber-600 hover:bg-amber-50 dark:border-amber-900/50 dark:hover:bg-amber-900/20 rounded-xl font-bold">
                <XCircle className="w-4 h-4 mr-2"/> Yêu cầu sửa
            </Button>
            <Button onClick={() => setConfirmAction('APPROVE')} disabled={isProcessing} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 rounded-xl font-bold">
                <CheckCircle className="w-4 h-4 mr-2"/> Phê duyệt Xuất bản
            </Button>
        </div>
      </div>

      {/* DANH SÁCH CÂU HỎI ĐỂ ADMIN ĐỌC (READ-ONLY + LATEX) */}
      <div className="space-y-6 pt-4">
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 px-2">Chi tiết nội dung câu hỏi:</h3>
        
        {course.questions.length === 0 && <p className="text-slate-500 italic px-2">Đề thi này chưa có câu hỏi nào.</p>}

        {course.questions.map((q: any, qIdx: number) => (
            <Card key={qIdx} className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                <CardContent className="p-6 md:p-8">
                    <div className="flex gap-4 mb-6">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shrink-0">
                            {qIdx + 1}
                        </span>
                        
                        <div className="w-full">
                            <span className="text-xs font-bold text-blue-500 uppercase mb-3 block">
                                {q.type === "MULTIPLE_CHOICE" ? "Trắc Nghiệm" : "Tự Luận"}
                            </span>
                            
                            {/* KHUNG HIỂN THỊ CÂU HỎI BẰNG LATEX CHO ADMIN */}
                            <div className="text-lg font-medium text-slate-800 dark:text-white mb-4 overflow-x-auto p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <Latex>{q.text ? q.text.replace(/\/frac/g, "\\frac") : ""}</Latex>
                            </div>

                            {/* HIỂN THỊ ĐÁP ÁN */}
                            {q.type === "MULTIPLE_CHOICE" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                    {(q.options as string[])?.map((opt: string, optIdx: number) => {
                                        const isCorrect = String(opt) === q.correctAnswer;
                                        return (
                                            <div key={optIdx} className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${isCorrect ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'}`}>
                                                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ${isCorrect ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                                                    {isCorrect && <CheckCircle className="w-4 h-4" />}
                                                </div>
                                                <div className="font-medium text-slate-700 dark:text-slate-300 overflow-x-auto">
                                                    <Latex>{opt ? opt.replace(/\/frac/g, "\\frac") : ""}</Latex>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {q.type === "SHORT_ANSWER" && (
                                <div className="bg-amber-50 dark:bg-amber-500/10 p-5 rounded-2xl border border-amber-200 dark:border-amber-500/30 mt-4 inline-block">
                                    <span className="text-sm font-bold text-amber-700 dark:text-amber-400 block mb-2">Đáp án đúng (ngăn cách bởi dấu phẩy):</span>
                                    <span className="font-bold text-xl text-slate-800 dark:text-white bg-white dark:bg-slate-900 px-4 py-2 rounded-xl inline-block shadow-sm">
                                        {q.correctAnswer}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}