"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function CategoryPerformanceChart({ data }: { data: { name: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E4DCC8" horizontal={false} />
        <XAxis type="number" tick={{ fill: "#7A756C", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: "#1E2A4A", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={120}
        />
        <Tooltip
          formatter={(value) => [`₹${Number(value).toFixed(2)}`, "Revenue"]}
          contentStyle={{ borderColor: "#E4DCC8", borderRadius: 8, fontSize: 13 }}
        />
        <Bar dataKey="revenue" fill="#C79A5D" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
