"use client";

import { useState, use } from "react"; // 1. Thêm import 'use'
import { confirmOrderOnMobile } from "@/app/(dashboard)/student/pro/actions"; // Đảm bảo đường dẫn import đúng với cấu trúc dự án của bạn
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle2, Fingerprint, Loader2, ShieldCheck } from "lucide-react";

// 2. Định nghĩa lại kiểu dữ liệu của params là Promise
export default function MobilePayPage({ params }: { params: Promise<{ orderId: string }> }) {
  // 3. Dùng use() để lấy orderId từ Promise params
  const { orderId } = use(params);

  const [status, setStatus] = useState<"WAITING" | "PROCESSING" | "SUCCESS">("WAITING");

  const handleConfirm = async () => {
    setStatus("PROCESSING");
    // Giả lập delay mạng 1.5s cho giống thật
    await new Promise(r => setTimeout(r, 1500));
    
    // Sử dụng orderId đã được unwrap
    const res = await confirmOrderOnMobile(orderId);
    if (res.success) {
      setStatus("SUCCESS");
    } else {
      alert("Lỗi kết nối hoặc đơn hàng không tồn tại!");
      setStatus("WAITING");
    }
  };

  if (status === "SUCCESS") {
    return (
      <div className="min-h-screen bg-green-600 flex items-center justify-center p-6 text-white text-center">
        <div className="space-y-4 animate-in zoom-in">
          <CheckCircle2 size={80} className="mx-auto" />
          <h1 className="text-2xl font-bold">Thanh toán thành công!</h1>
          <p>Bạn có thể kiểm tra kết quả trên màn hình máy tính.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-xl border-none">
        <CardHeader className="bg-[#0f172a] text-white text-center py-8 rounded-t-xl">
           <ShieldCheck className="mx-auto mb-2 text-green-400" size={40} />
           <h1 className="text-lg font-bold">Xác thực giao dịch</h1>
           <p className="text-slate-400 text-xs">EduTech Secure Payment</p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
           <div className="text-center space-y-1">
              <p className="text-slate-500 text-sm">Tổng thanh toán</p>
              <p className="text-3xl font-black text-slate-900">199.000đ</p>
           </div>
           
           <div className="bg-slate-50 p-4 rounded-lg text-xs text-slate-600 text-center border border-slate-200">
              Vui lòng xác nhận vân tay hoặc FaceID để hoàn tất thanh toán cho đơn hàng <br/>
              <strong className="text-slate-900 font-mono text-sm">#{orderId.slice(0, 8)}</strong>
           </div>

           <Button 
             onClick={handleConfirm} 
             disabled={status === "PROCESSING"}
             className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200"
           >
             {status === "PROCESSING" ? <Loader2 className="animate-spin" /> : <><Fingerprint className="mr-2"/> XÁC NHẬN THANH TOÁN</>}
           </Button>
        </CardContent>
      </Card>
    </div>
  );
}