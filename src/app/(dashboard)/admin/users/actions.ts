"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// 1. LẤY DANH SÁCH USER (Có tìm kiếm)
export async function getUsers(query: string = "") {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query} }, // Tìm theo tên
        { email: { contains: query } }, // Tìm theo email
      ],
    },
    orderBy: { createdAt: "desc" }, // Người mới nhất lên đầu
  });
  return users;
}

// 2. TẠO USER MỚI
export async function createUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  // Mã hóa mật khẩu
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });
    revalidatePath("/admin/users"); // Làm mới trang ngay lập tức
    return { success: true, message: "Tạo thành công!" };
  } catch (error) {
    return { success: false, message: "Email đã tồn tại hoặc lỗi hệ thống." };
  }
}

// 3. CẬP NHẬT USER
export async function updateUser(userId: number, formData: FormData) {
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { name, role },
    });
    revalidatePath("/admin/users");
    return { success: true, message: "Cập nhật thành công!" };
  } catch (error) {
    return { success: false, message: "Lỗi khi cập nhật." };
  }
}

// 4. XÓA USER
export async function deleteUser(userId: number) {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    revalidatePath("/admin/users");
    return { success: true, message: "Đã xóa user." };
  } catch (error) {
    return { success: false, message: "Lỗi không xóa được." };
  }
}