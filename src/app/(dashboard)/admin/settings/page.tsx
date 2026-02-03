"use client";

import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheck, Bot, Globe, Save, RefreshCcw, AlertTriangle, DollarSign, Percent } from "lucide-react";
import { toast } from "sonner";

// Import Actions
import { getSystemConfig, updateSystemConfig } from "./actions"; 

export default function SystemSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // State config (Thêm commissionRate)
  const [config, setConfig] = useState({
    siteName: "EduTech AI Platform",
    maintenanceMsg: "",
    isMaintenance: false,
    allowAiGrading: false,
    commissionRate: 20, // Mặc định 20%
  });

  // 1. Load dữ liệu thật từ DB
  useEffect(() => {
    async function loadConfig() {
      try {
        const data = await getSystemConfig();
        if (data) {
          setConfig({
            siteName: data.appName || "EduTech AI Platform", 
            maintenanceMsg: data.maintenanceMsg || "",
            isMaintenance: data.isMaintenance || false,
            allowAiGrading: data.allowAiGrading || false,
            commissionRate: data.commissionRate || 20, // Lấy từ DB
          });
        }
      } catch (error) {
        console.error("Lỗi tải config:", error);
        toast.error("Không tải được cấu hình hệ thống");
      } finally {
        setFetching(false);
      }
    }
    loadConfig();
  }, []);

  // 2. Xử lý lưu dữ liệu
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate hoa hồng
      if (config.commissionRate < 0 || config.commissionRate > 100) {
        toast.error("Tỷ lệ hoa hồng phải từ 0% đến 100%");
        setLoading(false);
        return;
      }

      const res = await updateSystemConfig({
        appName: config.siteName,
        maintenanceMsg: config.maintenanceMsg,
        isMaintenance: config.isMaintenance,
        allowAiGrading: config.allowAiGrading,
        commissionRate: Number(config.commissionRate) // Gửi lên server
      });
      
      if (res.success) {
        toast.success("Hệ thống đã cập nhật cấu hình mới!");
      } else {
        toast.error("Lỗi Server: " + (res.error || "Không rõ nguyên nhân"));
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi kết nối server.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-stone-500">
        <RefreshCcw className="animate-spin text-amber-600 h-8 w-8" />
        <p>Đang tải dữ liệu...</p>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSave} className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Cấu hình Hệ thống</h1>
          <p className="text-stone-500 mt-1">Quản lý tài nguyên, tài chính và trí tuệ nhân tạo.</p>
        </div>
        <Button type="submit" disabled={loading} className="bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-900/20 w-full md:w-auto">
          {loading ? <RefreshCcw className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
          Lưu tất cả thay đổi
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* === CARD MỚI: TÀI CHÍNH & HOA HỒNG === */}
        <Card className="lg:col-span-3 border-l-4 border-l-green-500 shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center gap-2 text-green-700 font-bold">
              <DollarSign size={20} />
              <CardTitle>Cấu hình Tài chính & Doanh thu</CardTitle>
            </div>
            <CardDescription>Kiểm soát dòng tiền và tỷ lệ chia sẻ doanh thu với Giảng viên.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
             <div className="space-y-4">
                <div className="flex flex-col gap-2">
                   <label className="text-sm font-bold text-stone-700">Phí sàn / Hoa hồng (Commission Rate)</label>
                   <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                      <Input 
                        type="number" 
                        min={0} max={100}
                        value={config.commissionRate} 
                        onChange={(e) => setConfig({...config, commissionRate: Number(e.target.value)})}
                        className="pl-10 text-lg font-bold text-green-700 border-green-200 focus-visible:ring-green-500 h-12"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-400">%</div>
                   </div>
                   <p className="text-xs text-stone-500">
                     * Admin sẽ nhận <span className="font-bold text-green-600">{config.commissionRate}%</span> doanh thu. 
                     Giảng viên nhận <span className="font-bold text-green-600">{100 - config.commissionRate}%</span> còn lại.
                   </p>
                </div>
             </div>
             
             {/* Minh họa trực quan */}
             <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                <h4 className="text-xs font-bold text-stone-500 uppercase mb-3">Minh họa giao dịch 1.000.000đ</h4>
                <div className="flex items-center gap-2 text-sm">
                   <div className="flex-1 bg-green-100 p-2 rounded text-center text-green-800 border border-green-200">
                      <span className="block font-bold">Admin</span>
                      +{((1000000 * config.commissionRate) / 100).toLocaleString()}đ
                   </div>
                   <div className="text-stone-400 font-bold">+</div>
                   <div className="flex-1 bg-blue-100 p-2 rounded text-center text-blue-800 border border-blue-200">
                      <span className="block font-bold">Teacher</span>
                      +{((1000000 * (100 - config.commissionRate)) / 100).toLocaleString()}đ
                   </div>
                </div>
             </div>
          </CardContent>
        </Card>

        {/* KHU VỰC BẢO TRÌ (GIỮ NGUYÊN) */}
        <Card className="lg:col-span-2 border-amber-200 bg-amber-50/30 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-amber-100 bg-amber-50/50">
            <div className="flex items-center gap-2 text-amber-700 font-bold">
              <AlertTriangle size={20} />
              <CardTitle>Chế độ Bảo trì & Thông báo</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-amber-200 shadow-sm transition-all hover:shadow-md">
              <div>
                <p className="font-bold text-stone-800">Kích hoạt thông báo</p>
                <p className="text-xs text-stone-500 mt-0.5">Hiển thị banner cảnh báo trên toàn website.</p>
              </div>
              <Switch 
                checked={config.isMaintenance} 
                onCheckedChange={(val) => setConfig({...config, isMaintenance: val})}
                className="data-[state=checked]:bg-amber-600"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Nội dung thông báo</label>
              <Textarea 
                value={config.maintenanceMsg}
                onChange={(e) => setConfig({...config, maintenanceMsg: e.target.value})}
                placeholder="Ví dụ: Hệ thống bảo trì..."
                className="min-h-[100px] bg-white border-amber-200 focus-visible:ring-amber-500 resize-none shadow-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* CẤU HÌNH AI (GIỮ NGUYÊN) */}
        <Card className="border-none shadow-md bg-stone-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-20 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <CardHeader>
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Bot size={20} />
              <CardTitle>AI Mentor Core</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="flex items-center justify-between p-3 bg-stone-800/50 rounded-lg border border-stone-700">
              <span className="text-sm font-medium">Gemini 1.5 Flash</span>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50 px-2 py-0.5">Paid Tier</Badge>
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-300">Auto-Grade (Beta)</span>
                <Switch 
                  checked={config.allowAiGrading}
                  onCheckedChange={(val) => setConfig({...config, allowAiGrading: val})}
                  className="data-[state=checked]:bg-amber-500"
                />
              </div>
              <p className="text-[10px] text-stone-500 leading-tight">
                AI tự động chấm điểm bài làm dựa trên đáp án đúng.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* THÔNG TIN NỀN TẢNG (GIỮ NGUYÊN) */}
        <Card className="lg:col-span-2 border-none shadow-md bg-white">
          <CardHeader>
            <div className="flex items-center gap-2 text-stone-800 font-bold">
              <Globe size={20} />
              <CardTitle>Thông tin thương hiệu</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-600">Tên hiển thị Website</label>
              <Input 
                value={config.siteName} 
                onChange={(e) => setConfig({...config, siteName: e.target.value})}
                className="focus-visible:ring-amber-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-600">Database Engine</label>
              <div className="flex items-center px-3 h-10 w-full rounded-md border border-stone-200 bg-stone-50 text-sm text-stone-500 cursor-not-allowed select-none">
                MySQL 8.0 (Localhost)
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BẢO MẬT (GIỮ NGUYÊN) */}
        <Card className="border-none shadow-md bg-white">
          <CardHeader>
            <div className="flex items-center gap-2 text-blue-600 font-bold">
              <ShieldCheck size={20} />
              <CardTitle>Bảo mật</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">SSL Certificate</span>
                  <span className="text-[10px] text-blue-600">Secure Context: TRUE</span>
                </div>
                <Badge className="bg-blue-600 hover:bg-blue-700 shadow-sm">Active</Badge>
             </div>
             <p className="text-[11px] text-stone-400 italic text-center px-2">
               * Config được bảo vệ bởi Server Actions.
             </p>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}