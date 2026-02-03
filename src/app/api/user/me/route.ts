import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  // Lấy dữ liệu trực tiếp từ DB
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      email: true,
      bio: true,
      avatar: true, 
      role: true, // <--- BỔ SUNG DÒNG NÀY ĐỂ BIẾT LÀ ADMIN HAY STUDENT
    }
  });

  return NextResponse.json(user);
}