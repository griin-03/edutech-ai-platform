"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, Zap, Crown, Sparkles, Infinity as InfinityIcon, 
  ShieldCheck, BrainCircuit, ArrowRight, X 
} from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const { data: session } = useSession();
  
  // 🔥 Lấy trạng thái PRO từ session
  const isPro = (session?.user as any)?.isPro === true;

  return (
    <div className="min-h-screen bg-[#fdfbf7] dark:bg-[#0c0a09] animate-in fade-in duration-700 pb-20">
      
      {/* --- HERO SECTION --- */}
      <div className="pt-20 pb-16 px-6 text-center max-w-3xl mx-auto space-y-6">
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-none px-4 py-1.5 text-sm font-bold mb-4 animate-bounce">
          <Sparkles className="w-4 h-4 mr-2 inline" /> Khởi đầu hành trình thủ khoa
        </Badge>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Nâng cấp tài khoản <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">PRO</span>
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Mở khóa toàn bộ sức mạnh của AI Mentor và Thư viện đề thi không giới hạn. Đầu tư một lần, sử dụng trọn đời.
        </p>
      </div>

      {/* --- PRICING CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto px-6 mb-24 items-center">
        
        {/* GÓI CƠ BẢN (FREE) */}
        <Card className={`border-none shadow-lg transition-all duration-300 dark:bg-slate-900 ${isPro ? 'opacity-60 scale-95 grayscale-[50%]' : 'hover:-translate-y-1'}`}>
          <CardHeader className="p-8 pb-4">
            <CardTitle className="flex items-center gap-2 text-xl text-slate-600 dark:text-slate-300">
              <Zap className="w-6 h-6 text-slate-400" /> Gói Cơ bản
            </CardTitle>
            <div className="mt-4">
              <span className="text-5xl font-black text-slate-900 dark:text-white">0đ</span>
              <span className="text-slate-500 font-medium ml-1">/vĩnh viễn</span>
            </div>
            <p className="text-sm text-slate-500 mt-2">Dành cho người mới bắt đầu làm quen với hệ thống.</p>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-4">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300"><Check className="w-5 h-5 text-emerald-500" /> Truy cập khóa học Free</div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300"><Check className="w-5 h-5 text-emerald-500" /> Làm bài thi giới hạn (3 lần/ngày)</div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-400 dark:text-slate-600"><X className="w-5 h-5" /> AI Mentor hỗ trợ 24/7</div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-400 dark:text-slate-600"><X className="w-5 h-5" /> Chứng chỉ hoàn thành</div>
          </CardContent>
          <CardFooter className="p-8 pt-0">
            <Button variant="outline" className="w-full h-14 rounded-xl font-bold text-slate-500 border-slate-200 dark:border-slate-800 dark:bg-slate-950" disabled>
              {isPro ? "Đã nâng cấp" : "Đang sử dụng"}
            </Button>
          </CardFooter>
        </Card>

        {/* GÓI PRO (VIP) */}
        <Card className={`relative overflow-hidden transition-all duration-500 border-4 ${isPro ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20 shadow-2xl shadow-amber-500/20 scale-105' : 'border-amber-400 bg-white dark:bg-slate-900 shadow-2xl hover:-translate-y-2'}`}>
          {/* Họa tiết nền mờ */}
          <div className="absolute -top-10 -right-10 opacity-5"><Crown size={200} /></div>
          
          <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-white text-xs px-4 py-1.5 font-bold rounded-bl-xl uppercase tracking-wider shadow-md">Popular</div>
          
          <CardHeader className="p-8 pb-4 relative z-10">
            <CardTitle className="flex items-center gap-2 text-xl text-amber-600 dark:text-amber-500 font-black">
              <Crown className="w-6 h-6 fill-amber-500" /> Gói PRO
            </CardTitle>
            <div className="mt-4">
              <span className="text-5xl font-black text-slate-900 dark:text-white">199.000đ</span>
              <span className="text-slate-500 font-medium ml-1">/tháng</span>
            </div>
            <p className="text-sm text-slate-500 mt-2">Dành cho học sinh muốn bứt phá điểm số tối đa.</p>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-4 relative z-10">
            <div className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200"><Check className="w-5 h-5 text-amber-500" /> Mở khóa TẤT CẢ thư viện đề thi PRO</div>
            <div className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200"><Check className="w-5 h-5 text-amber-500" /> Không giới hạn số lượt thi thử</div>
            <div className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200"><Check className="w-5 h-5 text-amber-500" /> AI Mentor chấm điểm & giải thích 1-1</div>
            <div className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200"><Check className="w-5 h-5 text-amber-500" /> Huy hiệu VIP vinh danh trên BXH</div>
          </CardContent>
          <CardFooter className="p-8 pt-0 relative z-10">
            {isPro ? (
              <Button disabled className="w-full h-14 rounded-xl font-black bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-lg text-base opacity-100 flex items-center justify-center gap-2">
                <Crown className="w-5 h-5"/> ĐANG SỬ DỤNG GÓI PRO
              </Button>
            ) : (
              <Link href="/student/pro/payment?plan=PRO_MONTHLY&amount=199000" className="w-full">
                <Button className="w-full h-14 rounded-xl font-black bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-xl shadow-orange-500/20 text-base group">
                  NÂNG CẤP NGAY <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            )}
          </CardFooter>
        </Card>

      </div>

      {/* --- FEATURE HIGHLIGHTS --- */}
      <div className="max-w-5xl mx-auto px-6 mb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Tại sao nên chọn gói PRO?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 text-center hover:shadow-md transition-shadow">
            <div className="w-14 h-14 mx-auto bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
              <InfinityIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Không Giới Hạn</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Truy cập toàn bộ hơn 10.000+ đề thi chất lượng cao đã được kiểm duyệt khắt khe bởi các chuyên gia.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 text-center hover:shadow-md transition-shadow">
            <div className="w-14 h-14 mx-auto bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-6">
              <BrainCircuit className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Gia Sư AI 24/7</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Sai ở đâu, AI chỉ ở đó. Giải thích cặn kẽ từng bước cho đến khi bạn thực sự hiểu bản chất vấn đề.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 text-center hover:shadow-md transition-shadow">
            <div className="w-14 h-14 mx-auto bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Cam Kết Chất Lượng</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Nội dung luôn được cập nhật theo cấu trúc đề thi mới nhất của Bộ GD&ĐT. Không chứa quảng cáo.</p>
          </div>
        </div>
      </div>

      {/* --- FAQ SECTION --- */}
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">Câu hỏi thường gặp</h2>
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Tôi có thể hủy gói PRO bất cứ lúc nào không?</h4>
            <p className="text-slate-500 text-sm leading-relaxed">Có, bạn hoàn toàn có thể hủy tự động gia hạn bất cứ lúc nào trong phần Cài đặt tài khoản. Bạn vẫn sẽ giữ quyền lợi PRO cho đến hết chu kỳ đã thanh toán.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Hình thức thanh toán nào được chấp nhận?</h4>
            <p className="text-slate-500 text-sm leading-relaxed">Hệ thống hỗ trợ thanh toán siêu tốc thông qua quét mã QR Code (hỗ trợ tất cả các ứng dụng ngân hàng và ví Momo, ZaloPay).</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Tài khoản PRO có dùng được trên nhiều thiết bị không?</h4>
            <p className="text-slate-500 text-sm leading-relaxed">Bạn có thể đăng nhập và học tập trên mọi thiết bị (Laptop, Điện thoại, Máy tính bảng). Tuy nhiên, để bảo mật, bạn không thể sử dụng cùng lúc trên 2 thiết bị.</p>
          </div>
        </div>
      </div>

    </div>
  );
}