"use server";

import { prisma } from "@/lib/prisma";

export async function getActiveTeachers() {
  try {
    // 1 LẦN GỌI DUY NHẤT: Lấy mọi Giảng viên (TEACHER) kèm theo các Khóa học đã xuất bản của họ
    const teachers = await prisma.user.findMany({
      where: {
        role: "TEACHER" 
      },
      select: {
        id: true,
        name: true,
        avatar: true, // Sử dụng 'avatar' theo database
        courses: { 
          where: { isPublished: true },
          select: {
            id: true,
            title: true,
            category: true,
            price: true,
          }
        }
      }
    });

    // Định dạng lại dữ liệu để mớm cho giao diện
    return teachers.map((teacher) => ({
      id: teacher.id,
      name: teacher.name || "Giảng viên",
      image: teacher.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.id}`,
      courses: teacher.courses,
      coursesCount: teacher.courses.length,
      rating: 5.0, 
      reviews: Math.floor(Math.random() * 50) + 10,
      subject: teacher.courses[0]?.category || "Đa môn học",
      topCourses: teacher.courses.slice(0, 2).map((c) => c.category),
      about: "Giảng viên uy tín trên hệ thống Edutech AI, chuyên cung cấp các bộ đề thi vận dụng và vận dụng cao."
    }));

  } catch (error) {
    console.error("LỖI LẤY DỮ LIỆU GIẢNG VIÊN:", error);
    return [];
  }
}

// Thêm hàm lấy khóa học của người dùng
export async function getUserCourses(userId: string) {
  try {
    if (!userId) {
      return [];
    }

    // Lấy các khóa học người dùng đã mua (dành cho học viên)
    const purchasedCourses = await prisma.purchase.findMany({
      where: {
        userId: userId,
      },
      include: {
        course: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                avatar: true,
              }
            },
            modules: {
              where: { isPublished: true },
              select: {
                id: true,
                title: true,
                lessons: {
                  where: { isPublished: true },
                  select: {
                    id: true,
                    title: true,
                    isFree: true,
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Định dạng lại dữ liệu
    const formattedCourses = purchasedCourses.map((purchase) => ({
      id: purchase.course.id,
      title: purchase.course.title,
      description: purchase.course.description,
      thumbnail: purchase.course.thumbnail || "/default-course-thumbnail.jpg",
      price: purchase.course.price,
      category: purchase.course.category,
      teacher: {
        id: purchase.course.teacher.id,
        name: purchase.course.teacher.name,
        avatar: purchase.course.teacher.avatar,
      },
      modules: purchase.course.modules.map(module => ({
        id: module.id,
        title: module.title,
        lessons: module.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          isFree: lesson.isFree,
          progress: 0, // Có thể thêm logic tính progress sau
        }))
      })),
      purchasedAt: purchase.createdAt,
      progress: 0, // Có thể thêm logic tính progress tổng thể sau
      totalLessons: purchase.course.modules.reduce((total, module) => total + module.lessons.length, 0),
      completedLessons: 0, // Có thể thêm logic tính số bài đã học sau
    }));

    return formattedCourses;

  } catch (error) {
    console.error("LỖI LẤY KHÓA HỌC CỦA NGƯỜI DÙNG:", error);
    return [];
  }
}

// Thêm hàm lấy khóa học của giảng viên
export async function getTeacherCourses(userId: string) {
  try {
    if (!userId) {
      return [];
    }

    // Lấy các khóa học do giảng viên tạo
    const courses = await prisma.course.findMany({
      where: {
        teacherId: userId,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        },
        modules: {
          where: { isPublished: true },
          select: {
            id: true,
            title: true,
            lessons: {
              where: { isPublished: true },
              select: {
                id: true,
                title: true,
              }
            }
          }
        },
        purchases: {
          select: {
            id: true,
            userId: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Định dạng lại dữ liệu
    const formattedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail || "/default-course-thumbnail.jpg",
      price: course.price,
      category: course.category,
      isPublished: course.isPublished,
      teacher: {
        id: course.teacher.id,
        name: course.teacher.name,
        avatar: course.teacher.avatar,
      },
      modules: course.modules.map(module => ({
        id: module.id,
        title: module.title,
        lessonsCount: module.lessons.length,
      })),
      totalLessons: course.modules.reduce((total, module) => total + module.lessons.length, 0),
      totalStudents: course.purchases.length,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    }));

    return formattedCourses;

  } catch (error) {
    console.error("LỖI LẤY KHÓA HỌC CỦA GIẢNG VIÊN:", error);
    return [];
  }
}

// Thêm hàm lấy thông tin chi tiết của một khóa học (bao gồm cả nội dung)
export async function getCourseDetails(courseId: string, userId?: string) {
  try {
    if (!courseId) {
      return null;
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
          }
        },
        modules: {
          where: { isPublished: true },
          orderBy: {
            position: 'asc'
          },
          include: {
            lessons: {
              where: { isPublished: true },
              orderBy: {
                position: 'asc'
              },
              select: {
                id: true,
                title: true,
                description: true,
                type: true,
                duration: true,
                isFree: true,
                videoUrl: true,
                position: true,
              }
            }
          }
        },
        purchases: userId ? {
          where: {
            userId: userId
          },
          select: {
            id: true
          }
        } : false
      }
    });

    if (!course) {
      return null;
    }

    // Kiểm tra xem user đã mua khóa học chưa
    const isPurchased = userId ? course.purchases && course.purchases.length > 0 : false;

    // Định dạng lại dữ liệu
    const formattedCourse = {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail || "/default-course-thumbnail.jpg",
      price: course.price,
      category: course.category,
      isPublished: course.isPublished,
      teacher: {
        id: course.teacher.id,
        name: course.teacher.name,
        avatar: course.teacher.avatar,
        bio: course.teacher.bio,
      },
      modules: course.modules.map(module => ({
        id: module.id,
        title: module.title,
        description: module.description,
        position: module.position,
        lessons: module.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          type: lesson.type,
          duration: lesson.duration,
          isFree: lesson.isFree,
          videoUrl: isPurchased || lesson.isFree ? lesson.videoUrl : null, // Chỉ hiển thị video nếu đã mua hoặc bài học miễn phí
          position: lesson.position,
        }))
      })),
      totalLessons: course.modules.reduce((total, module) => total + module.lessons.length, 0),
      isPurchased: isPurchased,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };

    return formattedCourse;

  } catch (error) {
    console.error("LỖI LẤY CHI TIẾT KHÓA HỌC:", error);
    return null;
  }
}

// Thêm hàm kiểm tra quyền truy cập bài học
export async function checkLessonAccess(lessonId: string, userId: string) {
  try {
    if (!lessonId || !userId) {
      return { hasAccess: false, error: "Thiếu thông tin" };
    }

    // Lấy thông tin bài học và khóa học
    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
      include: {
        module: {
          include: {
            course: true
          }
        }
      }
    });

    if (!lesson) {
      return { hasAccess: false, error: "Không tìm thấy bài học" };
    }

    // Nếu bài học miễn phí, ai cũng có thể xem
    if (lesson.isFree) {
      return { hasAccess: true };
    }

    // Kiểm tra xem user đã mua khóa học chưa
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: userId,
        courseId: lesson.module.course.id
      }
    });

    if (purchase) {
      return { hasAccess: true };
    }

    // Kiểm tra xem user có phải là giảng viên của khóa học không
    if (lesson.module.course.teacherId === userId) {
      return { hasAccess: true };
    }

    return { hasAccess: false, error: "Bạn cần mua khóa học để xem bài học này" };

  } catch (error) {
    console.error("LỖI KIỂM TRA QUYỀN TRUY CẬP BÀI HỌC:", error);
    return { hasAccess: false, error: "Lỗi hệ thống" };
  }
}

// Thêm hàm lấy thống kê khóa học cho dashboard
export async function getCourseStats(userId: string, role: string) {
  try {
    if (!userId) {
      return null;
    }

    if (role === "TEACHER") {
      // Thống kê cho giảng viên
      const courses = await prisma.course.findMany({
        where: {
          teacherId: userId,
        },
        include: {
          purchases: true,
          modules: {
            include: {
              lessons: true
            }
          }
        }
      });

      const totalCourses = courses.length;
      const totalStudents = courses.reduce((sum, course) => sum + course.purchases.length, 0);
      const totalLessons = courses.reduce((sum, course) => 
        sum + course.modules.reduce((moduleSum, module) => moduleSum + module.lessons.length, 0), 0
      );
      const totalRevenue = courses.reduce((sum, course) => 
        sum + (course.purchases.length * course.price), 0
      );

      return {
        totalCourses,
        totalStudents,
        totalLessons,
        totalRevenue,
      };
    } else {
      // Thống kê cho học viên
      const purchases = await prisma.purchase.findMany({
        where: {
          userId: userId,
        },
        include: {
          course: {
            include: {
              modules: {
                include: {
                  lessons: true
                }
              }
            }
          }
        }
      });

      const totalCourses = purchases.length;
      const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.course.price, 0);
      const totalLessonsAvailable = purchases.reduce((sum, purchase) => 
        sum + purchase.course.modules.reduce((moduleSum, module) => moduleSum + module.lessons.length, 0), 0
      );

      return {
        totalCourses,
        totalSpent,
        totalLessonsAvailable,
      };
    }

  } catch (error) {
    console.error("LỖI LẤY THỐNG KÊ KHÓA HỌC:", error);
    return null;
  }
}// Thêm vào cuối file actions.ts
export async function checkDownloadPermission(userId: string, courseId: string, coursePrice: number) {
  try {
    if (!userId) return false;

    // Lấy thông tin user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        planType: true,
      }
    });

    if (!user) return false;

    // Admin và Teacher có quyền tải tất cả
    if (user.role === "ADMIN" || user.role === "TEACHER") return true;

    // Đề miễn phí: ai cũng tải được
    if (coursePrice === 0 || coursePrice === null) return true;

    // Đề PRO: kiểm tra user có phải PRO không
    if (coursePrice > 0) {
      // User PRO được tải
      if (user.planType === "PRO") return true;

      // Kiểm tra user đã mua đề này chưa
      const purchase = await prisma.purchase.findFirst({
        where: {
          userId: userId,
          courseId: courseId
        }
      });

      return !!purchase;
    }

    return false;

  } catch (error) {
    console.error("Lỗi kiểm tra quyền tải:", error);
    return false;
  }
}