import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; 
import { Toaster } from "sonner"; 
import Script from "next/script"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Edutech AI Platform",
  description: "Next-gen Learning Management System with AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Đổi lang="en" thành "vi" cho chuẩn dự án Việt Nam
    <html lang="vi" suppressHydrationWarning>
      
      {/* 🔥 THÊM THẺ HEAD: Load font chuẩn xác cho các hình vẽ Toán học/Hình học */}
      <head>
        <link rel="stylesheet" type="text/css" href="https://tikzjax.com/v1/fonts.css" />
      </head>

      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          
          {children}

          {/* Hiển thị thông báo (Toast) toàn dự án */}
          <Toaster position="top-center" richColors />

        </ThemeProvider>

        {/* 🔥 KÍCH HOẠT ENGINE VẼ ĐỒ THỊ TOÁN HỌC (TIKZ) CHẠY NGẦM TOÀN HỆ THỐNG */}
        <Script src="https://tikzjax.com/v1/tikzjax.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}