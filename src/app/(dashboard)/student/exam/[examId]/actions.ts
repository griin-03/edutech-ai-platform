"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ==============================================================================
// 🔥 CACHE GLOBAL CHỐNG DOUBLE-SUBMIT (DÙNG CHO BÁO CÁO HÌNH 6.8)
// Biến này lưu trên RAM của Node.js, reset khi khởi động lại server
// ==============================================================================
const submitCache = new Set<string>();

// ------------------------------------------------------------------------------
// 1. API Lấy dữ liệu đề thi (Che giấu đáp án đúng)
// ------------------------------------------------------------------------------
export async function getExamData(examId: string) {
  try {
    const exam = await prisma.course.findUnique({
      where: { id: Number(examId) },
      include: {
        // CHÚ Ý BẢO MẬT: Chỉ lấy câu hỏi và danh sách đáp án (options), 
        // tuyệt đối KHÔNG select trường "correct" gửi về Client
        questions: {
          select: {
            id: true,
            text: true,
            options: true,
          },
          orderBy: { position: 'asc' }
        }
      }
    });

    if (!exam) return null;

    // Giả sử mỗi đề có thời gian mặc định là 10 phút (nếu DB của bạn chưa có cột này)
    return { ...exam, duration: 10 }; 
  } catch (error) {
    console.error("[GET_EXAM_ERROR]", error);
    return null;
  }
}

// ------------------------------------------------------------------------------
// 2. API Nộp bài thi (Có thuật toán bảo mật)
// ------------------------------------------------------------------------------
export async function submitExam(examId: string, answers: { [key: number]: string }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return { success: false, error: "Vui lòng đăng nhập" };

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { success: false, error: "Không tìm thấy người dùng" };

    // --------------------------------------------------------------------------
    // [ĐOẠN CODE CHỤP ẢNH HÌNH 6.8: LOGIC CHECK CACHE CHỐNG DOUBLE-SUBMIT]
    // --------------------------------------------------------------------------
    const cacheKey = `submit_${user.id}_${examId}`;

    // A. Kiểm tra Cache: Đã có key chưa?
    if (submitCache.has(cacheKey)) {
      console.warn(`[DOUBLE-SUBMIT DETECTED]: Học viên ${user.email} đang spam nút nộp bài ${examId}`);
      return { success: false, error: "Hệ thống đang xử lý bài thi của bạn, vui lòng không nhấn nộp nhiều lần!" };
    }

    // B. Khóa Cache: Chặn các request tiếp theo
    submitCache.add(cacheKey);
    // --------------------------------------------------------------------------

    
    // Thuật toán chấm điểm ngầm (Server-side Grading)
    let correctCount = 0;
    const dbQuestions = await prisma.question.findMany({ where: { courseId: Number(examId) } });
    
    // Đối chiếu đáp án của học sinh gửi lên với đáp án gốc trong DB
    dbQuestions.forEach((q) => {
      const studentAnswer = answers[q.id];
      if (studentAnswer && studentAnswer === q.correctAnswer) {
        correctCount++;
      }
    });

    // Tính điểm thang 10
    const totalQuestions = dbQuestions.length || 1;
    const score = parseFloat(((correctCount / totalQuestions) * 10).toFixed(2));

    // Lưu kết quả vào DB
    await prisma.examResult.create({
      data: {
        userId: user.id,
        courseId: Number(examId),
        score: score,
        violationCount: 0, // Mặc định, bạn có thể truyền số này từ client lên sau
      }
    });

    // C. Mở khóa Cache sau khi xử lý xong (giữ lock 5 giây cho an toàn)
    setTimeout(() => {
      submitCache.delete(cacheKey);
    }, 5000);

    return { success: true, score: score, correctCount, total: totalQuestions };

  } catch (error) {
    console.error("[SUBMIT_EXAM_ERROR]", error);
    return { success: false, error: "Lỗi hệ thống khi chấm điểm" };
  }
}