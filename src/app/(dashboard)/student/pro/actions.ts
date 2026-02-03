"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// 1. TẠO ĐƠN HÀNG TREO (PENDING)
export async function createPendingOrder(planType: string, amount: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return null;

  // Tạo record với status PENDING
  const order = await prisma.upgradeRequest.create({
    data: {
      userId: user.id,
      planType,
      amount,
      status: "PENDING", // Quan trọng: Đang chờ
      content: "Chờ quét mã QR...",
      imageProof: "mobile_scan_pending.png"
    }
  });

  return order.id;
}

// 2. CHECK TRẠNG THÁI ĐƠN HÀNG (Dùng để Desktop hỏi Server liên tục)
export async function checkOrderStatus(orderId: string) {
  const order = await prisma.upgradeRequest.findUnique({
    where: { id: orderId },
    select: { status: true }
  });
  
  return order?.status === "APPROVED";
}

// 3. XÁC NHẬN THANH TOÁN TỪ MOBILE (Điện thoại gọi hàm này)
export async function confirmOrderOnMobile(orderId: string) {
  try {
    // Transaction: Cập nhật đơn hàng -> Trừ tiền/Nâng cấp User
    await prisma.$transaction(async (tx) => {
      // a. Lấy thông tin đơn
      const order = await tx.upgradeRequest.findUnique({ where: { id: orderId } });
      if (!order || order.status === "APPROVED") return;

      // b. Update đơn hàng thành công
      await tx.upgradeRequest.update({
        where: { id: orderId },
        data: { status: "APPROVED", content: "Đã xác nhận từ Mobile" }
      });

      // c. Nâng cấp User
      await tx.user.update({
        where: { id: order.userId },
        data: { isPro: true } // Nếu dùng ví thì thêm logic trừ tiền ở đây
      });
      
      // d. Gửi thông báo
      await tx.notification.create({
        data: {
          userId: order.userId,
          type: "SYSTEM",
          message: "Thanh toán thành công qua Mobile QR!",
          isRead: false
        }
      });
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}