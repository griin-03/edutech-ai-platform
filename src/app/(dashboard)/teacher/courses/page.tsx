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

  // Tính toán số liệu tổng quan (Mini Dashboard)
  const totalCourses = courses.length;
  const totalStudents = courses.reduce((acc, c) => acc + c.sales, 0);
  const activeCourses = courses.filter(c => c.isPublished).length;

  // Lọc tìm kiếm
  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(filter.toLowerCase())
  );

  const renderStatus = (status: string, reason?: string) => {
    if (status === "APPROVED") return <Badge className="bg-green-600/10 text-green-700 hover:bg-green-600/20 border-green-200">Đã xuất bản</Badge>;
    if (status === "REJECTED") {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="destructive" className="cursor-help flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Từ chối
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="bg-red-600 text-white border-none">
              <p className="font-bold">Lý do từ chối:</p>
              <p>{reason || "Nội dung không đạt chuẩn"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200">Chờ duyệt</Badge>;
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen animate-in fade-in duration-500">
      
      {/* 1. HEADER & STATS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý Khóa học</h1>
          <p className="text-slate-500">Trung tâm kiểm soát nội dung và doanh thu từng khóa.</p>
        </div>
        <Link href="/teacher/courses/create">
          <Button className="bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200">
            <PlusCircle className="w-4 h-4 mr-2" /> Tạo khóa học mới
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-l-4 border-l-violet-500 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-violet-100 rounded-full text-violet-600"><BookOpen className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-slate-500">Tổng khóa học</p>
              <p className="text-2xl font-bold text-slate-900">{totalCourses}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600"><Users className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-slate-500">Tổng lượt học</p>
              <p className="text-2xl font-bold text-slate-900">{totalStudents}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-l-4 border-l-green-500 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full text-green-600"><DollarSign className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-slate-500">Đang kinh doanh</p>
              <p className="text-2xl font-bold text-slate-900">{activeCourses}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. MAIN TABLE */}
      <Card className="border-none shadow-md overflow-hidden">
        <div className="p-4 border-b bg-white flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Tìm kiếm khóa học..." 
              className="pl-9 bg-slate-50 border-none" 
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="p-0">
          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-violet-600 h-8 w-8" /></div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[350px]">Thông tin Khóa học</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hiệu quả Kinh doanh</TableHead>
                  <TableHead>Chất lượng</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-16 text-slate-400">Không tìm thấy khóa học nào.</TableCell></TableRow>
                ) : filteredCourses.map((course) => (
                  <TableRow key={course.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="flex gap-4 items-center">
                        <div className="relative h-16 w-24 rounded-lg overflow-hidden bg-slate-100 shrink-0 border">
                          {course.thumbnail ? (
                            <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                          ) : <div className="flex items-center justify-center h-full text-xs text-slate-400">No Image</div>}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 line-clamp-1">{course.title}</div>
                          <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                             <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 font-normal">{course.category}</Badge>
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
                        <div className="text-sm font-bold text-slate-900">
                          {new Intl.NumberFormat('vi-VN', {style:'currency',currency:'VND'}).format(course.revenue)}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                           <Users className="w-3 h-3" /> {course.sales} học viên
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-medium text-amber-500">
                        {course.avgRating > 0 ? (
                          <>
                            <span className="text-lg">{course.avgRating}</span>
                            <Star className="w-4 h-4 fill-amber-500" />
                          </>
                        ) : <span className="text-slate-400 text-sm font-normal">Chưa có</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 hover:text-blue-600 hover:border-blue-200">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:bg-red-50 hover:border-red-200"
                          onClick={() => handleDelete(course.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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