import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    
    // Lấy tham số từ URL
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode"); 
    const q = searchParams.get("q");
    const category = searchParams.get("category");

    // 1. Điều kiện lọc cơ bản
    let whereCondition: any = {};
    
    // Tìm kiếm tương đối (không phân biệt hoa thường nếu DB hỗ trợ)
    if (q) whereCondition.title = { contains: q };
    if (category && category !== "All") whereCondition.category = category;

    // 2. LOGIC TÁCH DỮ LIỆU
    if (mode === "mine") {
      // Nếu chưa đăng nhập mà đòi xem "Của tôi" -> Trả về rỗng ngay (Tránh lỗi Prisma)
      if (!userEmail) return NextResponse.json([]);

      whereCondition.savedCourses = {
        some: { user: { email: userEmail } }
      };
    } 
    else if (mode === "challenge") {
      // Chỉ lấy đề Online/Pro
      // Lưu ý: Đảm bảo trong DB cột format có giá trị này, nếu không hãy comment lại để test
      whereCondition.format = "ONLINE"; 
    }

    const courses = await prisma.course.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      include: {
        // Lấy thông tin đã lưu chưa (chỉ khi đã đăng nhập)
        savedCourses: userEmail ? {
          where: { user: { email: userEmail } }
        } : false,
        
        // Lấy điểm thi cao nhất (chỉ khi đã đăng nhập)
        examResults: userEmail ? {
          where: { user: { email: userEmail } },
          select: { score: true }
        } : false
      }
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("GET COURSE ERROR:", error); // In lỗi ra terminal để dễ sửa
    return NextResponse.json({ error: "Lỗi Server khi tải khóa học" }, { status: 500 });
  }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { action } = body;
        
        // 🔥 QUAN TRỌNG: Ép kiểu courseId sang số (Int)
        // Vì DB mới của bạn ID là số, nhưng Frontend gửi lên là String
        const courseId = Number(body.courseId);

        if (isNaN(courseId)) {
            return NextResponse.json({ error: "Invalid Course ID" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        if (action === "SAVE_COURSE") {
           // Kiểm tra xem đã lưu chưa để tránh lỗi duplicate
           const existingSave = await prisma.savedCourse.findFirst({
               where: {
                   userId: user.id,
                   courseId: courseId
               }
           });

           if (!existingSave) {
               await prisma.savedCourse.create({
                   data: { userId: user.id, courseId: courseId }
               });
               
               // Tăng lượt tải
               await prisma.course.update({
                   where: { id: courseId },
                   data: { downloads: { increment: 1 } }
               });
           }
           
           return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid Action" }, { status: 400 });

    } catch (error) {
        console.error("POST COURSE ERROR:", error); // Quan trọng: Xem lỗi gì ở Terminal
        return NextResponse.json({ error: "Lỗi Server khi lưu khóa học" }, { status: 500 });
    }
}