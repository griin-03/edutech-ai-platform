"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// 1. HÀM NẠP TIỀN VÀO VÍ (CHO STUDENT - DEMO)
export async function depositToWallet(amount: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { success: false, message: "Unauthorized" };

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { success: false, message: "User not found" };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      balance: { increment: amount },
      transactions: {
        create: {
          amount: amount,
          type: "DEPOSIT", // Nạp tiền
          description: "Nạp tiền vào ví EduWallet (Demo)"
        }
      }
    }
  });

  revalidatePath("/student/wallet");
  return { success: true };
}

// 2. HÀM MUA KHÓA HỌC (CÓ CHIA HOA HỒNG CHO ADMIN)
export async function buyCourse(courseId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { success: false, message: "Chưa đăng nhập" };

  const student = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!student) return { success: false, message: "Lỗi tài khoản" };

  // Lấy thông tin khóa học & tác giả
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { author: true } 
  });

  if (!course) return { success: false, message: "Khóa học không tồn tại" };
  if (!course.isPublished) return { success: false, message: "Khóa học chưa phát hành" };

  // CHECK 1: Đã mua chưa?
  const existingPurchase = await prisma.purchase.findFirst({
    where: { userId: student.id, courseId: course.id }
  });
  if (existingPurchase) return { success: false, message: "Bạn đã sở hữu khóa học này rồi" };

  // CHECK 2: Ví có đủ tiền không?
  if (student.balance < course.price) {
    return { success: false, message: "Số dư không đủ. Vui lòng nạp thêm!" };
  }

  // --- LOGIC TÍNH TOÁN CHIA TIỀN ---
  // 1. Lấy tỷ lệ hoa hồng từ cấu hình (Mặc định 20%)
  const systemConfig = await prisma.systemConfig.findFirst();
  const commissionRate = systemConfig?.commissionRate || 20; 

  const totalPrice = course.price;
  const adminShare = (totalPrice * commissionRate) / 100; // Admin nhận
  const teacherShare = totalPrice - adminShare;           // Teacher nhận

  // 2. Tìm Admin để cộng tiền
  const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  
  // Nếu không có Admin thì tiền hoa hồng sẽ bị "đốt" (hoặc bạn có thể cộng hết cho Teacher tùy logic)
  // Ở đây giả định luôn có 1 Admin.

  try {
    // TRANSACTION: Thực hiện mọi thứ cùng lúc (An toàn tuyệt đối)
    await prisma.$transaction(async (tx) => {
      
      // A. TRỪ TIỀN STUDENT (Trừ 100% giá)
      await tx.user.update({
        where: { id: student.id },
        data: { balance: { decrement: totalPrice } }
      });

      // B. CỘNG TIỀN TEACHER (Nhận 80%)
      await tx.user.update({
        where: { id: course.authorId },
        data: { balance: { increment: teacherShare } }
      });

      // C. CỘNG TIỀN ADMIN (Nhận 20%)
      if (adminUser) {
        await tx.user.update({
          where: { id: adminUser.id },
          data: { balance: { increment: adminShare } }
        });
      }

      // D. TẠO BẢN GHI MUA HÀNG (Để mở khóa học)
      await tx.purchase.create({
        data: {
          userId: student.id,
          courseId: course.id,
          price: totalPrice
        }
      });

      // --- E. LƯU LỊCH SỬ GIAO DỊCH (LOGGING) ---

      // Log cho Student
      await tx.transaction.create({
        data: {
          userId: student.id,
          amount: -totalPrice,
          type: "PAYMENT",
          description: `Mua khóa học: ${course.title}`
        }
      });

      // Log cho Teacher
      await tx.transaction.create({
        data: {
          userId: course.authorId,
          amount: teacherShare,
          type: "RECEIVE",
          description: `Bán khóa học: ${course.title} (Đã trừ ${commissionRate}% phí sàn)`
        }
      });

      // Log cho Admin (nếu có)
      if (adminUser) {
        await tx.transaction.create({
          data: {
            userId: adminUser.id,
            amount: adminShare,
            type: "COMMISSION",
            description: `Hoa hồng ${commissionRate}% từ khóa: ${course.title}`
          }
        });
      }
      
      // F. Gửi thông báo cho Teacher
      await tx.notification.create({
        data: {
            userId: course.authorId,
            type: "SALE",
            message: `💰 Ting ting! Bạn bán được khóa "${course.title}". Nhận: ${teacherShare.toLocaleString()}đ (Phí sàn: ${adminShare.toLocaleString()}đ)`
        }
      });
    });

    // Revalidate các trang cần thiết
    revalidatePath(`/student/my-courses`);
    revalidatePath(`/student/wallet`);
    
    return { success: true };

  } catch (error) {
    console.error("Lỗi giao dịch mua khóa học:", error);
    return { success: false, message: "Giao dịch thất bại. Vui lòng thử lại." };
  }
}