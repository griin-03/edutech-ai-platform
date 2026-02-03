import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Giữ lại TypeScript ignore (Cái này vẫn dùng được)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ⚠️ ĐÃ XÓA PHẦN 'eslint' (Vì Next.js 16 không hỗ trợ nữa)
  // Việc bỏ qua lỗi ESLint đã được xử lý ở file package.json bằng lệnh "--no-lint" rồi.

  // 2. Cấu hình ảnh (Giữ nguyên để hiện ảnh khóa học)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // 3. Upload file (Giữ nguyên)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', 
    },
  },
};

export default nextConfig;