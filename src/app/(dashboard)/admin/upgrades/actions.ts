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

// DUYỆT ĐƠN: Cập nhật Request -> Update User thành Pro -> Gửi thông báo
export async function approveUpgrade(requestId: string, userId: number) {
  try {
    // Dùng transaction để đảm bảo cả 3 việc cùng thành công hoặc cùng thất bại
    await prisma.$transaction([
      // 1. Cập nhật trạng thái đơn -> APPROVED
      prisma.upgradeRequest.update({
        where: { id: requestId },
        data: { status: "APPROVED" }
      }),

      // 2. Nâng cấp User -> isPro = true
      prisma.user.update({
        where: { id: userId },
        data: { isPro: true }
      }),

      // 3. (MỚI) TẠO THÔNG BÁO CHO USER
      prisma.notification.create({
        data: {
          userId: userId,
          type: "SYSTEM", // Loại thông báo
          message: "🎉 Chúc mừng! Tài khoản của bạn đã được nâng cấp lên PRO thành công. Hãy trải nghiệm ngay!",
          isRead: false,
          link: "/courses" // Bấm vào thông báo sẽ dẫn đến trang khóa học
        }
      })
    ]);

    revalidatePath("/admin/upgrades");
    return { success: true };
  } catch (error) {
    console.error("Lỗi duyệt đơn:", error); // Log lỗi ra để dễ debug
    return { success: false, error: "Lỗi hệ thống khi duyệt đơn" };
  }
}

// TỪ CHỐI ĐƠN
export async function rejectUpgrade(requestId: string) {
  try {
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