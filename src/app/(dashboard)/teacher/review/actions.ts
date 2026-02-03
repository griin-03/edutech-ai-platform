"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";

export async function getTeacherReviews() {
  const user = await currentUser();
  if (!user) return { reviews: [], summary: { total: 0, avg: 0, starCounts: [0,0,0,0,0] } };

  // 1. Lấy danh sách Review
  const reviews = await prisma.review.findMany({
    where: {
      course: { authorId: user.id } // Chỉ lấy review của khóa học tôi tạo
    },
    include: {
      user: { select: { name: true, avatar: true, email: true } }, // Người đánh giá
      course: { select: { title: true } } // Khóa học nào
    },
    orderBy: { createdAt: "desc" }
  });

  // 2. Tính toán số liệu tổng quan (Summary) để vẽ biểu đồ nhỏ
  const total = reviews.length;
  const sumRating = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = total > 0 ? (sumRating / total).toFixed(1) : 0;

  // Đếm số lượng từng loại sao (1 sao -> 5 sao)
  const starCounts = [0, 0, 0, 0, 0]; // Index 0 là 1 sao, Index 4 là 5 sao
  reviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      starCounts[r.rating - 1]++;
    }
  });

  return {
    reviews,
    summary: {
      total,
      avg,
      starCounts: starCounts.reverse() // Đảo lại để 5 sao lên đầu
    }
  };
}