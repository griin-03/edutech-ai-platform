"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || "", 
});

// ==============================================================================
// 1. TẠO KHUNG ĐỀ THI (LƯU DẠNG NHÁP - DRAFT)
// ==============================================================================
export async function createCourse(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return { success: false, message: "Lỗi đăng nhập." };

    const title = formData.get("title") as string;
    const tier = formData.get("tier") as string; 
    
    if (!title || title.trim().length < 5) return { success: false, message: "Tiêu đề quá ngắn." };

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { success: false, message: "Lỗi xác thực người dùng." };

    const course = await prisma.course.create({
      data: {
        title: title.trim(),
        authorId: user.id,
        isPublished: false,        
        approvalStatus: "DRAFT", 
        category: tier || "FREE",  
        price: tier === "PRO" ? 50000 : 0 
      }
    });

    return { success: true, message: "Khởi tạo thành công!", courseId: course.id };
  } catch (error) {
    return { success: false, message: "Lỗi hệ thống khi tạo đề thi." };
  }
}

// ==============================================================================
// 2. AI GENERATOR: CHUYÊN GIA TOÁN (BẤT TỬ JSON VỚI THUẬT TOÁN [SLASH])
// ==============================================================================
export async function generateExamQuestionsAI(title: string, topic: string) {
  try {
    if (!process.env.COHERE_API_KEY) throw new Error("Chưa cấu hình COHERE_API_KEY");

    // 🔥 PROMPT KỶ LUẬT THÉP & THUẬT TOÁN [SLASH]
    const prompt = `
      Bạn là GIÁO SƯ TOÁN HỌC TỐI CAO, tinh thông Toán học từ cấp THPT đến Đại học.
      LỆNH CẤM TUYỆT ĐỐI: BẠN CHỈ ĐƯỢC PHÉP TẠO ĐỀ THI MÔN TOÁN. Nếu yêu cầu nhắc đến môn khác, hãy bỏ qua và tự động tạo đề Toán.

      NHIỆM VỤ CỦA BẠN: Soạn bộ đề thi TOÁN dựa trên:
      - Ngữ cảnh: "${title}"
      - Yêu cầu cấu trúc: "${topic}"

      QUY TẮC BẮT BUỘC (TUÂN THỦ 100%):
      1. ĐÚNG SỐ LƯỢNG: Tạo CHÍNH XÁC số lượng câu trắc nghiệm và tự luận được yêu cầu. Không làm thừa hay thiếu. Nếu không rõ, tạo 5 trắc nghiệm, 2 tự luận.
      
      2. QUY TẮC TOÁN HỌC (SỐNG CÒN):
         - Mọi công thức Toán học phải được bọc trong dấu $.
         - ĐỂ TRÁNH LỖI HỆ THỐNG: BẠN BỊ CẤM SỬ DỤNG DẤU GẠCH CHÉO NGƯỢC (\\). 
         - HÃY THAY THẾ TOÀN BỘ DẤU (\\) BẰNG TỪ KHÓA "[SLASH]".
         - VÍ DỤ BẮT BUỘC: 
           + Thay vì viết $\\frac{1}{2}$, hãy viết $[SLASH]frac{1}{2}$
           + Thay vì viết $\\sin(x)$, hãy viết $[SLASH]sin(x)$
           + Thay vì viết $\\int_0^1$, hãy viết $[SLASH]int_0^1$
           + Thay vì viết $\\sqrt{x}$, hãy viết $[SLASH]sqrt{x}$

      KỶ LUẬT JSON:
      1. TRẢ VỀ DUY NHẤT 1 MẢNG JSON. Không giải thích, không dùng markdown.
      2. CẤM XUỐNG DÒNG (ENTER) TRONG CHUỖI.
      
      CẤU TRÚC ĐẦU RA BẮT BUỘC:
      [
        {
          "type": "MULTIPLE_CHOICE",
          "text": "Tính đạo hàm của hàm số $y = [SLASH]sin(x) + x^2$.",
          "options": ["$[SLASH]cos(x) + 2x$", "$-[SLASH]cos(x) + 2x$", "$[SLASH]sin(x) + 2x$", "$-[SLASH]sin(x) + x$"],
          "correct": 0
        },
        {
          "type": "SHORT_ANSWER",
          "text": "Giải phương trình: $2x + 4 = 10$.",
          "correctAnswers": ["3", "x=3"]
        }
      ]
    `;

    const chatPromise = cohere.chat({ 
      message: prompt, 
      temperature: 0.1, // Nhiệt độ cực thấp để AI ngoan ngoãn làm theo luật [SLASH]
      model: "command-r-08-2024" 
    });
    
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("AI_TIMEOUT")), 10000)); 
    
    const response = await Promise.race([chatPromise, timeoutPromise]) as any;

    let text = response.text.trim();
    
    // Gọt dũa lấy JSON
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    
    if (firstBracket !== -1 && lastBracket !== -1) {
      text = text.substring(firstBracket, lastBracket + 1);
    } else {
        throw new Error("AI không trả về cấu trúc mảng JSON.");
    }
    
    // =========================================================================
    // 🔥 BƯỚC GIẢI CỨU LỊCH SỬ: Dịch [SLASH] trở lại thành dấu gạch chéo ngược an toàn 
    // trước khi đưa vào lò JSON.parse. Từ nay không bao giờ có lỗi Bad Escaped nữa!
    // =========================================================================
    text = text.replace(/\[SLASH\]/g, "\\\\");

    return JSON.parse(text);

  } catch (error: any) {
    console.error("[AI_GENERATE_ERROR]:", error);
    return []; 
  }
}

