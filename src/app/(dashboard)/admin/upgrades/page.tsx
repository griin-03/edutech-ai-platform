"use client";

import { useEffect, useState } from "react";
import { approveUpgrade, getPendingUpgrades, rejectUpgrade } from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Check, X, ShieldCheck, CreditCard, ExternalLink, UserCheck, SearchX } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function UpgradeRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    getPendingUpgrades().then((data) => {
      setRequests(data);
      setLoading(false);
    });
  };

  // Hàm xử lý chung (Sẽ cập nhật chi tiết ở file actions sau)
  const handleApprove = async (id: string, userId: number, planType: string) => {
    const isTeacher = planType === "TEACHER_APPROVAL";
    
    // Gọi action (Bạn sẽ gửi file actions cho tôi sửa sau)
    const res = await approveUpgrade(id, userId, planType); 
    
    if (res.success) {
      toast.success(isTeacher ? "Đã cấp quyền Giảng viên thành công!" : "Đã kích hoạt PRO thành công!");
      loadData(); 
    } else {
      toast.error("Có lỗi xảy ra khi duyệt.");
    }
  };

  const handleReject = async (id: string) => {
    await rejectUpgrade(id);
    toast.info("Đã từ chối yêu cầu.");
    loadData();
  };

  // --- PHÂN LOẠI DỮ LIỆU ---
  const teacherRequests = requests.filter(r => r.planType === "TEACHER_APPROVAL");
  const proRequests = requests.filter(r => r.planType !== "TEACHER_APPROVAL");

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50/50 dark:bg-[#0c0a09] min-h-screen">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <span className="p-2.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl text-indigo-600">
              <ShieldCheck size={28} />
            </span>
            Kiểm duyệt Hệ thống
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Quản lý và xét duyệt các yêu cầu cấp quyền Giảng viên hoặc Nâng cấp PRO thủ công.
        </p>
      </div>

      <Tabs defaultValue="teachers" className="space-y-6">
        <TabsList className="bg-white dark:bg-[#1c1917] p-1 border border-slate-200 dark:border-slate-800 rounded-xl h-auto">
          <TabsTrigger value="teachers" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-500/10 dark:data-[state=active]:text-indigo-400 rounded-lg px-6 py-2.5 font-bold text-base">
             <UserCheck size={18} className="mr-2" />
             Duyệt Giảng viên
             {teacherRequests.length > 0 && (
                <Badge className="ml-2 bg-rose-500 text-white border-0 px-1.5 min-w-[20px]">{teacherRequests.length}</Badge>
             )}
          </TabsTrigger>
          <TabsTrigger value="pro" className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 dark:data-[state=active]:bg-amber-500/10 dark:data-[state=active]:text-amber-400 rounded-lg px-6 py-2.5 font-bold text-base">
             <CreditCard size={18} className="mr-2" />
             Duyệt PRO (Dự phòng)
             {proRequests.length > 0 && (
                <Badge className="ml-2 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-0 px-1.5 min-w-[20px]">{proRequests.length}</Badge>
             )}
          </TabsTrigger>
        </TabsList>

        {/* ================= TAB 1: DUYỆT GIÁO VIÊN ================= */}
        <TabsContent value="teachers">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-[#1c1917] rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                  <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
              ) : teacherRequests.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center">
                      <div className="h-16 w-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4"><SearchX size={32} className="text-slate-400"/></div>
                      <p className="text-lg font-bold text-slate-600 dark:text-slate-300">Không có yêu cầu nào</p>
                      <p className="text-slate-400 text-sm">Hiện tại không có tài khoản nào chờ duyệt làm Giảng viên.</p>
                  </div>
              ) : (
                <div className="overflow-x-auto">
                    <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow className="border-slate-200 dark:border-slate-800">
                        <TableHead className="font-bold text-slate-600 dark:text-slate-300">Người đăng ký</TableHead>
                        <TableHead className="font-bold text-slate-600 dark:text-slate-300">Email liên hệ</TableHead>
                        <TableHead className="font-bold text-slate-600 dark:text-slate-300">Link xác minh (CV/Bằng cấp)</TableHead>
                        <TableHead className="text-right font-bold text-slate-600 dark:text-slate-300">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {teacherRequests.map((req) => {
                            // Cắt chuỗi để lấy link gốc từ nội dung API tạo ra
                            const proofLink = req.content?.split('Link hồ sơ/chứng minh: ')[1] || req.content;

                            return (
                                <TableRow key={req.id} className="border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/20">
                                    <TableCell className="font-bold text-slate-800 dark:text-slate-200">{req.user?.name || "Ẩn danh"}</TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400">{req.user?.email}</TableCell>
                                    <TableCell>
                                        {proofLink && proofLink.startsWith('http') ? (
                                            <a href={proofLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 hover:underline rounded-lg text-sm font-medium transition-colors">
                                                <ExternalLink size={14} /> Xem hồ sơ
                                            </a>
                                        ) : (
                                            <span className="text-slate-400 italic text-sm">{req.content || "Không có nội dung"}</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="flex justify-end gap-2">
                                        <Button size="sm" onClick={() => handleApprove(req.id, req.userId, req.planType)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-500/20">
                                            <Check className="w-4 h-4 mr-1.5" /> Cấp quyền
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => handleReject(req.id)} className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50 dark:hover:bg-rose-500/10">
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                    </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= TAB 2: DUYỆT PRO (DỰ PHÒNG) ================= */}
        <TabsContent value="pro">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-[#1c1917] rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                  <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-amber-500" size={32} /></div>
              ) : proRequests.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center">
                      <div className="h-16 w-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4"><CheckCircle2 size={32} className="text-emerald-500"/></div>
                      <p className="text-lg font-bold text-slate-600 dark:text-slate-300">Tất cả đã được tự động hóa</p>
                      <p className="text-slate-400 text-sm max-w-sm mx-auto mt-1">Không có đơn nâng cấp PRO nào bị kẹt. Hệ thống thanh toán đang hoạt động ổn định.</p>
                  </div>
              ) : (
                <div className="overflow-x-auto">
                    <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow className="border-slate-200 dark:border-slate-800">
                        <TableHead className="font-bold text-slate-600 dark:text-slate-300">Học viên</TableHead>
                        <TableHead className="font-bold text-slate-600 dark:text-slate-300">Email</TableHead>
                        <TableHead className="font-bold text-slate-600 dark:text-slate-300">Số tiền</TableHead>
                        <TableHead className="font-bold text-slate-600 dark:text-slate-300">Nội dung CK</TableHead>
                        <TableHead className="text-right font-bold text-slate-600 dark:text-slate-300">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {proRequests.map((req) => (
                        <TableRow key={req.id} className="border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/20">
                            <TableCell className="font-bold text-slate-800 dark:text-slate-200">{req.user?.name}</TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-400">{req.user?.email}</TableCell>
                            <TableCell>
                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-0 font-black px-2.5 py-1 text-sm">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(req.amount)}
                                </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm text-slate-500">{req.content || "---"}</TableCell>
                            <TableCell className="flex justify-end gap-2">
                            <Button size="sm" onClick={() => handleApprove(req.id, req.userId, req.planType)} className="bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md shadow-amber-500/20">
                                <Check className="w-4 h-4 mr-1.5" /> Kích hoạt
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleReject(req.id)} className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50 dark:hover:bg-rose-500/10">
                                <X className="w-4 h-4" />
                            </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}