"use server";
import { prisma } from "@/lib/prisma"; 
import { revalidatePath } from "next/cache";

// Định nghĩa kiểu dữ liệu (Đã bổ sung commissionRate)
interface SystemConfigData {
  appName: string;
  maintenanceMsg: string;
  isMaintenance: boolean;
  allowAiGrading: boolean;
  commissionRate: number; // <--- MỚI: Thêm trường này
}

// 1. Lấy cấu hình
export async function getSystemConfig() {
  // Tìm bản ghi ID=1, nếu không thấy trả về null
  return await prisma.systemConfig.findUnique({
    where: { id: 1 },
  });
}

// 2. Lưu cấu hình (Đã cập nhật để lưu % hoa hồng)
export async function updateSystemConfig(data: SystemConfigData) {
  try {
    await prisma.systemConfig.upsert({
      where: { id: 1 },
      update: {
        appName: data.appName,
        maintenanceMsg: data.maintenanceMsg,
        isMaintenance: data.isMaintenance,
        allowAiGrading: data.allowAiGrading,
        commissionRate: data.commissionRate, // <--- CẬP NHẬT: Lưu % vào DB
      },
      create: {
        id: 1, // Luôn cố định ID là 1
        appName: data.appName,
        maintenanceMsg: data.maintenanceMsg,
        isMaintenance: data.isMaintenance,
        allowAiGrading: data.allowAiGrading,
        commissionRate: data.commissionRate, // <--- CẬP NHẬT: Lưu % khi tạo mới
      },
    });

    // Làm mới toàn bộ website để Header/Banner nhận tin bảo trì ngay lập tức
    revalidatePath("/", "layout"); 
    
    // Refresh thêm trang Admin Settings để thấy số mới ngay
    revalidatePath("/admin/settings");

    return { success: true };
  } catch (error) {
    console.error("Lỗi lưu cấu hình:", error);
    return { success: false, error: "Không thể lưu vào Database" };
  }
}