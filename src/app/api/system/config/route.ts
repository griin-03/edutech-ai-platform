// src/app/api/system-config/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Lấy bản ghi id: 1
    let config = await prisma.systemConfig.findUnique({
      where: { id: 1 },
    });

    // Nếu chưa có trong DB (lần đầu chạy), tạo mặc định luôn để không bị lỗi null
    if (!config) {
      config = await prisma.systemConfig.create({
        data: {
          id: 1,
          appName: "EduTech AI Platform",
          isMaintenance: false,
          maintenanceMsg: "",
          allowAiGrading: false,
        },
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("API Config Error:", error);
    // Trả về fallback an toàn nếu DB lỗi
    return NextResponse.json(
      { 
        appName: "EduTech AI", 
        isMaintenance: false, 
        allowAiGrading: false 
      }, 
      { status: 500 }
    );
  }
}