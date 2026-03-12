import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

// 1. Cấu hình PWA
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Tắt PWA khi đang code ở localhost để tránh lỗi cache
  register: true,
  skipWaiting: true,
});

// 2. Cấu hình Next.js cũ của bạn (Giữ nguyên 100%)
const nextConfig: NextConfig = {
  // Ép máy tính bỏ qua lỗi TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ép máy tính bỏ qua lỗi ESLint (phòng hờ)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Các cấu hình khác giữ nguyên
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', 
    },
  },
};

// 3. Xuất file: Bọc cấu hình Next.js bên trong cấu hình PWA
export default withPWA(nextConfig);