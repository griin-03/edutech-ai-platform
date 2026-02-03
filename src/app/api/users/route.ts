import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Nếu chưa đăng nhập, trả về khóa học nhưng không có kết quả thi
    if (!session?.user?.email) {
      const courses = await prisma.course.findMany();
      return NextResponse.json(courses);
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) return NextResponse.json([], { status: 404 });

    // Lấy khóa học KÈM THEO kết quả thi của User này
    const courses = await prisma.course.findMany({
      include: {
        examResults: {
          where: { userId: user.id }, // Chỉ lấy kết quả của user đang đăng nhập
          orderBy: { score: 'desc' }  // Sắp xếp điểm cao nhất lên đầu
        }
      }
    });

    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}