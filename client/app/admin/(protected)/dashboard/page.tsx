"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGetFlats, apiGetRecords, apiGetReport, ApiReport, ApiFlat, ApiRecord} from "../../../lib/api";
import { getCurrentMonth, getMonthLabel } from "../../../lib/data";
import {ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,BarChart,Bar,PieChart,
  Pie,Cell,
} from "recharts";

type MonthSummary = ApiReport & { month: string };

const DEFAULT_REPORT: ApiReport = {
  totalFlats: 0,
  paidCount: 0,
  pendingCount: 0,
  totalCollected: 0,
  totalPending: 0,
  byMode: [],
};

const C = {
  accent: "var(--color-accent-primary)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  border: "var(--color-border-default)",
  textSecondary: "var(--color-text-secondary)",
  textMuted: "var(--color-text-muted)",
  textPrimary: "var(--color-text-primary)",
};

function getLastMonths(fromMonth: string, count: number): string[] {
  const [yRaw, mRaw] = fromMonth.split("-");
  const base = new Date(Number(yRaw), Number(mRaw) - 1, 1);
  const months: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setMonth(base.getMonth() - i);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

function getAxisMonthLabel(month: string): string {
  const [yRaw, mRaw] = month.split("-");
  const d = new Date(Number(yRaw), Number(mRaw) - 1, 1);
  return d.toLocaleString("default", { month: "short", year: "2-digit" });
}

function formatCurrency(n: number): string {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}

function AmountTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload;
  const monthLabel = row?.month ? getMonthLabel(row.month) : payload[0]?.payload?.label;
  return (
    <div className="bg-bg-card border border-border-default rounded-xl p-3 shadow-lg">
      <p className="text-xs text-text-muted mb-2">{monthLabel}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey ?? p.name} className="flex items-center justify-between gap-4">
          <span className="text-xs text-text-secondary">{p.name}</span>
          <span className="text-xs text-text-primary font-medium">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function CountTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload;
  return (
    <div className="bg-bg-card border border-border-default rounded-xl p-3 shadow-lg">
      <p className="text-xs text-text-muted mb-2">{row?.label ?? "Current month"}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey ?? p.name} className="flex items-center justify-between gap-4">
          <span className="text-xs text-text-secondary">{p.name}</span>
          <span className="text-xs text-text-primary font-medium">{Number(p.value || 0).toLocaleString("en-IN")}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const currentMonth = getCurrentMonth();
  const trendMonths = useMemo(() => getLastMonths(currentMonth, 6), [currentMonth]);

  const [flats, setFlats] = useState<ApiFlat[]>([]);
  const [recordsForCurrentMonth, setRecordsForCurrentMonth] = useState<ApiRecord[]>([]);
  const [monthSummaries, setMonthSummaries] = useState<MonthSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [flatList, recordList, reportList] = await Promise.all([
          apiGetFlats(),
          apiGetRecords({ month: currentMonth }),
          Promise.all(trendMonths.map((m) => apiGetReport({ month: m }).catch(() => null))),
        ]);

        if (cancelled) return;

        const byMonth: Record<string, ApiReport> = {};
        trendMonths.forEach((m, idx) => {
          const rep = reportList[idx];
          if (rep) byMonth[m] = rep;
        });

        setFlats(flatList);
        setRecordsForCurrentMonth(recordList);
        setMonthSummaries(
          trendMonths.map((m) => ({
            month: m,
            ...(byMonth[m] || DEFAULT_REPORT),
          })),
        );
      } catch {
        if (!cancelled) {
          setFlats([]);
          setRecordsForCurrentMonth([]);
          setMonthSummaries(trendMonths.map((m) => ({ month: m, ...DEFAULT_REPORT })));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [currentMonth, trendMonths]);

  const currentSummary =
    monthSummaries.find((m) => m.month === currentMonth) || {
      month: currentMonth,
      ...DEFAULT_REPORT,
    };

  const totalMembers = flats.length || currentSummary.totalFlats;
  const paidMembers = currentSummary.paidCount;
  const pendingAmount = currentSummary.totalPending;
  const totalRevenue = currentSummary.totalCollected;

  const flatMap = useMemo(
    () => Object.fromEntries(flats.map((f) => [f.id, f] as const)),
    [flats],
  );

  const pendingRecords = useMemo(
    () => recordsForCurrentMonth.filter((r) => r.status === "pending").sort((a, b) => b.amount - a.amount),
    [recordsForCurrentMonth],
  );

  const paidVsUnpaidPie = useMemo(
    () => [
      { name: "Paid", value: currentSummary.paidCount, fill: C.success, label: getMonthLabel(currentMonth) },
      { name: "Unpaid", value: currentSummary.pendingCount, fill: C.warning, label: getMonthLabel(currentMonth) },
    ],
    [currentSummary.paidCount, currentSummary.pendingCount, currentMonth],
  );

  const revenueTrendData = useMemo(
    () =>
      monthSummaries.map((m) => ({
        label: getAxisMonthLabel(m.month),
        month: m.month,
        value: m.totalCollected,
      })),
    [monthSummaries],
  );

  const pendingDuesTrendData = useMemo(
    () =>
      monthSummaries.map((m) => ({
        label: getAxisMonthLabel(m.month),
        month: m.month,
        value: m.totalPending,
      })),
    [monthSummaries],
  );

  const monthlyCollectionBarData = useMemo(
    () =>
      monthSummaries.map((m) => ({
        label: getAxisMonthLabel(m.month),
        month: m.month,
        paidAmount: m.totalCollected,
        pendingAmount: m.totalPending,
      })),
    [monthSummaries],
  );

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-text-muted">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto p-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Dashboard</h1>
      <p className="text-text-muted text-sm mb-8">Overview for {getMonthLabel(currentMonth)}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-bg-card border border-border-default rounded-xl p-5">
          <p className="text-text-muted text-sm font-medium mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-success">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-text-muted mt-1">Paid for this month</p>
        </div>

        <div className="bg-bg-card border border-border-default rounded-xl p-5">
          <p className="text-text-muted text-sm font-medium mb-1">Total Members</p>
          <p className="text-2xl font-bold text-text-primary">{totalMembers}</p>
          <p className="text-xs text-text-muted mt-1">Active flats</p>
        </div>

        <div className="bg-bg-card border border-border-default rounded-xl p-5">
          <p className="text-text-muted text-sm font-medium mb-1">Paid Members</p>
          <p className="text-2xl font-bold text-success">{paidMembers}</p>
          <p className="text-xs text-text-muted mt-1">Paid for this month</p>
        </div>

        <div className="bg-bg-card border border-border-default rounded-xl p-5">
          <p className="text-text-muted text-sm font-medium mb-1">Pending Amount</p>
          <p className="text-2xl font-bold text-warning">{formatCurrency(pendingAmount)}</p>
          <p className="text-xs text-text-muted mt-1">{currentSummary.pendingCount} pending flats</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="bg-bg-card border border-border-default rounded-xl p-5">
          <p className="text-text-muted text-sm font-medium mb-3">Revenue Trend (Line)</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrendData} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={C.border} strokeDasharray="4 4" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: C.textSecondary, fontSize: 12 }}
                  axisLine={{ stroke: C.border }}
                  tickLine={{ stroke: C.border }}
                />
                <YAxis
                  tick={{ fill: C.textSecondary, fontSize: 12 }}
                  axisLine={{ stroke: C.border }}
                  tickLine={{ stroke: C.border }}
                  tickFormatter={(v) => formatCurrency(Number(v))}
                />
                <Tooltip content={AmountTooltip} />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Revenue"
                  stroke={C.accent}
                  strokeWidth={3}
                  dot={{ r: 3, fill: C.accent, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-bg-card border border-border-default rounded-xl p-5">
          <p className="text-text-muted text-sm font-medium mb-3">Paid vs Unpaid (Pie)</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={CountTooltip} />
                <Pie
                  data={paidVsUnpaidPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="55%"
                  outerRadius="70%"
                  labelLine={false}
                  stroke={C.border}
                  strokeWidth={1}
                  isAnimationActive={false}
                  label={({ name, percent }: any) => `${name} ${Math.round((percent || 0) * 100) / 1}%`}
                >
                  {paidVsUnpaidPie.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="bg-bg-card border border-border-default rounded-xl p-5">
          <p className="text-text-muted text-sm font-medium mb-3">Monthly Collection (Bar)</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCollectionBarData} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={C.border} strokeDasharray="4 4" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: C.textSecondary, fontSize: 12 }}
                  axisLine={{ stroke: C.border }}
                  tickLine={{ stroke: C.border }}
                />
                <YAxis
                  tick={{ fill: C.textSecondary, fontSize: 12 }}
                  axisLine={{ stroke: C.border }}
                  tickLine={{ stroke: C.border }}
                  tickFormatter={(v) => formatCurrency(Number(v))}
                />
                <Tooltip content={AmountTooltip} />
                <Bar dataKey="paidAmount" name="Paid" fill={C.success} radius={[6, 6, 0, 0]} />
                <Bar dataKey="pendingAmount" name="Pending" fill={C.warning} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-bg-card border border-border-default rounded-xl p-5">
          <p className="text-text-muted text-sm font-medium mb-3">Pending Dues (Line)</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pendingDuesTrendData} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={C.border} strokeDasharray="4 4" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: C.textSecondary, fontSize: 12 }}
                  axisLine={{ stroke: C.border }}
                  tickLine={{ stroke: C.border }}
                />
                <YAxis
                  tick={{ fill: C.textSecondary, fontSize: 12 }}
                  axisLine={{ stroke: C.border }}
                  tickLine={{ stroke: C.border }}
                  tickFormatter={(v) => formatCurrency(Number(v))}
                />
                <Tooltip content={AmountTooltip} />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Pending"
                  stroke={C.warning}
                  strokeWidth={3}
                  dot={{ r: 3, fill: C.warning, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/admin/monthly-records"
          className="px-4 py-2 rounded-lg bg-accent-primary text-white text-sm font-medium hover:opacity-90"
        >
          View monthly records
        </Link>
        <Link
          href="/admin/reports"
          className="px-4 py-2 rounded-lg border border-border-default text-text-primary text-sm font-medium hover:bg-bg-glass"
        >
          Reports
        </Link>
      </div>

      <div className="bg-bg-card border border-border-default rounded-xl p-5">
        <p className="text-text-muted text-sm font-medium mb-3">Defaulters list</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default bg-bg-glass">
                <th className="text-left py-3 px-4 font-medium text-text-secondary">Flat</th>
                <th className="text-left py-3 px-4 font-medium text-text-secondary">Owner</th>
                <th className="text-left py-3 px-4 font-medium text-text-secondary">Pending Amount</th>
              </tr>
            </thead>
            <tbody>
              {pendingRecords.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-10 px-4 text-center text-text-muted text-sm">
                    No pending dues for {getMonthLabel(currentMonth)}.
                  </td>
                </tr>
              ) : (
                pendingRecords.map((rec) => {
                  const flat = flatMap[rec.flat_id];
                  return (
                    <tr key={rec.id} className="border-b border-border-default hover:bg-bg-glass/50">
                      <td className="py-3 px-4 text-text-primary">{flat?.flat_no ?? rec.flat_id}</td>
                      <td className="py-3 px-4 text-text-primary">{flat?.owner_name ?? "—"}</td>
                      <td className="py-3 px-4 text-text-primary">{formatCurrency(rec.amount)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
