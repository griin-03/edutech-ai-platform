const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Điền email tài khoản bạn muốn nâng quyền
  const email = "admin@gmail.com"; 
  
  // Chọn quyền: "admin" hoặc "teacher"
  const newRole = "admin"; 

  console.log(`🛠  Đang nâng quyền cho: ${email} lên ${newRole}...`);

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: newRole },
    });
    console.log(`✅ THÀNH CÔNG! User ${user.name} giờ đã là ${newRole}.`);
    console.log(`👉 Hãy đăng xuất và đăng nhập lại để áp dụng quyền mới.`);
  } catch (e) {
    console.error("❌ LỖI: Không tìm thấy email hoặc lỗi DB.");
  }
}

main();