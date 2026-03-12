"use server";

import { prisma } from "@/lib/prisma";

export async function getActiveTeachers() {
  try {
    // 1 LẦN GỌI DUY NHẤT: Lấy mọi Giảng viên (TEACHER) kèm theo các Khóa học đã xuất bản của họ
    const teachers = await prisma.user.findMany({
      where: {
        role: "TEACHER" 
      },
      select: {
        id: true,
        name: true,
        avatar: true, // 🔥 SỬA Ở ĐÂY: Đổi từ 'image' thành 'avatar' cho chuẩn với Database của bạn
        courses: { 
          where: { isPublished: true },
          select: {
            id: true,
            title: true,
            category: true,
            price: true,
          }
        }
      }
    });

    // Định dạng lại dữ liệu để mớm cho giao diện
    return teachers.map((teacher: any) => ({
      id: teacher.id,
      name: teacher.name || "Giảng viên",
      // Gán teacher.avatar vào biến image để file giao diện (page.tsx) hiển thị bình thường
      image: teacher.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + teacher.id,
      courses: teacher.courses,
      coursesCount: teacher.courses.length,
      rating: 5.0, 
      reviews: Math.floor(Math.random() * 50) + 10,
      subject: teacher.courses[0]?.category || "Đa môn học",
      topCourses: teacher.courses.slice(0, 2).map((c: any) => c.category),
      about: "Giảng viên uy tín trên hệ thống Edutech AI, chuyên cung cấp các bộ đề thi vận dụng và vận dụng cao."
    }));

  } catch (error) {
    console.error("LỖI LẤY DỮ LIỆU GIẢNG VIÊN:", error);
    return [];
  }
}