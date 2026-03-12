import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role, proofLink } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Vui lòng điền đầy đủ thông tin" }, { status: 400 });
    }

    // 1. Kiểm tra email đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email này đã được sử dụng!" }, { status: 400 });
    }

    // 2. Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Tạo tài khoản (Mặc định tất cả đều là STUDENT để đảm bảo an toàn)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "STUDENT", // Dù chọn GV cũng khởi tạo là Student trước
      }
    });

    // 4. Nếu họ chọn làm Giáo viên -> Gửi yêu cầu cho Admin duyệt
    if (role === "TEACHER") {
        await prisma.upgradeRequest.create({
            data: {
                userId: newUser.id,
                planType: "TEACHER_APPROVAL",
                amount: 0,
                content: `Yêu cầu duyệt làm Giảng viên. Link hồ sơ/chứng minh: ${proofLink || "Không có"}`,
                status: "PENDING"
            }
        });
    }

    return NextResponse.json({ success: true, message: "Tạo tài khoản thành công!" });

  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json({ error: "Lỗi máy chủ khi đăng ký" }, { status: 500 });
  }
}