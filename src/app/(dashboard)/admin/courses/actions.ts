"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 1. Lấy danh sách
export async function getCourses(query: string = "") {
  try {
    return await prisma.course.findMany({
      where: { title: { contains: query } },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    return [];
  }
}

// 2. Tạo mới
export async function createCourse(formData: FormData) {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({ 
    where: { email: session?.user?.email || "" } 
  });
  
  if (!user) return { success: false, message: "Lỗi: Không tìm thấy User" };

  try {
    await prisma.course.create({
      data: {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string) || 0,
        isPublished: formData.get("isPublished") === "true",
        authorId: user.id,
      },
    });
    revalidatePath("/admin/courses");
    return { success: true, message: "Đã tạo khóa học!" };
  } catch (e) {
    return { success: false, message: "Lỗi tạo khóa học" };
  }
}

// 3. Cập nhật
export async function updateCourse(id: number, formData: FormData) {
  try {
    await prisma.course.update({
      where: { id },
      data: {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string) || 0,
        isPublished: formData.get("isPublished") === "true",
      },
    });
    revalidatePath("/admin/courses");
    return { success: true, message: "Cập nhật thành công!" };
  } catch (e) {
    return { success: false, message: "Lỗi cập nhật" };
  }
}

// 4. Xóa
export async function deleteCourse(id: number) {
  try {
    await prisma.course.delete({ where: { id } });
    revalidatePath("/admin/courses");
    return { success: true, message: "Đã xóa!" };
  } catch (e) {
    return { success: false, message: "Lỗi xóa" };
  }
}