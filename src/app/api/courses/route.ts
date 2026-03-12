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

    // 1. Điều kiện lọc cơ bản (Học sinh chỉ thấy đề đã được duyệt)
    let whereCondition: any = {
      isPublished: true,
      approvalStatus: "APPROVED"
    };
    
    // Tìm kiếm tương đối
    if (q) whereCondition.title = { contains: q };
    if (category && category !== "All") whereCondition.category = category;

    // 2. LOGIC TÁCH DỮ LIỆU
    if (mode === "mine") {
      if (!userEmail) return NextResponse.json([]);

      whereCondition.savedCourses = {
        some: { user: { email: userEmail } }
      };
    } 
    else if (mode === "challenge") {
      whereCondition.format = "ONLINE"; 
    }

    const courses = await prisma.course.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { name: true } },
        _count: { select: { questions: true } },
        
        // Cần thiết để trang thi lấy được câu hỏi
        questions: {
            orderBy: { position: 'asc' }
        },

        savedCourses: userEmail ? {
          where: { user: { email: userEmail } }
        } : false,
        
        examResults: userEmail ? {
          where: { user: { email: userEmail } },
          select: { score: true }
        } : false
      }
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("GET COURSE ERROR:", error); 
    return NextResponse.json({ error: "Lỗi Server khi tải khóa học" }, { status: 500 });
  }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { action } = body;
        
        const courseId = Number(body.courseId);
        if (isNaN(courseId)) {
            return NextResponse.json({ error: "Invalid Course ID" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // ==============================================================================
        // ACTION 1: LƯU KHÓA HỌC (TẢI ĐỀ)
        // ==============================================================================
        if (action === "SAVE_COURSE") {
           const existingSave = await prisma.savedCourse.findFirst({
               where: { userId: user.id, courseId: courseId }
           });

           if (!existingSave) {
               await prisma.savedCourse.create({
                   data: { userId: user.id, courseId: courseId }
               });
               
               await prisma.course.update({
                   where: { id: courseId },
                   data: { downloads: { increment: 1 } }
               });
           }
           
           return NextResponse.json({ success: true });
        }

        // ==============================================================================
        // ACTION 2: NỘP BÀI, TỰ ĐỘNG CHẤM ĐIỂM (BẢO MẬT) VÀ BÁO CÁO GIAN LẬN
        // ==============================================================================
        if (action === "GRADE") {
            // 🔥 THAY ĐỔI: Chỉ nhận answers (đáp án học sinh chọn) từ Frontend
            const { answers, violationCount, isSuspended } = body;
            
            let finalScore = 0;

            // 1. Tự động chấm điểm (Lấy đáp án gốc từ DB để so sánh)
            const course = await prisma.course.findUnique({
                where: { id: courseId },
                include: { questions: true }
            });

            if (course && course.questions && course.questions.length > 0) {
                let correctCount = 0;
                
                course.questions.forEach((q) => {
                    if (q.type === "SHORT_ANSWER") {
                        const userAns = (answers[q.id] || "").toString().trim().toLowerCase();
                        let correctArr: string[] = [];
                        
                        // Xử lý mảng đáp án Tự luận an toàn
                        if (Array.isArray(q.correctAnswers)) {
                            correctArr = q.correctAnswers as string[];
                        } else if (typeof q.correctAnswers === 'string') {
                            try { 
                                correctArr = JSON.parse(q.correctAnswers); 
                            } catch(e) { 
                                correctArr = q.correctAnswers.split(','); 
                            }
                        }
                        
                        const isMatch = correctArr.some((ans: string) => ans.trim().toLowerCase() === userAns);
                        if (isMatch) correctCount++;
                    } else {
                        // So sánh câu Trắc nghiệm
                        if (answers[q.id] === q.correct) correctCount++; 
                    }
                });

                // Tính điểm thang 10 chuẩn xác
                finalScore = (correctCount / course.questions.length) * 10;
            }

            // 2. Lưu kết quả thi vào Database với số điểm MÁY CHỦ tự tính
            const result = await prisma.examResult.create({
                data: {
                    userId: user.id,
                    courseId: courseId,
                    score: finalScore,
                    violationCount: violationCount || 0,
                    isSuspended: isSuspended || false,
                }
            });

            // 3. 🚨 BÁO CÁO GIAN LẬN CHO GIÁO VIÊN
            if ((violationCount > 0 || isSuspended) && course) {
                await prisma.notification.create({
                    data: {
                        userId: course.authorId, 
                        type: "WARNING",
                        message: `⚠️ Cảnh báo: Học viên ${user.name || user.email} đã vi phạm quy chế ${violationCount} lần (Đình chỉ: ${isSuspended ? "Có" : "Không"}) khi thi bài "${course.title}".`,
                        link: `/teacher/analytics` 
                    }
                });
            }

            // Trả về điểm thật cho Frontend hiển thị lên màn hình
            return NextResponse.json({ success: true, result, calculatedScore: finalScore });
        }

        return NextResponse.json({ error: "Invalid Action" }, { status: 400 });

    } catch (error) {
        console.error("POST COURSE ERROR:", error);
        return NextResponse.json({ error: "Lỗi Server khi xử lý dữ liệu" }, { status: 500 });
    }
}