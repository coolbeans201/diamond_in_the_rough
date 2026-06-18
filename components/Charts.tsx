"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";

type TrajectoryPoint = {
  season: string;
  diamond: number;
  impact?: number;
  perception?: number;
};

export function DiamondTrajectory({ data }: { data: TrajectoryPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid stroke="#2a3142" strokeDasharray="3 3" />
        <XAxis dataKey="season" stroke="#71717a" fontSize={12} />
        <YAxis stroke="#71717a" fontSize={12} />
        <Tooltip
          contentStyle={{ background: "#161b26", border: "1px solid #2a3142" }}
          labelStyle={{ color: "#fafafa" }}
        />
        <Line type="monotone" dataKey="diamond" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} name="Diamond Score" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ImpactPerceptionChart({
  data,
}: {
  data: Array<{ season: string; impact: number; perception: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid stroke="#2a3142" strokeDasharray="3 3" />
        <XAxis dataKey="season" stroke="#71717a" fontSize={12} />
        <YAxis stroke="#71717a" fontSize={12} domain={[0, 100]} />
        <Tooltip
          contentStyle={{ background: "#161b26", border: "1px solid #2a3142" }}
        />
        <Legend />
        <Bar dataKey="impact" fill="#22c55e" name="Impact" />
        <Bar dataKey="perception" fill="#3b82f6" name="Perception" />
      </BarChart>
    </ResponsiveContainer>
  );
}
