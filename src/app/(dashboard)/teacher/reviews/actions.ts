"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// 1. LẤY DANH SÁCH REVIEW (Kèm thống kê)
export async function getTeacherReviews() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return { reviews: [], stat: null };

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { reviews: [], stat: null };

  // Lấy review của các khóa học do tôi dạy
  const reviews = await prisma.review.findMany({
    where: {
      course: { authorId: user.id }
    },
    include: {
      user: { select: { name: true, avatar: true } },
      course: { select: { title: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  // TÍNH TOÁN KPI
  const total = reviews.length;
  const avgRating = total > 0 ? reviews.reduce((a, b) => a + b.rating, 0) / total : 0;
  
  // Đếm số sao (1-5)
  const distribution = [0, 0, 0, 0, 0];
  reviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) distribution[r.rating - 1]++;
  });

  // Tỷ lệ đã trả lời
  const repliedCount = reviews.filter(r => r.reply).length;
  const responseRate = total > 0 ? Math.round((repliedCount / total) * 100) : 0;

  return {
    reviews,
    stat: {
      total,
      avgRating: avgRating.toFixed(1),
      distribution: distribution.reverse(), // Đảo để 5 sao lên đầu
      responseRate
    }
  };
}

// 2. TRẢ LỜI REVIEW (REPLY)
export async function replyToReview(reviewId: string, replyContent: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return { success: false, message: "Unauthorized" };

  try {
    // Check quyền sở hữu: Review này có thuộc khóa học của tôi không?
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { course: true }
    });

    if (!review || review.course.authorId !== user?.id) {
      return { success: false, message: "Bạn không có quyền trả lời review này." };
    }

    await prisma.review.update({
      where: { id: reviewId },
      data: {
        reply: replyContent,
        repliedAt: new Date()
      }
    });

    revalidatePath("/teacher/reviews");
    return { success: true, message: "Đã gửi phản hồi thành công!" };
  } catch (error) {
    return { success: false, message: "Lỗi hệ thống." };
  }
}