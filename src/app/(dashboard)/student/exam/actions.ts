"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// LẤY ĐỀ THI TỪ DB THẬT
export async function getExamData(courseId: string) {
  // Chuyển string id thành number vì Course ID là Int
  const id = parseInt(courseId);

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      questions: {
        select: {
          id: true,
          text: true,
          options: true, // Lấy options JSON về
        }
      }
    }
  });

  if (!course) return null;

  return {
    id: course.id,
    title: `Bài thi: ${course.title}`,
    duration: 45, // Bạn có thể thêm trường duration vào DB nếu muốn
    questions: course.questions.map(q => ({
      id: q.id,
      text: q.text,
      options: q.options as string[] // Ép kiểu JSON sang mảng string
    }))
  };
}

// LOGIC NỘP BÀI & CHẤM ĐIỂM THẬT
export async function submitExam(courseId: string, userId: number, answers: any) {
  const id = parseInt(courseId);
  
  // 1. Lấy đáp án đúng từ DB để chấm
  const questions = await prisma.question.findMany({
    where: { courseId: id }
  });

  let score = 0;
  const total = questions.length;

  questions.forEach(q => {
    if (answers[q.id] === q.correctAnswer) {
      score++;
    }
  });

  // Quy đổi ra thang điểm 100
  const finalScore = total > 0 ? (score / total) * 100 : 0;

  // 2. Lưu kết quả vào DB
  await prisma.examResult.create({
    data: {
      userId: userId,
      courseId: id,
      score: finalScore,
      violationCount: 0, // Mặc định 0, sẽ update nếu Mắt thần bắt được lỗi
      feedback: finalScore >= 50 ? "Đạt yêu cầu" : "Cần cố gắng hơn"
    }
  });

  return { success: true, score: finalScore };
}