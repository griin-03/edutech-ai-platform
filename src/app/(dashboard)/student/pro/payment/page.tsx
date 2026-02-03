"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { createPendingOrder, checkOrderStatus } from "../actions"; 
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, ScanLine, ArrowLeft, Smartphone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react"; // Tạo QR Code trực tiếp trên web

export default function PaymentGatewayPage() {
  const router = useRouter();
  const { update } = useSession();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "PRO_MONTHLY";

  const [orderId, setOrderId] = useState<string | null>(null);
  const [status, setStatus] = useState<"LOADING" | "WAITING" | "SUCCESS">("LOADING");
  
  // Lấy địa chỉ IP/Domain hiện tại để tạo link cho điện thoại
  const [origin, setOrigin] = useState("");

  // 1. KHI VÀO TRANG: LẤY LINK GỐC VÀ TẠO ĐƠN TREO
  useEffect(() => {
    // Lấy origin (Ví dụ: http://192.168.1.5:3000)
    setOrigin(window.location.origin);

    createPendingOrder(plan, 199000).then((id) => {
      if (id) {
        setOrderId(id);
        setStatus("WAITING");
      }
    });
  }, []);

  // 2. POLLING: CỨ 2 GIÂY HỎI SERVER 1 LẦN XEM ĐIỆN THOẠI ĐÃ BẤM CHƯA
  useEffect(() => {
    if (!orderId || status === "SUCCESS") return;

    const interval = setInterval(async () => {
      const isPaid = await checkOrderStatus(orderId);
      if (isPaid) {
        setStatus("SUCCESS");
        await update(); // Cập nhật session (isPro: true)
        router.refresh();
        toast.success("Đồng bộ thành công từ thiết bị di động!");
        
        clearInterval(interval);
        setTimeout(() => router.push("/student/ai-tutor"), 3000);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [orderId, status]);

  // --- MÀN HÌNH THÀNH CÔNG ---
  if (status === "SUCCESS") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 animate-in fade-in">
        <div className="text-center p-10 bg-white rounded-3xl shadow-xl border border-green-100">
           <div className="mx-auto bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Thanh toán hoàn tất!</h2>
          <p className="text-slate-500 mt-2">Đã nhận tín hiệu xác thực từ điện thoại.</p>
          <p className="text-xs text-slate-400 mt-6">Đang chuyển hướng về Chat AI...</p>
        </div>
      </div>
    );
  }

  // LINK MÀ ĐIỆN THOẠI SẼ MỞ
  const mobileUrl = orderId ? `${origin}/mobile-pay/${orderId}` : "";

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl border-0 overflow-hidden rounded-3xl bg-white">
        <CardContent className="p-0">
           
           {/* HEADER */}
           <div className="bg-[#0f172a] p-6 text-center relative overflow-hidden">
              <div className="relative z-10">
                <h1 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                   <ShieldCheck className="text-green-400" size={24}/> Cổng thanh toán EduPay
                </h1>
                <p className="text-sm text-slate-400 mt-1">Quét mã QR để xác nhận giao dịch</p>
              </div>
           </div>

           <div className="p-8 flex flex-col items-center gap-6 min-h-[400px] justify-center">
              {status === "LOADING" ? (
                 <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    <p className="text-sm text-slate-500">Đang khởi tạo mã bảo mật...</p>
                 </div>
              ) : (
                 <>
                    {/* KHUNG QR CODE ĐƯỢC TẠO TRỰC TIẾP */}
                    <div className="relative group p-4 border-2 border-dashed border-blue-300 rounded-2xl bg-white shadow-lg">
                       <QRCodeSVG 
                          value={mobileUrl} // Link này sẽ được mã hóa thành QR
                          size={220} 
                          level={"H"}
                          includeMargin={true}
                       />
                       
                       {/* Icon Scan giữa QR cho đẹp */}
                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="bg-white p-1.5 rounded-full shadow-md">
                             <ScanLine size={28} className="text-blue-600 animate-pulse" />
                          </div>
                       </div>
                    </div>

                    <div className="text-center space-y-2">
                       <p className="font-bold text-slate-800 flex items-center justify-center gap-2 text-lg">
                          <Smartphone size={20} className="text-blue-600"/> Quét bằng điện thoại
                       </p>
                       <p className="text-sm text-slate-500 max-w-[250px] mx-auto">
                          Sử dụng Camera hoặc Zalo để quét mã trên.
                       </p>
                    </div>

                    {/* Link backup phòng khi không quét được */}
                    <div className="mt-2 w-full text-center">
                       <p className="text-[10px] text-slate-400 mb-1">Link debug (nếu không có ĐT):</p>
                       <a href={mobileUrl} target="_blank" className="text-xs font-mono font-bold text-blue-600 hover:underline break-all px-4 block">
                          {mobileUrl}
                       </a>
                    </div>
                 </>
              )}
           </div>
           
           <div className="p-4 bg-slate-50 border-t flex justify-center">
              <Button variant="ghost" className="text-slate-500 hover:text-red-500" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Hủy giao dịch
              </Button>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}