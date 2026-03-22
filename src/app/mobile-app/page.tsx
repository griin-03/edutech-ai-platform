"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes"; 
import { getMobileAppData } from "./actions"; 
import { 
  Bell, Trophy, Home, BookOpen, Brain, User, Target, 
  Sparkles, TrendingUp, LogIn, Loader2, Wallet, Crown, 
  CheckCircle2, Compass, PlayCircle, LogOut, Settings,
  ShieldCheck, Sun, Moon, Users, Database, Zap,
  Globe, Code, Calculator, PenTool, Lock, FileEdit
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

const SUBJECT_ICONS: Record<string, any> = {
  "English": { icon: Globe, color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400" },
  "IT": { icon: Code, color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10 dark:text-cyan-400" },
  "Toán": { icon: Calculator, color: "text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400" },
  "Design": { icon: PenTool, color: "text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400" },
  "General": { icon: BookOpen, color: "text-stone-600 bg-stone-50 dark:bg-stone-500/10 dark:text-stone-400" }
};

export default function MobileAppDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme(); 
  
  const [activeTab, setActiveTab] = useState("home");
  const [appData, setAppData] = useState<any>(null);
  
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState("student");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); 
    async function loadData() {
      if (session?.user && (session.user as any).id) {
        const userId = parseInt((session.user as any).id);
        const role = ((session.user as any).role || "STUDENT").toUpperCase();
        setUserRole(role);
        
        const data = await getMobileAppData(userId, role);
        setAppData(data);
      }
      setIsLoading(false);
    }

    if (status === "authenticated") loadData();
    else if (status === "unauthenticated") setIsLoading(false);
  }, [session, status]);

  // FETCH API KHÓA HỌC
  useEffect(() => {
    async function fetchCourses() {
       setIsLoadingCourses(true);
       try {
         const res = await fetch('/api/courses');
         
         if (res.ok) {
           const data = await res.json();
           
           if (Array.isArray(data)) {
             const formattedExams = data
                .filter((c: any) => c._count?.questions > 0) 
                .map((c: any) => {
                  let subjectType = "General";
                  if (c.title.toLowerCase().includes("toán")) subjectType = "Toán";
                  else if (c.title.toLowerCase().includes("english") || c.title.toLowerCase().includes("anh")) subjectType = "English";
                  else if (c.title.toLowerCase().includes("it") || c.title.toLowerCase().includes("lập trình")) subjectType = "IT";
                  
                  const themeInfo = SUBJECT_ICONS[subjectType] || SUBJECT_ICONS["General"];
                  
                  return {
                    id: c.id,
                    title: c.title,
                    category: c.category || "General",
                    author: c.author?.name || "Hệ thống",
                    icon: themeInfo.icon,
                    color: themeInfo.color,
                    questions: c._count?.questions || 0,
                    isPro: c.category === "PRO" || c.price > 0 
                  };
              });
              setCoursesList(formattedExams);
           }
         }
       } catch (error) {
         console.error("Lỗi khi fetch courses:", error);
       } finally {
         setIsLoadingCourses(false);
       }
    }

    // Học sinh cần fetch để thi, Giáo viên cần fetch để quản lý
    if (status === "authenticated" && (userRole === "STUDENT" || userRole === "TEACHER")) {
       fetchCourses();
    }
  }, [status, userRole]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center max-w-md mx-auto">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
        <p className="text-stone-500 font-bold">Đang tải dữ liệu phân quyền...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login?callbackUrl=/mobile-app" });
  };

  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center max-w-md mx-auto p-6 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-amber-100 dark:from-amber-900/20 to-transparent"></div>
        <div className="w-24 h-24 bg-white dark:bg-stone-900 rounded-3xl shadow-xl flex items-center justify-center mb-8 relative z-10 text-amber-500 border border-amber-100 dark:border-stone-800">
           <Trophy size={40} />
        </div>
        <h1 className="text-2xl font-black text-stone-800 dark:text-stone-100 mb-2 relative z-10">EduTech AI App</h1>
        <p className="text-stone-500 mb-10 relative z-10">Bạn đã đăng xuất. Vui lòng đăng nhập lại để xem dữ liệu.</p>
        <button 
          onClick={() => router.push("/login?callbackUrl=/mobile-app")}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 relative z-10"
        >
          <LogIn size={20} /> Đăng nhập hệ thống
        </button>
      </div>
    );
  }

  const user = session.user as any;
  const displayName = user.name || "Người dùng";
  const displayInitials = displayName.substring(0, 2).toUpperCase();
  
  // 1. PHÂN QUYỀN RÕ RÀNG
  const isAdmin = userRole === "ADMIN";
  const isTeacher = userRole === "TEACHER";
  const isStudent = userRole !== "ADMIN" && userRole !== "TEACHER";

  const headerColor = isAdmin 
    ? "bg-gradient-to-br from-indigo-600 to-purple-800" 
    : isTeacher 
    ? "bg-gradient-to-br from-emerald-600 to-teal-700" 
    : "bg-gradient-to-br from-amber-500 to-orange-600";

  const roleText = isAdmin ? "Quản trị viên" : isTeacher ? "Giảng viên" : "Học sinh";

  // 2. CẤU HÌNH MENU DƯỚI ĐÁY THEO QUYỀN
  const navItems = [
    { id: "home", icon: Home, label: isAdmin ? "Hệ thống" : "Tổng quan" }
  ];

  if (isAdmin) {
    navItems.push({ id: "study", icon: ShieldCheck, label: "Kiểm duyệt" });
    navItems.push({ id: "scores", icon: Users, label: "Hoạt động" });
  } else if (isTeacher) {
    navItems.push({ id: "study", icon: FileEdit, label: "Quản lý Đề" });
    navItems.push({ id: "scores", icon: Brain, label: "Điểm HS" });
  } else {
    // Chỉ có học sinh mới có tab Thi Nhanh
    navItems.push({ id: "study", icon: BookOpen, label: "Học tập" });
    navItems.push({ id: "quiz", icon: Zap, label: "Thi Nhanh" });
    navItems.push({ id: "scores", icon: Brain, label: "Bảng điểm" });
  }
  
  navItems.push({ id: "profile", icon: User, label: "Cá nhân" });


  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-24 font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className={`px-5 pt-12 pb-24 rounded-b-[2.5rem] shadow-lg relative ${headerColor}`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-white/50 shadow-sm">
              <AvatarImage src={user.image || ""} />
              <AvatarFallback className="text-stone-800 font-bold">{displayInitials}</AvatarFallback>
            </Avatar>
            <div className="text-white">
              <p className="text-xs font-medium text-white/80 uppercase tracking-wider">{roleText}</p>
              <h2 className="font-bold text-lg tracking-tight line-clamp-1">{displayName}</h2>
            </div>
          </div>
          <button className="h-10 w-10 bg-black/10 rounded-full flex items-center justify-center text-white backdrop-blur-sm relative">
            <Bell size={20} />
          </button>
        </div>
      </div>

      <div className="px-5 -mt-16 relative z-20 space-y-4">
        
        {/* THÔNG TIN TÀI KHOẢN / VÍ */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 shadow-xl shadow-stone-900/5 border border-stone-100 dark:border-stone-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className={`p-2.5 rounded-xl ${isAdmin ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : isTeacher ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'}`}>
               {isAdmin ? <Database size={20} /> : <Wallet size={20} />}
             </div>
             <div>
                <p className="text-[10px] text-stone-500 font-bold uppercase">{isAdmin ? "Doanh thu hệ thống" : "Số dư ví"}</p>
                <p className="font-black text-stone-800 dark:text-stone-100 text-lg">
                  {isAdmin ? "45,000,000 đ" : `${appData?.userInfo?.balance?.toLocaleString('vi-VN')} đ`}
                </p>
             </div>
          </div>
          
          {/* HIỂN THỊ TRẠNG THÁI PRO RÕ RÀNG */}
          <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
            isAdmin || isTeacher 
              ? "bg-indigo-100 text-indigo-700" 
              : appData?.userInfo?.isPro 
                ? "bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-md" 
                : "bg-stone-100 dark:bg-stone-800 text-stone-500 border border-stone-200 dark:border-stone-700"
          }`}>
             {(isAdmin || isTeacher) ? <ShieldCheck size={14} /> : appData?.userInfo?.isPro ? <Crown size={14} /> : <Lock size={14} />} 
             {isAdmin ? "ADMIN" : isTeacher ? "GIẢNG VIÊN" : appData?.userInfo?.isPro ? "PRO VIP" : "Free"}
          </div>
        </div>

        {/* TAB 1: TỔNG QUAN */}
        {activeTab === "home" && (
           <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-100 dark:border-stone-800 flex justify-between items-center">
              {isAdmin ? (
                 <>
                  <div className="text-center flex-1 border-r border-stone-100 dark:border-stone-800">
                    <div className="flex justify-center mb-1"><Users size={20} className="text-indigo-500" /></div>
                    <p className="text-xs text-stone-500 font-medium">Người dùng</p>
                    <p className="font-black text-stone-800 dark:text-stone-100">{appData?.adminStats?.totalUsers || 0}</p>
                  </div>
                  <div className="text-center flex-1">
                    <div className="flex justify-center mb-1"><BookOpen size={20} className="text-purple-500" /></div>
                    <p className="text-xs text-stone-500 font-medium">Khóa học</p>
                    <p className="font-black text-stone-800 dark:text-stone-100">{appData?.adminStats?.totalCourses || 0}</p>
                  </div>
                 </>
              ) : (
                 <>
                  <div className="text-center flex-1 border-r border-stone-100 dark:border-stone-800">
                    <div className="flex justify-center mb-1"><Target size={20} className={isTeacher ? "text-emerald-500" : "text-rose-500"} /></div>
                    <p className="text-xs text-stone-500 font-medium">Lượt làm bài</p>
                    <p className="font-black text-stone-800 dark:text-stone-100">{appData?.scores?.length || 0}</p>
                  </div>
                  <div className="text-center flex-1">
                    <div className="flex justify-center mb-1"><TrendingUp size={20} className="text-blue-500" /></div>
                    <p className="text-xs text-stone-500 font-medium">{isTeacher ? "Điểm TB Lớp" : "Điểm TB"}</p>
                    <p className="font-black text-stone-800 dark:text-stone-100">
                      {appData?.scores?.length > 0 ? (appData.scores.reduce((a:any, b:any) => a + b.score, 0) / appData.scores.length).toFixed(1) : "0.0"}
                    </p>
                  </div>
                 </>
              )}
            </div>

            <div className={`${isAdmin ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-900/50" : isTeacher ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/50" : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50"} border rounded-2xl p-4 flex gap-4`}>
              <div className="mt-1"><Sparkles size={24} className={isAdmin ? "text-indigo-500" : isTeacher ? "text-emerald-500" : "text-blue-500"} /></div>
              <div>
                <h4 className={`font-bold text-sm ${isAdmin ? "text-indigo-900 dark:text-indigo-400" : isTeacher ? "text-emerald-900 dark:text-emerald-400" : "text-blue-900 dark:text-blue-400"}`}>
                  {isAdmin ? "Báo cáo Hệ thống" : "Gợi ý từ AI Mentor"}
                </h4>
                <p className={`text-xs mt-1 leading-relaxed ${isAdmin ? "text-indigo-700 dark:text-indigo-300" : isTeacher ? "text-emerald-700 dark:text-emerald-300" : "text-blue-700 dark:text-blue-300"}`}>
                  {isAdmin 
                    ? `Hệ thống ghi nhận tổng cộng ${appData?.adminStats?.totalExams || 0} lượt nộp bài. Server hoạt động ổn định.` 
                    : isTeacher
                    ? `Bạn có ${appData?.scores?.length || 0} lượt nộp bài mới từ học sinh. Hãy kiểm tra tab Điểm HS.`
                    : `Dựa trên ${appData?.scores?.length || 0} bài thi gần nhất, thuật toán nhận thấy bạn đang làm rất tốt.`}
                </p>
              </div>
            </div>

            {isStudent && (
              <div>
                <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-3 flex items-center gap-2"><CheckCircle2 className="text-emerald-500" size={18}/> Nhiệm vụ hôm nay</h3>
                <div className="space-y-2">
                  {appData?.tasks?.length > 0 ? appData.tasks.map((task: any, i: number) => (
                      <div key={i} className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-100 dark:border-stone-800 flex justify-between items-center">
                        <span className={`text-sm font-medium ${task.isCompleted ? "line-through text-stone-400" : "text-stone-700 dark:text-stone-300"}`}>{task.title}</span>
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded">+{task.xp} XP</span>
                      </div>
                  )) : <p className="text-xs text-stone-500 bg-white dark:bg-stone-900 p-4 rounded-xl border border-dashed dark:border-stone-800 text-center">Chưa có nhiệm vụ nào được tạo.</p>}
                </div>
              </div>
            )}
           </div>
        )}

        {/* TAB 2: QUẢN LÝ / HỌC TẬP (PHÂN QUYỀN GIAO DIỆN) */}
        {activeTab === "study" && (
           <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
             {isAdmin ? (
               <div>
                  <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-3 flex items-center gap-2"><Database className="text-indigo-500" size={18}/> Yêu cầu chờ duyệt</h3>
                  <p className="text-xs text-stone-500 bg-white dark:bg-stone-900 p-4 rounded-xl border border-dashed dark:border-stone-800 text-center">Hiện không có yêu cầu hệ thống nào.</p>
               </div>
             ) : isTeacher ? (
               <div>
                  <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-3 flex items-center gap-2"><FileEdit className="text-emerald-500" size={18}/> Quản lý Đề thi của tôi</h3>
                  {isLoadingCourses ? (
                      <Loader2 className="animate-spin text-emerald-500 mx-auto my-4" />
                  ) : coursesList.filter(c => c.author === user.name).length > 0 ? (
                      coursesList.filter(c => c.author === user.name).map(course => (
                        <div key={course.id} className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-100 dark:border-stone-800 mb-3 flex justify-between items-center shadow-sm">
                           <div>
                             <p className="font-bold text-sm text-stone-800 dark:text-stone-100">{course.title}</p>
                             <p className="text-xs text-stone-500 mt-0.5">{course.questions} câu hỏi</p>
                           </div>
                           <button className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold">Chỉnh sửa</button>
                        </div>
                      ))
                  ) : (
                      <p className="text-xs text-stone-500 bg-white dark:bg-stone-900 p-4 rounded-xl border border-dashed dark:border-stone-800 text-center">Bạn chưa tạo khóa học nào.</p>
                  )}
               </div>
             ) : (
               <>
                 <div>
                   <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-3 flex items-center gap-2"><Compass className="text-blue-500" size={18}/> Lộ trình của bạn</h3>
                   {appData?.paths?.length > 0 ? appData.paths.map((path: any, i: number) => (
                      <div key={i} className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-100 dark:border-stone-800 mb-3">
                         <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-stone-700 dark:text-stone-300">{path.title}</span>
                            <span className="text-xs font-bold text-blue-600">{path.progress}%</span>
                         </div>
                         <Progress value={path.progress} className="h-2 [&>div]:bg-blue-500" />
                      </div>
                   )) : <p className="text-xs text-stone-500 bg-white dark:bg-stone-900 p-4 rounded-xl border border-dashed dark:border-stone-800 text-center">Chưa đăng ký lộ trình nào.</p>}
                 </div>

                 <div>
                   <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-3 flex items-center gap-2"><PlayCircle className="text-rose-500" size={18}/> Khóa học đã lưu</h3>
                   {appData?.courses?.length > 0 ? appData.courses.map((course: any, i: number) => (
                      <div key={i} className="bg-white dark:bg-stone-900 p-3 rounded-xl border border-stone-100 dark:border-stone-800 mb-3 flex gap-3 items-center">
                         <div className="h-12 w-12 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-lg flex items-center justify-center shrink-0"><BookOpen size={20}/></div>
                         <div>
                            <p className="text-sm font-bold text-stone-800 dark:text-stone-100 line-clamp-1">{course.title}</p>
                            <p className="text-xs text-stone-500 mt-0.5">{course.category}</p>
                         </div>
                      </div>
                   )) : <p className="text-xs text-stone-500 bg-white dark:bg-stone-900 p-4 rounded-xl border border-dashed dark:border-stone-800 text-center">Bạn chưa mua khóa học nào.</p>}
                 </div>
               </>
             )}
           </div>
        )}

        {/* ========================================================= */}
        {/* TAB MỚI: THI TRẮC NGHIỆM NHANH (CHỈ HIỂN THỊ VỚI HỌC SINH) */}
        {/* ========================================================= */}
        {isStudent && activeTab === "quiz" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
             <div className="flex justify-between items-center mb-3">
               <h3 className="font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                 <Zap className="text-amber-500 fill-amber-100" size={18}/> Danh sách bài thi
               </h3>
             </div>
             
             {isLoadingCourses ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="animate-spin text-amber-500 w-8 h-8" />
                </div>
             ) : coursesList.length === 0 ? (
                <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-dashed border-stone-200 dark:border-stone-800 text-center">
                  <p className="text-sm text-stone-500">Chưa có bài thi nào trên hệ thống.</p>
                </div>
             ) : (
                <div className="space-y-3">
                  {coursesList.map((course) => {
                    const CourseIcon = course.icon;
                    
                    // XÁC ĐỊNH QUYỀN: BÀI THI FREE HOẶC HỌC SINH CÓ PRO
                    const isUserPro = appData?.userInfo?.isPro === true;
                    const hasAccess = !course.isPro || isUserPro;
                    
                    return (
                      <div key={course.id} className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-100 dark:border-stone-800 flex justify-between items-center shadow-sm hover:shadow-md transition-all">
                        <div className={`p-2.5 rounded-xl mr-3 shrink-0 ${course.color} ${!hasAccess && 'opacity-50 grayscale'}`}>
                           <CourseIcon size={22} />
                        </div>
                        
                        <div className={`flex-1 min-w-0 pr-2 ${!hasAccess && 'opacity-60'}`}>
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                             <span className="text-[10px] font-bold bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300 px-2 py-0.5 rounded-full uppercase">{course.category}</span>
                             {course.isPro && (
                                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                  <Crown size={10}/> PRO
                                </span>
                             )}
                          </div>
                          <p className="font-bold text-sm text-stone-800 dark:text-stone-100 line-clamp-1">{course.title}</p>
                          <p className="text-[11px] text-stone-500 mt-1 flex items-center gap-1 truncate">
                            {course.questions} câu 
                            <span className="text-stone-300 dark:text-stone-700">•</span> 
                            {course.author}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                             if (!hasAccess) {
                                // Tự động chuyển hướng đến trang mua PRO
                                router.push("/student/pro"); 
                             } else {
                                router.push(`/mobile-app/quiz/${course.id}`);
                             }
                          }} 
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shrink-0 flex items-center gap-1.5 transition-all ${
                            hasAccess 
                              ? "bg-amber-500 hover:bg-amber-600 active:scale-95 text-stone-900 shadow-amber-500/20" 
                              : "bg-stone-100 dark:bg-stone-800 text-stone-400 border border-stone-200 dark:border-stone-700 active:scale-95"
                          }`}
                        >
                          {!hasAccess && <Lock size={14} className="text-stone-400" />}
                          {hasAccess ? "Thi Ngay" : "Mở Khóa"}
                        </button>
                      </div>
                    )
                  })}
                </div>
             )}
          </div>
        )}

        {/* TAB 3: BẢNG ĐIỂM */}
        {activeTab === "scores" && (
           <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="font-bold text-stone-800 dark:text-stone-100">
               {isAdmin ? "Hoạt động thi toàn hệ thống" : isTeacher ? "Lịch sử nộp bài của học sinh" : "Lịch sử điểm số cá nhân"}
            </h3>
            {appData?.scores?.length === 0 ? (
              <p className="text-xs text-stone-500 bg-white dark:bg-stone-900 p-4 rounded-xl border border-dashed dark:border-stone-800 text-center">Chưa có dữ liệu bài thi.</p>
            ) : (
              appData.scores.map((item: any, idx: number) => (
                <div key={item.id || idx} className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-100 dark:border-stone-800 flex items-center gap-4 shadow-sm">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${item.bg} ${item.color} ${item.bg.includes('dark') ? '' : 'dark:bg-opacity-20'}`}>
                    {item.score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-stone-800 dark:text-stone-100 text-sm truncate">{item.title}</p>
                    <p className="text-[11px] text-stone-500 mt-0.5 truncate">{item.subtitle}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-stone-400 font-medium">{item.date}</p>
                  </div>
                </div>
              ))
            )}
           </div>
        )}

        {/* TAB 4: CÁ NHÂN */}
        {activeTab === "profile" && (
           <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
                <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 overflow-hidden shadow-sm">
               <div 
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
                  className="p-4 border-b border-stone-50 dark:border-stone-800 flex items-center justify-between active:bg-stone-50 dark:active:bg-stone-800 transition-colors cursor-pointer"
               >
                  <div className="flex items-center gap-3">
                    {mounted && theme === "dark" ? <Moon size={20} className="text-blue-400"/> : <Sun size={20} className="text-amber-500"/>}
                    <span className="font-medium text-stone-700 dark:text-stone-300 text-sm">Giao diện ban đêm</span>
                  </div>
                  <div className={`w-11 h-6 rounded-full flex items-center p-1 transition-colors duration-300 ${mounted && theme === 'dark' ? 'bg-amber-500 justify-end' : 'bg-stone-200 dark:bg-stone-700 justify-start'}`}>
                     <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
                  </div>
               </div>
               <Link href={isAdmin ? "/admin/settings" : isTeacher ? "/teacher/settings" : "/student/settings"}>
                  <div className="p-4 border-b border-stone-50 dark:border-stone-800 flex items-center justify-between active:bg-stone-50 dark:active:bg-stone-800 transition-colors">
                     <div className="flex items-center gap-3">
                        <Settings size={20} className="text-stone-500"/>
                        <span className="font-medium text-stone-700 dark:text-stone-300 text-sm">Cài đặt tài khoản</span>
                     </div>
                     <span className="text-stone-400 text-xs text-right">Mật khẩu, Avatar...</span>
                  </div>
               </Link>
            </div>
            <button 
               onClick={handleLogout}
               className="w-full bg-red-50 dark:bg-red-500/10 text-red-600 rounded-2xl p-4 border border-red-100 dark:border-red-500/20 flex items-center justify-center gap-2 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors mt-6 shadow-sm"
            >
               <LogOut size={18} /> Đăng xuất khỏi thiết bị
            </button>
           </div>
        )}

      </div>

      {/* BOTTOM NAVIGATION TÙY CHỈNH THEO QUYỀN */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 pb-safe z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center px-6 py-3">
          {navItems.map((item) => (
            <button 
               key={item.id} 
               onClick={() => setActiveTab(item.id)} 
               className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeTab === item.id ? (isAdmin ? "text-indigo-600 scale-110" : isTeacher ? "text-emerald-600 scale-110" : "text-amber-600 scale-110") : "text-stone-400"}`}
            >
              <item.icon size={22} className={activeTab === item.id ? (isAdmin ? "fill-indigo-100 dark:fill-indigo-900" : isTeacher ? "fill-emerald-100 dark:fill-emerald-900" : "fill-amber-100 dark:fill-amber-900") : ""} />
              <span className={`text-[10px] font-bold ${activeTab === item.id ? "opacity-100" : "opacity-0 h-0"}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}