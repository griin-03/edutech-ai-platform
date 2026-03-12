"use client";

import React, { useEffect, useState } from "react"; // THÊM React vào import
import { getTeacherStudents } from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, Search, Mail, MoreHorizontal, 
  Trophy, AlertTriangle, Gem, UserX, Download,
  BookOpen, ChevronDown, ChevronUp, Eye
} from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Format tiền tệ
const formatVND = (price: number) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

// Format ngày tháng
const formatDate = (date: string | null) => {
  if (!date) return "Chưa có";
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function StudentManagementPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await getTeacherStudents();
      setStudents(data);
    } catch (error) {
      toast.error("Không thể tải danh sách học viên");
    } finally {
      setLoading(false);
    }
  };

  // Logic lọc tìm kiếm
  const filteredData = students.filter(s => 
    s.name?.toLowerCase().includes(filter.toLowerCase()) || 
    s.email?.toLowerCase().includes(filter.toLowerCase())
  );

  // Toggle mở rộng dòng
  const toggleRow = (studentId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId);
    } else {
      newExpanded.add(studentId);
    }
    setExpandedRows(newExpanded);
  };

  // Logic hiển thị Badge trạng thái
  const renderBadge = (status: string) => {
    switch (status) {
      case "VIP":
        return <Badge className="bg-purple-500 hover:bg-purple-600"><Gem className="w-3 h-3 mr-1" /> VIP</Badge>;
      case "CHEATER":
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" /> Gian lận</Badge>;
      case "TOP_TIER":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600"><Trophy className="w-3 h-3 mr-1" /> Xuất sắc</Badge>;
      case "AT_RISK":
        return <Badge variant="outline" className="text-orange-500 border-orange-200 bg-orange-50">Cần hỗ trợ</Badge>;
      case "DOWNLOADER":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700"><Download className="w-3 h-3 mr-1" /> Chỉ tải</Badge>;
      default:
        return <Badge variant="secondary" className="text-slate-500">Học viên</Badge>;
    }
  };

  const handleSendMail = (email: string) => {
    window.location.href = `mailto:${email}?subject=Thông báo từ Giảng viên`;
    toast.success(`Đang mở trình soạn thảo mail gửi tới: ${email}`);
  };

  const handleViewDetail = (student: any) => {
    setSelectedStudent(student);
    setShowDetailDialog(true);
  };

  // Thống kê KPI
  const stats = {
    total: students.length,
    vip: students.filter(s => s.status === 'VIP').length,
    cheater: students.filter(s => s.status === 'CHEATER').length,
    topTier: students.filter(s => s.status === 'TOP_TIER').length,
    atRisk: students.filter(s => s.status === 'AT_RISK').length,
    downloader: students.filter(s => s.status === 'DOWNLOADER').length,
    totalRevenue: students.reduce((sum, s) => sum + s.totalSpent, 0)
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen animate-in fade-in duration-500">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">Quản lý Học viên</h1>
           <p className="text-slate-500">Theo dõi tiến độ, hành vi và xếp hạng học viên.</p>
        </div>
        <Button 
          onClick={loadStudents} 
          variant="outline" 
          className="gap-2"
          type="button"
        >
          <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* 2. KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-sm border-l-4 border-l-blue-600">
           <CardContent className="p-6">
              <div className="text-sm text-slate-500 font-medium">Tổng học viên</div>
              <div className="text-3xl font-bold text-slate-800 mt-2">{stats.total}</div>
              <div className="text-xs text-slate-400 mt-1">Đã tương tác với khóa học</div>
           </CardContent>
        </Card>
        
        <Card className="shadow-sm border-l-4 border-l-purple-500">
           <CardContent className="p-6">
              <div className="text-sm text-slate-500 font-medium">VIP (Chi tiêu cao)</div>
              <div className="text-3xl font-bold text-purple-600 mt-2">{stats.vip}</div>
              <div className="text-xs text-slate-400 mt-1">{formatVND(stats.totalRevenue)} tổng doanh thu</div>
           </CardContent>
        </Card>
        
        <Card className="shadow-sm border-l-4 border-l-emerald-500">
           <CardContent className="p-6">
              <div className="text-sm text-slate-500 font-medium">Học viên xuất sắc</div>
              <div className="text-3xl font-bold text-emerald-600 mt-2">{stats.topTier}</div>
              <div className="text-xs text-slate-400 mt-1">Điểm trung bình ≥ 9</div>
           </CardContent>
        </Card>
        
        <Card className="shadow-sm border-l-4 border-l-red-500">
           <CardContent className="p-6">
              <div className="text-sm text-slate-500 font-medium">Cảnh báo gian lận</div>
              <div className="text-3xl font-bold text-red-600 mt-2">{stats.cheater}</div>
              <div className="text-xs text-slate-400 mt-1">{stats.atRisk} cần hỗ trợ</div>
           </CardContent>
        </Card>
      </div>

      {/* 3. DATA TABLE */}
      <Card className="border-none shadow-md overflow-hidden">
        <div className="p-4 border-b bg-white flex items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Tìm kiếm theo tên, email..." 
              className="pl-9"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="text-sm text-slate-500">
            Hiển thị {filteredData.length}/{students.length} học viên
          </div>
        </div>

        <div className="p-0">
           {loading ? (
             <div className="flex justify-center p-12">
               <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
             </div>
           ) : (
             <Table>
               <TableHeader className="bg-slate-50">
                 <TableRow>
                   <TableHead className="w-8"></TableHead>
                   <TableHead>Thông tin Học viên</TableHead>
                   <TableHead>Phân loại</TableHead>
                   <TableHead>Khóa học</TableHead>
                   <TableHead>Điểm TB</TableHead>
                   <TableHead>Vi phạm</TableHead>
                   <TableHead>Đã chi</TableHead>
                   <TableHead>Gần nhất</TableHead>
                   <TableHead className="text-right">Tác vụ</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10 text-slate-500">
                        Không tìm thấy học viên nào.
                      </TableCell>
                    </TableRow>
                 ) : filteredData.map((s) => (
                   <React.Fragment key={s.id}>
                    <TableRow className="hover:bg-slate-50/50 cursor-pointer" onClick={() => toggleRow(s.id)}>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          type="button"
                        >
                          {expandedRows.has(s.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={s.avatar} />
                            <AvatarFallback>{s.name?.[0] || '?'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-slate-800">{s.name}</div>
                            <div className="text-xs text-slate-500">{s.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{renderBadge(s.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-medium">{s.coursesCount}</span> khóa
                        </div>
                        <div className="text-xs text-slate-400">
                          Mua: {s.totalPurchases} | Tải: {s.totalSaved}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${
                          s.avgScore >= 8 ? 'text-emerald-600' : 
                          s.avgScore >= 5 ? 'text-blue-600' : 
                          s.avgScore > 0 ? 'text-orange-500' : 'text-slate-400'
                        }`}>
                          {s.avgScore > 0 ? s.avgScore.toFixed(1) : '--'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {s.totalViolations > 0 ? (
                          <span className="text-red-600 font-bold flex items-center gap-1">
                            {s.totalViolations} <AlertTriangle className="w-3 h-3" />
                          </span>
                        ) : <span className="text-slate-400">0</span>}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {formatVND(s.totalSpent)}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div className="font-medium">{s.latestCourse}</div>
                          <div className="text-slate-400">{formatDate(s.latestActivity)}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              type="button"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => handleViewDetail(s)}>
                              <Eye className="w-4 h-4 mr-2" /> Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleSendMail(s.email)}>
                              <Mail className="w-4 h-4 mr-2" /> Gửi Email
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <UserX className="w-4 h-4 mr-2" /> Báo cáo Admin
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    
                    {/* Hàng mở rộng - Chi tiết theo khóa học */}
                    {expandedRows.has(s.id) && (
                      <TableRow className="bg-slate-50/50">
                        <TableCell colSpan={9} className="p-4">
                          <div className="space-y-4">
                            <h4 className="font-semibold text-sm">Chi tiết tương tác theo khóa học:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {s.courseStats?.map((stat: any, idx: number) => (
                                <Card key={idx} className="p-3 text-sm">
                                  <div className="font-medium text-slate-800 mb-2">{stat.courseTitle}</div>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <span className="text-slate-500">Mua:</span>{' '}
                                      <span className={stat.purchased ? 'text-green-600 font-bold' : 'text-slate-400'}>
                                        {stat.purchased ? '✅' : '❌'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500">Tải:</span>{' '}
                                      <span className={stat.saved ? 'text-blue-600 font-bold' : 'text-slate-400'}>
                                        {stat.saved ? '✅' : '❌'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500">Đã thi:</span>{' '}
                                      <span className="font-medium">{stat.examCount} lần</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500">Điểm cao:</span>{' '}
                                      <span className="font-medium text-emerald-600">
                                        {stat.bestScore?.toFixed(1) || '--'}
                                      </span>
                                    </div>
                                    {stat.latestExamDate && (
                                      <div className="col-span-2 text-slate-400">
                                        Thi gần nhất: {formatDate(stat.latestExamDate)}
                                      </div>
                                    )}
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                   </React.Fragment>
                 ))}
               </TableBody>
             </Table>
           )}
        </div>
      </Card>

      {/* Dialog chi tiết học viên */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết học viên</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về quá trình học tập
            </DialogDescription>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-6 py-4">
              {/* Thông tin cơ bản */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedStudent.avatar} />
                  <AvatarFallback>{selectedStudent.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedStudent.name}</h3>
                  <p className="text-slate-500">{selectedStudent.email}</p>
                  <p className="text-sm text-slate-400">Tham gia: {formatDate(selectedStudent.joinedAt)}</p>
                </div>
                <div className="ml-auto">
                  {renderBadge(selectedStudent.status)}
                </div>
              </div>

              {/* Thống kê tổng quan */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold">{selectedStudent.totalExams}</div>
                  <div className="text-xs text-slate-500">Bài đã thi</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600">{selectedStudent.avgScore?.toFixed(1)}</div>
                  <div className="text-xs text-slate-500">Điểm TB</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{formatVND(selectedStudent.totalSpent)}</div>
                  <div className="text-xs text-slate-500">Đã chi</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{selectedStudent.totalViolations}</div>
                  <div className="text-xs text-slate-500">Vi phạm</div>
                </Card>
              </div>

              {/* Chi tiết các khóa học */}
              <h4 className="font-bold mt-6">Chi tiết từng khóa học:</h4>
              <div className="space-y-3">
                {selectedStudent.courseStats?.map((stat: any, idx: number) => (
                  <Card key={idx} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-semibold">{stat.courseTitle}</h5>
                        <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                          <div>
                            <span className="text-slate-500">Đã mua:</span>{' '}
                            {stat.purchased ? '✅' : '❌'}
                          </div>
                          <div>
                            <span className="text-slate-500">Đã tải:</span>{' '}
                            {stat.saved ? '✅' : '❌'}
                          </div>
                          <div>
                            <span className="text-slate-500">Đã thi:</span>{' '}
                            {stat.examCount} lần
                          </div>
                          <div>
                            <span className="text-slate-500">Điểm cao nhất:</span>{' '}
                            <span className="font-bold text-emerald-600">
                              {stat.bestScore?.toFixed(1) || '--'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Điểm gần nhất:</span>{' '}
                            <span className="font-medium">
                              {stat.latestScore?.toFixed(1) || '--'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Thi gần nhất:</span>{' '}
                            <span className="text-xs">
                              {formatDate(stat.latestExamDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}