// ==============================================================================
// 3. CHỐT GỬI ADMIN
// ==============================================================================
export async function applyAiQuestions(courseId: number | string, questions: any[]) {
  try {
    const validCourseId = Number(courseId);

    await prisma.$transaction(async (tx) => {
      await tx.question.deleteMany({ where: { courseId: validCourseId } }); 
      
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];

        let finalCorrectAnswer = "";
        if (q.type === "MULTIPLE_CHOICE") {
            finalCorrectAnswer = q.options && q.options[q.correct] ? String(q.options[q.correct]) : "Chưa chọn";
        } else {
            finalCorrectAnswer = q.correctAnswers && q.correctAnswers.length > 0 ? String(q.correctAnswers[0]) : "";
        }

        await tx.question.create({
          data: {
            courseId: validCourseId,
            text: String(q.text || ""),
            type: q.type || "MULTIPLE_CHOICE",
            options: q.type === "MULTIPLE_CHOICE" ? (q.options || []) : [],
            correct: q.type === "MULTIPLE_CHOICE" ? Number(q.correct || 0) : null,
            correctAnswers: q.type === "SHORT_ANSWER" ? (q.correctAnswers || []) : [],
            correctAnswer: finalCorrectAnswer, 
            position: i + 1,
          }
        });
      }

      await tx.course.update({
        where: { id: validCourseId },
        data: { approvalStatus: "PENDING" } 
      });
    });

    revalidatePath(`/teacher/courses`);
    return { success: true, message: "🎉 Đã gửi bộ đề thành công! Vui lòng chờ Admin duyệt." };
  } catch (error) {
    console.error("[APPLY_QUESTIONS_ERROR]:", error);
    return { success: false, message: "Lỗi khi lưu bộ đề vào Database. Vui lòng thử lại!" };
  }
}

// ==============================================================================
// 4. LẤY CÂU HỎI TỪ DATABASE
// ==============================================================================
export async function getQuestionsByCourseId(courseId: number) {
  try {
    const questions = await prisma.question.findMany({
      where: { courseId: Number(courseId) },
      orderBy: { position: 'asc' }
    });
    return questions;
  } catch (error) {
    console.error("[GET_QUESTIONS_ERROR]:", error);
    return [];
  }
}