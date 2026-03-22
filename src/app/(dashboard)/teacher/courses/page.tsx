"use client";

import { useEffect, useState } from "react";
import { getMyCourses, deleteCourse } from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  Loader2, PlusCircle, Pencil, Trash2, AlertCircle, 
  Search, BookOpen, Users, DollarSign, Star, Crown, LockOpen
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    getMyCourses().then((data) => {
      setCourses(data);
      setLoading(false);
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Cảnh báo: Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa?")) return;
    const res = await deleteCourse(id);
    if (res.success) {
      toast.success("Đã xóa khóa học thành công");
      loadData();
    } else {
      toast.error(res.error);
    }
  };

  const totalCourses = courses.length;
  const totalStudents = courses.reduce((acc, c) => acc + c.sales, 0);
  const activeCourses = courses.filter(c => c.isPublished).length;

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(filter.toLowerCase())
  );

  const renderStatus = (status: string, reason?: string) => {
    if (status === "APPROVED") return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold">Đã xuất bản</Badge>;
    if (status === "DRAFT") return <Badge className="bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700 px-2.5 py-0.5 text-xs font-semibold">Bản nháp</Badge>;
    if (status === "REJECTED") {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="destructive" className="cursor-help flex items-center gap-1 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30 px-2.5 py-0.5 text-xs font-semibold">
                <AlertCircle className="w-3.5 h-3.5" /> Bị Từ chối
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="bg-red-600 text-white border-none shadow-xl max-w-[250px] p-3 rounded-xl">
              <p className="font-bold mb-1 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> Admin yêu cầu sửa:</p>
              <p className="text-sm text-red-100 leading-relaxed">{reason || "Nội dung chưa đạt chuẩn, vui lòng kiểm tra lại."}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 animate-pulse px-2.5 py-0.5 text-xs font-semibold">Chờ duyệt</Badge>;
  };

  return (
    <div className="p-4 md:p-6 space-y-5 bg-stone-50 dark:bg-stone-950 min-h-screen animate-in fade-in duration-500 font-sans text-stone-900 dark:text-stone-100">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-stone-900 p-4 md:px-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-stone-800 dark:text-stone-50 tracking-tight">Quản lý Khóa học</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-1 text-sm font-medium">Trung tâm kiểm soát nội dung và doanh thu của bạn.</p>
        </div>
        <Link href="/teacher/courses/create">
          <Button className="bg-amber-600 hover:bg-amber-700 active:scale-95 transition-all text-white shadow-md shadow-amber-600/20 rounded-xl font-bold px-5 py-2.5 text-sm h-auto">
            <PlusCircle className="w-4 h-4 mr-2" /> Tạo Đề thi mới
          </Button>
        </Link>
      </div>

      {/* 2. STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm rounded-2xl overflow-hidden group hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
          <CardContent className="p-4 md:p-5 flex items-center gap-4">
            <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-xl text-stone-600 dark:text-stone-400 group-hover:bg-amber-100 group-hover:text-amber-600 dark:group-hover:bg-amber-900/30 dark:group-hover:text-amber-500 transition-colors">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-0.5">Tổng khóa học</p>
              <p className="text-2xl font-black text-stone-800 dark:text-white leading-none">{totalCourses}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm rounded-2xl overflow-hidden group hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
          <CardContent className="p-4 md:p-5 flex items-center gap-4">
            <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-xl text-stone-600 dark:text-stone-400 group-hover:bg-amber-100 group-hover:text-amber-600 dark:group-hover:bg-amber-900/30 dark:group-hover:text-amber-500 transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-0.5">Tổng lượt làm bài</p>
              <p className="text-2xl font-black text-stone-800 dark:text-white leading-none">{totalStudents}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm rounded-2xl overflow-hidden group hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
          <CardContent className="p-4 md:p-5 flex items-center gap-4">
            <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-xl text-stone-600 dark:text-stone-400 group-hover:bg-amber-100 group-hover:text-amber-600 dark:group-hover:bg-amber-900/30 dark:group-hover:text-amber-500 transition-colors">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-0.5">Đang hoạt động</p>
              <p className="text-2xl font-black text-stone-800 dark:text-white leading-none">{activeCourses}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. MAIN TABLE */}
      <Card className="border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden rounded-2xl bg-white dark:bg-stone-900">
        
        {/* Table Toolbar */}
        <div className="p-4 md:px-5 border-b border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-50/50 dark:bg-stone-900/50">
          <h2 className="text-base font-bold flex items-center gap-2 text-stone-800 dark:text-stone-100">
            <BookOpen className="w-4 h-4 text-amber-500" /> Danh sách Đề thi của tôi
          </h2>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input 
              placeholder="Tìm kiếm tên đề thi..." 
              className="pl-9 bg-white dark:bg-stone-950 border-stone-200 dark:border-stone-800 rounded-lg h-9 text-sm font-medium focus-visible:ring-amber-500" 
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-amber-500 h-8 w-8" />
              <p className="text-stone-500 text-sm font-medium animate-pulse">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-stone-100/50 dark:bg-stone-950/50">
                <TableRow className="border-stone-200 dark:border-stone-800 hover:bg-transparent">
                  <TableHead className="w-[350px] font-bold text-stone-500 dark:text-stone-400 py-3 px-5 uppercase text-[10px] tracking-wider">Khóa học / Đề thi</TableHead>
                  <TableHead className="font-bold text-stone-500 dark:text-stone-400 py-3 px-5 uppercase text-[10px] tracking-wider">Trạng thái duyệt</TableHead>
                  <TableHead className="font-bold text-stone-500 dark:text-stone-400 py-3 px-5 uppercase text-[10px] tracking-wider">Thống kê</TableHead>
                  <TableHead className="font-bold text-stone-500 dark:text-stone-400 py-3 px-5 uppercase text-[10px] tracking-wider text-center">Đánh giá</TableHead>
                  <TableHead className="text-right font-bold text-stone-500 dark:text-stone-400 py-3 px-5 uppercase text-[10px] tracking-wider">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-16 text-stone-400 text-sm font-medium">Bạn chưa tạo đề thi nào, hoặc không tìm thấy kết quả.</TableCell></TableRow>
                ) : filteredCourses.map((course) => (
                  <TableRow key={course.id} className="hover:bg-stone-50/80 dark:hover:bg-stone-800/30 transition-colors border-stone-100 dark:border-stone-800 group">
                    <TableCell className="p-4 px-5">
                      <div className="flex gap-4 items-center">
                        <div className="relative h-14 w-20 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0 border border-stone-200 dark:border-stone-700 shadow-sm group-hover:shadow-md transition-shadow">
                          {course.thumbnail ? (
                            <Image src={course.thumbnail} alt={course.title} fill className="object-cover transition-transform group-hover:scale-105 duration-500" />
                          ) : <div className="flex items-center justify-center h-full text-xs text-stone-400"><BookOpen className="w-5 h-5 opacity-40"/></div>}
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <div className="font-bold text-sm text-stone-800 dark:text-stone-100 line-clamp-2 leading-tight">{course.title}</div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                             <Badge variant="secondary" className="text-[9px] px-2 py-0 h-5 font-bold bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 uppercase tracking-wider rounded-md">
                               {course.category || "Chưa phân loại"}
                             </Badge>
                             
                             {course.category === "PRO" || course.price > 0 ? (
                                <Badge className="text-[9px] px-2 py-0 h-5 font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white border-none shadow-sm rounded-md flex items-center gap-1">
                                  <Crown className="w-3 h-3"/> PRO • 50.000đ
                                </Badge>
                             ) : (
                                <Badge variant="outline" className="text-[9px] px-2 py-0 h-5 font-bold text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 rounded-md flex items-center gap-1">
                                  <LockOpen className="w-3 h-3"/> FREE • 0đ
                                </Badge>
                             )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5">
                      {renderStatus(course.approvalStatus, course.rejectionReason)}
                    </TableCell>
                    <TableCell className="px-5">
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                           <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                          {new Intl.NumberFormat('vi-VN', {style:'currency',currency:'VND'}).format(course.revenue || 0)}
                        </div>
                        <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 w-fit px-2 py-0.5 rounded-md">
                           <Users className="w-3 h-3 text-blue-500" /> {course.sales || 0} lượt làm
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 text-center">
                      <div className="flex items-center justify-center gap-1 font-bold text-amber-500 bg-amber-50 dark:bg-amber-500/10 w-fit mx-auto px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-500/20">
                        {course.avgRating > 0 ? (
                          <>
                            <span className="text-sm">{Number(course.avgRating).toFixed(1)}</span>
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                          </>
                        ) : <span className="text-stone-400 dark:text-stone-500 text-[11px] font-semibold">Chưa có</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-5">
                      <div className="flex justify-end gap-2">
                        
                        {/* KHÓA NÚT SỬA */}
                        {course.approvalStatus === "APPROVED" || course.approvalStatus === "PENDING" ? (
                          <TooltipProvider delayDuration={100}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-block">
                                  <Button variant="outline" size="icon" disabled className="h-8 w-8 rounded-lg opacity-50 cursor-not-allowed border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900">
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="bg-stone-800 text-white border-none rounded-lg px-3 py-2 text-xs font-medium shadow-xl">
                                <p>{course.approvalStatus === "APPROVED" ? "Đề đã xuất bản, không thể sửa" : "Đang chờ Admin duyệt, không thể sửa"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <TooltipProvider delayDuration={100}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link href={`/teacher/courses/${course.id}`}>
                                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-stone-200 dark:border-stone-700 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50 dark:text-stone-300 dark:hover:text-amber-400 dark:hover:border-amber-800 dark:bg-stone-900 dark:hover:bg-amber-900/20 transition-all shadow-sm">
                                            <Pencil className="w-3.5 h-3.5" />
                                        </Button>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent className="bg-amber-600 text-white border-none rounded-lg px-3 py-2 text-xs font-medium shadow-xl"><p>Chỉnh sửa Đề thi</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        <TooltipProvider delayDuration={100}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        className="h-8 w-8 rounded-lg border-stone-200 dark:border-stone-700 text-red-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:border-red-900/50 dark:bg-stone-900 transition-all shadow-sm"
                                        onClick={() => handleDelete(course.id)}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-red-600 text-white border-none rounded-lg px-3 py-2 text-xs font-medium shadow-xl"><p>Xóa Đề thi vĩnh viễn</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
}