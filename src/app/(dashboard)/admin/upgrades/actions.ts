"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Lấy danh sách yêu cầu đang chờ
export async function getPendingUpgrades() {
  return await prisma.upgradeRequest.findMany({
    where: { status: "PENDING" },
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });
}

// DUYỆT ĐƠN: Cập nhật Request -> Update User (Role hoặc Pro) -> Gửi thông báo
export async function approveUpgrade(requestId: string, userId: number, planType: string) {
  try {
    const isTeacher = planType === "TEACHER_APPROVAL";

    // Dùng transaction để đảm bảo cả 3 việc cùng thành công hoặc cùng thất bại
    await prisma.$transaction([
      // 1. Cập nhật trạng thái đơn -> APPROVED
      prisma.upgradeRequest.update({
        where: { id: requestId },
        data: { status: "APPROVED" }
      }),

      // 2. Nâng cấp User (Phân biệt Giáo viên hay PRO)
      prisma.user.update({
        where: { id: userId },
        data: isTeacher ? { role: "TEACHER" } : { isPro: true }
      }),

      // 3. TẠO THÔNG BÁO CHO USER (Tùy biến câu chữ theo loại nâng cấp)
      prisma.notification.create({
        data: {
          userId: userId,
          type: "SYSTEM", 
          message: isTeacher 
            ? "🎉 Chúc mừng! Đơn đăng ký Giảng viên của bạn đã được duyệt. Hãy đăng nhập lại để vào trang Quản trị nhé!"
            : "🎉 Chúc mừng! Tài khoản của bạn đã được nâng cấp lên PRO thành công. Hãy trải nghiệm ngay!",
          isRead: false,
          link: isTeacher ? "/teacher/dashboard" : "/student/my-courses" 
        }
      })
    ]);

    // Xóa cache để giao diện Admin cập nhật ngay lập tức
    revalidatePath("/admin/upgrades");
    revalidatePath("/admin/users"); 
    
    return { success: true };
  } catch (error) {
    console.error("Lỗi duyệt đơn:", error); 
    return { success: false, error: "Lỗi hệ thống khi duyệt đơn" };
  }
}

// TỪ CHỐI ĐƠN
export async function rejectUpgrade(requestId: string) {
  try {
    // Tùy chọn: Bạn cũng có thể thêm logic gửi thông báo từ chối (Notification) ở đây tương tự như trên
    await prisma.upgradeRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" }
    });
    
    revalidatePath("/admin/upgrades");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Lỗi khi từ chối đơn" };
  }
}