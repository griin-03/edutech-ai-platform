"use client";

import { useEffect, useState } from "react";
import { getTransactions } from "./actions"; // Nhớ import đúng đường dẫn file action bạn vừa tạo
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Format tiền tệ
const formatVND = (price: number) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getTransactions().then((data) => {
      setTransactions(data);
      setLoading(false);
    });
  }, []);

  // Logic Search Client-side đơn giản
  const filteredData = transactions.filter(t => 
    t.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.course?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Lịch sử Giao dịch</h1>
          <p className="text-slate-500">Quản lý và tra soát tất cả đơn hàng trên hệ thống.</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" /> Xuất Excel
        </Button>
      </div>

      <Card className="shadow-md border-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách đơn hàng gần đây</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
              <Input 
                placeholder="Tìm theo tên, email, khóa học..." 
                className="pl-8"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Khóa học đã mua</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? filteredData.map((t) => (
                  <TableRow key={t.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={t.avatar} />
                          <AvatarFallback>{t.customer[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{t.customer}</span>
                          <span className="text-xs text-slate-500">{t.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-700">{t.course}</TableCell>
                    <TableCell className="font-bold text-slate-900">{formatVND(t.amount)}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{t.date}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                        Thành công
                      </Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      Không tìm thấy giao dịch nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}