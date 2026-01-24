import { 
    LayoutDashboard, BookOpen, FileQuestion, Users, Settings, BarChart, 
    Library, Globe, Sparkles, Bot 
  } from "lucide-react";
  
  export const APP_NAME = "Edutech AI Platform";
  
  export const NAV_ITEMS = {
    student: [
      {
        group: "MENU CHÍNH",
        items: [
          { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
          { label: "My Courses", href: "/student/my-courses", icon: BookOpen },
          { label: "Take Exams", href: "/student/take-exam", icon: FileQuestion },
          { label: "AI Tutor", href: "/student/ai-tutor", icon: Bot },
        ]
      },
      {
        group: "KHÁM PHÁ",
        items: [
          { label: "Thư viện đề thi", href: "/student/exam-library", icon: Library },
          { label: "Cộng đồng", href: "/student/community", icon: Users },
          { label: "AI Mentor", href: "/student/ai-mentor", icon: Sparkles },
        ]
      }
    ],
    // Giữ nguyên teacher/admin hoặc nâng cấp cấu trúc tương tự nếu cần
    teacher: [
      {
        group: "QUẢN LÝ",
        items: [
          { label: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
          { label: "Manage Courses", href: "/teacher/courses", icon: BookOpen },
          { label: "Question Bank", href: "/teacher/exams", icon: FileQuestion },
          { label: "Grading", href: "/teacher/grading", icon: BarChart },
        ]
      }
    ],
    admin: [
      {
        group: "HỆ THỐNG",
        items: [
          { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
          { label: "Users", href: "/admin/users", icon: Users },
          { label: "Analytics", href: "/admin/analytics", icon: BarChart },
          { label: "Settings", href: "/admin/settings", icon: Settings },
        ]
      }
    ],
  };