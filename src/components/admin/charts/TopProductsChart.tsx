"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function TopProductsChart({ data }: { data: { name: string; quantity: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E4DCC8" horizontal={false} />
        <XAxis type="number" tick={{ fill: "#7A756C", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: "#1E2A4A", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={140}
        />
        <Tooltip
          formatter={(value) => [Number(value), "Units sold"]}
          contentStyle={{ borderColor: "#E4DCC8", borderRadius: 8, fontSize: 13 }}
        />
        <Bar dataKey="quantity" fill="#8A9A87" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
