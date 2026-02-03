"use client";

import { useEffect, useState } from "react";
import { getTeacherStudents } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, Search, Mail, MoreHorizontal, 
  Trophy, AlertTriangle, Gem, UserX 
} from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Format tiền tệ
const formatVND = (price: number) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function StudentManagementPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    getTeacherStudents().then((data) => {
      setStudents(data);
      setLoading(false);
    });
  }, []);

  // Logic lọc tìm kiếm
  const filteredData = students.filter(s => 
    s.name.toLowerCase().includes(filter.toLowerCase()) || 
    s.email.toLowerCase().includes(filter.toLowerCase())
  );

  // Logic hiển thị Badge trạng thái
  const renderBadge = (status: string) => {
    switch (status) {
      case "VIP":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Gem className="w-3 h-3 mr-1" /> VIP</Badge>;
      case "CHEATER":
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" /> Gian lận</Badge>;
      case "TOP_TIER":
        return <Badge className="bg-green-600 hover:bg-green-700"><Trophy className="w-3 h-3 mr-1" /> Xuất sắc</Badge>;
      case "AT_RISK":
        return <Badge variant="outline" className="text-red-500 border-red-200">Cần hỗ trợ</Badge>;
      default:
        return <Badge variant="secondary" className="text-slate-500">Học viên</Badge>;
    }
  };

  const handleSendMail = (email: string) => {
    // Demo logic gửi mail
    window.location.href = `mailto:${email}?subject=Thông báo từ Giảng viên`;
    toast.success(`Đang mở trình soạn thảo mail gửi tới: ${email}`);
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen animate-in fade-in duration-500">
      
      {/* 1. HEADER & KPI */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">Quản lý Học viên</h1>
           <p className="text-slate-500">Theo dõi tiến độ, hành vi và xếp hạng học viên.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-l-4 border-l-blue-600">
           <CardContent className="p-6">
              <div className="text-sm text-slate-500 font-medium">Tổng số học viên</div>
              <div className="text-3xl font-bold text-slate-800 mt-2">{students.length}</div>
           </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-yellow-500">
           <CardContent className="p-6">
              <div className="text-sm text-slate-500 font-medium">Học viên VIP (Chi tiêu cao)</div>
              <div className="text-3xl font-bold text-slate-800 mt-2">
                 {students.filter(s => s.status === 'VIP').length}
              </div>
           </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-red-500">
           <CardContent className="p-6">
              <div className="text-sm text-slate-500 font-medium">Cảnh báo Gian lận</div>
              <div className="text-3xl font-bold text-red-600 mt-2">
                 {students.filter(s => s.status === 'CHEATER').length}
              </div>
           </CardContent>
        </Card>
      </div>

      {/* 2. DATA TABLE */}
      <Card className="border-none shadow-md overflow-hidden">
        <div className="p-4 border-b bg-white flex items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Tìm kiếm theo tên, email..." 
              className="pl-9"
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="p-0">
           {loading ? (
             <div className="flex justify-center p-12"><Loader2 className="animate-spin text-violet-600" /></div>
           ) : (
             <Table>
               <TableHeader className="bg-slate-50">
                 <TableRow>
                   <TableHead>Thông tin Học viên</TableHead>
                   <TableHead>Phân loại</TableHead>
                   <TableHead>Khóa học</TableHead>
                   <TableHead>Học lực (Avg)</TableHead>
                   <TableHead>Vi phạm</TableHead>
                   <TableHead>Tổng chi tiêu</TableHead>
                   <TableHead className="text-right">Tác vụ</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {filteredData.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-10 text-slate-500">Không tìm thấy dữ liệu.</TableCell></TableRow>
                 ) : filteredData.map((s) => (
                   <TableRow key={s.id} className="hover:bg-slate-50/50">
                     <TableCell>
                       <div className="flex items-center gap-3">
                         <Avatar>
                           <AvatarImage src={s.avatar} />
                           <AvatarFallback>{s.name[0]}</AvatarFallback>
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
                       <div className="text-xs text-slate-400 truncate max-w-[150px]" title={s.latestCourse}>
                         Mới nhất: {s.latestCourse}
                       </div>
                     </TableCell>
                     <TableCell>
                       <span className={`font-bold ${s.avgScore >= 80 ? 'text-green-600' : s.avgScore < 50 ? 'text-red-500' : 'text-slate-700'}`}>
                         {s.avgScore > 0 ? s.avgScore : '--'}
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
                     <TableCell className="text-right">
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={() => handleSendMail(s.email)}>
                             <Mail className="w-4 h-4 mr-2" /> Gửi Email
                           </DropdownMenuItem>
                           <DropdownMenuItem className="text-red-600">
                             <UserX className="w-4 h-4 mr-2" /> Báo cáo Admin
                           </DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           )}
        </div>
      </Card>
    </div>
  );
}