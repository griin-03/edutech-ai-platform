"use client";

import { useState } from "react";
import { createUpgradeRequest } from "./actions"; // Ta sẽ tạo file action này ngay dưới
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, Shield, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      // Gọi Server Action để tạo UpgradeRequest
      const res = await createUpgradeRequest(formData);
      if (res.success) {
        toast.success("Đã gửi yêu cầu! Vui lòng đợi Admin duyệt.");
      } else {
        toast.error("Lỗi: " + res.error);
      }
    } catch (e) {
      toast.error("Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Nâng cấp tài khoản PRO</h1>
        <p className="text-slate-500 text-lg">Mở khóa toàn bộ khóa học và tính năng AI cao cấp.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* CỘT 1: QUYỀN LỢI */}
        <Card className="border-blue-200 shadow-lg bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-700">Gói Vĩnh viễn</CardTitle>
            <div className="text-4xl font-bold mt-2">299.000 đ <span className="text-sm font-normal text-slate-500">/ trọn đời</span></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li className="flex items-center gap-2"><Check className="text-green-600 w-5 h-5" /> Truy cập mọi khóa học Pro</li>
              <li className="flex items-center gap-2"><Check className="text-green-600 w-5 h-5" /> AI Tutor hỗ trợ 24/7 không giới hạn</li>
              <li className="flex items-center gap-2"><Check className="text-green-600 w-5 h-5" /> Cấp chứng chỉ sau khi hoàn thành</li>
              <li className="flex items-center gap-2"><Check className="text-green-600 w-5 h-5" /> Tắt quảng cáo</li>
            </ul>
          </CardContent>
        </Card>

        {/* CỘT 2: FORM THANH TOÁN */}
        <Card className="border-2 border-blue-600 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-3 py-1 rounded-bl-lg">Khuyên dùng</div>
          <CardHeader>
            <CardTitle>Thông tin chuyển khoản</CardTitle>
            <CardDescription>Quét mã QR và điền thông tin bên dưới.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Giả lập QR Code */}
            <div className="flex justify-center bg-white p-4 rounded border">
                {/* Thay src bằng link ảnh QR thật của bạn nếu muốn */}
                <div className="w-32 h-32 bg-slate-200 flex items-center justify-center text-xs text-slate-500">
                    [QR VNPAY/BANK]
                </div>
            </div>
            
            <form action={handleSubmit} className="space-y-4">
               <div className="space-y-2">
                 <Label>Nội dung chuyển khoản</Label>
                 <Input name="content" placeholder="Ví dụ: Tung chuyen tien hoc phi" required />
               </div>
               
               <div className="space-y-2">
                 <Label>Số tiền đã chuyển</Label>
                 <Input name="amount" type="number" defaultValue="299000" readOnly className="bg-slate-100" />
               </div>

               {/* Upload ảnh bill (Giả lập input text URL cho đơn giản, hoặc dùng input file nếu đã config upload) */}
               <div className="space-y-2">
                 <Label>Link ảnh giao dịch (Hoặc ghi chú thêm)</Label>
                 <Textarea name="note" placeholder="Dán link ảnh hoặc ghi chú..." />
               </div>

               <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                 {loading ? <Loader2 className="animate-spin mr-2" /> : <Zap className="mr-2 w-4 h-4" />}
                 Xác nhận đã chuyển khoản
               </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}