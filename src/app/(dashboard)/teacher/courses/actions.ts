"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
// 1. SỬA LỖI: Import đúng thư viện Auth
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getMyCourses() {
  // 2. Lấy session chuẩn
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return [];

  // 3. Tìm User ID từ Email
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return [];

  // 4. LẤY DỮ LIỆU ĐA CHIỀU (Advanced Data Fetching)
  const courses = await prisma.course.findMany({
    where: { 
      authorId: user.id 
    },
    include: {
      purchases: { select: { price: true } }, // Để tính tiền
      reviews: { select: { rating: true } },  // Để tính sao
      _count: {
        select: { 
          examResults: true, // Đếm số bài thi đã làm
          purchases: true    // Đếm số người mua
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // 5. Tính toán số liệu kinh doanh cho từng khóa (Business Logic)
  const enrichedCourses = courses.map(course => {
    const totalRevenue = course.purchases.reduce((sum, p) => sum + p.price, 0);
    const avgRating = course.reviews.length > 0
      ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length
      : 0;

    return {
      ...course,
      revenue: totalRevenue,
      avgRating: parseFloat(avgRating.toFixed(1)),
      sales: course._count.purchases
    };
  });

  return enrichedCourses;
}

// Giữ nguyên hàm xóa
export async function deleteCourse(courseId: number) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { purchases: true }
    });

    if (course && course.purchases.length > 0) {
      return { success: false, error: "Không thể xóa khóa học đang kinh doanh (đã có người mua)!" };
    }

    await prisma.course.delete({ where: { id: courseId } });
    revalidatePath("/teacher/courses");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Lỗi hệ thống khi xóa" };
  }
}