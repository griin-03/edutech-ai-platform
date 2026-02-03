"use client";

import { useEffect, useState } from "react";
import { getDeepTeacherAnalytics } from "./actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  BarChart
} from "recharts";
import { Loader2, TrendingUp, AlertCircle, Target } from "lucide-react";

const formatVND = (price: number) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

// Bảng màu đẹp cho biểu đồ tròn
const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#6366f1'];

export default function DeepAnalyticsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDeepTeacherAnalytics().then(res => {
      if (res) setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin h-10 w-10 text-violet-600" /></div>;

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen animate-in fade-in duration-500">
      
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-900">Phân tích Hiệu quả Đào tạo</h1>
        <p className="text-slate-500">Đánh giá chất lượng khóa học dựa trên doanh thu, phản hồi và kết quả thi.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. BIỂU ĐỒ TRÒN: CẤU TRÚC DOANH THU (KHÓA NÀO LÀ "CASH COW"?) */}
        <Card className="shadow-md border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <TrendingUp className="w-5 h-5 text-green-500" /> Tỷ trọng Doanh thu
            </CardTitle>
            <CardDescription>Khóa học nào đang đóng góp nhiều nhất vào thu nhập của bạn?</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {data.some(d => d.revenue > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%" cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="revenue"
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                      const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                      return percent > 0.05 ? (
                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      ) : null;
                    }}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatVND(value)} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-slate-400">Chưa có doanh thu</div>
            )}
          </CardContent>
        </Card>

        {/* 2. BIỂU ĐỒ PHA TRỘN: SỐ LƯỢNG BÁN vs. CHẤT LƯỢNG (RATING) */}
        <Card className="shadow-md border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <AlertCircle className="w-5 h-5 text-orange-500" /> Tương quan: Bán hàng & Chất lượng
            </CardTitle>
            <CardDescription>
                <span className="text-violet-600 font-bold">Cột tím:</span> Số lượng bán | <span className="text-orange-500 font-bold">Đường cam:</span> Điểm đánh giá (Sao)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
             {data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid stroke="#f5f5f5" />
                    <XAxis dataKey="name" scale="band" fontSize={10} interval={0} angle={-15} textAnchor="end" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8b5cf6" label={{ value: 'Lượt bán', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#f97316" domain={[0, 5]} label={{ value: 'Sao', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="sales" name="Lượt bán" barSize={30} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="rating" name="Đánh giá (Sao)" stroke="#f97316" strokeWidth={3} dot={{r: 4}} />
                  </ComposedChart>
                </ResponsiveContainer>
             ) : (
                <div className="h-full flex items-center justify-center text-slate-400">Chưa có dữ liệu</div>
             )}
          </CardContent>
        </Card>

        {/* 3. BIỂU ĐỒ CỘT NGANG: ĐIỂM THI TRUNG BÌNH (HIỆU QUẢ HỌC TẬP) */}
        <Card className="shadow-md border-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <Target className="w-5 h-5 text-blue-500" /> Hiệu quả Đào tạo (Điểm thi trung bình)
            </CardTitle>
            <CardDescription>Mức độ hiểu bài của học viên qua các bài kiểm tra.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {data.some(d => d.score > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={150} fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" name="Điểm trung bình (Thang 100)" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={25} label={{ position: 'right', fill: '#666' }}>
                     {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.score >= 80 ? '#10b981' : entry.score >= 50 ? '#f59e0b' : '#ef4444'} />
                     ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-400 border-2 border-dashed rounded-lg">
                    Chưa có dữ liệu điểm thi (Học viên chưa làm bài Test nào)
                </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}