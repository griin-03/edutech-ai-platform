const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const COURSES = [
  // --- IT & CÔNG NGHỆ ---
  {
    title: "Lập trình Web Next.js 14 Toàn tập",
    description: "Học cách xây dựng ứng dụng Edutech thực tế với Next.js, Prisma và Tailwind CSS.",
    price: 1200000,
    isPro: true,
    level: "Advanced",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
    isPublished: true,
  },
  {
    title: "Nhập môn Python cho người mới",
    description: "Nền tảng lập trình vững chắc với ngôn ngữ Python trong 7 ngày.",
    price: 0,
    isPro: false,
    level: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935",
    isPublished: true,
  },
  {
    title: "Mastering Database với Oracle SQL",
    description: "Kỹ năng quản trị và truy vấn dữ liệu chuyên sâu cho kỹ sư phần mềm.",
    price: 850000,
    isPro: true,
    level: "Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d",
    isPublished: true,
  },

  // --- NGOẠI NGỮ ---
  {
    title: "IELTS Speaking Breakthrough 7.5+",
    description: "Chiến thuật trả lời các chủ đề khó trong kỳ thi IELTS Speaking.",
    price: 2500000,
    isPro: true,
    level: "Advanced",
    thumbnail: "https://images.unsplash.com/photo-1543269865-cbf427effbad",
    isPublished: true,
  },
  {
    title: "Tiếng Anh giao tiếp cơ bản",
    description: "Học các mẫu câu thông dụng khi đi du lịch và mua sắm.",
    price: 0,
    isPro: false,
    level: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    isPublished: true,
  },
  {
    title: "Luyện thi TOEIC Cấp tốc 650+",
    description: "Mẹo giải đề và từ vựng trọng tâm cho bài thi TOEIC mới nhất.",
    price: 450000,
    isPro: false,
    level: "Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8",
    isPublished: true,
  },

  // --- THIẾT KẾ & MULTIMEDIA ---
  {
    title: "Thiết kế UI/UX chuyên nghiệp với Figma",
    description: "Từ tư duy thiết kế đến triển khai Prototype thực tế cho App di động.",
    price: 1500000,
    isPro: true,
    level: "Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1586717791821-3f44a5638d48",
    isPublished: true,
  },
  {
    title: "Edit Video TikTok triệu view bằng CapCut",
    description: "Hướng dẫn các kỹ thuật dựng video ngắn bắt mắt và bắt trend.",
    price: 0,
    isPro: false,
    level: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279",
    isPublished: true,
  },

  // --- KINH DOANH & MARKETING ---
  {
    title: "Facebook Ads thực chiến 2026",
    description: "Tối ưu chi phí quảng cáo và bùng nổ doanh số bán hàng online.",
    price: 3200000,
    isPro: true,
    level: "Advanced",
    thumbnail: "https://images.unsplash.com/photo-1533750516457-a7f992034fec",
    isPublished: true,
  },
  {
    title: "Kỹ năng quản lý tài chính cá nhân",
    description: "Cách lập kế hoạch chi tiêu và đầu tư thông minh cho giới trẻ.",
    price: 0,
    isPro: false,
    level: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e",
    isPublished: true,
  },

  // --- CÁC KHÓA HỌC KHÁC ---
  { title: "Nhiếp ảnh đường phố cho người mới", description: "Làm chủ máy ảnh và góc nhìn nghệ thuật.", price: 600000, isPro: false, level: "Beginner", thumbnail: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32", isPublished: true },
  { title: "Java Core và OOP căn bản", description: "Học lập trình hướng đối tượng một cách bài bản nhất.", price: 900000, isPro: true, level: "Intermediate", thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97", isPublished: true },
  { title: "Tiếng Nhật N5 - Nhập môn Hiragana", description: "Bắt đầu hành trình chinh phục tiếng Nhật từ con số 0.", price: 0, isPro: false, level: "Beginner", thumbnail: "https://images.unsplash.com/photo-1528360983277-13d9b152c58f", isPublished: true },
  { title: "Data Science với R", description: "Phân tích dữ liệu và thống kê chuyên sâu.", price: 2100000, isPro: true, level: "Advanced", thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71", isPublished: true },
  { title: "Kỹ năng thuyết trình ấn tượng", description: "Vượt qua nỗi sợ đứng trước đám đông.", price: 350000, isPro: false, level: "Intermediate", thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c", isPublished: true },
  { title: "Lập trình C++ cho kỳ thi HSG", description: "Giải quyết các bài toán thuật toán khó.", price: 1100000, isPro: true, level: "Advanced", thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4", isPublished: true },
  { title: "Tiếng Hàn giao tiếp sơ cấp", description: "Giao tiếp cơ bản như người bản xứ.", price: 0, isPro: false, level: "Beginner", thumbnail: "https://images.unsplash.com/photo-1517154421773-0529f29ea451", isPublished: true },
  { title: "Digital Marketing Overview", description: "Cái nhìn tổng quan về thế giới Marketing số.", price: 0, isPro: false, level: "Beginner", thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f", isPublished: true },
  { title: "Blockchain và Crypto 101", description: "Tìm hiểu về công nghệ tương lai.", price: 1800000, isPro: true, level: "Intermediate", thumbnail: "https://images.unsplash.com/photo-1621504450168-b8c43519181a", isPublished: true },
  { title: "AI Prompt Engineering", description: "Sử dụng ChatGPT và Gemini hiệu quả cho công việc.", price: 500000, isPro: true, level: "Intermediate", thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995", isPublished: true },
];

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (!admin) return console.log("❌ Hãy tạo Admin trước!");

  console.log("⏳ Đang nạp 20 khóa học...");
  for (const c of COURSES) {
    await prisma.course.create({
      data: { ...c, authorId: admin.id }
    });
  }
  console.log("🎉 Xong! Check Prisma Studio nhé.");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());