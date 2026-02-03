"use client";

import { useState, useEffect } from "react";
import { getUsers, createUser, updateUser, deleteUser } from "./actions"; // Import logic
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Trash2, Plus, Search, Loader2 } from "lucide-react";
import { toast } from "sonner"; // Hoặc alert thường nếu chưa cài sonner

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  
  // State cho Modal (Thêm/Sửa)
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load dữ liệu
  const loadUsers = async () => {
    setLoading(true);
    const data = await getUsers(search);
    setUsers(data);
    setLoading(false);
  };

  // Tự động load khi search thay đổi (Debounce nhẹ)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Xử lý Submit Form (Thêm hoặc Sửa)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let res;
    if (isEditMode && currentUser) {
      res = await updateUser(currentUser.id, formData);
    } else {
      res = await createUser(formData);
    }

    if (res.success) {
      toast.success(res.message); // Nếu chưa cài toast thì dùng alert(res.message)
      setIsOpen(false);
      loadUsers(); // Refresh lại bảng
    } else {
      toast.error(res.message); // alert(res.message)
    }
  };

  // Xử lý Xóa
  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc muốn xóa user này không?")) {
      const res = await deleteUser(id);
      if (res.success) {
        toast.success(res.message);
        loadUsers();
      } else {
        toast.error(res.message);
      }
    }
  };

  // Mở Modal để Thêm mới
  const openCreateModal = () => {
    setIsEditMode(false);
    setCurrentUser(null);
    setIsOpen(true);
  };

  // Mở Modal để Sửa
  const openEditModal = (user: any) => {
    setIsEditMode(true);
    setCurrentUser(user);
    setIsOpen(true);
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">Quản lý Người dùng</h1>
        <Button onClick={openCreateModal} className="bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Thêm mới
        </Button>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="flex items-center space-x-2 bg-white dark:bg-stone-900 p-2 rounded-xl border shadow-sm max-w-md">
        <Search className="text-stone-400 ml-2" />
        <Input 
          placeholder="Tìm theo tên hoặc email..." 
          className="border-none focus-visible:ring-0"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Bảng Dữ liệu */}
      <div className="rounded-xl border bg-white dark:bg-stone-900 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-stone-50 dark:bg-stone-800">
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex justify-center"><Loader2 className="animate-spin text-amber-600"/></div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
               <TableRow><TableCell colSpan={4} className="text-center py-10 text-stone-500">Không tìm thấy dữ liệu.</TableCell></TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-amber-100 text-amber-700 font-bold">{user.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-stone-500">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? "destructive" : user.role === 'teacher' ? "default" : "secondary"} className="uppercase text-[10px]">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-stone-500 text-sm">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(user)}>
                        <Pencil className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* MODAL THÊM / SỬA USER */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Chỉnh sửa User" : "Tạo User mới"}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">Họ và tên</label>
              <Input name="name" defaultValue={currentUser?.name} required placeholder="Nguyễn Văn A" />
            </div>
            
            {/* Email và Pass chỉ hiện khi Tạo mới (Để đơn giản hóa việc sửa) */}
            {!isEditMode && (
              <>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input name="email" type="email" required placeholder="email@example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium">Mật khẩu</label>
                  <Input name="password" type="password" required placeholder="******" />
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Phân quyền</label>
              <Select name="role" defaultValue={currentUser?.role || "student"}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn quyền" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student (Học viên)</SelectItem>
                  <SelectItem value="teacher">Teacher (Giáo viên)</SelectItem>
                  <SelectItem value="admin">Admin (Quản trị)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white mt-4">
               {isEditMode ? "Lưu thay đổi" : "Tạo tài khoản"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}