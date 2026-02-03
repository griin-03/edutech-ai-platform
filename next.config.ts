import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Ép máy tính bỏ qua lỗi TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },
  // 2. Ép máy tính bỏ qua lỗi ESLint (phòng hờ)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 3. Các cấu hình khác giữ nguyên
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

export default nextConfig;