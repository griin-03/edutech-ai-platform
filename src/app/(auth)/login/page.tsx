"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation"; // 🔥 Thêm useSearchParams
import { useState, Suspense } from "react";
import { Loader2, ArrowLeft, GraduationCap, Briefcase, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner"; 

type AuthMode = "LOGIN" | "REGISTER" | "FORGOT_PASSWORD";

// Tách Form ra một component riêng để bọc Suspense (Chuẩn Next.js khi dùng useSearchParams)
function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams(); // 🔥 Bắt tham số trên URL
  const callbackUrl = searchParams.get("callbackUrl"); // 🔥 Lấy URL trả về (ví dụ: /mobile-app)
  
  const [mode, setMode] = useState<AuthMode>("LOGIN");
  const [loading, setLoading] = useState(false);

  // --- STATE CHUNG ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // --- STATE CHO ĐĂNG KÝ ---
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerRole, setRegisterRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [proofLink, setProofLink] = useState("");

  // ==============================================================================
  // 1. LOGIC ĐĂNG NHẬP ĐÃ NÂNG CẤP CALLBACK URL
  // ==============================================================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email,
        password: password,
        redirect: false, 
      });

      if (res?.error) {
        if (res.error === "CredentialsSignin") {
            toast.error("Sai email hoặc mật khẩu. Vui lòng thử lại!");
        } else {
            toast.error(res.error); 
        }
        setLoading(false);
        return;
      }

      const userRes = await fetch("/api/user/me");
      
      if (userRes.ok) {
        const userData = await userRes.json();
        const role = (userData.role || "STUDENT").toString().toUpperCase();
        
        toast.success("Đăng nhập thành công!");
        router.refresh(); 

        // 🔥 LOGIC ĐIỀU HƯỚNG THÔNG MINH MỚI
        if (callbackUrl) {
            router.push(callbackUrl); // Trả về App Mobile nếu có yêu cầu
        } else if (role === "ADMIN") {
            router.push("/admin/dashboard");
        } else if (role === "TEACHER") {
            router.push("/teacher/dashboard");
        } else {
            router.push("/student/dashboard");
        }

      } else {
        toast.error("Không lấy được thông tin người dùng.");
        router.refresh();
        router.push(callbackUrl || "/student/dashboard"); 
      }
    } catch (error) {
      console.error("Lỗi hệ thống:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  // ==============================================================================
  // 2. LOGIC ĐĂNG KÝ (Giữ nguyên)
  // ==============================================================================
  const handleRegister = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (password !== confirmPassword) {
          return toast.error("Mật khẩu nhập lại không khớp!");
      }

      if (registerRole === "TEACHER" && !proofLink.trim()) {
          return toast.error("Vui lòng cung cấp link CV/Bằng cấp để xét duyệt!");
      }

      setLoading(true);
      try {
          const res = await fetch("/api/auth/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, email, password, role: registerRole, proofLink })
          });

          const data = await res.json();

          if (res.ok) {
              toast.success(registerRole === "TEACHER" ? "Đăng ký thành công! Vui lòng chờ Admin duyệt quyền Giáo viên." : "Tạo tài khoản thành công! Vui lòng đăng nhập.");
              setMode("LOGIN");
              setPassword("");
              setConfirmPassword("");
          } else {
              toast.error(data.error || "Lỗi đăng ký");
          }
      } catch (error) {
          toast.error("Không thể kết nối đến máy chủ.");
      } finally {
          setLoading(false);
      }
  };

  // ==============================================================================
  // 3. LOGIC QUÊN MẬT KHẨU (Giữ nguyên)
  // ==============================================================================
  const handleForgotPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setTimeout(() => {
          toast.success("Một email khôi phục mật khẩu đã được gửi đến " + email);
          setLoading(false);
          setMode("LOGIN");
      }, 1500);
  };

  return (
    <div className="space-y-6 p-8 md:p-10 bg-white dark:bg-stone-900 shadow-2xl rounded-[2rem] w-full max-w-md border border-stone-200 dark:border-stone-800 relative overflow-hidden">
        {mode !== "LOGIN" && (
        <button onClick={() => setMode("LOGIN")} className="absolute top-6 left-6 text-stone-400 hover:text-stone-800 dark:hover:text-white transition-colors" type="button">
            <ArrowLeft size={20} />
        </button>
        )}

        <div className="text-center space-y-2 pt-2">
        <h1 className="text-3xl font-black text-stone-800 dark:text-stone-100 tracking-tight">
            EduTech<span className="text-amber-600">.AI</span>
        </h1>
        <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
            {mode === "LOGIN" && "Đăng nhập hệ thống quản lý"}
            {mode === "REGISTER" && "Khởi tạo tài khoản mới"}
            {mode === "FORGOT_PASSWORD" && "Khôi phục mật khẩu"}
        </p>
        </div>
        
        {/* ================= FORM ĐĂNG NHẬP ================= */}
        {mode === "LOGIN" && (
            <form onSubmit={handleLogin} className="space-y-4 pt-4 animate-in fade-in slide-in-from-left-4 duration-300">
            <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Email</label>
                <input 
                    type="email" placeholder="Nhập email của bạn" value={email} onChange={e => setEmail(e.target.value)} required autoFocus
                    className="w-full p-3.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white outline-none transition-all dark:bg-stone-950 dark:border-stone-800 dark:text-stone-200"
                />
            </div>
            <div>
                <div className="flex justify-between items-center mb-1.5 px-1">
                    <label className="block text-xs font-bold text-stone-500 uppercase">Mật khẩu</label>
                    <button type="button" onClick={() => setMode("FORGOT_PASSWORD")} className="text-xs font-bold text-amber-600 hover:underline">Quên mật khẩu?</button>
                </div>
                <div className="relative">
                    <input 
                        type={showPassword ? "text" : "password"} placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} required
                        className="w-full p-3.5 pr-12 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white outline-none transition-all dark:bg-stone-950 dark:border-stone-800 dark:text-stone-200"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300">
                        {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                </div>
            </div>
            <button type="submit" disabled={loading} className="w-full mt-6 p-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-70 flex items-center justify-center shadow-lg shadow-amber-500/20 h-12">
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Đăng nhập ngay"}
            </button>
            <div className="text-center text-sm text-stone-500 mt-6 pt-6 border-t border-stone-100 dark:border-stone-800">
                Chưa có tài khoản? <button type="button" onClick={() => setMode("REGISTER")} className="text-amber-600 font-bold hover:underline">Đăng ký ngay</button>
            </div>
            </form>
        )}

        {/* ================= FORM ĐĂNG KÝ ================= */}
        {mode === "REGISTER" && (
            <form onSubmit={handleRegister} className="space-y-4 pt-2 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div onClick={() => setRegisterRole("STUDENT")} className={`cursor-pointer p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${registerRole === "STUDENT" ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10' : 'border-stone-100 dark:border-stone-800 bg-transparent'}`}>
                    <GraduationCap className={registerRole === "STUDENT" ? 'text-amber-600' : 'text-stone-400'} size={24}/>
                    <span className={`text-xs font-bold ${registerRole === "STUDENT" ? 'text-amber-700 dark:text-amber-400' : 'text-stone-500'}`}>Học viên</span>
                </div>
                <div onClick={() => setRegisterRole("TEACHER")} className={`cursor-pointer p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${registerRole === "TEACHER" ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-stone-100 dark:border-stone-800 bg-transparent'}`}>
                    <Briefcase className={registerRole === "TEACHER" ? 'text-blue-600' : 'text-stone-400'} size={24}/>
                    <span className={`text-xs font-bold ${registerRole === "TEACHER" ? 'text-blue-700 dark:text-blue-400' : 'text-stone-500'}`}>Giảng viên</span>
                </div>
            </div>

            <div>
                <input type="text" placeholder="Họ và tên" value={name} onChange={e => setName(e.target.value)} required className="w-full p-3.5 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none dark:bg-stone-950 dark:border-stone-800 dark:text-white" />
            </div>
            <div>
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3.5 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none dark:bg-stone-950 dark:border-stone-800 dark:text-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                    <input type={showRegPassword ? "text" : "password"} placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-3.5 pr-10 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none dark:bg-stone-950 dark:border-stone-800 dark:text-white" />
                    <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300">
                        {showRegPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                </div>
                <div className="relative">
                    <input type={showConfirmPassword ? "text" : "password"} placeholder="Nhập lại MK" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full p-3.5 pr-10 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none dark:bg-stone-950 dark:border-stone-800 dark:text-white" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300">
                        {showConfirmPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                </div>
            </div>

            {registerRole === "TEACHER" && (
                <div className="animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl mb-3 border border-blue-100 dark:border-blue-900/50">
                        <p className="text-[11px] text-blue-700 dark:text-blue-300 font-medium leading-relaxed flex items-start gap-1.5"><CheckCircle2 className="w-4 h-4 shrink-0 text-blue-500"/> Tài khoản của bạn sẽ cần Admin xét duyệt. Vui lòng dán Link CV, bằng cấp hoặc Facebook cá nhân để xác minh.</p>
                    </div>
                    <input type="url" placeholder="https://..." value={proofLink} onChange={e => setProofLink(e.target.value)} required className="w-full p-3.5 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none dark:bg-stone-950 dark:border-stone-800 dark:text-white" />
                </div>
            )}

            <button type="submit" disabled={loading} className={`w-full mt-6 p-3.5 rounded-xl font-bold text-white transition-all disabled:opacity-70 flex items-center justify-center h-12 shadow-lg ${registerRole === 'TEACHER' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 shadow-blue-500/20' : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 shadow-amber-500/20'}`}>
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Đăng ký tài khoản"}
            </button>
            </form>
        )}

        {/* ================= FORM QUÊN MẬT KHẨU ================= */}
        {mode === "FORGOT_PASSWORD" && (
            <form onSubmit={handleForgotPassword} className="space-y-4 pt-4 animate-in fade-in zoom-in-95 duration-300">
            <p className="text-sm text-stone-500 dark:text-stone-400 text-center px-4 mb-6">
                Nhập email đã đăng ký của bạn. Chúng tôi sẽ gửi một liên kết để tạo lại mật khẩu mới.
            </p>
            <div>
                <input 
                    type="email" placeholder="Email khôi phục..." value={email} onChange={e => setEmail(e.target.value)} required autoFocus
                    className="w-full p-3.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white outline-none transition-all dark:bg-stone-950 dark:border-stone-800 dark:text-stone-200"
                />
            </div>
            <button type="submit" disabled={loading} className="w-full mt-6 p-3.5 rounded-xl font-bold text-white bg-stone-900 hover:bg-black transition-all disabled:opacity-70 flex items-center justify-center h-12 shadow-lg dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200">
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Gửi yêu cầu khôi phục"}
            </button>
            </form>
        )}
    </div>
  );
}

// Bọc toàn bộ trang Login bằng Suspense để Next.js tối ưu useSearchParams
export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 dark:bg-stone-950 transition-colors duration-300 py-10 px-4">
      <Suspense fallback={<Loader2 className="animate-spin h-10 w-10 text-amber-500" />}>
        <AuthForm />
      </Suspense>
    </div>
  );
}