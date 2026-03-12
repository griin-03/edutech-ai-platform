"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. LẤY CHI TIẾT ĐỀ THI & CÂU HỎI CHO ADMIN XEM TRƯỚC
export async function getCourseDetailForAdmin(courseId: number) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        author: { select: { name: true, email: true } },
        questions: { orderBy: { position: 'asc' } }
      }
    });
    return { success: true, data: course };
  } catch (error) {
    console.error("[ADMIN_GET_COURSE_ERROR]:", error);
    return { success: false, message: "Lỗi khi tải dữ liệu đề thi." };
  }
}

// 2. ADMIN DUYỆT BÀI (APPROVED)
export async function approveCourseByAdmin(courseId: number) {
  try {
    await prisma.course.update({
      where: { id: courseId },
      data: { 
          approvalStatus: "APPROVED", 
          isPublished: true, // Cho phép hiển thị lên chợ khóa học
          rejectionReason: null 
      }
    });
    revalidatePath("/admin/moderation");
    revalidatePath(`/admin/moderation/${courseId}`);
    return { success: true, message: "Đã phê duyệt! Đề thi hiện đã được xuất bản." };
  } catch (error) {
    return { success: false, message: "Lỗi hệ thống khi phê duyệt." };
  }
}

// 3. ADMIN TỪ CHỐI BÀI (REJECTED) KÈM LÝ DO
export async function rejectCourseByAdmin(courseId: number, reason: string) {
  try {
    await prisma.course.update({
      where: { id: courseId },
      data: { 
          approvalStatus: "REJECTED", 
          isPublished: false, 
          rejectionReason: reason 
      }
    });
    // Đồng thời cập nhật lại giao diện giảng viên để họ thấy lý do
    revalidatePath("/admin/moderation");
    revalidatePath("/teacher/courses"); 
    return { success: true, message: "Đã từ chối và gửi phản hồi cho Giảng viên." };
  } catch (error) {
    return { success: false, message: "Lỗi hệ thống khi từ chối." };
  }
}

// 4. ADMIN XÓA LUÔN BÀI VI PHẠM (DELETE)
export async function deleteCourseByAdmin(courseId: number) {
  try {
    await prisma.question.deleteMany({ where: { courseId } });
    await prisma.course.delete({ where: { id: courseId } });
    revalidatePath("/admin/moderation");
    return { success: true, message: "Đã xóa vĩnh viễn đề thi này khỏi hệ thống." };
  } catch (error) {
    return { success: false, message: "Lỗi khi xóa đề thi." };
  }
}