import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode"); 
    const q = searchParams.get("q");
    const category = searchParams.get("category");

    let whereCondition: any = {
      isPublished: true,
      approvalStatus: "APPROVED"
    };
    
    if (q) whereCondition.title = { contains: q };
    if (category && category !== "All") whereCondition.category = category;

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
        questions: {
            orderBy: { position: 'asc' }
        },
        savedCourses: userEmail ? {
          where: { user: { email: userEmail } }
        } : false,
        examResults: userEmail ? {
          where: { user: { email: userEmail } },
          select: { score: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1
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

        if (action === "GRADE") {
            // 🔥 KIỂM TRA XEM ĐÃ CÓ KẾT QUẢ THI CHƯA
            const tenSecondsAgo = new Date(Date.now() - 10 * 1000); // Giảm xuống 10 giây để test
            
            const existingResult = await prisma.examResult.findFirst({
                where: {
                    userId: user.id,
                    courseId: courseId,
                    createdAt: {
                        gte: tenSecondsAgo
                    }
                }
            });

            if (existingResult) {
                console.log("Đã có kết quả thi gần đây, trả về kết quả cũ:", existingResult);
                return NextResponse.json({ 
                    success: true, 
                    result: existingResult,
                    calculatedScore: existingResult.score,
                    message: "Đã có kết quả thi trước đó"
                });
            }

            // 🔥 LẤY ANSWERS TỪ BODY
            const answers = body.answers || {};
            const violationCount = Number(body.violationCount) || 0;
            const isSuspended = Boolean(body.isSuspended) || false;
            
            console.log("========== BẮT ĐẦU CHẤM ĐIỂM ==========");
            console.log("Course ID:", courseId);
            console.log("User:", user.email);
            console.log("Received answers:", JSON.stringify(answers, null, 2));
            
            // KIỂM TRA NẾU ANSWERS RỖNG
            if (Object.keys(answers).length === 0) {
                console.log("⚠️ CẢNH BÁO: Answers rỗng! Kiểm tra frontend gửi dữ liệu");
            }
            
            let finalScore = 0;
            let courseTitle = "Bài thi không tên";
            let authorId = null;

            // Lấy đề thi và câu hỏi
            const course = await prisma.course.findUnique({
                where: { id: courseId },
                include: { questions: true }
            });

            if (!course) {
                console.error("Không tìm thấy course với ID:", courseId);
                return NextResponse.json({ error: "Không tìm thấy đề thi" }, { status: 404 });
            }

            courseTitle = course.title;
            authorId = course.authorId;
            
            console.log("Course title:", courseTitle);
            console.log("Số lượng câu hỏi:", course.questions?.length || 0);
            
            // CHẤM ĐIỂM
            if (course.questions && course.questions.length > 0) {
                let correctCount = 0;
                
                course.questions.forEach((q, index) => {
                    // Lấy đáp án của học sinh từ answers object
                    const studentAnswer = answers[q.id];
                    
                    console.log(`\n----- Câu ${index + 1} (ID: ${q.id}) -----`);
                    console.log("Type:", q.type);
                    console.log("Student answer:", studentAnswer, "Type:", typeof studentAnswer);
                    console.log("Correct in DB:", q.correct, "Type:", typeof q.correct);

                    if (q.type === "SHORT_ANSWER") {
                        // Xử lý tự luận
                        const userAns = studentAnswer ? studentAnswer.toString().trim().toLowerCase() : "";
                        
                        if (userAns !== "") {
                            let correctArr: string[] = [];
                            
                            if (Array.isArray(q.correctAnswers)) {
                                correctArr = q.correctAnswers as string[];
                            } else if (typeof q.correctAnswers === 'string') {
                                try { 
                                    correctArr = JSON.parse(q.correctAnswers); 
                                } catch(e) { 
                                    correctArr = q.correctAnswers.split(',').map((s: string) => s.trim()); 
                                }
                            }
                            
                            const isMatch = correctArr.some((ans: string) => ans.trim().toLowerCase() === userAns);
                            if (isMatch) {
                                correctCount++;
                                console.log("✅ ĐÚNG");
                            } else {
                                console.log("❌ SAI");
                            }
                        } else {
                            console.log("⚠️ Bỏ qua (trống)");
                        }
                    } else {
                        // Xử lý trắc nghiệm
                        if (studentAnswer !== undefined && studentAnswer !== null && studentAnswer !== "") {
                            // Chuyển đổi về number để so sánh
                            const studentAnsNum = Number(studentAnswer);
                            const correctAnsNum = Number(q.correct);
                            
                            console.log("So sánh:", studentAnsNum, "===", correctAnsNum);
                            
                            if (!isNaN(studentAnsNum) && !isNaN(correctAnsNum) && studentAnsNum === correctAnsNum) {
                                correctCount++;
                                console.log("✅ ĐÚNG");
                            } else {
                                console.log("❌ SAI");
                            }
                        } else {
                            console.log("⚠️ Bỏ qua (không chọn đáp án)");
                        }
                    }
                });

                // Tính điểm
                finalScore = Number(((correctCount / course.questions.length) * 10).toFixed(2));
                console.log(`\n========== KẾT QUẢ ==========`);
                console.log(`Đúng: ${correctCount}/${course.questions.length} câu`);
                console.log(`Điểm: ${finalScore}`);
            }

            // LƯU KẾT QUẢ
            console.log("\nĐang lưu kết quả vào database...");
            
            const result = await prisma.examResult.create({
                data: {
                    userId: user.id,
                    courseId: courseId,
                    score: finalScore,
                    violationCount: violationCount,
                    isSuspended: isSuspended,
                }
            });

            console.log("Đã lưu kết quả:", result);

            // GỬI THÔNG BÁO GIAN LẬN
            if ((violationCount > 0 || isSuspended) && authorId) {
                await prisma.notification.create({
                    data: {
                        userId: authorId, 
                        type: "WARNING",
                        message: `⚠️ Cảnh báo: Học viên ${user.name || user.email} đã vi phạm quy chế ${violationCount} lần (Đình chỉ: ${isSuspended ? "Có" : "Không"}) khi thi bài "${courseTitle}".`,
                        link: `/teacher/analytics` 
                    }
                });
                console.log("Đã gửi thông báo gian lận cho giáo viên");
            }

            return NextResponse.json({ 
                success: true, 
                result, 
                calculatedScore: finalScore,
                message: "Nộp bài thành công"
            });
        }

        return NextResponse.json({ error: "Invalid Action" }, { status: 400 });

    } catch (error) {
        console.error("POST COURSE ERROR:", error);
        return NextResponse.json({ error: "Lỗi Server khi xử lý dữ liệu" }, { status: 500 });
    }
}