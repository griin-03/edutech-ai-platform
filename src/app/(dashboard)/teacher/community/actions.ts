"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// 1. LẤY DANH SÁCH BÀI VIẾT (FEED)
export async function getCommunityPosts() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, avatar: true, role: true } // Quan trọng: Lấy role để hiện Badge
      },
      _count: {
        select: { comments: true, likes: true }
      }
    }
  });
  return posts;
}

// 2. ĐĂNG BÀI MỚI (TEACHER POST)
export async function createTeacherPost(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return { success: false };

  const content = formData.get("content") as string;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });

  if (!user || !content.trim()) return { success: false };

  await prisma.post.create({
    data: {
      content: content,
      userId: user.id,
      title: "Thông báo từ Giảng viên", // Hoặc lấy từ input
      category: "ANNOUNCEMENT" // Teacher đăng thì thường là thông báo hoặc chia sẻ kiến thức
    }
  });

  revalidatePath("/teacher/community");
  return { success: true };
}