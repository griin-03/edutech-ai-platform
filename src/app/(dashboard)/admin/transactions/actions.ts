"use server";

import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function getTransactions() {
  // Lấy 20 giao dịch gần nhất (Thực tế sẽ cần phân trang)
  const transactions = await prisma.purchase.findMany({
    take: 20,
    orderBy: { createdAt: "desc" }, // Mới nhất lên đầu
    include: {
      user: {
        select: { name: true, email: true, avatar: true }
      },
      course: {
        select: { title: true }
      }
    }
  });

  // Format dữ liệu cho bảng
  return transactions.map((t) => ({
    id: t.id,
    customer: t.user.name || t.user.email,
    email: t.user.email,
    avatar: t.user.avatar,
    course: t.course.title,
    amount: t.price,
    date: format(t.createdAt, "dd/MM/yyyy HH:mm"),
    status: "Success", // Mặc định là thành công vì đã vào DB
  }));
}