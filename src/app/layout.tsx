import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; 
import { Toaster } from "sonner"; // 🔥 BƯỚC 1: Import Toaster từ sonner
import Script from "next/script"; // 🔥 THÊM: Import component Script của Next.js

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Edutech AI Platform",
  description: "Next-gen Learning Management System with AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          
          {children}

          {/* 🔥 BƯỚC 2: Đặt Toaster ở đây để hiển thị thông báo cho toàn dự án */}
          <Toaster position="top-center" richColors />

        </ThemeProvider>

        {/* 🔥 BƯỚC 3: KÍCH HOẠT ENGINE VẼ ĐỒ THỊ TOÁN HỌC (TIKZ) CHẠY NGẦM TOÀN HỆ THỐNG */}
        <Script src="https://tikzjax.com/v1/tikzjax.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}