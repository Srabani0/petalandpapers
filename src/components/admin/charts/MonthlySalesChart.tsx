"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function MonthlySalesChart({ data }: { data: { month: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E4DCC8" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: "#7A756C", fontSize: 12 }} axisLine={{ stroke: "#E4DCC8" }} tickLine={false} />
        <YAxis tick={{ fill: "#7A756C", fontSize: 12 }} axisLine={false} tickLine={false} width={48} />
        <Tooltip
          formatter={(value) => [`₹${Number(value).toFixed(2)}`, "Revenue"]}
          contentStyle={{ borderColor: "#E4DCC8", borderRadius: 8, fontSize: 13 }}
        />
        <Bar dataKey="revenue" fill="#A67C3D" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
