import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CohereClient } from "cohere-ai";

// 1. Cấu hình Cohere
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || "", 
});

// 2. Định nghĩa các Vai trò (Persona) của AI
const SYSTEM_PROMPTS: Record<string, string> = {
  general: "Bạn là EduTech Genious, một trợ lý học tập thông minh, thân thiện và am hiểu nhiều lĩnh vực. Hãy trả lời ngắn gọn, súc tích và khích lệ tinh thần học tập.",
  ielts: "You are Ms. Sarah, a strict but helpful IELTS Examiner. Focus on correcting grammar, suggesting advanced vocabulary (C1/C2), and improving coherence. Always respond in English unless asked otherwise.",
  math: "Bạn là Giáo sư Newton, chuyên gia Toán học. Hãy giải thích các vấn đề toán học theo từng bước (step-by-step), logic và dễ hiểu. Sử dụng LaTeX cho công thức nếu cần.",
  code: "Bạn là Dev Senior. Hãy review code, chỉ ra lỗi sai (bugs), gợi ý cách tối ưu (clean code) và giải thích về kiến trúc phần mềm. Luôn đưa ra ví dụ code minh họa."
};

// --- XỬ LÝ POST: NHẬN TIN NHẮN & TRẢ LỜI ---
export async function POST(req: Request) {
  try {
    // A. Kiểm tra đăng nhập
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // B. Lấy dữ liệu từ Client
    const { message, sessionId, persona } = await req.json();
    
    if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });

    let currentSessionId = sessionId;

    // C. Xử lý Session (Tạo mới hoặc Lấy cũ)
    if (!currentSessionId) {
      // Nếu chưa có session -> Tạo mới
      const newSession = await prisma.chatSession.create({
        data: {
          title: message.substring(0, 40) + "...", // Lấy 40 ký tự đầu làm tiêu đề
          userId: user.id,
          type: "tutor"
        }
      });
      currentSessionId = newSession.id;
    }

    // D. Lưu tin nhắn của User vào DB
    await prisma.chatMessage.create({
      data: {
        role: "user",
        content: message,
        sessionId: currentSessionId
      }
    });

    // E. Lấy lịch sử chat cũ để AI "nhớ" ngữ cảnh (Lấy 10 tin gần nhất)
    const history = await prisma.chatMessage.findMany({
      where: { sessionId: currentSessionId },
      orderBy: { createdAt: 'asc' },
      take: 10
    });

    // Format lịch sử cho Cohere
    const chatHistory = history.map(msg => ({
      role: msg.role === "user" ? "USER" : "CHATBOT",
      message: msg.content
    }));

    // F. Gửi lên Cohere AI
    const systemPrompt = SYSTEM_PROMPTS[persona] || SYSTEM_PROMPTS["general"];
    
    const response = await cohere.chat({
      model: "command-r-08-2024",
      message: message,
      chatHistory: chatHistory as any,
      preamble: systemPrompt, // Đây là chỗ set vai trò (IELTS, Math...)
      temperature: 0.3,
    });

    const aiReply = response.text;

    // G. Lưu câu trả lời của AI vào DB
    await prisma.chatMessage.create({
      data: {
        role: "assistant", // Lưu ý: Trong DB mình đặt là 'assistant' hoặc 'ai' tùy enum, ở đây lưu string
        content: aiReply,
        sessionId: currentSessionId
      }
    });

    // Cập nhật thời gian update cho session (để nó nhảy lên đầu list)
    await prisma.chatSession.update({
      where: { id: currentSessionId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({ reply: aiReply, sessionId: currentSessionId });

  } catch (error: any) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// --- XỬ LÝ GET: LẤY LỊCH SỬ CHAT ---
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json([], { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json([], { status: 404 });

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    // Case 1: Lấy danh sách các cuộc trò chuyện (Sidebar)
    if (action === "GET_SESSIONS") {
      const sessions = await prisma.chatSession.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' }, // Mới nhất lên đầu
        take: 20
      });
      return NextResponse.json(sessions);
    }

    // Case 2: Lấy nội dung chi tiết của 1 cuộc trò chuyện
    if (action === "GET_MESSAGES") {
      const sessionId = searchParams.get("sessionId");
      if (!sessionId) return NextResponse.json([]);

      const messages = await prisma.chatMessage.findMany({
        where: { sessionId: sessionId },
        orderBy: { createdAt: 'asc' } // Cũ nhất ở trên
      });
      return NextResponse.json(messages);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}