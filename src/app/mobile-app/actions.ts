"use server";

import { prisma } from "@/lib/prisma";

export async function getMobileAppData(userId: number, role: string) {
  try {
    const userInfo = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true, isPro: true }
    });

    let examResults = [];
    let adminStats = null; // Biến chứa dữ liệu riêng cho Admin

    // 1. NẾU LÀ ADMIN: Lấy toàn bộ bài thi trên hệ thống + Đếm tổng quan
    if (role === "ADMIN") {
      examResults = await prisma.examResult.findMany({
        include: { course: true, user: true },
        orderBy: { createdAt: 'desc' }, take: 15
      });
      adminStats = {
        totalUsers: await prisma.user.count(),
        totalCourses: await prisma.course.count(),
        totalExams: await prisma.examResult.count()
      };
    } 
    // 2. NẾU LÀ GIÁO VIÊN: Chỉ lấy bài thi thuộc khóa học của mình
    else if (role === "TEACHER") {
      examResults = await prisma.examResult.findMany({
        where: { course: { authorId: userId } },
        include: { course: true, user: true },
        orderBy: { createdAt: 'desc' }, take: 15
      });
    } 
    // 3. NẾU LÀ HỌC SINH: Chỉ lấy bài thi của chính mình
    else {
      examResults = await prisma.examResult.findMany({
        where: { userId: userId },
        include: { course: true },
        orderBy: { createdAt: 'desc' }, take: 15
      });
    }

    const tasks = await prisma.dailyTask.findMany({ where: { userId: userId }, take: 3 });
    const paths = await prisma.learningPath.findMany({ where: { userId: userId }, take: 2 });
    const myCourses = await prisma.purchase.findMany({ where: { userId: userId }, include: { course: true }, take: 5 });

    const formattedScores = examResults.map(r => {
      const isHigh = r.score >= 8;
      const isMedium = r.score >= 5 && r.score < 8;
      return {
        id: r.id,
        title: (r as any).user ? (r as any).user.name : r.course.title,
        subtitle: (r as any).user ? r.course.title : (r.course.category || "Bài kiểm tra"),
        score: r.score,
        date: r.createdAt.toLocaleDateString('vi-VN'),
        color: isHigh ? "text-emerald-600" : isMedium ? "text-amber-600" : "text-rose-600",
        bg: isHigh ? "bg-emerald-100" : isMedium ? "bg-amber-100" : "bg-rose-100",
      };
    });

    return {
      userInfo,
      scores: formattedScores,
      tasks, paths, courses: myCourses.map(p => p.course),
      adminStats // Trả về thêm dữ liệu cho Admin
    };

  } catch (error) {
    console.error("LỖI LẤY DỮ LIỆU APP MOBILE:", error);
    return null;
  }
}