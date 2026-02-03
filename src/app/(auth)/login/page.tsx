"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner"; // Gợi ý: Dùng toast sẽ đẹp hơn alert (nếu có)

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Gửi yêu cầu đăng nhập lên NextAuth
      const res = await signIn("credentials", {
        email: email,
        password: password,
        redirect: false, // Quan trọng: Tắt chuyển hướng tự động
      });

      if (res?.error) {
        // Dùng alert tạm thời (hoặc toast nếu có)
        alert("Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.");
        setLoading(false);
        return;
      }

      // 2. Đăng nhập thành công -> Gọi API xác định danh tính
      const userRes = await fetch("/api/user/me");
      
      if (userRes.ok) {
        const userData = await userRes.json();
        
        // 🔥 FIX QUAN TRỌNG: Chuẩn hóa Role về chữ IN HOA để so sánh
        const role = (userData.role || "STUDENT").toString().toUpperCase();
        
        console.log("🚀 [LOGIN] Role detected:", role); // Log để kiểm tra

        // Cập nhật router để làm mới dữ liệu Sidebar
        router.refresh(); 

        // 3. ĐIỀU HƯỚNG CHÍNH XÁC (Dựa trên Role in hoa)
        if (role === "ADMIN") {
            router.push("/admin/dashboard");
        } else if (role === "TEACHER") {
            router.push("/teacher/dashboard");
        } else {
            router.push("/student/dashboard");
        }

      } else {
        // Fallback: Nếu API lỗi, đưa về Student cho an toàn
        console.error("❌ Không lấy được thông tin User");
        router.refresh();
        router.push("/student/dashboard");
      }

    } catch (error) {
      console.error("Lỗi hệ thống:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại sau.");
      setLoading(false);
    }
    // Không set loading false ở cuối để tránh nút bị bật lại khi đang redirect
  };

  return (
    <div className="flex h-screen items-center justify-center bg-stone-100 dark:bg-stone-950 transition-colors duration-300">
      <form onSubmit={handleLogin} className="space-y-6 p-8 md:p-10 bg-white dark:bg-stone-900 shadow-2xl rounded-2xl w-full max-w-md border border-stone-200 dark:border-stone-800">
         
         {/* Logo & Header */}
         <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-stone-800 dark:text-stone-100 tracking-tight">
                EduTech<span className="text-amber-600">.AI</span>
            </h1>
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
                Đăng nhập hệ thống quản lý
            </p>
         </div>
         
         {/* Inputs */}
         <div className="space-y-4 pt-4">
           <div>
             <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Email</label>
             <input 
                type="email"
                placeholder="admin@gmail.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white outline-none transition-all dark:bg-stone-950 dark:border-stone-800 dark:text-stone-200"
                required
                autoFocus
             />
           </div>
           
           <div>
             <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">Mật khẩu</label>
             <input 
                type="password" 
                placeholder="••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white outline-none transition-all dark:bg-stone-950 dark:border-stone-800 dark:text-stone-200"
                required
             />
           </div>
         </div>

         {/* Submit Button */}
         <button 
            type="submit" 
            disabled={loading}
            className="w-full p-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
         >
            {loading ? (
                <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Đang xử lý...</span>
                </>
            ) : (
                "Đăng nhập"
            )}
         </button>

         {/* Footer */}
         <div className="text-center text-xs text-stone-400 mt-4">
            Quên mật khẩu? <span className="text-amber-600 font-bold cursor-pointer hover:underline">Khôi phục ngay</span>
         </div>
      </form>
    </div>
  );
}