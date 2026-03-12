"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Lấy thời gian server (fix lỗi hydration)
export async function getServerTime() {
  return new Date().toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour12: false
  });
}

// Lấy danh sách yêu cầu đang chờ với thống kê chi tiết
export async function getPendingUpgrades() {
  const requests = await prisma.upgradeRequest.findMany({
    where: { status: "PENDING" },
    include: { 
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          isPro: true,
          createdAt: true
        }
      } 
    },
    orderBy: { createdAt: "desc" }
  });

  // Tính tổng doanh tiềm năng từ các yêu cầu PRO
  const totalPotentialRevenue = requests
    .filter(r => r.planType !== "TEACHER_APPROVAL")
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  return {
    requests,
    stats: {
      total: requests.length,
      teacher: requests.filter(r => r.planType === "TEACHER_APPROVAL").length,
      pro: requests.filter(r => r.planType !== "TEACHER_APPROVAL").length,
      totalPotentialRevenue
    }
  };
}

// DUYỆT ĐƠN: Cập nhật Request -> Update User (Role hoặc Pro) -> Gửi thông báo
export async function approveUpgrade(requestId: string, userId: number, planType: string) {
  try {
    const isTeacher = planType === "TEACHER_APPROVAL";

    // Lấy thông tin request để lưu lại lịch sử
    const request = await prisma.upgradeRequest.findUnique({
      where: { id: requestId },
      include: { user: true }
    });

    if (!request) {
      return { success: false, message: "Không tìm thấy yêu cầu" };
    }

    // Dùng transaction để đảm bảo cả 3 việc cùng thành công hoặc cùng thất bại
    await prisma.$transaction([
      // 1. Cập nhật trạng thái đơn -> APPROVED
      prisma.upgradeRequest.update({
        where: { id: requestId },
        data: { 
          status: "APPROVED",
          processedAt: new Date(),
          processedBy: userId // Có thể thêm trường này vào schema
        }
      }),

      // 2. Nâng cấp User (Phân biệt Giáo viên hay PRO)
      prisma.user.update({
        where: { id: userId },
        data: isTeacher 
          ? { 
              role: "TEACHER",
              updatedAt: new Date()
            } 
          : { 
              isPro: true,
              proExpiryDate: planType === "PRO_YEAR" 
                ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 năm
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 tháng
              updatedAt: new Date()
            }
      }),

      // 3. TẠO THÔNG BÁO CHO USER
      prisma.notification.create({
        data: {
          userId: userId,
          type: "SYSTEM",
          title: isTeacher ? "✅ Duyệt Giảng viên thành công" : "🎉 Kích hoạt PRO thành công",
          message: isTeacher 
            ? "Chúc mừng! Đơn đăng ký Giảng viên của bạn đã được duyệt. Bạn có thể đăng nhập vào trang Quản trị để bắt đầu đăng khóa học."
            : `Chúc mừng! Tài khoản của bạn đã được nâng cấp lên PRO thành công. 
               \n💰 Số tiền: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(request.amount || 0)}
               \n📝 Nội dung CK: ${request.content || 'Không có'}`,
          isRead: false,
          link: isTeacher ? "/teacher/dashboard" : "/student/my-courses",
          metadata: {
            requestId,
            planType,
            amount: request.amount,
            processedAt: new Date().toISOString()
          }
        }
      }),

      // 4. TẠO LOG GIAO DỊCH (nếu là PRO)
      ...(!isTeacher ? [
        prisma.transaction.create({
          data: {
            userId: userId,
            amount: request.amount || 0,
            type: "UPGRADE_PRO",
            status: "SUCCESS",
            description: `Nâng cấp PRO - ${planType}`,
            metadata: {
              requestId,
              planType,
              content: request.content
            }
          }
        })
      ] : [])
    ]);

    // Xóa cache để giao diện Admin cập nhật ngay lập tức
    revalidatePath("/admin/upgrades");
    revalidatePath("/admin/users");
    revalidatePath("/teacher/students");
    
    return { 
      success: true, 
      message: isTeacher ? "Đã cấp quyền Giảng viên thành công" : "Đã kích hoạt PRO thành công"
    };
  } catch (error) {
    console.error("Lỗi duyệt đơn:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Lỗi hệ thống khi duyệt đơn"
    };
  }
}

