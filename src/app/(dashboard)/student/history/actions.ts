"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getMyExamHistory() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, data: [] };
    }

    // Tìm User ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) return { success: false, data: [] };

    // Lấy toàn bộ lịch sử thi của User này, kèm theo tên của Đề thi (Course)
    const history = await prisma.examResult.findMany({
      where: { userId: user.id },
      include: {
        course: { select: { title: true, category: true } }
      },
      orderBy: { createdAt: 'desc' } // Mới nhất lên đầu
    });

    return { success: true, data: history };
  } catch (error) {
    console.error("[GET_HISTORY_ERROR]", error);
    return { success: false, data: [] };
  }
}