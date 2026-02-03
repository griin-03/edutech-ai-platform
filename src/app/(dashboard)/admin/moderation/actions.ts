"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Lấy khóa học chờ duyệt
export async function getPendingCourses() {
  return await prisma.course.findMany({
    where: { 
      approvalStatus: "PENDING",
      isPublished: false 
    },
    include: { author: true }, // Để hiện tên giáo viên
    orderBy: { createdAt: "desc" }
  });
}

// DUYỆT BÀI: Status = APPROVED và Public ra ngoài
export async function publishCourse(courseId: number) {
  await prisma.course.update({
    where: { id: courseId },
    data: { 
      approvalStatus: "APPROVED",
      isPublished: true 
    }
  });
  revalidatePath("/admin/moderation");
}

// TỪ CHỐI: Status = REJECTED (Kèm lý do)
export async function rejectCourse(courseId: number, reason: string) {
  await prisma.course.update({
    where: { id: courseId },
    data: { 
      approvalStatus: "REJECTED",
      rejectionReason: reason,
      isPublished: false
    }
  });
  revalidatePath("/admin/moderation");
}