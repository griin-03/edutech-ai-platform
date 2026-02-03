"use client";

import { useEffect, useState } from "react";
import { approveUpgrade, getPendingUpgrades, rejectUpgrade } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X } from "lucide-react";
import { toast } from "sonner"; // Hoặc library toast bạn dùng

export default function UpgradeRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    getPendingUpgrades().then((data) => {
      setRequests(data);
      setLoading(false);
    });
  };

  const handleApprove = async (id: string, userId: number) => {
    const res = await approveUpgrade(id, userId);
    if (res.success) {
      toast.success("Đã duyệt nâng cấp Pro thành công!");
      loadData(); // Load lại bảng
    } else {
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleReject = async (id: string) => {
    await rejectUpgrade(id);
    toast.info("Đã từ chối yêu cầu.");
    loadData();
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold">Duyệt Yêu cầu Nâng cấp (Pro)</h1>
      <Card>
        <CardHeader><CardTitle>Danh sách chờ duyệt ({requests.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Loader2 className="animate-spin" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Nội dung CK</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-slate-500">Không có yêu cầu nào.</TableCell></TableRow>
                ) : requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.user.name}</TableCell>
                    <TableCell>{req.user.email}</TableCell>
                    <TableCell className="text-green-600 font-bold">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(req.amount)}
                    </TableCell>
                    <TableCell>{req.content || "Không có nội dung"}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" onClick={() => handleApprove(req.id, req.userId)} className="bg-green-600 hover:bg-green-700">
                        <Check className="w-4 h-4 mr-1" /> Duyệt
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReject(req.id)}>
                        <X className="w-4 h-4 mr-1" /> Từ chối
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}