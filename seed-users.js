const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Mật khẩu chung: 123456
  const password = await bcrypt.hash("123456", 10);

  const teamMembers = [
    { name: "LÊ THANH TÙNG", code: "ltt" },
    { name: "NGUYỄN TIẾN LỘC", code: "ntl" },
    { name: "NGUYỄN VĂN SƠN", code: "nvs" },
    { name: "NGUYỄN VĂN VINH", code: "nvv" },
    { name: "PHẠM ĐỨC MẠNH", code: "pdm" },
  ];

  const users = [];

  teamMembers.forEach(member => {
    // Mỗi người 1 Admin
    users.push({ 
      email: `${member.code}.admin@gmail.com`, 
      name: `${member.name} (Admin)`, 
      role: "ADMIN" 
    });
    // Mỗi người 1 Teacher
    users.push({ 
      email: `${member.code}.tea@gmail.com`, 
      name: `${member.name} (Teacher)`, 
      role: "TEACHER" 
    });
    // Mỗi người 1 Student
    users.push({ 
      email: `${member.code}.stu@gmail.com`, 
      name: `${member.name} (Student)`, 
      role: "STUDENT" 
    });
  });

  console.log(`⏳ Đang tạo ${users.length} tài khoản cho 5 thành viên nhóm...`);

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { 
        role: u.role, 
        password: password, 
        name: u.name 
      },
      create: {
        email: u.email,
        name: u.name,
        password: password,
        role: u.role,
        balance: 1000000, // Tặng luôn 1 triệu vào ví để test mua khóa học
        isPro: u.role === "ADMIN" // Admin thì mặc định có Pro
      },
    });
  }

  console.log("--------------------------------------");
  console.log("✅ XONG! Đã tạo 15 tài khoản thành công.");
  console.log("Mật khẩu chung cho tất cả: 123456");
  console.log("Ví dụ đăng nhập Admin của Tùng: ltt.admin@gmail.com");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi seed data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });