"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function logExamViolation(resultId: string, violationType: string) {
  try {
    // 1. Tăng số lần vi phạm
    const updatedResult = await prisma.examResult.update({
      where: { id: resultId },
      data: {
        violationCount: { increment: 1 },
        // Nếu vi phạm > 5 lần -> Tự động đình chỉ thi (Tùy logic bạn)
        // isSuspended: true 
      }
    });

    // 2. (Optional) Gửi thông báo cho Teacher ngay lập tức (Real-time nếu có Socket)
    // Hoặc tạo record Notification cho Teacher

    revalidatePath("/teacher/students"); // Update ngay bảng Teacher
    return { success: true, count: updatedResult.violationCount };
  } catch (error) {
    console.error("Lỗi ghi nhận vi phạm:", error);
    return { success: false };
  }
}