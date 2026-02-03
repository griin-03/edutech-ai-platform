// FILE: prisma/seed.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Dữ liệu mẫu: 20 Đề thi chất lượng cao
const MOCK_COURSES = [
  // --- ENGLISH / IELTS ---
  {
    title: "IELTS Academic Reading Practice Test 2025 - Vol 1",
    description: "Bộ đề luyện Reading sát với đề thi thật IDP/BC tháng 1/2025. Bao gồm giải thích chi tiết.",
    level: "Advanced",
    category: "English",
    thumbnail: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80",
    format: "PDF",
    isPro: false,
    rating: 4.8,
    downloads: 1250,
    metaData: { pages: 45, year: 2025, size: "12MB" }
  },
  {
    title: "Full IELTS Listening Test with Audio - Cam 19",
    description: "Đề thi thử Cambridge 19 Listening kèm file Audio chất lượng cao.",
    level: "Intermediate",
    category: "English",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    format: "ONLINE", // Thi online
    isPro: true, // VIP mới xem được
    rating: 4.9,
    downloads: 3400,
    metaData: { duration: "40 mins", year: 2024 }
  },
  {
    title: "3000 Từ vựng TOEIC thông dụng nhất (Flashcard)",
    description: "Tổng hợp từ vựng TOEIC theo chủ đề kinh tế, văn phòng.",
    level: "Beginner",
    category: "English",
    thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
    format: "DOCX",
    isPro: false,
    rating: 4.5,
    downloads: 890,
    metaData: { pages: 120, year: 2023, size: "5MB" }
  },
  {
    title: "IELTS Writing Task 2: Ideas & Vocabulary PDF",
    description: "Sổ tay ý tưởng cho 24 chủ đề Writing thường gặp.",
    level: "Advanced",
    category: "English",
    thumbnail: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    format: "PDF",
    isPro: true,
    rating: 5.0,
    downloads: 5600,
    metaData: { pages: 88, year: 2024, size: "8MB" }
  },
  
  // --- IT / PROGRAMMING ---
  {
    title: "Luyện thi chứng chỉ AWS Cloud Practitioner (CLF-C02)",
    description: "Bộ câu hỏi trắc nghiệm 500 câu ôn thi chứng chỉ AWS cơ bản.",
    level: "Beginner",
    category: "IT",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    format: "ONLINE",
    isPro: true,
    rating: 4.7,
    downloads: 2100,
    metaData: { questions: 500, year: 2024 }
  },
  {
    title: "Frontend Developer Interview Questions 2024",
    description: "Tuyển tập câu hỏi phỏng vấn ReactJS, NextJS, CSS thường gặp tại các công ty Big Tech.",
    level: "Intermediate",
    category: "IT",
    thumbnail: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80",
    format: "PDF",
    isPro: false,
    rating: 4.9,
    downloads: 8900,
    metaData: { pages: 200, year: 2024, size: "15MB" }
  },
  {
    title: "Java Core & OOP Practice Test",
    description: "Bài kiểm tra kiến thức Java căn bản và Lập trình hướng đối tượng.",
    level: "Beginner",
    category: "IT",
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
    format: "ONLINE",
    isPro: false,
    rating: 4.6,
    downloads: 1500,
    metaData: { questions: 50, year: 2023 }
  },
  {
    title: "Python Data Science Handbook",
    description: "Tài liệu thực hành Python cho phân tích dữ liệu (NumPy, Pandas).",
    level: "Advanced",
    category: "IT",
    thumbnail: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80",
    format: "PDF",
    isPro: true,
    rating: 4.8,
    downloads: 3200,
    metaData: { pages: 350, year: 2024, size: "25MB" }
  },

  // --- MATH / TOÁN HỌC ---
  {
    title: "Đề thi thử THPT Quốc Gia 2025 môn Toán - Lần 1",
    description: "Đề thi thử chuẩn cấu trúc Bộ GD&ĐT, có lời giải chi tiết.",
    level: "Advanced",
    category: "Math",
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    format: "PDF",
    isPro: false,
    rating: 4.9,
    downloads: 15000,
    metaData: { pages: 12, year: 2025, size: "2MB" }
  },
  {
    title: "Chuyên đề Hình học không gian 12",
    description: "Tổng hợp công thức và bài tập trắc nghiệm hình học không gian.",
    level: "Intermediate",
    category: "Math",
    thumbnail: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&q=80",
    format: "DOCX",
    isPro: false,
    rating: 4.4,
    downloads: 4500,
    metaData: { pages: 50, year: 2024, size: "3MB" }
  },
  {
    title: "SAT Math Practice Test - College Board",
    description: "Đề luyện thi SAT Math (No Calculator & Calculator).",
    level: "Advanced",
    category: "Math",
    thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80",
    format: "ONLINE",
    isPro: true,
    rating: 4.8,
    downloads: 2300,
    metaData: { questions: 58, year: 2024 }
  },

  // --- GENERAL / KHÁC ---
  {
    title: "Đề thi Olympic Vật Lý 10 - 2024",
    description: "Đề thi chọn học sinh giỏi Vật Lý cấp trường.",
    level: "Advanced",
    category: "Physics",
    thumbnail: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80",
    format: "PDF",
    isPro: false,
    rating: 4.7,
    downloads: 1200,
    metaData: { pages: 8, year: 2024, size: "1MB" }
  },
  {
    title: "Design Thinking: UI/UX Principles Test",
    description: "Kiểm tra kiến thức cơ bản về thiết kế trải nghiệm người dùng.",
    level: "Beginner",
    category: "Design",
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
    format: "ONLINE",
    isPro: true,
    rating: 4.6,
    downloads: 980,
    metaData: { questions: 30, year: 2024 }
  },
  {
    title: "Business English Communication",
    description: "Mẫu câu giao tiếp tiếng Anh thương mại dành cho người đi làm.",
    level: "Intermediate",
    category: "Business",
    thumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
    format: "PDF",
    isPro: false,
    rating: 4.5,
    downloads: 3100,
    metaData: { pages: 60, year: 2023, size: "4MB" }
  },
  {
    title: "Trắc nghiệm Lịch sử Đảng Cộng sản Việt Nam",
    description: "Ngân hàng câu hỏi ôn thi môn Lịch sử Đảng đại học.",
    level: "Beginner",
    category: "General",
    thumbnail: "https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=800&q=80",
    format: "ONLINE",
    isPro: false,
    rating: 4.3,
    downloads: 8000,
    metaData: { questions: 100, year: 2024 }
  }
]

async function main() {
  console.log(`Start seeding ...`)
  
  // Xóa dữ liệu cũ (Tùy chọn - cẩn thận khi dùng)
  // await prisma.course.deleteMany({})

  for (const course of MOCK_COURSES) {
    const createdCourse = await prisma.course.create({
      data: course,
    })
    console.log(`Created course with id: ${createdCourse.id}`)
  }
  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })