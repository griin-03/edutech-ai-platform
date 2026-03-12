"use client";

import { useState, useEffect } from "react";
import { getActiveTeachers } from "./actions"; // 🔥 Import hàm lấy dữ liệu từ DB
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Star, MessageCircle, Download, UserPlus, 
  GraduationCap, BookOpen, Award, CheckCircle2, Loader2, ChevronDown, ChevronUp
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function StudentTeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // 🔥 State để theo dõi xem đang mở danh sách khóa học của Giảng viên nào
  const [expandedTeacherId, setExpandedTeacherId] = useState<string | number | null>(null);

  // Lấy dữ liệu từ Database khi trang vừa load
  useEffect(() => {
    async function loadData() {
      const data = await getActiveTeachers();
      setTeachers(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const filteredTeachers = teachers.filter(teacher => 
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Hàm xử lý khi bấm nút Tải Về
  const handleDownload = (courseTitle: string) => {
    // Tương lai bạn sẽ gắn API tải file PDF vào đây
    toast.success(`Đang tải dữ liệu: ${courseTitle}`);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 dark:text-stone-50 flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
              <GraduationCap className="w-7 h-7" />
            </div>
            Kết Nối Giảng Viên
          </h1>
          <p className="text-stone-500 dark:text-stone-400 mt-2 text-base">
            Khám phá đội ngũ giảng viên chuyên gia, đăng ký học và tải các bộ đề độc quyền.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
          <Input 
            placeholder="Tìm tên hoặc môn học..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 rounded-xl focus-visible:ring-amber-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-amber-500">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-bold text-stone-500 dark:text-stone-400">Đang tải dữ liệu Giảng viên...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <Card key={teacher.id} className="overflow-hidden border-stone-200/60 dark:border-stone-800 bg-white dark:bg-stone-900/50 hover:shadow-xl hover:shadow-amber-900/5 transition-all duration-300 group rounded-[1.5rem]">
              
              <CardHeader className="p-6 pb-0 relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-20 h-20 rounded-2xl bg-stone-100 dark:bg-stone-800 p-1 border border-stone-200 dark:border-stone-700 relative overflow-hidden shrink-0">
                    <Image src={teacher.image} alt={teacher.name} fill className="object-cover rounded-xl" />
                  </div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 font-bold px-3 py-1 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {teacher.rating} 
                    <span className="font-normal text-amber-600/70 dark:text-amber-500/50 ml-0.5">({teacher.reviews})</span>
                  </Badge>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    {teacher.name}
                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  </h3>
                  <p className="text-amber-600 dark:text-amber-400 font-medium text-sm mt-1">{teacher.subject}</p>
                  <p className="text-stone-500 dark:text-stone-400 text-sm mt-3 line-clamp-2 leading-relaxed">
                    {teacher.about}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-5">
                
                <div className="mb-6 space-y-3">
                  <div className="flex items-center gap-4 text-sm text-stone-600 dark:text-stone-300 font-medium border-y border-stone-100 dark:border-stone-800 py-3">
                    <div className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-stone-400" /> {teacher.coursesCount} Khóa học/Đề</div>
                    <div className="w-1 h-1 rounded-full bg-stone-300 dark:bg-stone-700"></div>
                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"><Award className="w-4 h-4" /> Xem Review</div>
                  </div>
                </div>

                {/* BỘ NÚT TƯƠNG TÁC */}
                <div className="grid grid-cols-2 gap-3">
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md shadow-amber-600/20">
                    <UserPlus className="w-4 h-4 mr-2" /> Theo dõi
                  </Button>
                  <Button variant="outline" className="w-full rounded-xl border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800" onClick={() => toast.info("Tính năng Chat đang được phát triển!")}>
                    <MessageCircle className="w-4 h-4 mr-2 text-blue-500" /> Chat riêng
                  </Button>

                  {/* 🔥 NÚT BẤM XỔ XUỐNG ĐƯỢC NÂNG CẤP THÔNG MINH */}
                  <Button 
                    variant="secondary" 
                    disabled={teacher.coursesCount === 0} // Vô hiệu hóa nếu không có đề
                    onClick={() => setExpandedTeacherId(expandedTeacherId === teacher.id ? null : teacher.id)}
                    className={`w-full col-span-2 rounded-xl transition-all duration-300 ${
                      teacher.coursesCount === 0 
                      ? 'bg-stone-50 text-stone-400 dark:bg-stone-900/50 dark:text-stone-600 cursor-not-allowed opacity-70' 
                      : expandedTeacherId === teacher.id 
                        ? 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300' 
                        : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200'
                    }`}
                  >
                    <Download className="w-4 h-4 mr-2" /> 
                    
                    {/* Đổi chữ linh hoạt dựa vào số lượng khóa học */}
                    {teacher.coursesCount === 0 
                      ? "Chưa có đề thi nào" 
                      : (expandedTeacherId === teacher.id ? "Đóng danh sách" : "Tải Đề & Xem Khóa Học")}
                    
                    {/* Chỉ hiện mũi tên xổ xuống nếu có khóa học */}
                    {teacher.coursesCount > 0 && (
                      expandedTeacherId === teacher.id ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />
                    )}
                  </Button>
                </div>

                {/* 🔥 KHU VỰC HIỂN THỊ DANH SÁCH ĐỀ THI (CHỈ HIỆN KHI BẤM NÚT TRÊN VÀ CÓ KHÓA HỌC) */}
                {expandedTeacherId === teacher.id && teacher.coursesCount > 0 && (
                  <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 animate-in slide-in-from-top-2 fade-in duration-300">
                    <h4 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-3">Đề thi đang phát hành ({teacher.coursesCount})</h4>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                      {teacher.courses.map((course: any) => (
                        <div key={course.id} className="flex items-center justify-between bg-stone-50 dark:bg-stone-900 p-3 rounded-xl border border-stone-200/60 dark:border-stone-700/50 group/item hover:border-amber-300 dark:hover:border-amber-700/50 transition-colors">
                          <div className="pr-3">
                            <p className="font-bold text-sm text-stone-800 dark:text-stone-200 line-clamp-1 group-hover/item:text-amber-600 dark:group-hover/item:text-amber-400 transition-colors">{course.title}</p>
                            <Badge variant="outline" className="mt-1 text-[10px] border-stone-200 dark:border-stone-700">{course.category || "Miễn phí"}</Badge>
                          </div>
                          <Button 
                            onClick={() => handleDownload(course.title)}
                            size="sm" 
                            className="bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 dark:text-amber-400 rounded-lg shrink-0 font-bold"
                          >
                            Tải về
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          ))}

          {filteredTeachers.length === 0 && !isLoading && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl text-stone-500">
              Không tìm thấy giảng viên nào đang phát hành đề thi.
            </div>
          )}
        </div>
      )}
    </div>
  );
}