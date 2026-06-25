"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend,
  Cell,
  PieChart,
  Pie,
} from "recharts";

// ── Sepia palette ──────────────────────────────────────────────────────────
const SEPIA = ["#3D1F00", "#6B3A0F", "#9C5A1D", "#C4783A", "#E8B98A", "#D4A574", "#B8860B", "#8B6914"];
const KATANYU_COLOR = "#6B3A0F";
const STACARE_COLOR = "#C4783A";

// ── Shared tooltip style ───────────────────────────────────────────────────
const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#fff",
    border: "1px solid #E8D5BF",
    borderRadius: "8px",
    fontSize: "12px",
    boxShadow: "0 2px 8px rgba(61,31,0,0.08)",
  },
  labelStyle: { color: "#3D1F00", fontWeight: 600 },
};

// ── Types ──────────────────────────────────────────────────────────────────
export type DeptData = { dept: string; label: string; count: number; pct: number };
export type GenData = { gen: number; label: string; count: number };
export type AgeData = { range: string; count: number };
export type ActivityData = { title: string; count: number };
export type MonthlyDonationData = { month: string; KATANYU: number; STACARE: number };
export type GrowthData = { month: string; total: number };

// ── 1. Department horizontal bar ───────────────────────────────────────────
export function DeptBarChart({ data }: { data: DeptData[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 44)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 60, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0E6D8" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: "#9C5A1D" }} />
        <YAxis
          type="category"
          dataKey="label"
          width={140}
          tick={{ fontSize: 12, fill: "#3D1F00" }}
        />
        <Tooltip
          {...tooltipStyle}
          formatter={(value, _name, props) => [
            `${value as number} คน (${(props as { payload: DeptData }).payload.pct}%)`,
            "จำนวน",
          ]}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
          {data.map((_, i) => (
            <Cell key={i} fill={SEPIA[i % SEPIA.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── 2. Generation vertical bar ─────────────────────────────────────────────
export function GenerationBarChart({ data }: { data: GenData[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 0, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0E6D8" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "#9C5A1D" }}
          interval={data.length > 20 ? Math.floor(data.length / 20) : 0}
        />
        <YAxis tick={{ fontSize: 11, fill: "#9C5A1D" }} allowDecimals={false} />
        <Tooltip
          {...tooltipStyle}
          formatter={(value) => [`${value as number} คน`, "จำนวนสมาชิก"]}
        />
        <Bar dataKey="count" fill="#9C5A1D" radius={[3, 3, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── 3. Age range donut ─────────────────────────────────────────────────────
const AGE_COLORS = ["#3D1F00", "#6B3A0F", "#9C5A1D", "#C4783A", "#E8B98A"];

type CustomLabelProps = {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
};

function AgeLabel({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 }: CustomLabelProps) {
  if (percent < 0.04) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function AgeRangeChart({ data }: { data: AgeData[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          dataKey="count"
          nameKey="range"
          labelLine={false}
          label={AgeLabel}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={AGE_COLORS[i % AGE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          {...tooltipStyle}
          formatter={(value, name) => [`${value as number} คน`, name as string]}
        />
        <Legend
          formatter={(value) => <span style={{ fontSize: 12, color: "#3D1F00" }}>{value}</span>}
          iconSize={10}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── 4. Top activities bar ──────────────────────────────────────────────────
export function TopActivitiesChart({ data }: { data: ActivityData[] }) {
  const truncated = data.map((d) => ({
    ...d,
    shortTitle: d.title.length > 20 ? d.title.slice(0, 19) + "…" : d.title,
  }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={truncated} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0E6D8" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: "#9C5A1D" }} allowDecimals={false} />
        <YAxis type="category" dataKey="shortTitle" width={150} tick={{ fontSize: 11, fill: "#3D1F00" }} />
        <Tooltip
          {...tooltipStyle}
          formatter={(value) => [`${value as number} คน`, "ผู้จอง"]}
          labelFormatter={(_label, payload) => payload?.[0]?.payload?.title ?? _label}
        />
        <Bar dataKey="count" fill="#6B3A0F" radius={[0, 4, 4, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── 5. Monthly donation line chart ─────────────────────────────────────────
export function DonationMonthlyChart({ data }: { data: MonthlyDonationData[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0E6D8" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9C5A1D" }} />
        <YAxis tick={{ fontSize: 11, fill: "#9C5A1D" }} tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          {...tooltipStyle}
          formatter={(value, name) => [
            `฿${Number(value).toLocaleString("th-TH")}`,
            (name as string) === "KATANYU" ? "กตัญญูครูสถา" : "สถาอาทร",
          ]}
        />
        <Legend
          formatter={(value) => (
            <span style={{ fontSize: 12, color: "#3D1F00" }}>
              {value === "KATANYU" ? "กตัญญูครูสถา" : "สถาอาทร"}
            </span>
          )}
        />
        <Line type="monotone" dataKey="KATANYU" stroke={KATANYU_COLOR} strokeWidth={2.5} dot={{ r: 4, fill: KATANYU_COLOR }} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="STACARE" stroke={STACARE_COLOR} strokeWidth={2.5} dot={{ r: 4, fill: STACARE_COLOR }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── 6. Member cumulative growth area chart ─────────────────────────────────
export function MemberGrowthChart({ data }: { data: GrowthData[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="sepiaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#9C5A1D" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#9C5A1D" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0E6D8" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9C5A1D" }} />
        <YAxis tick={{ fontSize: 11, fill: "#9C5A1D" }} allowDecimals={false} />
        <Tooltip
          {...tooltipStyle}
          formatter={(value) => [`${value as number} คน`, "สมาชิกสะสม"]}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#9C5A1D"
          strokeWidth={2.5}
          fill="url(#sepiaGradient)"
          dot={false}
          activeDot={{ r: 5, fill: "#6B3A0F" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
