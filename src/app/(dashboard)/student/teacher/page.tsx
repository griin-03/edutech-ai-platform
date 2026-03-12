"use client";

import { useState, useEffect } from "react";
import { getActiveTeachers, getUserCourses, getTeacherCourses, getCourseStats, checkDownloadPermission } from "./actions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Star, MessageCircle, Download, UserPlus, 
  GraduationCap, BookOpen, Award, CheckCircle2, Loader2, 
  ChevronDown, ChevronUp, BookMarked, Users, DollarSign,
  Clock, TrendingUp, Shield, Sparkles, Crown, Lock
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useSession } from "next-auth/react";

export default function StudentTeachersPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  
  // Debug: Log session status
  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session);
    console.log("User data:", user);
  }, [session, status, user]);

  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTeacherId, setExpandedTeacherId] = useState<string | number | null>(null);
  const [userCourses, setUserCourses] = useState<any[]>([]);
  const [teacherCourses, setTeacherCourses] = useState<any[]>([]);
  const [courseStats, setCourseStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("teachers");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showCourseDetail, setShowCourseDetail] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Kiểm tra user có phải PRO không
  const isPro = user?.planType === "PRO" || user?.role === "ADMIN" || user?.role === "TEACHER";

  // Lấy dữ liệu từ Database khi trang vừa load
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Load teachers
        const teachersData = await getActiveTeachers();
        setTeachers(teachersData);

        // Load user-specific data if logged in
        if (user?.id) {
          console.log("Loading data for user:", user.id);
          
          if (user?.role === "TEACHER") {
            // Teacher: Load their courses
            const courses = await getTeacherCourses(user.id);
            setTeacherCourses(courses);
            
            // Load stats
            const stats = await getCourseStats(user.id, "TEACHER");
            setCourseStats(stats);
          } else {
            // Student: Load purchased courses
            const courses = await getUserCourses(user.id);
            console.log("User courses loaded:", courses);
            setUserCourses(courses);
            
            // Load stats
            const stats = await getCourseStats(user.id, "USER");
            setCourseStats(stats);
          }
        } else {
          console.log("No user logged in");
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        toast.error("Không thể tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user?.id, user?.role]);

  const filteredTeachers = teachers.filter(teacher => 
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Hàm xử lý khi bấm nút Tải Về - ĐÃ SỬA LOGIC KIỂM TRA USER
  const handleDownload = async (course: any) => {
    console.log("Download clicked - User:", user);
    console.log("Download clicked - Course:", course);
    
    // Kiểm tra đăng nhập
    if (!user || !user.id) {
      console.log("User not logged in");
      toast.error(
        <div className="flex flex-col gap-2">
          <span className="font-bold">🔐 Cần đăng nhập</span>
          <span className="text-sm">Vui lòng đăng nhập để tải đề thi</span>
          <Button 
            size="sm" 
            className="mt-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => window.location.href = "/dang-nhap"}
          >
            Đăng nhập ngay
          </Button>
        </div>,
        { duration: 5000 }
      );
      return;
    }

    setDownloadingId(course.id);
    
    try {
      console.log("Checking permission for:", { userId: user.id, courseId: course.id, price: course.price });
      
      // Kiểm tra quyền tải
      const canDownload = await checkDownloadPermission(user.id, course.id, course.price);
      console.log("Download permission result:", canDownload);
      
      if (!canDownload) {
        if (course.price > 0) {
          toast.error(
            <div className="flex flex-col gap-2">
              <span className="font-bold">⚠️ Cần nâng cấp PRO</span>
              <span className="text-sm">Bạn cần mua khóa học hoặc nâng cấp PRO để tải đề thi này</span>
              <Button 
                size="sm" 
                className="mt-2 bg-amber-600 hover:bg-amber-700"
                onClick={() => window.location.href = "/pricing"}
              >
                Nâng cấp ngay
              </Button>
            </div>,
            { duration: 5000 }
          );
        } else {
          toast.error("Bạn không có quyền tải đề thi này");
        }
        return;
      }

      // Giả lập quá trình tải thành công
      toast.loading(`Đang chuẩn bị tải: ${course.title}...`, { id: course.id });
      
      // Mô phỏng quá trình tải
      setTimeout(() => {
        // Tạo một link tải giả
        const link = document.createElement('a');
        link.href = `#`; // Thay bằng URL thật của file PDF
        link.download = `${course.title}.pdf`;
        link.click();
        
        toast.success(
          <div className="flex flex-col gap-1">
            <span className="font-bold">✅ Tải thành công!</span>
            <span className="text-sm">{course.title} đã được thêm vào My Courses</span>
          </div>,
          { id: course.id }
        );

        // Refresh danh sách khóa học đã mua
        if (user?.id) {
          getUserCourses(user.id).then(courses => {
            setUserCourses(courses);
          });
        }
      }, 1500);

    } catch (error) {
      console.error("Lỗi tải file:", error);
      toast.error("Có lỗi xảy ra khi tải file", { id: course.id });
    } finally {
      setDownloadingId(null);
    }
  };

  // Hàm xem chi tiết khóa học
  const handleViewCourse = (course: any) => {
    setSelectedCourse(course);
    setShowCourseDetail(true);
  };

  // Render teacher card (giữ nguyên phần renderTeacherCard như cũ)
  const renderTeacherCard = (teacher: any) => (
    <Card key={teacher.id} className="overflow-hidden border-stone-200/60 dark:border-stone-800 bg-white dark:bg-stone-900/50 hover:shadow-xl hover:shadow-amber-900/5 transition-all duration-300 group rounded-[1.5rem]">
      {/* ... giữ nguyên phần renderTeacherCard như code trước ... */}
      <CardHeader className="p-6 pb-0 relative">
        <div className="flex justify-between items-start mb-4">
          <div className="w-20 h-20 rounded-2xl bg-stone-100 dark:bg-stone-800 p-1 border border-stone-200 dark:border-stone-700 relative overflow-hidden shrink-0">
            <Image 
              src={teacher.image} 
              alt={teacher.name} 
              fill 
              className="object-cover rounded-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.id}`;
              }}
            />
          </div>
          <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 font-bold px-3 py-1 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {teacher.rating} 
            <span className="font-normal text-amber-600/70 dark:text-amber-500/50 ml-0.5">({teacher.reviews})</span>
          </Badge>
        </div>

        <div>
          <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            {teacher.name}
            {teacher.verified && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
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
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-stone-400" /> 
              {teacher.coursesCount} Đề thi
            </div>
            <div className="w-1 h-1 rounded-full bg-stone-300 dark:bg-stone-700"></div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-stone-400" />
              {teacher.students || 120}+ học viên
            </div>
          </div>

          {/* Top courses tags */}
          {teacher.topCourses && teacher.topCourses.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {teacher.topCourses.map((topic: string, idx: number) => (
                <Badge key={idx} variant="outline" className="bg-stone-50 dark:bg-stone-800">
                  {topic}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* BỘ NÚT TƯƠNG TÁC */}
        <div className="grid grid-cols-2 gap-3">
          <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md shadow-amber-600/20">
            <UserPlus className="w-4 h-4 mr-2" /> Theo dõi
          </Button>
          <Button 
            variant="outline" 
            className="w-full rounded-xl border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800" 
            onClick={() => toast.info("Tính năng Chat đang được phát triển!")}
          >
            <MessageCircle className="w-4 h-4 mr-2 text-blue-500" /> Chat
          </Button>

          {/* NÚT BẤM XỔ XUỐNG */}
          <Button 
            variant="secondary" 
            disabled={teacher.coursesCount === 0}
            onClick={() => setExpandedTeacherId(expandedTeacherId === teacher.id ? null : teacher.id)}
            className={`w-full col-span-2 rounded-xl transition-all duration-300 ${
              teacher.coursesCount === 0 
              ? 'bg-stone-50 text-stone-400 dark:bg-stone-900/50 dark:text-stone-600 cursor-not-allowed opacity-70' 
              : expandedTeacherId === teacher.id 
                ? 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300' 
                : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200'
            }`}
          >
            <BookMarked className="w-4 h-4 mr-2" />
            {teacher.coursesCount === 0 
              ? "Chưa có đề thi" 
              : (expandedTeacherId === teacher.id ? "Thu gọn" : "Xem đề thi")}
            {teacher.coursesCount > 0 && (
              expandedTeacherId === teacher.id ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />
            )}
          </Button>
        </div>

        {/* DANH SÁCH ĐỀ THI */}
        {expandedTeacherId === teacher.id && teacher.coursesCount > 0 && (
          <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 animate-in slide-in-from-top-2 fade-in duration-300">
            <h4 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-3">
              Đề thi ({teacher.coursesCount})
            </h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {teacher.courses.map((course: any) => {
                const isFree = course.price === 0 || course.price === null;
                const canDownload = isFree || isPro || user?.role === "TEACHER" || user?.role === "ADMIN";
                
                return (
                  <div 
                    key={course.id} 
                    className="flex items-center justify-between bg-stone-50 dark:bg-stone-900 p-3 rounded-xl border border-stone-200/60 dark:border-stone-700/50 group/item hover:border-amber-300 dark:hover:border-amber-700/50 transition-colors"
                  >
                    <div className="flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-stone-800 dark:text-stone-200 line-clamp-1 group-hover/item:text-amber-600 dark:group-hover/item:text-amber-400 transition-colors">
                          {course.title}
                        </p>
                        {!isFree && <Crown className="w-3 h-3 text-amber-500" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] border-stone-200 dark:border-stone-700">
                          {course.category || "Đề thi"}
                        </Badge>
                        {!isFree && (
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 text-[10px]">
                            PRO
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleDownload(course)}
                      disabled={downloadingId === course.id}
                      size="sm" 
                      className={`rounded-lg shrink-0 ${
                        !user 
                          ? 'bg-stone-200 text-stone-500 dark:bg-stone-800 dark:text-stone-500 cursor-not-allowed' 
                          : 'bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 dark:text-amber-400'
                      }`}
                    >
                      {downloadingId === course.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : !user ? (
                        <>
                          <Lock className="w-3 h-3 mr-1" /> Đăng nhập
                        </>
                      ) : (
                        <>
                          <Download className="w-3 h-3 mr-1" /> Tải
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Render student dashboard
  const renderStudentDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Đề thi đã mua</p>
                <p className="text-3xl font-bold">{courseStats?.totalCourses || 0}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Đã chi tiêu</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(courseStats?.totalSpent || 0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Đề thi có thể tải</p>
                <p className="text-3xl font-bold">{courseStats?.totalLessonsAvailable || 0}</p>
              </div>
              <GraduationCap className="w-8 h-8 text-purple-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hiển thị trạng thái PRO */}
      {isPro && (
        <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6" />
              <div>
                <p className="font-bold">Tài khoản PRO</p>
                <p className="text-sm text-amber-100">Bạn có thể tải tất cả đề thi PRO</p>
              </div>
            </div>
            <Badge className="bg-white text-amber-600 border-0">Đã kích hoạt</Badge>
          </CardContent>
        </Card>
      )}

      {/* My Courses List */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-amber-500" />
            Đề thi của tôi
          </h3>
        </CardHeader>
        <CardContent>
          {!user ? (
            <div className="text-center py-12 text-stone-500">
              <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Vui lòng đăng nhập để xem đề thi của bạn</p>
              <Button 
                className="mt-4 bg-amber-600 hover:bg-amber-700"
                onClick={() => window.location.href = "/dang-nhap"}
              >
                Đăng nhập
              </Button>
            </div>
          ) : userCourses.length === 0 ? (
            <div className="text-center py-12 text-stone-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Bạn chưa mua đề thi nào</p>
              <p className="text-sm mt-2">Hãy khám phá các đề thi từ giảng viên bên dưới!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-900 rounded-xl">
                  <div className="flex-1">
                    <h4 className="font-bold">{course.title}</h4>
                    <p className="text-sm text-stone-500">Giảng viên: {course.teacher?.name}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="w-3 h-3" />
                        <span>Mua ngày: {new Date(course.purchasedAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleDownload(course)} 
                    disabled={downloadingId === course.id}
                    className="bg-amber-600 hover:bg-amber-700"
                    size="sm"
                  >
                    {downloadingId === course.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Tải lại
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Main render
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 dark:text-stone-50 flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
              <GraduationCap className="w-7 h-7" />
            </div>
            {user?.role === "TEACHER" ? "Quản lý giảng dạy" : "Kết Nối Giảng Viên"}
          </h1>
          <p className="text-stone-500 dark:text-stone-400 mt-2 text-base">
            {user?.role === "TEACHER" 
              ? "Quản lý đề thi và theo dõi hiệu suất giảng dạy"
              : "Khám phá đội ngũ giảng viên chuyên gia, tải các bộ đề thi độc quyền."
            }
          </p>
        </div>

        {user?.role !== "TEACHER" && (
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
            <Input 
              placeholder="Tìm tên hoặc môn học..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 rounded-xl focus-visible:ring-amber-500"
            />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-amber-500">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p className="font-bold text-stone-500 dark:text-stone-400">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          {/* Tabs for different views */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              {user?.role === "TEACHER" ? (
                <>
                  <TabsTrigger value="dashboard" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700">
                    <Shield className="w-4 h-4 mr-2" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="teachers" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700">
                    <Users className="w-4 h-4 mr-2" />
                    Đồng nghiệp
                  </TabsTrigger>
                </>
              ) : (
                <>
                  <TabsTrigger value="teachers" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700">
                    <Users className="w-4 h-4 mr-2" />
                    Giảng viên
                  </TabsTrigger>
                  <TabsTrigger value="my-courses" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700">
                    <BookMarked className="w-4 h-4 mr-2" />
                    Đề thi của tôi
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
              {/* Teacher dashboard - có thể thêm sau */}
              <Card>
                <CardContent className="p-6">
                  <p>Dashboard cho giảng viên đang phát triển...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="my-courses" className="mt-6">
              {renderStudentDashboard()}
            </TabsContent>

            <TabsContent value="teachers" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTeachers.map(renderTeacherCard)}
                {filteredTeachers.length === 0 && (
                  <div className="col-span-full py-20 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl text-stone-500">
                    Không tìm thấy giảng viên nào phù hợp.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Course Detail Dialog */}
      <Dialog open={showCourseDetail} onOpenChange={setShowCourseDetail}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              {selectedCourse?.title}
            </DialogTitle>
            <DialogDescription>
              Chi tiết đề thi
            </DialogDescription>
          </DialogHeader>

          {selectedCourse && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-stone-50 dark:bg-stone-900 rounded-xl">
                <div className="flex-1">
                  <p className="text-sm text-stone-600 dark:text-stone-400">Giảng viên</p>
                  <p className="font-bold">{selectedCourse.teacher?.name}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-stone-600 dark:text-stone-400">Danh mục</p>
                  <p className="font-bold">{selectedCourse.category || "Đề thi"}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-stone-600 dark:text-stone-400">Loại</p>
                  <p className="font-bold">
                    {selectedCourse.price > 0 ? (
                      <span className="text-amber-600 flex items-center gap-1">
                        <Crown className="w-4 h-4" /> PRO
                      </span>
                    ) : "Miễn phí"}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-2">Mô tả</h4>
                <p className="text-stone-600 dark:text-stone-400">{selectedCourse.description || "Chưa có mô tả"}</p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCourseDetail(false)}>
                  Đóng
                </Button>
                <Button 
                  onClick={() => handleDownload(selectedCourse)}
                  disabled={downloadingId === selectedCourse.id}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {downloadingId === selectedCourse.id ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Tải đề thi
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}