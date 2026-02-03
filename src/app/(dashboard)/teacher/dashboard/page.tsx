import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Overview } from "@/components/dashboard/overview"; 
import { DollarSign, Users, CreditCard, Activity, ArrowUpRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Hàm format tiền tệ VNĐ
const formatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export default async function TeacherDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) return redirect("/");

  const teacher = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!teacher) return redirect("/");

  // Xử lý ID an toàn
  const authorIdSafe = typeof teacher.id === 'string' ? parseInt(teacher.id) : teacher.id;

  const courses = await prisma.course.findMany({
    where: { 
        authorId: authorIdSafe 
    },
    include: {
      savedCourses: {
        include: { user: true }, 
        // 🔥 FIX LỖI: Đổi createdAt -> savedAt
        orderBy: { savedAt: 'desc' } 
      }, 
      reviews: true 
    },
    orderBy: { createdAt: 'desc' } // Bảng Course thì vẫn dùng createdAt ok
  });

  // --- TÍNH TOÁN SỐ LIỆU ---

  const totalRevenue = courses.reduce((acc, course) => {
    return acc + (course.price || 0) * course.savedCourses.length;
  }, 0);

  const totalStudents = courses.reduce((acc, course) => acc + course.savedCourses.length, 0);

  const totalCourses = courses.length;

  // Tính doanh thu theo tháng
  const monthlyRevenue = new Array(12).fill(0);

  courses.forEach(course => {
    course.savedCourses.forEach(record => {
      // 🔥 FIX LỖI: Đổi record.createdAt -> record.savedAt
      const month = new Date(record.savedAt).getMonth(); 
      if (month >= 0 && month < 12) {
          monthlyRevenue[month] += (course.price || 0);
      }
    });
  });

  const graphData = monthlyRevenue.map((total, index) => ({
      name: `T${index + 1}`,
      total: total
  }));

  // Danh sách học viên gần đây
  const recentEnrollments = courses
    .flatMap(c => c.savedCourses.map(sc => ({
        studentName: sc.user.name || "Người dùng ẩn danh",
        studentEmail: sc.user.email || "Chưa cập nhật email",
        studentImage: sc.user.avatar,
        coursePrice: c.price,
        // 🔥 FIX LỖI: Đổi sc.createdAt -> sc.savedAt
        date: sc.savedAt
    })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 bg-[#fdfbf7] min-h-screen">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-stone-800">Bảng Điều Khiển</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        <Card className="border-stone-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-500 uppercase">Tổng doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-800">{formatter.format(totalRevenue)}</div>
            <p className="text-xs text-emerald-600 font-medium flex items-center mt-1">
               <ArrowUpRight size={12} className="mr-1"/> +20.1% so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card className="border-stone-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-500 uppercase">Học viên mới</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-800">+{totalStudents}</div>
            <p className="text-xs text-stone-500 mt-1">Đang hoạt động tích cực</p>
          </CardContent>
        </Card>

        <Card className="border-stone-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-500 uppercase">Khóa học</CardTitle>
            <CreditCard className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-800">{totalCourses}</div>
            <p className="text-xs text-stone-500 mt-1">Đã xuất bản</p>
          </CardContent>
        </Card>

        <Card className="border-stone-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-500 uppercase">Tương tác AI</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-800">+573</div>
            <p className="text-xs text-stone-500 mt-1">Câu hỏi được AI giải đáp</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        <Card className="col-span-4 border-stone-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-stone-800">Biểu đồ doanh thu</CardTitle>
            <CardDescription>
                Thu nhập từ các khóa học trong năm nay.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={graphData} />
          </CardContent>
        </Card>

        <Card className="col-span-3 border-stone-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-stone-800">Đăng ký mới nhất</CardTitle>
            <CardDescription>
              Có {recentEnrollments.length} lượt đăng ký gần đây.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentEnrollments.length > 0 ? (
                  recentEnrollments.map((item, index) => (
                    <div key={index} className="flex items-center">
                        <Avatar className="h-9 w-9">
                        <AvatarImage src={item.studentImage || "/placeholder-avatar.jpg"} alt="Avatar" />
                        <AvatarFallback>{item.studentName?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none text-stone-800">{item.studentName}</p>
                        <p className="text-xs text-stone-500 truncate w-40">
                            {item.studentEmail}
                        </p>
                        </div>
                        <div className="ml-auto font-medium text-stone-800 text-sm">
                            {item.coursePrice === 0 ? "Miễn phí" : `+${formatter.format(item.coursePrice || 0)}`}
                        </div>
                    </div>
                  ))
              ) : (
                  <p className="text-sm text-stone-500 text-center py-10">Chưa có học viên nào đăng ký.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}