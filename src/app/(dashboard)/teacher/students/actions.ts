"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getTeacherStudents() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return [];

  // 1. Lấy ID của Teacher hiện tại
  const teacher = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!teacher) return [];

  // 2. Lấy danh sách ID các khóa học do Teacher này tạo
  const myCourses = await prisma.course.findMany({
    where: { authorId: teacher.id },
    select: { id: true }
  });
  const myCourseIds = myCourses.map(c => c.id);

  // 3. QUERY PHỨC TẠP: Lấy danh sách Học viên đã mua các khóa học trên
  // Kèm theo dữ liệu Kết quả thi và Lịch sử mua hàng (Chỉ trong phạm vi khóa của tôi)
  const students = await prisma.user.findMany({
    where: {
      purchases: {
        some: {
          courseId: { in: myCourseIds } // Điều kiện: Phải mua khóa của tôi
        }
      }
    },
    include: {
      purchases: {
        where: { courseId: { in: myCourseIds } }, // Chỉ lấy đơn hàng mua của tôi
        include: { course: { select: { title: true } } }
      },
      examResults: {
        where: { courseId: { in: myCourseIds } }, // Chỉ lấy điểm thi khóa của tôi
        select: { score: true, violationCount: true, isSuspended: true }
      }
    }
  });

  // 4. XỬ LÝ LOGIC (DATA TRANSFORMATION)
  const enrichedStudents = students.map(student => {
    // a. Tính tổng tiền đã cúng cho Teacher (LTV)
    const totalSpent = student.purchases.reduce((sum, p) => sum + p.price, 0);

    // b. Tính điểm trung bình & check gian lận
    const totalExams = student.examResults.length;
    const avgScore = totalExams > 0 
      ? student.examResults.reduce((sum, e) => sum + e.score, 0) / totalExams
      : 0;
    
    // c. Tổng số lần vi phạm (Rời tab, copy paste...)
    const totalViolations = student.examResults.reduce((sum, e) => sum + e.violationCount, 0);
    const isSuspended = student.examResults.some(e => e.isSuspended);

    // d. Phân loại Học viên (Labeling Logic)
    let status = "NORMAL";
    if (isSuspended || totalViolations > 5) status = "CHEATER"; // Cờ đỏ
    else if (totalSpent > 1000000) status = "VIP"; // Cờ xanh
    else if (avgScore >= 90) status = "TOP_TIER"; // Học bá
    else if (avgScore > 0 && avgScore < 50) status = "AT_RISK"; // Cần hỗ trợ

    return {
      id: student.id,
      name: student.name || "Không tên",
      email: student.email,
      avatar: student.avatar,
      joinedAt: student.createdAt,
      totalSpent,
      coursesCount: student.purchases.length,
      latestCourse: student.purchases[student.purchases.length - 1]?.course.title || "N/A",
      avgScore: parseFloat(avgScore.toFixed(1)),
      totalViolations,
      status
    };
  });

  // Sắp xếp: Ưu tiên hiển thị VIP và Cheater lên đầu để Teacher chú ý
  return enrichedStudents.sort((a, b) => b.totalSpent - a.totalSpent);
}