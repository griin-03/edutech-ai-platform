"use client";

import { useState } from "react";
import { createCourse } from "./actions";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; // Thư viện thông báo đẹp
import { Loader2, Sparkles, BookOpen, ArrowRight, X } from "lucide-react";
import Link from "next/link";

export default function CreateCoursePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("title", title);

    const res = await createCourse(formData);

    if (res.success) {
      toast.success(res.message); // Hiện thông báo xanh
      // Chuyển hướng sang trang Edit sau 1 giây
      setTimeout(() => {
        router.push(`/teacher/courses/${res.courseId}`);
      }, 1000);
    } else {
      toast.error(res.message); // Hiện thông báo đỏ nếu lỗi
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 animate-in fade-in zoom-in duration-500">
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-violet-200/30 blur-[100px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-200/30 blur-[100px]" />
      </div>

      <Card className="w-full max-w-2xl shadow-xl border-none relative z-10 overflow-hidden">
        {/* THANH TIẾN TRÌNH GIẢ LẬP */}
        <div className="h-1.5 w-full bg-slate-100">
          <div className="h-full w-[33%] bg-violet-600 rounded-r-full" />
        </div>

        <CardHeader className="text-center pt-10 pb-6">
          <div className="mx-auto bg-violet-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-violet-600">
            <Sparkles className="w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-bold text-slate-800">Đặt tên cho khóa học mới</CardTitle>
          <CardDescription className="text-lg text-slate-500 mt-2 max-w-lg mx-auto">
            Bạn muốn gọi "đứa con tinh thần" của mình là gì? <br/>
            Đừng lo, bạn hoàn toàn có thể đổi tên này sau.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-10 pb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="title" className="text-base font-semibold text-slate-700">Tiêu đề khóa học</Label>
              <div className="relative">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input 
                  id="title" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Thành thạo ReactJS trong 30 ngày..." 
                  className="pl-12 py-7 text-lg shadow-sm border-slate-200 focus:border-violet-500 focus:ring-violet-200"
                  autoFocus
                />
              </div>
              <p className="text-xs text-slate-500 text-right">
                {title.length}/60 ký tự
              </p>
            </div>

            {/* GỢI Ý TÊN HAY */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase mb-3">Mẹo đặt tên hay:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="text-sm text-slate-600 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Ngắn gọn & Súc tích
                </div>
                <div className="text-sm text-slate-600 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Nêu rõ kết quả đạt được
                </div>
                <div className="text-sm text-slate-600 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Nhắm đúng đối tượng
                </div>
                <div className="text-sm text-slate-600 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Dùng từ ngữ gây tò mò
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Link href="/teacher/courses" className="w-full">
                <Button type="button" variant="outline" className="w-full py-6 text-base hover:bg-slate-100">
                  <X className="w-5 h-5 mr-2" /> Hủy bỏ
                </Button>
              </Link>
              
              <Button 
                type="submit" 
                disabled={!title.trim() || isLoading} 
                className="w-full py-6 text-base bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200 transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang khởi tạo...
                  </>
                ) : (
                  <>
                    Tiếp tục <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        
        <CardFooter className="bg-slate-50/50 border-t py-4 text-center justify-center">
          <p className="text-xs text-slate-400">
            Bước 1 trong 3: Thiết lập thông tin cơ bản
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}