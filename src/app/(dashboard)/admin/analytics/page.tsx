"use client";

import { useEffect, useState } from "react";
// Import hàm lấy dữ liệu thật từ server
import { getAdminAnalytics } from "./actions"; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// Import thư viện biểu đồ
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, CartesianGrid, PieChart, Pie, Cell, Legend
} from "recharts";
// Import icon
import { Loader2, DollarSign, Users, BookOpen, Star, TrendingUp, UserCheck } from "lucide-react";

// Hàm format tiền tệ (VND) cho đẹp
const formatVND = (price: number) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Gọi dữ liệu ngay khi vào trang
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAdminAnalytics();
        setData(res);
      } catch (error) {
        console.error("Lỗi tải trang phân tích:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Hiển thị loading xoay vòng khi đang lấy dữ liệu
  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 h-12 w-12" />
      </div>
    );
  }

  // Mảng màu cho biểu đồ tròn
  const PIE_COLORS = ['#3b82f6', '#a855f7', '#f59e0b', '#ef4444'];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Phân tích Hệ thống</h1>
          <p className="text-slate-500">Số liệu thời gian thực từ Database (Real-time Analytics).</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border text-sm font-medium text-slate-600">
          Cập nhật: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* 1. KPI CARDS - CÁC CON SỐ QUAN TRỌNG */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Doanh thu */}
        <Card className="border-l-4 border-l-blue-600 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Tổng Doanh Thu</CardTitle>
            <DollarSign className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{formatVND(data?.kpi.totalRevenue || 0)}</div>
            <p className="text-xs text-slate-500 mt-1">
              <span className="text-green-600 font-bold">+{formatVND(data?.kpi.monthlyRevenue || 0)}</span> tháng này
            </p>
          </CardContent>
        </Card>

        {/* Học viên */}
        <Card className="border-l-4 border-l-purple-600 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Tổng Học viên</CardTitle>
            <Users className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data?.kpi.totalStudents}</div>
            <p className="text-xs text-slate-500 mt-1">Tài khoản đang hoạt động</p>
          </CardContent>
        </Card>

        {/* Khóa học */}
        <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Tổng Khóa học</CardTitle>
            <BookOpen className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data?.kpi.totalCourses}</div>
            <p className="text-xs text-slate-500 mt-1">Khóa học đã xuất bản</p>
          </CardContent>
        </Card>

        {/* Đánh giá */}
        <Card className="border-l-4 border-l-rose-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Chất lượng Đào tạo</CardTitle>
            <Star className="h-5 w-5 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data?.kpi.avgRating} / 5.0</div>
            <p className="text-xs text-slate-500 mt-1">Dựa trên đánh giá học viên</p>
          </CardContent>
        </Card>
      </div>

      {/* 2. KHU VỰC BIỂU ĐỒ (CHARTS SECTION) */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        
        {/* BIỂU ĐỒ MIỀN: DOANH THU THEO NGÀY (CHIẾM 4 PHẦN) */}
        <Card className="lg:col-span-4 shadow-md border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Biểu đồ Tăng trưởng Doanh thu
            </CardTitle>
            <CardDescription>Theo dõi dòng tiền vào hệ thống trong 30 ngày qua.</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[350px] w-full">
              {data?.charts.revenue.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.charts.revenue} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`} />
                    <Tooltip 
                      formatter={(value: number) => [formatVND(value), "Doanh thu"]}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed m-4">
                  <TrendingUp className="h-10 w-10 mb-2 opacity-20" />
                  <p>Chưa có giao dịch nào trong 30 ngày qua</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* BIỂU ĐỒ TRÒN & TOP KHÓA HỌC (CHIẾM 3 PHẦN) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Top Khóa học */}
          <Card className="shadow-md border-none">
            <CardHeader>
              <CardTitle>Top Khóa học Bán chạy</CardTitle>
              <CardDescription>Các khóa học thu hút nhất.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                 {data?.charts.topCourses.length > 0 ? data.charts.topCourses.map((item: any, index: number) => (
                   <div key={index} className="flex items-center">
                     <div className="w-8 font-bold text-slate-400">#{index + 1}</div>
                     <div className="flex-1">
                       <div className="flex items-center justify-between mb-1">
                         <span className="text-sm font-medium text-slate-700 truncate max-w-[150px]" title={item.name}>{item.name}</span>
                         <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{item.sales} lượt mua</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                         <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                            style={{ width: `${(item.sales / data.charts.topCourses[0].sales) * 100}%` }} 
                         />
                       </div>
                     </div>
                   </div>
                 )) : (
                   <p className="text-center text-slate-400 text-sm py-8">Chưa có dữ liệu</p>
                 )}
               </div>
            </CardContent>
          </Card>

          {/* Phân bổ người dùng (Biểu đồ tròn nhỏ) */}
          <Card className="shadow-md border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Phân bổ Người dùng</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.charts.userDistribution}
                    cx="50%" cy="50%"
                    innerRadius={40} outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data?.charts.userDistribution?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}