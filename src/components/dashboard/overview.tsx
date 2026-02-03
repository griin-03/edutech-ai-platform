"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

// Dữ liệu mẫu (Giả lập doanh thu/hoạt động theo tháng)
const data = [
  { name: "T1", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "T2", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "T3", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "T4", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "T5", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "T6", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "T7", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "T8", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "T9", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "T10", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "T11", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "T12", total: Math.floor(Math.random() * 5000) + 1000 },
];

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip 
            cursor={{fill: 'transparent'}}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-amber-600"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}