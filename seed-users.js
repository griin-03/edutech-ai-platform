const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Mật khẩu chung cho tất cả: 123456
  const password = await bcrypt.hash("123456", 10);

  const users = [
    // 3 ADMIN
    { email: "admin1@gmail.com", name: "Quản Trị Viên 01", role: "ADMIN" },
    { email: "admin2@gmail.com", name: "Quản Trị Viên 02", role: "ADMIN" },
    { email: "admin3@gmail.com", name: "Quản Trị Viên 03", role: "ADMIN" },
    
    // 3 TEACHER
    { email: "teacher1@gmail.com", name: "Giảng Viên 01", role: "TEACHER" },
    { email: "teacher2@gmail.com", name: "Giảng Viên 02", role: "TEACHER" },
    { email: "teacher3@gmail.com", name: "Giảng Viên 03", role: "TEACHER" },

    // 3 STUDENT
    { email: "student1@gmail.com", name: "Học Viên 01", role: "STUDENT" },
    { email: "student2@gmail.com", name: "Học Viên 02", role: "STUDENT" },
    { email: "student3@gmail.com", name: "Học Viên 03", role: "STUDENT" },
  ];

  console.log("⏳ Đang tạo 9 tài khoản mẫu...");

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role, password: password, name: u.name }, // Cập nhật cả tên nếu đổi
      create: {
        email: u.email,
        name: u.name,
        password: password,
        role: u.role,
      },
    });
  }

  console.log("✅ XONG! Đã tạo 9 tài khoản thành công.");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());