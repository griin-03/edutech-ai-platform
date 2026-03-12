"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getMyCourses() {
  try {
    // 1. Lấy session chuẩn
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return [];

    // 2. Tìm User ID từ Email
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return [];

    // 3. LẤY DỮ LIỆU ĐA CHIỀU (Advanced Data Fetching)
    const courses = await prisma.course.findMany({
      where: { 
        authorId: user.id 
      },
      include: {
        purchases: { select: { price: true } }, // Để tính tiền
        reviews: { select: { rating: true } },  // Để tính sao
        _count: {
          select: { 
            purchases: true    // Đếm số người mua
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // 4. Tính toán số liệu kinh doanh cho từng khóa (Business Logic)
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
  } catch (error) {
    console.error("[GET_MY_COURSES_ERROR]", error);
    return [];
  }
}

export async function deleteCourse(courseId: number) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { purchases: true }
    });

    if (!course) {
        return { success: false, error: "Không tìm thấy đề thi này!" };
    }

    // Ràng buộc kinh doanh: Không cho phép xóa khóa học đã có người mua
    if (course.purchases.length > 0) {
      return { success: false, error: "Không thể xóa khóa học đang kinh doanh (đã có người mua)!" };
    }

    // 🔥 ĐÃ THÊM: Xóa các câu hỏi (Questions) thuộc đề thi này trước để tránh lỗi Database (Foreign Key)
    await prisma.question.deleteMany({ 
        where: { courseId: courseId } 
    });

    // Sau khi dọn sạch câu hỏi thì mới xóa vỏ Đề thi
    await prisma.course.delete({ 
        where: { id: courseId } 
    });
    
    // Cập nhật lại giao diện ngay lập tức
    revalidatePath("/teacher/courses");
    return { success: true };
  } catch (error) {
    console.error("[DELETE_COURSE_ERROR]", error);
    return { success: false, error: "Lỗi hệ thống khi xóa. Vui lòng thử lại!" };
  }
}