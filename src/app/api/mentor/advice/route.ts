import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CohereClient } from "cohere-ai"; // Import Cohere

// Khởi tạo Cohere Client
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY, // Đảm bảo bạn đã có key này trong file .env
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = await prisma.user.findUnique({ where: { email: session?.user?.email! } });
    
    // 1. LẤY DỮ LIỆU HỌC TẬP THẬT TỪ DB
    const results = await prisma.examResult.findMany({
        where: { userId: user?.id },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { course: true }
    });

    // 2. TẠO PROMPT (Đầu vào cho AI)
    const summary = results.map(r => `${r.course.title}: ${r.score} điểm`).join(", ");
    
    const prompt = `
      Bạn là một cố vấn học tập AI (AI Mentor) chuyên nghiệp. 
      Học viên tên là "${user?.name || 'bạn'}".
      Kết quả 5 bài thi gần nhất của học viên: ${summary || "Chưa có bài thi nào"}.
      
      Yêu cầu:
      - Hãy đưa ra một lời khuyên ngắn gọn (dưới 50 từ).
      - Giọng điệu: Thân thiện, động viên nhưng thẳng thắn.
      - Xưng hô: "Mình" (AI) và "Bạn" (Học viên).
      - Nếu điểm thấp, hãy khuyên ôn tập lại kiến thức cơ bản.
      - Nếu điểm cao, hãy khuyên duy trì và thử thách khó hơn.
      - Nếu chưa có điểm, hãy khuyên làm bài kiểm tra đầu tiên.
    `;

    // 3. GỌI API COHERE ĐỂ LẤY LỜI KHUYÊN
    const response = await cohere.chat({
      message: prompt,
      // model: "command", // Bạn có thể chọn model khác nếu muốn (command-r, command-light...)
    });

    const adviceText = response.text;

    return NextResponse.json({ advice: adviceText });

  } catch (error) {
    console.error("Cohere Error:", error);
    return NextResponse.json({ 
        advice: "Hệ thống AI đang bận một chút, nhưng hãy nhớ: Kiên trì là chìa khóa thành công! Hãy thử lại sau nhé." 
    });
  }
}