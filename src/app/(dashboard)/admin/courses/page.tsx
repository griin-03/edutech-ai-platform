"use client";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { getCourses, createCourse, updateCourse, deleteCourse } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox"; // Cần cài: npx shadcn@latest add checkbox
import { Pencil, Trash2, Plus, Loader2, BookOpen, Crown } from "lucide-react";
import { toast } from "sonner";

const formatVND = (price: number) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await getCourses();
    setCourses(data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Xử lý giá trị checkbox isPro vì mặc định FormData không lấy nếu không check
    if (!formData.has("isPro")) formData.append("isPro", "false");

    const res = currentCourse 
      ? await updateCourse(currentCourse.id, formData) 
      : await createCourse(formData);
      
    if (res.success) {
      toast.success(res.message);
      setIsOpen(false);
      loadData();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-stone-800">Kho Tài Nguyên Học Tập</h1>
           <p className="text-stone-500 text-sm">Quản lý các khóa học Miễn phí và Premium (Pro)</p>
        </div>
        <Button onClick={() => { setCurrentCourse(null); setIsOpen(true); }} className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-900/20">
          <Plus className="mr-2 h-4 w-4" /> Thêm khóa học mới
        </Button>
      </div>

      <div className="rounded-xl border shadow-sm bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-stone-50">
            <TableRow>
              <TableHead className="w-[400px]">Thông tin khóa học</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Giá bán</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow><TableCell colSpan={5} className="text-center h-32"><Loader2 className="animate-spin inline text-amber-600"/></TableCell></TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.id} className="hover:bg-stone-50/50 transition-colors">
                  <TableCell>
                     <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", course.isPro ? "bg-amber-100" : "bg-blue-100")}>
                           {course.isPro ? <Crown className="h-5 w-5 text-amber-600"/> : <BookOpen className="h-5 w-5 text-blue-600" />}
                        </div>
                        <div>
                           <p className="font-bold text-stone-800 flex items-center gap-2">
                             {course.title}
                             {course.isPro && <Badge className="bg-amber-500 text-[9px] h-4">PRO</Badge>}
                           </p>
                           <p className="text-xs text-stone-500 line-clamp-1">{course.description}</p>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell>
                     {course.price === 0 ? (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Miễn phí</Badge>
                     ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Trả phí</Badge>
                     )}
                  </TableCell>
                  <TableCell className="font-mono font-bold text-stone-700">
                    {course.price === 0 ? "0 ₫" : formatVND(course.price)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={course.isPublished ? "default" : "secondary"}>
                      {course.isPublished ? "Đang bán" : "Bản nháp"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="hover:text-blue-600" onClick={() => { setCurrentCourse(course); setIsOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:text-red-600" onClick={async () => {
                       if(confirm("Xóa khóa học này?")) { await deleteCourse(course.id); loadData(); }
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{currentCourse ? "Chỉnh sửa thông tin" : "Tạo mới khóa học"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <div>
               <label className="text-sm font-bold text-stone-700">Tên khóa học</label>
               <Input name="title" defaultValue={currentCourse?.title} required className="mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-sm font-bold text-stone-700">Giá tiền (VND)</label>
                   <Input name="price" type="number" defaultValue={currentCourse?.price || 0} className="mt-1" />
                </div>
                <div>
                   <label className="text-sm font-bold text-stone-700">Trạng thái</label>
                   <Select name="isPublished" defaultValue={currentCourse?.isPublished ? "true" : "false"}>
                      <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">Lưu nháp</SelectItem>
                        <SelectItem value="true">Công khai</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
            </div>

            <div className="flex items-center space-x-2 bg-amber-50 p-3 rounded-lg border border-amber-100">
                <input type="checkbox" name="isPro" id="isPro" defaultChecked={currentCourse?.isPro} value="true" className="h-4 w-4 accent-amber-600" />
                <label htmlFor="isPro" className="text-sm font-bold text-amber-800 cursor-pointer">
                    Đánh dấu là khóa học PRO (Yêu cầu tài khoản Premium)
                </label>
            </div>

            <Button type="submit" className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold h-12">
               {currentCourse ? "Cập nhật khóa học" : "Tạo khóa học"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}