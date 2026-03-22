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

    // 3. LẤY DỮ LIỆU ĐA CHIỀU (Bổ sung bảng ExamResult để đếm lượt làm bài)
    const courses = await prisma.course.findMany({
      where: { 
        authorId: user.id 
      },
      include: {
        purchases: true, // Lấy toàn bộ mảng mua hàng để tính tiền
        reviews: { select: { rating: true } },  // Để tính sao đánh giá
        _count: {
          select: { 
            purchases: true,     // Đếm lượt mua
            examResults: true    // 🔥 FIX LỖI: Đếm số lượt học sinh đã làm bài thi
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // 4. Tính toán số liệu kinh doanh cho từng khóa
    const enrichedCourses = courses.map(course => {
      // Hỗ trợ cả 2 trường hợp bạn dùng thuộc tính 'price' hoặc 'amountPaid' trong Database
      const totalRevenue = course.purchases.reduce((sum, p) => sum + (p.price || (p as any).amountPaid || 0), 0);
      
      const avgRating = course.reviews.length > 0
        ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length
        : 0;

      return {
        ...course,
        revenue: totalRevenue,
        avgRating: parseFloat(avgRating.toFixed(1)),
        // 🔥 ĐỒNG BỘ UI: Trả về số lượt làm bài (examResults) vào biến 'sales' để hiển thị trên thẻ giao diện
        sales: course._count.examResults, 
        purchasesCount: course._count.purchases // Giữ lại lượt mua thực tế dự phòng
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
      include: { 
        purchases: true,
        _count: { select: { examResults: true } }
      }
    });

    if (!course) {
        return { success: false, error: "Không tìm thấy đề thi này!" };
    }

    // Ràng buộc kinh doanh: Không cho phép xóa khóa học ĐÃ BÁN hoặc ĐÃ CÓ NGƯỜI THI
    if (course.purchases.length > 0 || course._count.examResults > 0) {
      return { success: false, error: "Lỗi: Không thể xóa đề thi đang có dữ liệu học sinh làm bài hoặc đã mua!" };
    }

    // 🔥 XÓA DỮ LIỆU LIÊN KẾT TRƯỚC (Tránh lỗi Foreign Key Crash trên Database 18 bảng)
    await prisma.question.deleteMany({ where: { courseId: courseId } });
    await prisma.savedCourse.deleteMany({ where: { courseId: courseId } });
    await prisma.review.deleteMany({ where: { courseId: courseId } });

    // Sau khi dọn sạch mảng phụ thì mới xóa vỏ Đề thi chính
    await prisma.course.delete({ 
        where: { id: courseId } 
    });
    
    // Cập nhật lại giao diện ngay lập tức
    revalidatePath("/teacher/courses");
    return { success: true };
  } catch (error) {
    console.error("[DELETE_COURSE_ERROR]", error);
    return { success: false, error: "Lỗi Database khi xóa. Vui lòng kiểm tra lại Constraint!" };
  }
}