import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Users, BookOpen, GraduationCap, ShieldCheck, 
  ArrowUpRight, Clock, Activity, DollarSign, Percent 
} from "lucide-react";
import { format } from "date-fns"; 
import { vi } from "date-fns/locale";

export const dynamic = 'force-dynamic'; 

export default async function AdminDashboard() {
  // 1. LẤY DỮ LIỆU THẬT TỪ DB (BAO GỒM CẢ TIỀN & CẤU HÌNH)
  const [
    totalStudents,
    totalTeachers,
    totalAdmins,
    totalCourses,
    recentUsers,
    totalPosts,
    adminWallet, // Lấy ví admin
    systemConfig // Lấy cấu hình phí sàn
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.course.count().catch(() => 0), 
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      }
    }),
    prisma.post.count().catch(() => 0),
    // --- QUERY MỚI: Lấy tiền của Admin ---
    prisma.user.findFirst({ 
      where: { role: "ADMIN" },
      select: { balance: true }
    }),
    // --- QUERY MỚI: Lấy % Hoa hồng ---
    prisma.systemConfig.findFirst({
      select: { commissionRate: true }
    })
  ]);

  const totalUsers = totalStudents + totalTeachers + totalAdmins;
  const currentRevenue = adminWallet?.balance || 0; // Tiền thật trong ví
  const currentRate = systemConfig?.commissionRate || 20; // % Phí sàn hiện tại

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* 1. HEADER CHÀO MỪNG */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">Tổng quan hệ thống</h1>
          <p className="text-stone-500 mt-1">
            Cập nhật lần cuối: {format(new Date(), "HH:mm - dd/MM/yyyy", { locale: vi })}
          </p>
        </div>
        <div className="hidden md:flex gap-2">
            {/* THÊM BADGE HIỆN TỶ LỆ HOA HỒNG */}
            <Badge variant="outline" className="px-4 py-2 text-sm bg-blue-50 text-blue-700 border-blue-200">
                <Percent className="w-4 h-4 mr-2" /> Phí sàn: {currentRate}%
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm bg-green-50 text-green-700 border-green-200">
                <Activity className="w-4 h-4 mr-2" /> Hệ thống hoạt động tốt
            </Badge>
        </div>
      </div>

      {/* 2. CÁC THẺ SỐ LIỆU (STATS CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Tổng học viên */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">Học viên</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-stone-400 mt-1">+20% so với tháng trước</p>
          </CardContent>
        </Card>

        {/* Card 2: Tổng giáo viên */}
        <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">Giảng viên</CardTitle>
            <GraduationCap className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTeachers}</div>
            <p className="text-xs text-stone-400 mt-1">Đang hoạt động tích cực</p>
          </CardContent>
        </Card>

        {/* Card 3: Khóa học */}
        <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">Khóa học & Bài giảng</CardTitle>
            <BookOpen className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-stone-400 mt-1">{totalPosts} bài thảo luận</p>
          </CardContent>
        </Card>

        {/* Card 4: Doanh thu (HIỆN TIỀN THẬT TRONG VÍ ADMIN) */}
        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">Doanh thu Sàn (Ví Admin)</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {/* FORMAT TIỀN VND CHUẨN */}
            <div className="text-2xl font-bold text-slate-900">
               {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentRevenue)}
            </div>
            <p className="text-xs text-emerald-600 mt-1 font-bold flex items-center">
               <ArrowUpRight size={12} className="mr-1"/> Hoa hồng {currentRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. PHẦN CHÍNH: USER MỚI & BIỂU ĐỒ */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        
        {/* BẢNG USER MỚI */}
        <Card className="lg:col-span-4 border-none shadow-md">
          <CardHeader>
            <CardTitle>Thành viên mới gia nhập</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentUsers.length === 0 ? (
                <p className="text-center text-stone-500 py-4">Chưa có thành viên nào.</p>
              ) : (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-900 rounded-xl hover:bg-stone-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border border-white shadow-sm">
                        <AvatarImage src={user.avatar || ""} />
                        <AvatarFallback className="bg-amber-100 text-amber-700 font-bold">
                            {user.name ? user.name[0].toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-stone-800 dark:text-stone-200">{user.name || "Không tên"}</p>
                        <p className="text-xs text-stone-500">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                        {user.role === 'admin' && <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0">Admin</Badge>}
                        {user.role === 'teacher' && <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0">Teacher</Badge>}
                        {user.role === 'student' && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">Student</Badge>}
                        <p className="text-[10px] text-stone-400 mt-1 flex items-center justify-end gap-1">
                            <Clock size={10} /> {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: vi })}
                        </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* THỐNG KÊ NHANH */}
        <Card className="lg:col-span-3 border-none shadow-md bg-stone-900 text-white">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <ShieldCheck className="text-green-400"/> Trạng thái Admin
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm text-stone-300">Dung lượng Server</span>
                        <span className="text-sm font-bold text-green-400">Ổn định</span>
                    </div>
                    <div className="w-full bg-stone-800 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '24%' }}></div>
                    </div>
                    <p className="text-xs text-stone-400 mt-2">24% đã sử dụng</p>
                </div>

                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm text-stone-300">Tỷ lệ chuyển đổi (Student &rarr; Pro)</span>
                        <span className="text-sm font-bold text-amber-400">4.5%</span>
                    </div>
                    <div className="w-full bg-stone-800 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <p className="text-xs text-stone-400 mt-2">Cần cải thiện các bài học miễn phí</p>
                </div>

                <div className="p-4 rounded-xl border border-stone-700 bg-stone-950">
                    <h4 className="font-bold text-sm mb-2 text-stone-300">Phân bổ người dùng</h4>
                    <div className="flex gap-2 text-xs">
                        <div className="flex-1 bg-blue-900/50 p-2 rounded text-center border border-blue-800">
                            <span className="block font-bold text-lg text-blue-400">{totalUsers > 0 ? Math.round((totalStudents/totalUsers)*100) : 0}%</span>
                            Student
                        </div>
                        <div className="flex-1 bg-purple-900/50 p-2 rounded text-center border border-purple-800">
                             <span className="block font-bold text-lg text-purple-400">{totalUsers > 0 ? Math.round((totalTeachers/totalUsers)*100) : 0}%</span>
                            Teacher
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}