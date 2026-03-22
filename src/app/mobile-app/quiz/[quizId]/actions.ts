"use server";

import { prisma } from "@/lib/prisma";

// 1. LẤY ĐỀ THI TỪ DB THẬT VÀ KIỂM TRA QUYỀN PRO/FREE
export async function getExamData(courseId: string, userId: number, role: string) {
  const id = parseInt(courseId);

  // Kéo dữ liệu khóa học và thông tin User cùng lúc để tối ưu hiệu suất
  const [course, user] = await Promise.all([
    prisma.course.findUnique({
      where: { id },
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            options: true,
          },
          orderBy: { position: 'asc' } // Sắp xếp câu hỏi đúng thứ tự
        }
      }
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { isPro: true, name: true }
    })
  ]);

  if (!course || !course.questions || course.questions.length === 0 || !user) {
    return null;
  }

  // 🔒 BẢO MẬT: Chặn truy cập nếu là học sinh gói FREE nhưng vào đề PRO
  const isStudent = role !== "ADMIN" && role !== "TEACHER";
  if (course.category === "PRO" && isStudent && !user.isPro) {
     return { error: "PRO_REQUIRED" }; // Bắn lỗi về Client để chặn hiển thị đề
  }

  return {
    id: course.id,
    title: course.title,
    duration: 10, // Cố định 10 phút như bạn yêu cầu
    questions: course.questions.map(q => ({
      id: q.id,
      text: q.text,
      options: q.options
    }))
  };
}

// 2. LOGIC NỘP BÀI, CHẤM ĐIỂM & GỬI THÔNG BÁO GIAN LẬN
export async function submitExam(
  courseId: string, 
  userId: number, 
  answers: Record<number, number>, 
  violationCount: number, 
  isSuspended: boolean
) {
  const id = parseInt(courseId);
  
  // Lấy khóa học để biết ai là tác giả (authorId) và lấy đáp án
  const course = await prisma.course.findUnique({
    where: { id },
    include: { questions: true }
  });

  if (!course) throw new Error("Course not found");

  let score = 0;
  const total = course.questions.length;

  course.questions.forEach(q => {
    // Chấm điểm: So sánh vị trí đáp án học sinh chọn với đáp án đúng trong DB
    if (answers[q.id] !== undefined && String(answers[q.id]) === String(q.correct)) { 
      score++;
    }
  });

  // Quy đổi ra thang điểm 10 (Làm tròn 2 chữ số thập phân)
  const finalScore = total > 0 ? Number(((score / total) * 10).toFixed(2)) : 0;

  // Lưu kết quả vào DB
  await prisma.examResult.create({
    data: {
      userId: userId,
      courseId: id,
      score: finalScore,
      violationCount: violationCount,
      isSuspended: isSuspended,
    }
  });

  // 🚨 THÔNG BÁO CHO GIÁO VIÊN NẾU CÓ GIAN LẬN
  if ((violationCount > 0 || isSuspended) && course.authorId) {
     const user = await prisma.user.findUnique({ where: { id: userId } });
     await prisma.notification.create({
         data: {
             userId: course.authorId, 
             type: "WARNING",
             message: `⚠️ Cảnh báo Mobile App: Học viên ${user?.name || 'Vô danh'} đã vi phạm quy chế ${violationCount} lần khi thi bài "${course.title}".`,
             link: `/teacher/analytics` 
         }
     });
  }

  return { 
    success: true, 
    score: finalScore, 
    correctCount: score, 
    totalQuestions: total 
  };
}