import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Thêm đoạn này để mở giới hạn upload
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', 
    },
  },
  // (Nếu cần upload ảnh lớn hơn nữa thì tăng số 10mb lên, ví dụ '50mb')
};

export default nextConfig;