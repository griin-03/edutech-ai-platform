"use client";

import { useEffect, useState } from "react";
import { getPendingCourses, publishCourse, rejectCourse } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea"; // Cần cài component này hoặc dùng input thường
import { Loader2, Eye, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function ModerationPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    getPendingCourses().then((data) => {
      setCourses(data);
      setLoading(false);
    });
  };

  const handlePublish = async (id: number) => {
    await publishCourse(id);
    toast.success("Khóa học đã được xuất bản!");
    loadData();
  };

  const handleReject = async () => {
    if (!selectedCourseId) return;
    await rejectCourse(selectedCourseId, rejectReason);
    toast.info("Đã từ chối khóa học.");
    setSelectedCourseId(null);
    setRejectReason("");
    loadData();
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold">Kiểm duyệt Nội dung</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? <Loader2 className="animate-spin" /> : (
            courses.length === 0 ? <p className="text-slate-500">Không có khóa học nào chờ duyệt.</p> :
            courses.map((course) => (
            <Card key={course.id} className="overflow-hidden shadow-md">
                <div className="relative h-40 w-full bg-slate-200">
                  {course.thumbnail ? (
                     <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                  ) : <div className="flex items-center justify-center h-full text-slate-400">No Image</div>}
                  <Badge className="absolute top-2 right-2 bg-yellow-500">Pending</Badge>
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
                    <p className="text-sm text-slate-500">GV: {course.author.name}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="text-xs text-slate-500">Giá: {course.price > 0 ? `${course.price} đ` : 'Miễn phí'}</div>
                    <div className="flex gap-2 w-full">
                        <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handlePublish(course.id)}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Duyệt
                        </Button>
                        
                        {/* Nút Từ chối mở ra Dialog nhập lý do */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="destructive" className="flex-1" onClick={() => setSelectedCourseId(course.id)}>
                                    <XCircle className="w-4 h-4 mr-1" /> Huỷ
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Lý do từ chối khóa học?</DialogTitle></DialogHeader>
                                <Textarea 
                                    placeholder="Ví dụ: Nội dung sơ sài, vi phạm bản quyền..." 
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                />
                                <DialogFooter>
                                    <Button onClick={handleReject} variant="destructive">Xác nhận Từ chối</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => window.open(`/courses/${course.id}`, '_blank')}>
                        <Eye className="w-4 h-4 mr-2" /> Xem trước nội dung
                    </Button>
                </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}