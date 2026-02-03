"use server";

import { prisma } from "@/lib/prisma";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

export async function getAdminAnalytics() {
  // 1. LẤY DỮ LIỆU THÔ TỪ DATABASE (REAL DATA)
  
  // Lấy tất cả đơn hàng đã thanh toán
  const purchases = await prisma.purchase.findMany({
    include: { 
      course: true,
      user: true 
    },
    orderBy: { createdAt: "asc" }
  });

  // Lấy danh sách đánh giá để tính điểm chất lượng
  const reviews = await prisma.review.findMany();

  // Đếm số lượng User theo vai trò
  const totalStudents = await prisma.user.count({ where: { role: "STUDENT" } });
  const totalTeachers = await prisma.user.count({ where: { role: "TEACHER" } });
  
  // Đếm tổng số khóa học
  const totalCourses = await prisma.course.count({ where: { isPublished: true } });

  // 2. XỬ LÝ LOGIC TÍNH TOÁN (AGGREGATION)

  // A. Tính Tổng Doanh Thu (Total Revenue)
  // Cộng dồn field 'price' trong bảng Purchase
  const totalRevenue = purchases.reduce((acc, curr) => acc + curr.price, 0);

  // B. Tính Doanh thu tháng này (Monthly Revenue)
  const now = new Date();
  const currentMonthRevenue = purchases
    .filter(p => p.createdAt >= startOfMonth(now) && p.createdAt <= endOfMonth(now))
    .reduce((acc, curr) => acc + curr.price, 0);

  // C. Tính Điểm đánh giá trung bình (Avg Rating)
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  // 3. CHUẨN BỊ DỮ LIỆU CHO BIỂU ĐỒ (CHARTS)

  // D. Biểu đồ: Doanh thu theo ngày (Revenue Over Time)
  // Gom nhóm các đơn hàng có cùng ngày tháng lại với nhau
  const salesMap: { [key: string]: number } = {};
  
  // Chỉ lấy dữ liệu 30 ngày gần nhất để biểu đồ không bị quá dài
  const recentPurchases = purchases.filter(p => p.createdAt >= subDays(new Date(), 30));

  recentPurchases.forEach((p) => {
    const dateStr = format(p.createdAt, "dd/MM"); // Ví dụ: 03/02
    salesMap[dateStr] = (salesMap[dateStr] || 0) + p.price;
  });

  // Chuyển đổi object thành array để thư viện Recharts hiểu được
  const revenueChartData = Object.entries(salesMap).map(([date, total]) => ({
    name: date,
    total: total
  }));

  // E. Biểu đồ: Top Khóa học bán chạy (Top Selling Courses)
  const courseSalesMap: { [key: string]: number } = {};
  
  purchases.forEach((p) => {
    const title = p.course.title;
    courseSalesMap[title] = (courseSalesMap[title] || 0) + 1; // Đếm số lần xuất hiện
  });

  const topCoursesData = Object.entries(courseSalesMap)
    .map(([name, sales]) => ({ name, sales }))
    .sort((a, b) => b.sales - a.sales) // Sắp xếp từ cao xuống thấp
    .slice(0, 5); // Chỉ lấy Top 5

  // F. Biểu đồ: Phân bổ người dùng (User Distribution)
  const userPieData = [
    { name: "Học viên", value: totalStudents, fill: "#3b82f6" }, // Blue
    { name: "Giảng viên", value: totalTeachers, fill: "#a855f7" }, // Purple
  ];

  // 4. TRẢ KẾT QUẢ VỀ CLIENT
  return {
    kpi: {
      totalRevenue,
      monthlyRevenue: currentMonthRevenue,
      totalOrders: purchases.length,
      avgRating,
      totalStudents,
      totalCourses
    },
    charts: {
      revenue: revenueChartData,
      topCourses: topCoursesData,
      userDistribution: userPieData
    }
  };
}