"use client";

import { useEffect, useState } from "react";
import { getPendingCourses, publishCourse, rejectCourse } from "./actions";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Eye, CheckCircle, XCircle, User, BookOpen, Clock, ShieldAlert, ArrowRight, Layers } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ModerationPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State quản lý việc Từ chối
  const [rejectReason, setRejectReason] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    getPendingCourses().then((data) => {
      setCourses(data);
      setLoading(false);
    });
  };

  const handlePublish = async (id: number) => {
    if (!confirm("Duyệt nhanh bộ đề này mà không cần xem trước nội dung?")) return;
    setIsProcessing(true);
    try {
        await publishCourse(id);
        toast.success("Khóa học đã được duyệt & xuất bản!");
        loadData();
    } catch (e) {
        toast.error("Lỗi khi duyệt bài.");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCourseId) return;
    if (!rejectReason.trim()) return toast.error("Vui lòng nhập lý do từ chối!");
    
    setIsProcessing(true);
    try {
        await rejectCourse(selectedCourseId, rejectReason);
        toast.info("Đã trả bộ đề về cho Giảng viên.");
        setSelectedCourseId(null);
        setRejectReason("");
        loadData();
    } catch (e) {
        toast.error("Lỗi khi từ chối bài.");
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
             <ShieldAlert className="w-8 h-8 text-amber-500" />
             Kiểm duyệt Nội dung
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
             Quản lý và phê duyệt các bộ đề thi do Giảng viên gửi lên hệ thống.
          </p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-5 py-3 rounded-2xl flex items-center gap-3">
            <Layers className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <div>
                <p className="text-xs font-bold text-amber-600/70 dark:text-amber-400/70 uppercase">Đang chờ duyệt</p>
                <p className="text-xl font-black text-amber-700 dark:text-amber-400">{courses.length} bộ đề</p>
            </div>
        </div>
      </div>

      {/* GRID DANH SÁCH */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
            <p className="text-slate-500 font-medium animate-pulse">Đang tải dữ liệu kiểm duyệt...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">Tuyệt vời!</h3>
            <p className="text-slate-500 mt-2">Không còn bộ đề nào đang chờ duyệt. Mọi thứ đã được xử lý xong.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
                
                {/* THUMBNAIL */}
                <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                  {course.thumbnail ? (
                     <Image src={course.thumbnail} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                     <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
                         <BookOpen className="w-10 h-10 mb-2 opacity-50" />
                         <span className="text-sm font-medium">Chưa có ảnh bìa</span>
                     </div>
                  )}
                  {/* OVERLAY GRADIENT & BADGE */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                  <Badge className="absolute top-4 right-4 bg-amber-500 text-white font-bold px-3 py-1 shadow-md border-none animate-pulse">
                      Chờ duyệt
                  </Badge>
                  <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg line-clamp-2 leading-tight">{course.title}</h3>
                  </div>
                </div>

                {/* THÔNG TIN CHI TIẾT */}
                <CardContent className="p-5 flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                        <div className="flex items-center text-slate-600 dark:text-slate-400">
                            <User className="w-4 h-4 mr-2 shrink-0 text-slate-400" />
                            <span className="truncate font-medium">{course.author?.name || "Giảng viên"}</span>
                        </div>
                        <div className="flex items-center text-slate-600 dark:text-slate-400">
                            <BookOpen className="w-4 h-4 mr-2 shrink-0 text-slate-400" />
                            <span className="truncate font-medium">{course.category || "Chưa phân loại"}</span>
                        </div>
                        <div className="flex items-center text-slate-600 dark:text-slate-400 col-span-2">
                            <Clock className="w-4 h-4 mr-2 shrink-0 text-slate-400" />
                            <span className="font-medium">Gửi lúc: {new Date(course.updatedAt || course.createdAt).toLocaleString('vi-VN')}</span>
                        </div>
                    </div>
                    
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase">Định giá:</span>
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                            {course.price > 0 ? new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(course.price) : 'MIỄN PHÍ'}
                        </span>
                    </div>
                </CardContent>

                {/* HÀNH ĐỘNG */}
                <CardFooter className="p-5 pt-0 flex flex-col gap-3">
                    {/* 🔥 ĐÃ FIX LỖI 404: Trỏ đúng link Admin */}
                    <Link href={`/admin/moderation/${course.id}`} className="w-full">
                        <Button className="w-full h-12 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20">
                            <Eye className="w-5 h-5 mr-2" /> Xem Chi Tiết Để Duyệt
                        </Button>
                    </Link>

                    <div className="flex gap-3 w-full">
                        <Button variant="outline" className="flex-1 h-10 rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/50 dark:hover:bg-emerald-900/20" onClick={() => handlePublish(course.id)} disabled={isProcessing}>
                            <CheckCircle className="w-4 h-4 mr-2" /> Duyệt Nhanh
                        </Button>
                        <Button variant="outline" className="flex-1 h-10 rounded-xl border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20" onClick={() => setSelectedCourseId(course.id)} disabled={isProcessing}>
                            <XCircle className="w-4 h-4 mr-2" /> Từ chối
                        </Button>
                    </div>
                </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* DIALOG TỪ CHỐI (Đưa ra ngoài vòng lặp để tối ưu hiệu suất) */}
      <Dialog open={!!selectedCourseId} onOpenChange={(open) => !open && setSelectedCourseId(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" /> Từ chối Đề thi
            </DialogTitle>
            <DialogDescription>
              Vui lòng cung cấp lý do chi tiết để Giảng viên có thể khắc phục và gửi lại.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
             <Textarea 
                placeholder="Ví dụ: Câu số 3 bị lỗi công thức toán học, thiếu đáp án đúng..." 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="min-h-[120px] rounded-xl border-slate-300 focus:border-red-500 focus:ring-red-200"
                autoFocus
             />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => setSelectedCourseId(null)}>Hủy bỏ</Button>
            <Button variant="destructive" className="rounded-xl font-bold" onClick={handleReject} disabled={isProcessing || !rejectReason.trim()}>
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : "Xác nhận Từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}