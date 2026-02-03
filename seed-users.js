const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Mật khẩu chung cho tất cả: 123456
  const password = await bcrypt.hash("123456", 10);

  const users = [
    // 2 ADMIN
    { email: "admin1@gmail.com", name: "Admin Số 1", role: "ADMIN" },
    { email: "admin2@gmail.com", name: "Admin Số 2", role: "ADMIN" },
    
    // 2 TEACHER
    { email: "teacher1@gmail.com", name: "Cô Giáo Thảo", role: "TEACHER" },
    { email: "teacher2@gmail.com", name: "Thầy Ba", role: "TEACHER" },

    // 2 STUDENT
    { email: "student1@gmail.com", name: "Trò Giỏi", role: "STUDENT" },
    { email: "student2@gmail.com", name: "Trò Ngoan", role: "STUDENT" },
  ];

  console.log("⏳ Đang tạo 6 tài khoản mẫu...");

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role, password: password }, // Nếu có rồi thì reset pass/role
      create: {
        email: u.email,
        name: u.name,
        password: password,
        role: u.role,
      },
    });
  }

  console.log("✅ XONG! Đã tạo 6 tài khoản thành công.");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());