"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function OrderTrendsChart({ data }: { data: { day: string; orders: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E4DCC8" vertical={false} />
        <XAxis dataKey="day" tick={{ fill: "#7A756C", fontSize: 12 }} axisLine={{ stroke: "#E4DCC8" }} tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fill: "#7A756C", fontSize: 12 }} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
        <Tooltip
          formatter={(value) => [Number(value), "Orders"]}
          contentStyle={{ borderColor: "#E4DCC8", borderRadius: 8, fontSize: 13 }}
        />
        <Line type="monotone" dataKey="orders" stroke="#1E2A4A" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
