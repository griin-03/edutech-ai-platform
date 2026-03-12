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
// 2. AI GENERATOR: CHUYÊN GIA 12 MÔN THPT QUỐC GIA (ĐÃ MỞ KHÓA LINH HOẠT)
// ==============================================================================
export async function generateExamQuestionsAI(title: string, topic: string) {
  try {
    if (!process.env.COHERE_API_KEY) throw new Error("Chưa cấu hình COHERE_API_KEY");

    // 🔥 NÂNG CẤP PROMPT: Cho phép AI linh hoạt phân tích Môn học và Số lượng câu hỏi
    const prompt = `
      Bạn là Tổ trưởng Tổ ra đề thi THPT Quốc gia của Bộ Giáo dục & Đào tạo. 
      Nhiệm vụ: Tạo một bộ đề thi CỰC KỲ CHUYÊN SÂU dựa trên 2 thông tin sau:
      - Tên đề tài / Môn học: "${title}"
      - Yêu cầu chi tiết (Độ khó, Số lượng câu, Trắc nghiệm/Tự luận): "${topic}"

      YÊU CẦU CHUYÊN MÔN:
      - Tự động nhận diện chính xác 1 trong 12 môn (Toán, Lý, Hóa, Sinh, Văn, Sử, Địa, GDCD, Anh, Tin, Công nghệ, GDQP) từ Tên đề.
      - TUYỆT ĐỐI tuân thủ số lượng câu hỏi và cấu trúc (trắc nghiệm/tự luận) được ghi trong "Yêu cầu chi tiết". Nếu người dùng không ghi số lượng, mặc định tạo 10 câu (7 trắc nghiệm, 3 tự luận).
      - KHÔNG dùng định nghĩa cơ bản. Đề thi phải có tư duy logic, phân tích, suy luận.
      - BẮT BUỘC SỬ DỤNG LATEX CHO TOÁN/LÝ/HÓA: Công thức bọc trong ký hiệu $. QUAN TRỌNG: Để tránh lỗi cú pháp JSON, bạn PHẢI dùng 2 dấu gạch chéo ngược cho các lệnh LaTeX (Ví dụ: $\\\\frac{a}{b}$, $\\\\sqrt{x}$, $\\\\lim_{x \\\\to 0}$).

      KỶ LUẬT JSON (BẮT BUỘC):
      1. TRẢ VỀ DUY NHẤT 1 MẢNG JSON. KHÔNG có bất kỳ văn bản markdown (\`\`\`json) hay lời giải thích nào ở ngoài mảng.
      2. Cấu trúc mảng phải chuẩn xác:
      [
        { "type": "MULTIPLE_CHOICE", "text": "Nội dung câu trắc nghiệm...", "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"], "correct": 0 },
        { "type": "SHORT_ANSWER", "text": "Nội dung câu tự luận...", "correctAnswers": ["đáp án đúng 1", "đáp án đúng 2"] }
      ]
    `;

    const chatPromise = cohere.chat({ message: prompt, temperature: 0.5, model: "command-r-08-2024" });
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("AI_TIMEOUT")), 40000)); // Tăng timeout lên 40s vì đề dài hơn
    
    const response = await Promise.race([chatPromise, timeoutPromise]) as any;

    // 🔥 FIX LỖI JSON: Chỉ cắt đúng đoạn mảng [...], bỏ vụ replace lỗi LaTeX
    let text = response.text.trim();
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    
    if (firstBracket !== -1 && lastBracket !== -1) {
      text = text.substring(firstBracket, lastBracket + 1);
    } else {
        throw new Error("AI không trả về mảng JSON hợp lệ.");
    }
    
    // Parse thẳng text, AI đã được nhắc dùng \\\\ để escape ở trên
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