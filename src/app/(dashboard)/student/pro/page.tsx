"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Zap, Crown } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="p-8 min-h-screen bg-slate-50 flex flex-col items-center justify-center animate-in fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Nâng cấp tài khoản</h1>
        <p className="text-slate-500">Mở khóa toàn bộ sức mạnh của AI Mentor và Thư viện đề thi không giới hạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* GÓI FREE */}
        <Card className="border-none shadow-sm opacity-80 hover:opacity-100 transition-opacity">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-slate-400" /> Gói Cơ bản
            </CardTitle>
            <div className="text-3xl font-bold text-slate-700">0đ <span className="text-sm font-normal">/vĩnh viễn</span></div>
          </CardHeader>
          <CardContent className="space-y-3">
            <li className="flex gap-2 text-sm"><Check className="w-4 h-4 text-green-500" /> Truy cập khóa học Free</li>
            <li className="flex gap-2 text-sm"><Check className="w-4 h-4 text-green-500" /> Làm bài thi giới hạn (3 lần/ngày)</li>
            <li className="flex gap-2 text-sm text-slate-400 line-through"><Check className="w-4 h-4" /> AI Mentor hỗ trợ 24/7</li>
            <li className="flex gap-2 text-sm text-slate-400 line-through"><Check className="w-4 h-4" /> Chứng chỉ hoàn thành</li>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>Đang sử dụng</Button>
          </CardFooter>
        </Card>

        {/* GÓI PRO */}
        <Card className="border-2 border-amber-500 shadow-xl relative overflow-hidden transform hover:-translate-y-1 transition-transform">
          <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs px-3 py-1 font-bold rounded-bl-lg">POPULAR</div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <Crown className="w-5 h-5 fill-amber-500" /> Gói PRO
            </CardTitle>
            <div className="text-4xl font-bold text-slate-900">199.000đ <span className="text-sm font-normal text-slate-500">/tháng</span></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <li className="flex gap-2 text-sm font-medium"><Check className="w-4 h-4 text-amber-500" /> Mở khóa TẤT CẢ khóa học Pro</li>
            <li className="flex gap-2 text-sm font-medium"><Check className="w-4 h-4 text-amber-500" /> Không giới hạn lượt thi thử</li>
            <li className="flex gap-2 text-sm font-medium"><Check className="w-4 h-4 text-amber-500" /> AI Mentor chấm điểm & giải thích chi tiết</li>
            <li className="flex gap-2 text-sm font-medium"><Check className="w-4 h-4 text-amber-500" /> Huy hiệu VIP trên Cộng đồng</li>
          </CardContent>
          <CardFooter>
            <Link href="/student/pro/payment?plan=PRO_MONTHLY&amount=199000" className="w-full">
              <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-6 shadow-lg shadow-orange-200">
                NÂNG CẤP NGAY 🚀
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}