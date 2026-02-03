import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Lấy role từ token
    const role = req.nextauth.token?.role as string;
    const path = req.nextUrl.pathname;

    // 1. Bảo vệ trang Admin
    if (path.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/student/dashboard", req.url));
    }

    // 2. Bảo vệ trang Teacher
    if (path.startsWith("/teacher") && role !== "TEACHER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/student/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Yêu cầu phải đăng nhập mới được đi tiếp
    },
  }
);

// Áp dụng cho các đường dẫn sau
export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*"],
};