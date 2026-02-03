"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getDeepTeacherAnalytics() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return null;

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return null;

  // 1. Lấy dữ liệu Khóa học kèm theo: Doanh thu, Đánh giá, Điểm thi
  const courses = await prisma.course.findMany({
    where: { authorId: user.id },
    include: {
      purchases: { select: { price: true } }, // Để tính tiền
      reviews: { select: { rating: true } },  // Để tính sao
      examResults: { select: { score: true } } // Để tính học lực
    }
  });

  // 2. Xử lý dữ liệu (Transform Data)
  const analyticsData = courses.map(course => {
    // a. Tính doanh thu khóa này
    const revenue = course.purchases.reduce((sum, p) => sum + p.price, 0);
    const salesCount = course.purchases.length;

    // b. Tính điểm đánh giá trung bình
    const avgRating = course.reviews.length > 0
      ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length
      : 0;

    // c. Tính điểm thi trung bình của học viên
    const avgExamScore = course.examResults.length > 0
      ? course.examResults.reduce((sum, e) => sum + e.score, 0) / course.examResults.length
      : 0;

    return {
      name: course.title,
      revenue,     // Tiền (VND)
      sales: salesCount, // Số lượng bán
      rating: parseFloat(avgRating.toFixed(1)), // 1.0 - 5.0
      score: parseFloat(avgExamScore.toFixed(1)) // 0 - 100
    };
  });

  // Sắp xếp theo doanh thu giảm dần
  return analyticsData.sort((a, b) => b.revenue - a.revenue);
}