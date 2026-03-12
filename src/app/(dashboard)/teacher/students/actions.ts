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
    select: { id: true, title: true }
  });
  
  const myCourseIds = myCourses.map(c => c.id);
  
  // Nếu không có khóa học nào, trả về mảng rỗng
  if (myCourseIds.length === 0) return [];

  // 3. Lấy tất cả học viên đã tải (SAVE_COURSE) hoặc mua (PURCHASE) hoặc đã thi (EXAM_RESULT) khóa học của tôi
  const students = await prisma.user.findMany({
    where: {
      OR: [
        // Đã mua khóa học
        {
          purchases: {
            some: {
              courseId: { in: myCourseIds }
            }
          }
        },
        // Đã tải (lưu) khóa học
        {
          savedCourses: {
            some: {
              courseId: { in: myCourseIds }
            }
          }
        },
        // Đã thi khóa học (có kết quả thi)
        {
          examResults: {
            some: {
              courseId: { in: myCourseIds }
            }
          }
        }
      ]
    },
    include: {
      // Lấy tất cả đơn hàng mua khóa của tôi
      purchases: {
        where: { courseId: { in: myCourseIds } },
        include: { 
          course: { 
            select: { 
              id: true,
              title: true,
              price: true 
            } 
          } 
        },
        orderBy: { createdAt: 'desc' }
      },
      // Lấy tất cả kết quả thi khóa của tôi
      examResults: {
        where: { courseId: { in: myCourseIds } },
        include: {
          course: {
            select: { 
              id: true,
              title: true 
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      // Lấy tất cả khóa học đã lưu (tải) của tôi
      savedCourses: {
        where: { courseId: { in: myCourseIds } },
        include: {
          course: {
            select: { 
              id: true,
              title: true 
            }
          }
        },
        orderBy: { savedAt: 'desc' }
      },
      // Đếm tổng số khóa học đã tải
      _count: {
        select: {
          savedCourses: {
            where: { courseId: { in: myCourseIds } }
          },
          purchases: {
            where: { courseId: { in: myCourseIds } }
          },
          examResults: {
            where: { courseId: { in: myCourseIds } }
          }
        }
      }
    }
  });

  // 4. XỬ LÝ LOGIC (DATA TRANSFORMATION) - Làm giàu dữ liệu
  const enrichedStudents = students.map(student => {
    // a. Tính tổng tiền đã chi cho Teacher
    const totalSpent = student.purchases.reduce((sum, p) => sum + p.price, 0);

    // b. Tính điểm trung bình
    const totalExams = student.examResults.length;
    const avgScore = totalExams > 0 
      ? student.examResults.reduce((sum, e) => sum + e.score, 0) / totalExams
      : 0;
    
    // c. Tổng số lần vi phạm
    const totalViolations = student.examResults.reduce((sum, e) => sum + e.violationCount, 0);
    const isSuspended = student.examResults.some(e => e.isSuspended);

    // d. Lấy khóa học gần nhất học viên tương tác
    const allInteractions = [
      ...student.purchases.map(p => ({ type: 'purchase', date: p.createdAt, title: p.course.title })),
      ...student.examResults.map(e => ({ type: 'exam', date: e.createdAt, title: e.course.title })),
      ...student.savedCourses.map(s => ({ type: 'save', date: s.savedAt, title: s.course.title }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const latestInteraction = allInteractions[0] || null;

    // e. Thống kê chi tiết theo từng khóa học
    const courseStats = myCourses.map(course => {
      // Đã mua chưa?
      const purchased = student.purchases.some(p => p.courseId === course.id);
      // Đã tải chưa?
      const saved = student.savedCourses.some(s => s.courseId === course.id);
      // Đã thi chưa? Lấy điểm thi gần nhất
      const examResults = student.examResults.filter(e => e.courseId === course.id);
      const latestExam = examResults[0] || null;
      const examCount = examResults.length;
      const bestScore = examResults.length > 0 
        ? Math.max(...examResults.map(e => e.score)) 
        : null;

      return {
        courseId: course.id,
        courseTitle: course.title,
        purchased,
        saved,
        examCount,
        bestScore,
        latestExamDate: latestExam?.createdAt || null,
        latestScore: latestExam?.score || null
      };
    });

    // f. Phân loại Học viên
    let status = "NORMAL";
    let statusColor = "gray";
    
    if (isSuspended || totalViolations > 5) {
      status = "CHEATER"; // Gian lận
      statusColor = "red";
    } else if (totalSpent > 1000000) {
      status = "VIP"; // Chi nhiều tiền
      statusColor = "purple";
    } else if (avgScore >= 9) {
      status = "TOP_TIER"; // Học giỏi
      statusColor = "green";
    } else if (avgScore > 0 && avgScore < 5) {
      status = "AT_RISK"; // Cần hỗ trợ
      statusColor = "orange";
    } else if (student._count.examResults === 0 && student._count.purchases === 0 && student._count.savedCourses > 0) {
      status = "DOWNLOADER"; // Chỉ tải về không học
      statusColor = "blue";
    }

    return {
      // Thông tin cơ bản
      id: student.id,
      name: student.name || "Không tên",
      email: student.email,
      avatar: student.avatar,
      joinedAt: student.createdAt,
      
      // Thống kê tổng quan
      totalSpent,
      totalPurchases: student._count.purchases,
      totalSaved: student._count.savedCourses,
      totalExams: student._count.examResults,
      coursesCount: student._count.purchases + student._count.savedCourses,
      
      // Thông tin học tập
      avgScore: parseFloat(avgScore.toFixed(1)),
      totalViolations,
      isSuspended,
      
      // Khóa học gần nhất
      latestCourse: latestInteraction?.title || "Chưa có",
      latestActivity: latestInteraction?.date || null,
      latestActivityType: latestInteraction?.type || null,
      
      // Phân loại
      status,
      statusColor,
      
      // Chi tiết theo từng khóa
      courseStats
    };
  });

  // 5. Sắp xếp thông minh
  return enrichedStudents.sort((a, b) => {
    // Ưu tiên: CHEATER > VIP > TOP_TIER > AT_RISK > DOWNLOADER > NORMAL
    const statusPriority: Record<string, number> = {
      'CHEATER': 0,
      'VIP': 1,
      'TOP_TIER': 2,
      'AT_RISK': 3,
      'DOWNLOADER': 4,
      'NORMAL': 5
    };
    
    const priorityA = statusPriority[a.status] || 99;
    const priorityB = statusPriority[b.status] || 99;
    
    if (priorityA !== priorityB) return priorityA - priorityB;
    
    // Cùng loại thì ưu tiên người chi nhiều tiền hơn
    if (a.status === 'VIP' || b.status === 'VIP') {
      return b.totalSpent - a.totalSpent;
    }
    
    // Cùng loại khác thì ưu tiên người học nhiều hơn
    return b.totalExams - a.totalExams;
  });
}