const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // ĐÂY LÀ TÀI KHOẢN BẠN ĐANG BỊ LỖI
  const email = "admin@gmail.com"; 
  const matKhauMoi = "123456"; // Chúng ta sẽ reset về 123456 cho dễ nhớ

  console.log(`🛠  Đang sửa lỗi đăng nhập cho: ${email}...`);

  // 1. Mã hóa mật khẩu chuẩn
  const hashedPassword = await bcrypt.hash(matKhauMoi, 10);

  try {
    // 2. Tìm và cập nhật user
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      console.log("❌ LỖI: Không tìm thấy email admin@gmail.com trong Database!");
      return;
    }

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    console.log("---------------------------------------------------");
    console.log("✅ ĐÃ SỬA THÀNH CÔNG!");
    console.log(`👉 Mật khẩu cũ (lỗi): ${user.password}`);
    console.log(`👉 Mật khẩu mới (đã mã hóa): ${hashedPassword}`);
    console.log("---------------------------------------------------");
    console.log(`🔑 GIỜ HÃY ĐĂNG NHẬP LẠI VỚI MẬT KHẨU: ${matKhauMoi}`);
    
  } catch (e) {
    console.error("❌ CÓ LỖI XẢY RA:", e);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());