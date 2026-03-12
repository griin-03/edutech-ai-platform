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
  Search, BookOpen, Users, DollarSign, Star 
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

  // 🔥 NÂNG CẤP: Hiển thị trạng thái cực đẹp và hỗ trợ hiển thị lý do Từ chối
  const renderStatus = (status: string, reason?: string) => {
    if (status === "APPROVED") return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">Đã xuất bản</Badge>;
    if (status === "DRAFT") return <Badge className="bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">Bản nháp</Badge>;
    if (status === "REJECTED") {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="destructive" className="cursor-help flex items-center gap-1 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30">
                <AlertCircle className="w-3 h-3" /> Từ chối
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="bg-red-600 text-white border-none shadow-xl max-w-[250px] p-3">
              <p className="font-bold mb-1 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> Admin yêu cầu sửa:</p>
              <p className="text-sm text-red-100">{reason || "Nội dung chưa đạt chuẩn, vui lòng kiểm tra lại."}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 animate-pulse">Chờ duyệt</Badge>;
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen animate-in fade-in duration-500">
      
      {/* 1. HEADER & STATS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Quản lý Khóa học</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Trung tâm kiểm soát nội dung và doanh thu từng khóa.</p>
        </div>
        <Link href="/teacher/courses/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 rounded-xl font-bold">
            <PlusCircle className="w-5 h-5 mr-2" /> Tạo khóa học mới
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-slate-900 border-l-4 border-l-violet-500 border-y-slate-200 border-r-slate-200 dark:border-y-slate-800 dark:border-r-slate-800 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-violet-100 dark:bg-violet-500/10 rounded-xl text-violet-600 dark:text-violet-400"><BookOpen className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tổng khóa học</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{totalCourses}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-slate-900 border-l-4 border-l-blue-500 border-y-slate-200 border-r-slate-200 dark:border-y-slate-800 dark:border-r-slate-800 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400"><Users className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tổng lượt học</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{totalStudents}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-slate-900 border-l-4 border-l-emerald-500 border-y-slate-200 border-r-slate-200 dark:border-y-slate-800 dark:border-r-slate-800 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400"><DollarSign className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Đang kinh doanh</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{activeCourses}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. MAIN TABLE */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden rounded-3xl bg-white dark:bg-slate-900">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Tìm kiếm khóa học..." 
              className="pl-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl dark:text-white" 
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-blue-600 h-8 w-8" /></div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-950/50">
                <TableRow className="border-slate-100 dark:border-slate-800">
                  <TableHead className="w-[350px] font-bold text-slate-600 dark:text-slate-400">Thông tin Khóa học</TableHead>
                  <TableHead className="font-bold text-slate-600 dark:text-slate-400">Trạng thái</TableHead>
                  <TableHead className="font-bold text-slate-600 dark:text-slate-400">Hiệu quả Kinh doanh</TableHead>
                  <TableHead className="font-bold text-slate-600 dark:text-slate-400">Chất lượng</TableHead>
                  <TableHead className="text-right font-bold text-slate-600 dark:text-slate-400">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-16 text-slate-400 dark:text-slate-500">Không tìm thấy khóa học nào.</TableCell></TableRow>
                ) : filteredCourses.map((course) => (
                  <TableRow key={course.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors border-slate-100 dark:border-slate-800">
                    <TableCell>
                      <div className="flex gap-4 items-center">
                        <div className="relative h-16 w-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                          {course.thumbnail ? (
                            <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                          ) : <div className="flex items-center justify-center h-full text-xs text-slate-400 dark:text-slate-500"><BookOpen className="w-5 h-5 opacity-50"/></div>}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{course.title}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                             <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 font-bold border-slate-200 dark:border-slate-700 dark:text-slate-300">{course.category}</Badge>
                             <span>• {new Date(course.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {renderStatus(course.approvalStatus, course.rejectionReason)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {new Intl.NumberFormat('vi-VN', {style:'currency',currency:'VND'}).format(course.revenue)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                           <Users className="w-3 h-3" /> {course.sales} học viên
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-medium text-amber-500">
                        {course.avgRating > 0 ? (
                          <>
                            <span className="text-lg font-bold">{course.avgRating}</span>
                            <Star className="w-4 h-4 fill-amber-500" />
                          </>
                        ) : <span className="text-slate-400 dark:text-slate-500 text-sm font-normal">Chưa có</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        
                        {/* 🔥 NÂNG CẤP CHÍNH: KHÓA NÚT SỬA KHI ĐÃ DUYỆT HOẶC ĐANG CHỜ DUYỆT */}
                        {course.approvalStatus === "APPROVED" || course.approvalStatus === "PENDING" ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-block">
                                  <Button variant="outline" size="icon" disabled className="h-9 w-9 rounded-xl opacity-50 cursor-not-allowed dark:border-slate-700 dark:bg-slate-800">
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="bg-slate-800 text-white border-none">
                                <p>{course.approvalStatus === "APPROVED" ? "Đề đã xuất bản, không thể sửa" : "Đang chờ Admin duyệt, không thể sửa"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link href={`/teacher/courses/${course.id}`}>
                                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-700 hover:text-blue-600 hover:border-blue-300 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:border-blue-800 dark:bg-slate-900 transition-colors">
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent className="bg-blue-600 text-white border-none"><p>Chỉnh sửa Đề thi</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-700 text-red-500 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-500/10 dark:hover:border-red-900/50 dark:bg-slate-900 transition-colors"
                                        onClick={() => handleDelete(course.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-red-600 text-white border-none"><p>Xóa Đề thi</p></TooltipContent>
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