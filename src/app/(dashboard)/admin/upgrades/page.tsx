"use client";

import { useEffect, useState } from "react";
import { approveUpgrade, getPendingUpgrades, rejectUpgrade, getServerTime } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, Check, X, ShieldCheck, CreditCard, ExternalLink, 
  UserCheck, SearchX, CheckCircle2, Clock, AlertCircle, 
  FileText, User, Mail, Calendar, DollarSign, Hash,
  Eye, Download, Printer, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Format tiền tệ
const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(amount);
};

// Format ngày tháng
const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function UpgradeRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    teacher: 0,
    pro: 0,
    totalRevenue: 0
  });
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    loadData();
    loadServerTime();
  }, []);

  const loadServerTime = async () => {
    try {
      const serverTime = await getServerTime();
      setCurrentTime(serverTime);
    } catch (error) {
      console.error("Lỗi lấy thời gian server:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getPendingUpgrades();
      // Đảm bảo data là mảng, nếu không thì gán mảng rỗng
      const requestsArray = Array.isArray(data) ? data : [];
      setRequests(requestsArray);
      
      // Tính toán thống kê từ dữ liệu server
      const teacherReqs = requestsArray.filter((r: any) => r?.planType === "TEACHER_APPROVAL");
      const proReqs = requestsArray.filter((r: any) => r?.planType && r.planType !== "TEACHER_APPROVAL");
      
      setStats({
        total: requestsArray.length,
        teacher: teacherReqs.length,
        pro: proReqs.length,
        totalRevenue: proReqs.reduce((sum: number, r: any) => sum + (r?.amount || 0), 0)
      });
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      toast.error("Không thể tải dữ liệu từ server");
      setRequests([]); // Đặt mảng rỗng khi có lỗi
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý duyệt
  const handleApprove = async (id: string, userId: number, planType: string) => {
    setProcessingId(id);
    const isTeacher = planType === "TEACHER_APPROVAL";
    
    try {
      const res = await approveUpgrade(id, userId, planType);
      
      if (res.success) {
        toast.success(
          <div className="flex flex-col gap-1">
            <span className="font-bold">✅ Thành công!</span>
            <span className="text-sm">{isTeacher ? "Đã cấp quyền Giảng viên" : "Đã kích hoạt PRO"}</span>
          </div>
        );
        loadData();
        if (selectedRequest?.id === id) setShowDetailDialog(false);
      } else {
        toast.error(
          <div className="flex flex-col gap-1">
            <span className="font-bold">❌ Lỗi!</span>
            <span className="text-sm">{res.message || "Có lỗi xảy ra khi duyệt."}</span>
          </div>
        );
      }
    } catch (error) {
      toast.error("Lỗi kết nối đến server");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await rejectUpgrade(id);
      
      if (res.success) {
        toast.info(
          <div className="flex flex-col gap-1">
            <span className="font-bold">⛔ Đã từ chối</span>
            <span className="text-sm">Yêu cầu đã bị từ chối</span>
          </div>
        );
        loadData();
        if (selectedRequest?.id === id) setShowDetailDialog(false);
      } else {
        toast.error(res.message || "Có lỗi xảy ra");
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewDetail = (req: any) => {
    setSelectedRequest(req);
    setShowDetailDialog(true);
  };

  // PHÂN LOẠI DỮ LIỆU - Kiểm tra requests có phải mảng không
  const safeRequests = Array.isArray(requests) ? requests : [];
  const teacherRequests = safeRequests.filter(r => r?.planType === "TEACHER_APPROVAL");
  const proRequests = safeRequests.filter(r => r?.planType && r.planType !== "TEACHER_APPROVAL");

  return (
    <div className="p-6 md:p-8 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0a0a0a] dark:to-[#1a1a1a] min-h-screen">
      
      {/* HEADER VỚI THỐNG KÊ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <span className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
              <ShieldCheck size={28} />
            </span>
            Kiểm duyệt Hệ thống
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Cập nhật lần cuối: {currentTime ? new Date(currentTime).toLocaleString('vi-VN') : 'Đang tải...'}
          </p>
        </div>
        
        <div className="flex gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => {
                    loadData();
                    loadServerTime();
                  }} 
                  variant="outline" 
                  className="gap-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Làm mới
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tải lại danh sách yêu cầu</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* THỐNG KÊ NHANH */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Tổng yêu cầu</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Duyệt Giảng viên</p>
                <p className="text-3xl font-bold mt-1">{stats.teacher}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Duyệt PRO</p>
                <p className="text-3xl font-bold mt-1">{stats.pro}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Tổng doanh thu (PRO)</p>
                <p className="text-xl font-bold mt-1">
                  {formatVND(stats.totalRevenue)}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="teachers" className="space-y-6">
        <TabsList className="bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl h-auto shadow-sm">
          <TabsTrigger 
            value="teachers" 
            className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-500/10 dark:data-[state=active]:text-indigo-400 rounded-xl px-6 py-3 font-bold text-base transition-all"
          >
            <UserCheck size={18} className="mr-2" />
            Duyệt Giảng viên
            {teacherRequests.length > 0 && (
              <Badge className="ml-2 bg-rose-500 text-white border-0 px-2 py-0.5 min-w-[24px] h-6">
                {teacherRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="pro" 
            className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 dark:data-[state=active]:bg-amber-500/10 dark:data-[state=active]:text-amber-400 rounded-xl px-6 py-3 font-bold text-base transition-all"
          >
            <CreditCard size={18} className="mr-2" />
            Duyệt PRO (Dự phòng)
            {proRequests.length > 0 && (
              <Badge className="ml-2 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-0 px-2 py-0.5 min-w-[24px] h-6">
                {proRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ================= TAB 1: DUYỆT GIÁO VIÊN ================= */}
        <TabsContent value="teachers">
          <Card className="border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 p-6">
              <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <UserCheck className="w-5 h-5" />
                Danh sách yêu cầu cấp quyền Giảng viên
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="py-32 flex flex-col items-center justify-center">
                  <Loader2 className="animate-spin text-indigo-500 w-12 h-12 mb-4" />
                  <p className="text-slate-500">Đang tải dữ liệu...</p>
                </div>
              ) : teacherRequests.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/50">
                  <div className="h-24 w-24 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border-4 border-emerald-100 dark:border-emerald-500/20">
                    <CheckCircle2 size={48} className="text-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">Tất cả đã được xử lý!</p>
                  <p className="text-slate-400 text-base max-w-md mx-auto">
                    Không có yêu cầu cấp quyền Giảng viên nào đang chờ xử lý. Hệ thống đang hoạt động bình thường.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                      <TableRow className="border-slate-200 dark:border-slate-700">
                        <TableHead className="font-bold text-slate-600 dark:text-slate-300 w-[250px]">
                          <User className="w-4 h-4 inline mr-1" /> Người đăng ký
                        </TableHead>
                        <TableHead className="font-bold text-slate-600 dark:text-slate-300">
                          <Mail className="w-4 h-4 inline mr-1" /> Email
                        </TableHead>
                        <TableHead className="font-bold text-slate-600 dark:text-slate-300">
                          <Calendar className="w-4 h-4 inline mr-1" /> Ngày gửi
                        </TableHead>
                        <TableHead className="font-bold text-slate-600 dark:text-slate-300">
                          <FileText className="w-4 h-4 inline mr-1" /> Hồ sơ xác minh
                        </TableHead>
                        <TableHead className="text-right font-bold text-slate-600 dark:text-slate-300 w-[200px]">
                          Hành động
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teacherRequests.map((req) => {
                        const proofLink = req?.content?.split('Link hồ sơ/chứng minh: ')[1] || req?.content;
                        
                        return (
                          <TableRow 
                            key={req?.id || Math.random()} 
                            className="border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                            onClick={() => handleViewDetail(req)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border-2 border-slate-200 dark:border-slate-700">
                                  <AvatarImage src={req?.user?.avatar} />
                                  <AvatarFallback className="bg-indigo-100 text-indigo-700">
                                    {req?.user?.name?.[0] || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-bold text-slate-800 dark:text-slate-200">
                                    {req?.user?.name || "Ẩn danh"}
                                  </div>
                                  <div className="text-xs text-slate-400">
                                    ID: {req?.userId || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-400">
                              {req?.user?.email || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800">
                                {req?.createdAt ? formatDate(req.createdAt) : 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {proofLink && proofLink.startsWith('http') ? (
                                <a 
                                  href={proofLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-all hover:scale-105"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink size={14} /> Xem hồ sơ
                                </a>
                              ) : (
                                <span className="text-slate-400 italic text-sm">
                                  {req?.content || "Không có nội dung"}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-end gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        size="sm" 
                                        onClick={() => handleApprove(req.id, req.userId, req.planType)}
                                        disabled={processingId === req.id}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/30 min-w-[80px]"
                                      >
                                        {processingId === req.id ? (
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <>
                                            <Check className="w-4 h-4 mr-1" /> Duyệt
                                          </>
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Phê duyệt và cấp quyền Giảng viên</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => handleReject(req.id)}
                                        disabled={processingId === req.id}
                                        className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-800 dark:hover:bg-rose-500/10"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Từ chối yêu cầu</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        size="sm" 
                                        variant="ghost"
                                        onClick={() => handleViewDetail(req)}
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Xem chi tiết</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
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

        {/* ================= TAB 2: DUYỆT PRO ================= */}
        <TabsContent value="pro">
          <Card className="border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-slate-800 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 p-6">
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <CreditCard className="w-5 h-5" />
                Danh sách yêu cầu nâng cấp PRO (Xử lý thủ công)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="py-32 flex flex-col items-center justify-center">
                  <Loader2 className="animate-spin text-amber-500 w-12 h-12 mb-4" />
                  <p className="text-slate-500">Đang tải dữ liệu...</p>
                </div>
              ) : proRequests.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/50">
                  <div className="h-24 w-24 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border-4 border-emerald-100 dark:border-emerald-500/20">
                    <CheckCircle2 size={48} className="text-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">Tự động hóa hoàn hảo!</p>
                  <p className="text-slate-400 text-base max-w-md mx-auto">
                    Không có yêu cầu nâng cấp PRO nào bị kẹt. Hệ thống thanh toán đang hoạt động ổn định.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                      <TableRow className="border-slate-200 dark:border-slate-700">
                        <TableHead className="font-bold text-slate-600 dark:text-slate-300 w-[250px]">
                          <User className="w-4 h-4 inline mr-1" /> Học viên
                        </TableHead>
                        <TableHead className="font-bold text-slate-600 dark:text-slate-300">
                          <Mail className="w-4 h-4 inline mr-1" /> Email
                        </TableHead>
                        <TableHead className="font-bold text-slate-600 dark:text-slate-300">
                          <Calendar className="w-4 h-4 inline mr-1" /> Ngày gửi
                        </TableHead>
                        <TableHead className="font-bold text-slate-600 dark:text-slate-300">
                          <DollarSign className="w-4 h-4 inline mr-1" /> Số tiền
                        </TableHead>
                        <TableHead className="font-bold text-slate-600 dark:text-slate-300">
                          <Hash className="w-4 h-4 inline mr-1" /> Nội dung CK
                        </TableHead>
                        <TableHead className="text-right font-bold text-slate-600 dark:text-slate-300 w-[200px]">
                          Hành động
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {proRequests.map((req) => (
                        <TableRow 
                          key={req?.id || Math.random()} 
                          className="border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                          onClick={() => handleViewDetail(req)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border-2 border-slate-200 dark:border-slate-700">
                                <AvatarImage src={req?.user?.avatar} />
                                <AvatarFallback className="bg-amber-100 text-amber-700">
                                  {req?.user?.name?.[0] || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-bold text-slate-800 dark:text-slate-200">
                                  {req?.user?.name || "Ẩn danh"}
                                </div>
                                <div className="text-xs text-slate-400">
                                  ID: {req?.userId || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400">
                            {req?.user?.email || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800">
                              {req?.createdAt ? formatDate(req.createdAt) : 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-0 font-black px-3 py-1.5 text-sm">
                              {req?.amount ? formatVND(req.amount) : formatVND(0)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                              {req?.content || "---"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleApprove(req.id, req.userId, req.planType)}
                                      disabled={processingId === req.id}
                                      className="bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md shadow-amber-500/30 min-w-[80px]"
                                    >
                                      {processingId === req.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <>
                                          <Check className="w-4 h-4 mr-1" /> Duyệt
                                        </>
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Kích hoạt gói PRO</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => handleReject(req.id)}
                                      disabled={processingId === req.id}
                                      className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-800 dark:hover:bg-rose-500/10"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Từ chối yêu cầu</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => handleViewDetail(req)}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Xem chi tiết</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
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

      {/* DIALOG CHI TIẾT YÊU CẦU */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-500" />
              Chi tiết yêu cầu
            </DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về yêu cầu nâng cấp
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6 py-4">
              {/* Thông tin người dùng */}
              <Card className="bg-slate-50 dark:bg-slate-800 border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-white shadow-lg">
                      <AvatarImage src={selectedRequest?.user?.avatar} />
                      <AvatarFallback className="text-xl">
                        {selectedRequest?.user?.name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                        {selectedRequest?.user?.name || "Ẩn danh"}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400">
                        {selectedRequest?.user?.email || 'N/A'}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <Badge variant="outline" className="bg-white dark:bg-slate-700">
                          ID: {selectedRequest?.userId || 'N/A'}
                        </Badge>
                        <Badge variant="outline" className="bg-white dark:bg-slate-700">
                          {selectedRequest?.planType === "TEACHER_APPROVAL" ? "Giảng viên" : "PRO"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Thông tin yêu cầu */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-500 uppercase mb-1">Ngày gửi</p>
                    <p className="font-bold">{selectedRequest?.createdAt ? formatDate(selectedRequest.createdAt) : 'N/A'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-500 uppercase mb-1">Trạng thái</p>
                    <Badge className="bg-amber-500 text-white">
                      <Clock className="w-3 h-3 mr-1" /> Chờ duyệt
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {selectedRequest?.planType !== "TEACHER_APPROVAL" && (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-500 uppercase mb-2">Thông tin thanh toán</p>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Số tiền:</span>
                      <Badge className="bg-emerald-500 text-white text-base px-3 py-1">
                        {selectedRequest?.amount ? formatVND(selectedRequest.amount) : formatVND(0)}
                      </Badge>
                    </div>
                    <Separator className="my-3" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase mb-1">Nội dung chuyển khoản</p>
                      <p className="font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded text-sm">
                        {selectedRequest?.content || "---"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedRequest?.planType === "TEACHER_APPROVAL" && (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-500 uppercase mb-2">Hồ sơ xác minh</p>
                    {selectedRequest?.content?.startsWith('http') ? (
                      <a 
                        href={selectedRequest.content} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Xem hồ sơ chi tiết
                      </a>
                    ) : (
                      <p className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded">
                        {selectedRequest?.content || "Không có nội dung"}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Đóng
            </Button>
            {selectedRequest && (
              <>
                <Button 
                  onClick={() => handleReject(selectedRequest.id)}
                  disabled={processingId === selectedRequest.id}
                  variant="outline"
                  className="border-rose-200 text-rose-600 hover:bg-rose-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Từ chối
                </Button>
                <Button 
                  onClick={() => handleApprove(selectedRequest.id, selectedRequest.userId, selectedRequest.planType)}
                  disabled={processingId === selectedRequest.id}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  {processingId === selectedRequest.id ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Phê duyệt
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}