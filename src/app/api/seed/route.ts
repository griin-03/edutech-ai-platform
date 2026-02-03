// FILE: src/app/api/seed/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Kiểm tra xem đã có khóa học chưa
    const count = await prisma.course.count();
    if (count > 0) {
      return NextResponse.json({ message: "Database đã có dữ liệu rồi, không cần tạo thêm." });
    }

    // 2. Nếu chưa có, tạo 6 khóa học mẫu y hệt giao diện
    const courses = await prisma.course.createMany({
      data: [
        {
          title: "IELTS Intensive Masterclass: Reading & Listening",
          description: "Dr. Sarah Watson",
          level: "Advanced",
          thumbnail: "bg-gradient-to-br from-amber-500 to-orange-600"
        },
        {
          title: "ReactJS & Next.js 14: The Complete Guide",
          description: "Maximilian Schwarz",
          level: "Intermediate",
          thumbnail: "bg-gradient-to-br from-blue-500 to-cyan-600"
        },
        {
          title: "UI/UX Design Fundamentals with Figma",
          description: "Gary Simon",
          level: "Beginner",
          thumbnail: "bg-gradient-to-br from-purple-500 to-pink-600"
        },
        {
          title: "Python for Data Science and Machine Learning",
          description: "Jose Portilla",
          level: "Advanced",
          thumbnail: "bg-gradient-to-br from-emerald-500 to-teal-600"
        },
        {
          title: "English Writing Task 2: Band 8.0 Strategies",
          description: "IELTS Liz",
          level: "Advanced",
          thumbnail: "bg-gradient-to-br from-rose-500 to-red-600"
        },
        {
          title: "Webflow 101: The Future of Web Design",
          description: "Ran Segall",
          level: "Beginner",
          thumbnail: "bg-gradient-to-br from-stone-600 to-stone-800"
        }
      ]
    });

    return NextResponse.json({ success: true, message: "Đã tạo thành công 6 khóa học mẫu vào Database!" });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi tạo dữ liệu mẫu" }, { status: 500 });
  }
}