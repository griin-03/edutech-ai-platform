"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { CohereClient } from "cohere-ai";

// Khởi tạo Client AI thật
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY, 
});

// ==============================================================================
// 1. TẠO KHÓA HỌC MỚI (Dữ liệu thật vào DB)
// ==============================================================================
export async function createCourse(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return { success: false, message: "Bạn chưa đăng nhập hoặc phiên làm việc hết hạn." };
    }

    const title = formData.get("title") as string;
    
    // Validate chặt chẽ (Logic đồ án tốt nghiệp)
    if (!title || title.trim().length < 5) {
      return { success: false, message: "Tiêu đề quá ngắn. Vui lòng nhập ít nhất 5 ký tự." };
    }

    // Lấy User ID chuẩn từ DB
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { success: false, message: "Lỗi xác thực người dùng." };

    // Ghi dữ liệu thật vào Database
    const course = await prisma.course.create({
      data: {
        title: title.trim(),
        authorId: user.id,
        isPublished: false,    // Mặc định là Nháp
        approvalStatus: "PENDING", // Chờ Admin duyệt
        price: 0,
        category: "Chưa phân loại"
      }
    });

    return { 
      success: true, 
      message: "Khởi tạo khóa học thành công! Đang chuyển hướng...", 
      courseId: course.id 
    };

  } catch (error) {
    console.error("[CREATE_COURSE_ERROR]:", error);
    return { success: false, message: "Lỗi hệ thống khi tạo khóa học." };
  }
}

// ==============================================================================
// 2. AI GENERATOR (Gọi API Cohere thật)
// ==============================================================================
export async function generateCourseOutlineAI(topic: string) {
  try {
    if (!process.env.COHERE_API_KEY) {
      throw new Error("Chưa cấu hình COHERE_API_KEY");
    }

    // Prompt Engineering nâng cao để AI trả về JSON chuẩn
    const prompt = `
      Đóng vai một Chuyên gia Giáo dục (Instructional Designer).
      Nhiệm vụ: Tạo đề cương chi tiết cho khóa học chủ đề "${topic}".
      
      YÊU CẦU NGHIÊM NGẶT VỀ OUTPUT (JSON):
      1. Chỉ trả về 1 mảng JSON (Array of Objects).
      2. KHÔNG trả về markdown, không \`\`\`json, không lời dẫn.
      3. Cấu trúc JSON bắt buộc:
      [
        {
          "title": "Tên Chương 1 (Hấp dẫn)",
          "lessons": ["Tên bài 1", "Tên bài 2", "Tên bài 3"]
        },
        {
          "title": "Tên Chương 2 (Chuyên sâu)",
          "lessons": ["Tên bài 1", "Tên bài 2"]
        }
      ]
      
      YÊU CẦU NỘI DUNG:
      - Tạo 3-5 chương.
      - Mỗi chương 2-5 bài học.
      - Ngôn ngữ: Tiếng Việt chuyên ngành.
      - Nội dung thực tế, đi từ cơ bản đến nâng cao.
    `;

    // Gọi API (Mất khoảng 2-4s)
    const response = await cohere.chat({
      message: prompt,
      temperature: 0.3, // Giữ độ sáng tạo thấp để cấu trúc ổn định
      model: "command-r", 
    });

    let text = response.text;
    
    // Xử lý làm sạch chuỗi JSON (Data Cleaning Logic)
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    
    if (firstBracket !== -1 && lastBracket !== -1) {
      text = text.substring(firstBracket, lastBracket + 1);
    }

    const outline = JSON.parse(text);
    return outline;

  } catch (error) {
    console.error("[AI_GENERATE_ERROR]:", error);
    // Fallback: Trả về mảng rỗng hoặc lỗi để Client xử lý
    return []; 
  }
}

// ==============================================================================
// 3. LƯU ĐỀ CƯƠNG VÀO DB (Sử dụng Transaction an toàn)
// ==============================================================================
export async function applyAiOutline(courseId: number, outline: any[]) {
  try {
    // Sử dụng Transaction: Nếu 1 bài học lỗi, hủy toàn bộ quá trình để tránh rác DB
    await prisma.$transaction(async (tx) => {
      
      // Xóa nội dung cũ nếu có (Để tránh trùng lặp khi bấm Generate nhiều lần)
      // await tx.chapter.deleteMany({ where: { courseId } }); // Bỏ comment nếu muốn reset

      for (let i = 0; i < outline.length; i++) {
        const chapterData = outline[i];

        // 1. Tạo Chương
        const chapter = await tx.chapter.create({
          data: {
            title: chapterData.title,
            courseId: courseId,
            position: i + 1,
            isPublished: true
          }
        });

        // 2. Tạo Bài học (Bulk Insert nếu DB hỗ trợ hoặc loop)
        if (chapterData.lessons && chapterData.lessons.length > 0) {
          for (let j = 0; j < chapterData.lessons.length; j++) {
            await tx.lesson.create({
              data: {
                title: chapterData.lessons[j],
                chapterId: chapter.id,
                position: j + 1,
                isPublished: true
              }
            });
          }
        }
      }
    });

    // Revalidate để giao diện cập nhật ngay lập tức
    revalidatePath(`/teacher/courses/${courseId}`);
    return { success: true, message: "Đã lưu nội dung vào khóa học!" };

  } catch (error) {
    console.error("[APPLY_OUTLINE_ERROR]:", error);
    return { success: false, message: "Lỗi khi lưu dữ liệu vào Database." };
  }
}