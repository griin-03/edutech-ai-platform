<div align="center">
  <h1 align="center">🎓 EduTech AI Platform</h1>
  <p align="center">
    <strong>Nền tảng học tập và thi trắc nghiệm trực tuyến thông minh tích hợp AI</strong>
  </p>
  <p align="center">
    <a href="https://edutech-ai-platform.onrender.com">Xem Demo Trực Tuyến</a>
  </p>

  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/TiDB-Cloud-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="TiDB" />
</div>

<br />
## 🔑 Tài khoản Demo (Dành riêng cho Giảng viên chấm thi)

Để thuận tiện cho việc trải nghiệm toàn bộ tính năng của hệ thống mà không cần chờ phê duyệt, kính mời Quý Thầy/Cô sử dụng bộ tài khoản đã được cấp quyền sẵn dưới đây:

**Mật khẩu chung cho tất cả tài khoản:** `123456`

| Phân quyền | Email Đăng nhập | Ghi chú tính năng nổi bật |
| :--- | :--- | :--- |
| 👑 **Admin** | `ltt.admin@gmail.com` | Xem Dashboard doanh thu, duyệt tài khoản Giảng viên, quản lý hệ thống. |
| 👨‍🏫 **Teacher** | `ltt.tea@gmail.com` | Tạo khóa học mới, dùng AI tạo đề thi trắc nghiệm, xem điểm học viên. |
| 👨‍🎓 **Student** | `ltt.stu@gmail.com` | Test tính năng thi trực tuyến với camera giám thị AI, Mở khoá pro bằng QR và Chat với Gia sư AI. |

👉 **Link Trang web chính thức:** [https://edutech-ai-platform.onrender.com/login](https://edutech-ai-platform.onrender.com/login)
👉 **Link Mobile-app báo điểm thi nhanh(đang phát triển):** [https://edutech-ai-platform.onrender.com/login](https://edutech-ai-platform.onrender.com/mobile-app)

## 🌟 Giới Thiệu Dự Án

**EduTech AI** là giải pháp công nghệ giáo dục (EdTech) toàn diện, được xây dựng nhằm mục đích tối ưu hóa trải nghiệm giảng dạy và học tập. Điểm đột phá của dự án là việc tích hợp Trí tuệ nhân tạo (AI) giúp cá nhân hóa lộ trình học, giải đáp thắc mắc tự động (AI Mentor) và hỗ trợ giáo viên soạn đề thi thông minh.

Hệ thống được thiết kế với 3 phân quyền chuyên biệt:
- 👑 **Admin (Quản trị viên):** Quản lý toàn diện người dùng, khóa học, doanh thu và kiểm duyệt hệ thống.
- 👨‍🏫 **Teacher (Giảng viên):** Tạo/Quản lý khóa học, ngân hàng câu hỏi, soạn đề thi và theo dõi tiến độ học viên.
- 👨‍🎓 **Student (Học viên):** Tham gia khóa học, làm bài thi trắc nghiệm, nâng cấp tài khoản PRO và tương tác 1-1 với Gia sư AI.

---

## 🚀 Tính Năng Nổi Bật

- **🤖 Gia sư AI (AI Mentor):** Tích hợp đa mô hình AI (Cohere & DeepSeek) giải đáp thắc mắc 12 môn học phổ thông 24/7.
- **📝 Sinh Đề Thi Tự Động:** AI hỗ trợ giáo viên tạo bộ câu hỏi trắc nghiệm nhanh chóng theo chủ đề.
- **⚡ Cổng Thanh Toán PRO:** Thanh toán nội bộ nâng cấp tài khoản VIP bằng mã QR động.
- **📱 Responsive Mobile-First:** Trải nghiệm mượt mà trên cả giao diện Web và Ứng dụng di động (PWA).
- **📊 Bảng Điều Khiển (Dashboard):** Thống kê trực quan dữ liệu người dùng và điểm số theo thời gian thực.

---

## 🛠️ Kiến Trúc Công Nghệ

- **Frontend:** Next.js 16 (App Router), React, Tailwind CSS, Shadcn UI.
- **Backend:** Next.js API Routes, Prisma ORM, NextAuth.js (Authentication).
- **Database:** MySQL (lưu trữ trên hạ tầng TiDB Cloud Serverless).
- **AI Integration:** Cohere API & DeepSeek API.
- **Deployment:** Render (Hosting) & GitHub Actions.

---

## 👥 Đội Ngũ Phát Triển (Nhóm Sinh Viên)

| STT | Họ và Tên | MSSV | Vai Trò |
| :---: | :--- | :---: | :--- |
| 1 | **Lê Thanh Tùng** | `5250138` | Leader / Backend / Database |
| 2 | **Nguyễn Tiến Lộc** | `5250091` | DevOps & QA|
| 3 | **Nguyễn Văn Sơn** | `5250129` | AI Engineer |
| 4 | **Nguyễn Văn Vinh** | `5250171` | Mobile Dev |
| 5 | **Phạm Đức Mạnh** | `5250098` | Frontend Developer |

---

## 💻 Hướng Dẫn Cài Đặt (Local Development)

Nếu bạn muốn chạy thử dự án này trên máy tính cá nhân, vui lòng làm theo các bước sau:

**1. Clone mã nguồn:**
```bash
git clone [https://github.com/griin-03/edutech-ai-platform.git](https://github.com/griin-03/edutech-ai-platform.git)
cd edutech-ai-platform