// TỪ CHỐI ĐƠN (Có gửi thông báo)
export async function rejectUpgrade(requestId: string, reason?: string) {
  try {
    const request = await prisma.upgradeRequest.findUnique({
      where: { id: requestId },
      include: { user: true }
    });

    if (!request) {
      return { success: false, message: "Không tìm thấy yêu cầu" };
    }

    await prisma.$transaction([
      // 1. Cập nhật trạng thái
      prisma.upgradeRequest.update({
        where: { id: requestId },
        data: { 
          status: "REJECTED",
          processedAt: new Date(),
          rejectionReason: reason
        }
      }),

      // 2. Gửi thông báo từ chối
      prisma.notification.create({
        data: {
          userId: request.userId,
          type: "SYSTEM",
          title: "❌ Yêu cầu bị từ chối",
          message: `Yêu cầu ${request.planType === "TEACHER_APPROVAL" ? "làm Giảng viên" : "nâng cấp PRO"} của bạn đã bị từ chối.
                    ${reason ? `\nLý do: ${reason}` : ''}
                    \nVui lòng liên hệ Admin để biết thêm chi tiết.`,
          isRead: false,
          link: "/contact",
          metadata: {
            requestId,
            reason,
            rejectedAt: new Date().toISOString()
          }
        }
      }),

      // 3. Tạo log giao dịch thất bại (nếu là PRO)
      ...(request.planType !== "TEACHER_APPROVAL" ? [
        prisma.transaction.create({
          data: {
            userId: request.userId,
            amount: request.amount || 0,
            type: "UPGRADE_PRO",
            status: "FAILED",
            description: `Nâng cấp PRO thất bại - ${reason || 'Không rõ lý do'}`,
            metadata: {
              requestId,
              reason
            }
          }
        })
      ] : [])
    ]);

    revalidatePath("/admin/upgrades");
    
    return { 
      success: true, 
      message: "Đã từ chối yêu cầu"
    };
  } catch (error) {
    console.error("Lỗi từ chối đơn:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Lỗi khi từ chối đơn"
    };
  }
}

// Lấy chi tiết một yêu cầu
export async function getUpgradeDetail(requestId: string) {
  try {
    const request = await prisma.upgradeRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            isPro: true,
            createdAt: true,
            _count: {
              select: {
                courses: true,
                examResults: true,
                purchases: true
              }
            }
          }
        }
      }
    });

    return { success: true, data: request };
  } catch (error) {
    return { success: false, error: "Không thể lấy chi tiết yêu cầu" };
  }
}

// Thống kê tổng quan cho Admin
export async function getUpgradeStats() {
  try {
    const [
      totalRequests,
      pendingRequests,
      approvedToday,
      rejectedToday,
      totalRevenue
    ] = await Promise.all([
      prisma.upgradeRequest.count(),
      prisma.upgradeRequest.count({ where: { status: "PENDING" } }),
      prisma.upgradeRequest.count({
        where: {
          status: "APPROVED",
          processedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.upgradeRequest.count({
        where: {
          status: "REJECTED",
          processedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.upgradeRequest.aggregate({
        where: {
          status: "APPROVED",
          planType: { not: "TEACHER_APPROVAL" }
        },
        _sum: { amount: true }
      })
    ]);

    return {
      success: true,
      stats: {
        totalRequests,
        pendingRequests,
        approvedToday,
        rejectedToday,
        totalRevenue: totalRevenue._sum.amount || 0
      }
    };
  } catch (error) {
    return { success: false, error: "Không thể lấy thống kê" };
  }
}

// Bulk actions - Duyệt nhiều đơn cùng lúc
export async function bulkApproveUpgrades(requestIds: string[]) {
  try {
    const results = await Promise.allSettled(
      requestIds.map(id => 
        prisma.$transaction(async (tx) => {
          const request = await tx.upgradeRequest.findUnique({
            where: { id }
          });
          
          if (!request) return null;

          await tx.upgradeRequest.update({
            where: { id },
            data: { 
              status: "APPROVED",
              processedAt: new Date()
            }
          });

          if (request.planType === "TEACHER_APPROVAL") {
            await tx.user.update({
              where: { id: request.userId },
              data: { role: "TEACHER" }
            });
          } else {
            await tx.user.update({
              where: { id: request.userId },
              data: { isPro: true }
            });
          }

          return request.id;
        })
      )
    );

    revalidatePath("/admin/upgrades");
    
    const successCount = results.filter(r => r.status === "fulfilled" && r.value).length;
    
    return {
      success: true,
      message: `Đã duyệt ${successCount}/${requestIds.length} yêu cầu`
    };
  } catch (error) {
    return { success: false, message: "Lỗi khi duyệt hàng loạt" };
  }
}