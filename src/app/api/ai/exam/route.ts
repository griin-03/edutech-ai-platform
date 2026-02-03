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

    // 🔥 FIX QUAN TRỌNG NHẤT: Ép kiểu courseId từ String sang Int
    // Database mới của bạn id là số, nếu để string prisma sẽ báo lỗi
    const courseId = Number(body.courseId);

    if (isNaN(courseId)) {
        return NextResponse.json({ error: "Invalid Course ID (Phải là số)" }, { status: 400 });
    }

    // 1. GENERATE (TẠO ĐỀ THI VỚI CƠ CHẾ RETRY)
    if (action === "GENERATE") {
      if (!process.env.COHERE_API_KEY) {
        return NextResponse.json({ error: "Server thiếu COHERE_API_KEY" }, { status: 500 });
      }

      // Lúc này courseId đã là số, findUnique sẽ chạy mượt mà
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course) return NextResponse.json({ error: "Khóa học không tồn tại" }, { status: 404 });

      console.log(`>> [Cohere] Đang tạo đề cho: ${course.title}...`);

      const prompt = `
        You are an expert exam creator.
        Task: Create 10 multiple-choice questions for the course "${course.title}" (Level: ${course.level}).
        
        STRICT OUTPUT RULES:
        1. Return ONLY valid JSON array.
        2. Do NOT use backslashes (\\) inside strings. Use forward slashes (/) if needed.
        3. Do NOT use Markdown formatting (no \`\`\`json).
        4. "correct" must be an integer index (0-3).
        
        JSON Structure:
        [
          {
            "id": 1,
            "text": "Question content without special characters?",
            "options": ["A", "B", "C", "D"],
            "correct": 0,
            "imageKeyword": "simple noun"
          }
        ]
      `;

      // HÀM RETRY: Tự động thử lại 3 lần nếu lỗi JSON
      const generateQuestions = async (retryCount = 0): Promise<any> => {
        try {
          const response = await cohere.chat({
            model: "command-r-08-2024", // Model ổn định nhất
            message: prompt,
            temperature: 0.4 + (retryCount * 0.1), // Tăng độ sáng tạo nếu thử lại
          });

          let text = response.text;

          // 1. Lọc bỏ Markdown
          text = text.replace(/```json/g, "").replace(/```/g, "").trim();
          
          // 2. Cắt lấy đúng đoạn Array [...]
          const firstBracket = text.indexOf("[");
          const lastBracket = text.lastIndexOf("]");
          if (firstBracket !== -1 && lastBracket !== -1) {
              text = text.substring(firstBracket, lastBracket + 1);
          }

          // 3. Sửa lỗi "Bad escaped character" (Thay thế \ bằng /)
          text = text.replace(/\\/g, "/"); 

          const questions = JSON.parse(text);

          // Validate dữ liệu
          if (!Array.isArray(questions) || questions.length < 5) {
             throw new Error("Dữ liệu không đủ hoặc sai định dạng");
          }

          return questions.slice(0, 10).map((q: any, i: number) => ({
            id: i + 1,
            text: q.text,
            options: q.options,
            correct: q.correct,
            imageKeyword: q.imageKeyword || "technology"
          }));

        } catch (err: any) {
          console.error(`>> Lỗi lần ${retryCount + 1}:`, err.message);
          if (retryCount < 2) { // Thử lại tối đa 2 lần nữa
             console.log(">> Đang thử lại...");
             return await generateQuestions(retryCount + 1);
          }
          throw err; // Nếu quá 3 lần thì mới báo lỗi ra ngoài
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
          courseId: courseId // Sử dụng courseId đã ép kiểu số
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