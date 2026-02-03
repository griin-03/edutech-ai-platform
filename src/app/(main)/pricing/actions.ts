"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth"; // Hàm lấy user hiện tại của bạn

export async function createUpgradeRequest(formData: FormData) {
  const user = await currentUser();
  if (!user) return { success: false, error: "Vui lòng đăng nhập" };

  const content = formData.get("content") as string;
  const note = formData.get("note") as string; // Tạm dùng làm imageProof hoặc ghi chú

  await prisma.upgradeRequest.create({
    data: {
      userId: user.id, // ID lấy từ session
      amount: 299000,
      content: content,
      imageProof: note, // Lưu tạm ghi chú vào đây
      status: "PENDING"
    }
  });

  return { success: true };
}