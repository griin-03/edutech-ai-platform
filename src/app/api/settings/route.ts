import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
  try {
    // 1. CHẶN TRUY CẬP TRÁI PHÉP
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để thực hiện" }, { status: 401 });
    }

    // [DEBUG] Log để xem server có nhận được request không
    console.log("👉 [API START] Bắt đầu xử lý request Settings...");

    // 2. ĐỌC DỮ LIỆU (Thường lỗi "Payload too large" sẽ sập ở dòng này)
    let body;
    try {
        body = await req.json();
    } catch (parseError) {
        console.error("❌ [API ERROR] Lỗi khi đọc JSON body (Có thể do file quá lớn):", parseError);
        return NextResponse.json({ 
            error: "Gói tin quá lớn! Server không thể đọc dữ liệu. Hãy kiểm tra lại next.config.ts" 
        }, { status: 413 });
    }

    const { type, data } = body;
    const userEmail = session.user.email;
    
    // [DEBUG] In ra loại request và độ dài dữ liệu để kiểm tra
    console.log(`👉 [API INFO] User: ${userEmail} | Type: ${type}`);
    if (data.avatar) {
        console.log(`👉 [API INFO] Đang nhận Avatar. Độ dài chuỗi Base64: ${data.avatar.length} ký tự`);
    }

    // =========================================================
    // CASE 1: CẬP NHẬT HỒ SƠ (PROFILE & AVATAR)
    // =========================================================
    if (type === "profile") {
        if (!data.name || data.name.trim().length < 2) {
             return NextResponse.json({ error: "Tên hiển thị phải có ít nhất 2 ký tự" }, { status: 400 });
        }

        console.log("👉 [DB] Đang gọi Prisma update...");
        
        await prisma.user.update({
            where: { email: userEmail },
            data: {
                name: data.name.trim(),
                bio: data.bio ? data.bio.trim() : null,
                avatar: data.avatar // Lưu chuỗi Base64 ảnh
            }
        });

        console.log("✅ [DB] Update thành công!");
        return NextResponse.json({ success: true, message: "Đã cập nhật hồ sơ thành công" });
    }

    // =========================================================
    // CASE 2: ĐỔI MẬT KHẨU (NÂNG CẤP BẢO MẬT)
    // =========================================================
    if (type === "security") {
        const { currentPassword, newPassword } = data;
        
        const user = await prisma.user.findUnique({ where: { email: userEmail } });
        if (!user) return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 });

        if (!user.password) {
            return NextResponse.json({ 
                error: "Tài khoản này đăng nhập bằng Google/MXH, không thể đổi mật khẩu." 
            }, { status: 400 });
        }

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return NextResponse.json({ error: "Mật khẩu hiện tại không chính xác" }, { status: 400 });
        }

        if (newPassword.length < 6) {
             return NextResponse.json({ error: "Mật khẩu mới quá ngắn (tối thiểu 6 ký tự)" }, { status: 400 });
        }

        const isSameAsOld = await bcrypt.compare(newPassword, user.password);
        if (isSameAsOld) {
            return NextResponse.json({ error: "Mật khẩu mới không được trùng với mật khẩu cũ" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await prisma.user.update({
            where: { email: userEmail },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ success: true, message: "Đổi mật khẩu thành công!" });
    }

    // =========================================================
    // CASE 3: CÀI ĐẶT KHÁC
    // =========================================================
    if (type === "preferences") {
        await prisma.user.update({
            where: { email: userEmail },
            data: { preferences: data }
        });
        return NextResponse.json({ success: true, message: "Đã lưu cài đặt" });
    }

    return NextResponse.json({ error: "Yêu cầu không hợp lệ" }, { status: 400 });

  } catch (error: any) {
    // --- KHU VỰC IN LỖI CHI TIẾT ---
    console.error("❌ ================= LỖI API ================= ❌");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Full Error:", error);
    console.error("❌ =========================================== ❌");

    // Phản hồi lỗi cụ thể về cho Client
    let errorMessage = "Lỗi hệ thống không xác định.";
    
    if (error.code === 'P2002') {
        errorMessage = "Dữ liệu bị trùng lặp.";
    } else if (error.message.includes("entity too large")) {
        errorMessage = "Ảnh quá lớn so với cấu hình Server (Next.js Config).";
    } else if (error.message.includes("Data too long")) {
        errorMessage = "Ảnh quá lớn so với Database (Cần đổi sang LONGTEXT).";
    }

    return NextResponse.json({ 
        error: errorMessage,
        details: error.message // Gửi kèm chi tiết để debug
    }, { status: 500 });
  }
}