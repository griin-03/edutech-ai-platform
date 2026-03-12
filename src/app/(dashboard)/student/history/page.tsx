"use client";

import { useState, useEffect } from "react";
import { getMyExamHistory } from "./actions"; // Đảm bảo import đúng đường dẫn
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  History, Search, BookOpen, Star, AlertCircle, 
  CheckCircle2, XCircle, ShieldAlert, Clock, Loader2, ArrowRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ExamHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await getMyExamHistory();
      if (res.success) {
        setHistory(res.data);
      }
      setLoading(false);
    };
    fetchHistory();
  }, []);

  // --- TÍNH TOÁN SỐ LIỆU THỐNG KÊ ---
  const totalExams = history.length;
  const avgScore = totalExams > 0 ? (history.reduce((acc, curr) => acc + curr.score, 0) / totalExams).toFixed(1) : "0.0";
  const passedExams = history.filter(h => h.score >= 5 && !h.isSuspended).length;
  const suspendedExams = history.filter(h => h.isSuspended).length;

  // Lọc tìm kiếm
  const filteredHistory = history.filter(item => 
    item.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 bg-[#fdfbf7] dark:bg-[#0c0a09] min-h-screen rounded-3xl">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2.5 bg-blue-100 dark:bg-blue-500/20 rounded-xl text-blue-600">
              <History size={28} />
            </span>
            Lịch sử Học tập & Thi cử
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-base">
            Theo dõi tiến độ, điểm số và các đánh giá từ hệ thống AI Giám thị.
          </p>
        </div>
        <Link href="/student/exam-library">
            <Button className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-xl font-bold h-12 px-6">
                Làm bài thi mới <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
        </Link>
      </div>

      {/* DASHBOARD THỐNG KÊ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-white dark:bg-[#1c1917] rounded-3xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-500"><BookOpen size={24} /></div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng bài thi</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{totalExams}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-white dark:bg-[#1c1917] rounded-3xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl text-amber-500"><Star size={24} /></div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Điểm trung bình</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{avgScore}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-[#1c1917] rounded-3xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-500"><CheckCircle2 size={24} /></div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Bài thi Đạt (&gt;=5)</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{passedExams}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-[#1c1917] rounded-3xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-rose-50 dark:bg-rose-500/10 rounded-2xl text-rose-500"><ShieldAlert size={24} /></div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Bị đình chỉ</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{suspendedExams}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DANH SÁCH LỊCH SỬ THI */}
      <div className="bg-white dark:bg-[#1c1917] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Chi tiết các lần thi</h2>
            <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder="Tìm theo tên bài thi..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-50 dark:bg-slate-900 border-none rounded-xl h-11"
                />
            </div>
        </div>

        <div className="space-y-3">
          {loading ? (
             <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                 <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                 <p className="font-medium">Đang tải lịch sử...</p>
             </div>
          ) : filteredHistory.length === 0 ? (
             <div className="py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                 <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                     <BookOpen className="w-8 h-8 text-slate-300" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">Chưa có dữ liệu</h3>
                 <p className="text-slate-400 mt-1">Bạn chưa hoàn thành bài thi nào hoặc không tìm thấy kết quả.</p>
             </div>
          ) : (
            filteredHistory.map((item) => {
              // Logic xác định trạng thái UI
              let statusText = "Chưa Đạt";
              let statusBadge = "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
              let statusIcon = <AlertCircle className="w-3.5 h-3.5 mr-1" />;
              
              if (item.isSuspended) {
                  statusText = "Đình Chỉ Thi";
                  statusBadge = "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 animate-pulse";
                  statusIcon = <XCircle className="w-3.5 h-3.5 mr-1" />;
              } else if (item.score >= 5) {
                  statusText = "Hoàn Thành (Đạt)";
                  statusBadge = "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
                  statusIcon = <CheckCircle2 className="w-3.5 h-3.5 mr-1" />;
              }

              return (
                <div key={item.id} className="group flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-md transition-all bg-slate-50/50 dark:bg-slate-900/30 gap-4">
                    
                    {/* Phần thông tin Đề thi */}
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <BookOpen className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base md:text-lg line-clamp-1">{item.course?.title || "Đề thi không xác định"}</h3>
                            <div className="flex items-center gap-2 mt-1 text-xs font-medium text-slate-500">
                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-slate-200">{item.course?.category || "General"}</Badge>
                                <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {new Date(item.createdAt).toLocaleString('vi-VN')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Phần Kết quả & Trạng thái */}
                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-none border-slate-200 pt-3 md:pt-0">
                        <div className="text-center">
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Vi phạm</p>
                            <p className={cn("font-bold text-sm", item.violationCount > 0 ? "text-rose-500" : "text-emerald-500")}>
                                {item.violationCount} Lần
                            </p>
                        </div>
                        
                        <div className="text-center bg-white dark:bg-slate-800 px-4 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700 min-w-[80px]">
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Điểm số</p>
                            <p className={cn("font-black text-xl", item.score >= 5 && !item.isSuspended ? "text-emerald-600" : "text-rose-600")}>
                                {item.score.toFixed(1)}
                            </p>
                        </div>

                        <Badge variant="outline" className={cn("px-3 py-1.5 h-8 font-bold shrink-0", statusBadge)}>
                            {statusIcon} {statusText}
                        </Badge>
                    </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}