"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  apiGetFlats,
  apiGetRecords,
  apiGetReport,
  ApiReport,
} from "../../../lib/api";
import { getCurrentMonth } from "../../../lib/data";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<{
    totalFlats: number;
    report: ApiReport | null;
    loading: boolean;
  }>({ totalFlats: 0, report: null, loading: true });

  const month = getCurrentMonth();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [flats, records, report] = await Promise.all([
          apiGetFlats(),
          apiGetRecords({ month }),
          apiGetReport({ month }).catch(() => null),
        ]);
        if (cancelled) return;
        setStats({
          totalFlats: flats.length,
          report: report || null,
          loading: false,
        });
      } catch {
        if (!cancelled) setStats((s) => ({ ...s, loading: false }));
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [month]);

  if (stats.loading) {
    return (
      <div className="p-8">
        <p className="text-text-muted">Loading dashboard...</p>
      </div>
    );
  }

  const r = stats.report;
  const totalCollected = r?.totalCollected ?? 0;
  const totalPending = r?.totalPending ?? 0;
  const paidCount = r?.paidCount ?? 0;
  const pendingCount = r?.pendingCount ?? 0;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        Dashboard
      </h1>
      <p className="text-text-muted text-sm mb-8">
        Overview for {new Date(month + "-01").toLocaleString("default", { month: "long", year: "numeric" })}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-bg-card border border-border-default rounded-xl p-5">
          <p className="text-text-muted text-sm font-medium mb-1">Total Flats</p>
          <p className="text-2xl font-bold text-text-primary">{stats.totalFlats}</p>
          <Link
            href="/admin/flats"
            className="text-xs text-accent-primary hover:underline mt-2 inline-block"
          >
            Manage flats →
          </Link>
        </div>
        <div className="bg-bg-card border border-border-default rounded-xl p-5">
          <p className="text-text-muted text-sm font-medium mb-1">Collected (this month)</p>
          <p className="text-2xl font-bold text-success">₹{totalCollected.toLocaleString("en-IN")}</p>
          <p className="text-xs text-text-muted mt-1">{paidCount} flats paid</p>
        </div>
        <div className="bg-bg-card border border-border-default rounded-xl p-5">
          <p className="text-text-muted text-sm font-medium mb-1">Pending (this month)</p>
          <p className="text-2xl font-bold text-warning">₹{totalPending.toLocaleString("en-IN")}</p>
          <p className="text-xs text-text-muted mt-1">{pendingCount} flats pending</p>
        </div>
        <div className="bg-bg-card border border-border-default rounded-xl p-5">
          <p className="text-text-muted text-sm font-medium mb-1">Payment modes</p>
          <div className="space-y-1 mt-1">
            {r?.byMode?.filter((m) => m.mode && Number(m.total) > 0).map((m) => (
              <p key={m.mode} className="text-sm text-text-secondary">
                {m.mode}: ₹{Number(m.total).toLocaleString("en-IN")}
              </p>
            )) || <p className="text-sm text-text-muted">No data</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="bg-bg-card border border-border-default rounded-xl p-5">
          <p className="text-text-muted text-sm font-medium mb-3">
            Paid vs Pending (count)
          </p>
          <div className="flex items-end gap-6 h-40">
            {[
              { label: "Paid", value: paidCount, color: "bg-success" },
              { label: "Pending", value: pendingCount, color: "bg-warning" },
            ].map((item) => {
              const max = Math.max(paidCount, pendingCount, 1);
              const h = Math.round((item.value / max) * 120) + 10;
              return (
                <div key={item.label} className="flex flex-col items-center gap-2">
                  <div className="text-xs text-text-muted">{item.value}</div>
                  <div
                    className={`w-16 rounded-lg ${item.color}`}
                    style={{ height: `${h}px`, opacity: 0.85 }}
                    title={`${item.label}: ${item.value}`}
                  />
                  <div className="text-xs text-text-secondary">{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-bg-card border border-border-default rounded-xl p-5">
          <p className="text-text-muted text-sm font-medium mb-3">
            Collection by payment mode
          </p>
          <div className="space-y-3">
            {(r?.byMode || []).length === 0 ? (
              <p className="text-sm text-text-muted">No data</p>
            ) : (
              (r?.byMode || [])
                .filter((m) => Number(m.total) > 0)
                .map((m) => {
                  const max = Math.max(
                    ...(r?.byMode || []).map((x) => Number(x.total) || 0),
                    1,
                  );
                  const pct = Math.round(((Number(m.total) || 0) / max) * 100);
                  return (
                    <div key={m.mode}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-text-secondary">{m.mode}</span>
                        <span className="text-text-primary">
                          ₹{Number(m.total).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="h-2 rounded bg-bg-glass border border-border-default overflow-hidden">
                        <div
                          className="h-full bg-accent-primary"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
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
    </div>
  );
}
