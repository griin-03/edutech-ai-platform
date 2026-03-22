import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || "", 
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, scoreFromClient } = body;

    const courseId = Number(body.courseId);

    if (isNaN(courseId)) {
        return NextResponse.json({ error: "Invalid Course ID (Phải là số)" }, { status: 400 });
    }

    // 1. GENERATE (TẠO ĐỀ THI TRẮC NGHIỆM & TỰ LUẬN)
    if (action === "GENERATE") {
      if (!process.env.COHERE_API_KEY) {
        return NextResponse.json({ error: "Server thiếu COHERE_API_KEY" }, { status: 500 });
      }

      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course) return NextResponse.json({ error: "Khóa học không tồn tại" }, { status: 404 });

      console.log(`>> [Cohere] Đang tạo đề cho: ${course.title}...`);

      // 🌟 PROMPT MỚI: TÍCH HỢP LUẬT [SLASH] BẢO VỆ JSON
      const prompt = `
        Đóng vai là một Chuyên gia khảo thí cấp cao của Bộ Giáo dục và Đào tạo Việt Nam.
        Nhiệm vụ: Tạo một bộ đề thi gồm 10 câu hỏi (7 câu trắc nghiệm, 3 câu tự luận ngắn điền từ) cho khóa học "${course.title}" (Cấp độ: ${course.level}).

        YÊU CẦU NGHIÊM NGẶT VỀ NỘI DUNG (BỎ QUA TẠO ẢNH):
        1. Câu trắc nghiệm (MULTIPLE_CHOICE): Gồm 4 đáp án, chỉ 1 đáp án đúng.
        2. Câu tự luận ngắn (SHORT_ANSWER): Câu hỏi yêu cầu điền 1 từ, cụm từ ngắn hoặc 1 con số. BẮT BUỘC cung cấp một mảng các đáp án có thể chấp nhận được (đồng nghĩa, viết tắt hợp lý, sai khác nhỏ) để hệ thống chấm điểm tự động. Ví dụ: ["ReactJS", "React JS", "React"].
        
        STRICT TECHNICAL RULES (VIOLATION CAUSES SERVER CRASH):
        1. Return ONLY a valid JSON array. NO greetings, NO explanations.
        2. Do NOT use backslashes (\\) inside strings. Use the keyword [SLASH] instead of backslashes for any formulas or special characters. Example: write [SLASH]frac{1}{2} instead of \\frac{1}{2}.
        3. Do NOT use Markdown formatting (no \`\`\`json).
        
        BẮT BUỘC TUÂN THỦ CẤU TRÚC JSON SAU MỘT CÁCH NGHIÊM NGẶT:
        [
          {
            "id": 1,
            "type": "MULTIPLE_CHOICE",
            "text": "Nội dung câu hỏi trắc nghiệm?",
            "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
            "correct": 0
          },
          {
            "id": 2,
            "type": "SHORT_ANSWER",
            "text": "Nội dung câu hỏi điền từ ngắn?",
            "correctAnswers": ["đáp án chuẩn", "đáp án đồng nghĩa 1", "đáp án đồng nghĩa 2"]
          }
        ]
      `;

      const generateQuestions = async (retryCount = 0): Promise<any> => {
        try {
          const response = await cohere.chat({
            model: "command-r-08-2024", 
            message: prompt,
            temperature: 0.4 + (retryCount * 0.1), 
          });

          let text = response.text;
          text = text.replace(/```json/g, "").replace(/```/g, "").trim();
          
          const firstBracket = text.indexOf("[");
          const lastBracket = text.lastIndexOf("]");
          if (firstBracket !== -1 && lastBracket !== -1) {
              text = text.substring(firstBracket, lastBracket + 1);
          }

          // ==========================================================
          // 🛡️ BẢO VỆ 2 LỚP: TIỀN XỬ LÝ DỮ LIỆU JSON TRƯỚC KHI PARSE
          // ==========================================================
          
          // Lớp 1: Khôi phục từ khóa [SLASH] thành escape character chuẩn của JSON (\\)
          // Nhờ đó LaTeX hiển thị mượt mà không bị sập hàm JSON.parse()
          text = text.split('[SLASH]').join('\\\\'); 
          
          // Lớp 2: Xóa các ký tự điều khiển ẩn (ẩn tàng hình) do AI đôi khi sinh ra làm vỡ JSON
          text = text.replace(/[\u0000-\u001F]+/g, ""); 
          
          const questions = JSON.parse(text);

          if (!Array.isArray(questions) || questions.length < 5) {
             throw new Error("Dữ liệu không đủ hoặc sai định dạng");
          }

          // Phân loại và map dữ liệu chuẩn xác trước khi gửi về Frontend
          return questions.slice(0, 10).map((q: any, i: number) => {
            if (q.type === "SHORT_ANSWER") {
              return {
                id: i + 1,
                type: "SHORT_ANSWER",
                text: q.text,
                correctAnswers: q.correctAnswers || []
              };
            }
            // Mặc định là trắc nghiệm
            return {
              id: i + 1,
              type: "MULTIPLE_CHOICE",
              text: q.text,
              options: q.options || [],
              correct: q.correct !== undefined ? q.correct : 0
            };
          });

        } catch (err: any) {
          console.error(`>> Lỗi lần ${retryCount + 1}:`, err.message);
          if (retryCount < 2) { 
             console.log(">> Đang thử lại...");
             return await generateQuestions(retryCount + 1);
          }
          throw err; 
        }
      };

      try {
        const questions = await generateQuestions();
        return NextResponse.json({ questions });
      } catch (finalError) {
        return NextResponse.json({ error: "AI đang bận, vui lòng thử lại!" }, { status: 500 });
      }
    }

    // 2. GRADE (GIỮ NGUYÊN)
    if (action === "GRADE") {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const user = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      await prisma.examResult.create({
        data: {
          score: parseFloat(scoreFromClient),
          feedback: scoreFromClient >= 5 ? "Đạt" : "Cần cố gắng",
          userId: user.id,
          courseId: courseId 
        }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}