"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGetRecords, ApiRecord } from "../../lib/api";
import { getMonthLabel } from "../../lib/data";

export default function UserSubscriptionsPage() {
  const [records, setRecords] = useState<ApiRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetRecords()
      .then(setRecords)
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...records].sort((a, b) => b.month.localeCompare(a.month));

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-2">Subscriptions</h1>
      <p className="text-text-muted text-sm mb-6">
        Monthly bills with status and payment details.
      </p>

      {loading ? (
        <p className="text-text-muted">Loading...</p>
      ) : (
        <div className="bg-bg-card border border-border-default rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default bg-bg-glass">
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Month</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Payment mode</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Payment date</th>
                  <th className="text-right py-3 px-4 font-medium text-text-secondary">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.id} className="border-b border-border-default hover:bg-bg-glass/50">
                    <td className="py-3 px-4 text-text-primary">{getMonthLabel(r.month)}</td>
                    <td className="py-3 px-4 text-text-primary">₹{Number(r.amount).toLocaleString("en-IN")}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          r.status === "paid" ? "bg-success-bg text-success" : "bg-warning-bg text-warning"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text-secondary">{r.payment_mode || "—"}</td>
                    <td className="py-3 px-4 text-text-secondary">
                      {r.payment_date ? new Date(r.payment_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/subscriptions/${r.month}`}
                        className="text-accent-primary hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sorted.length === 0 && (
            <p className="py-8 text-center text-text-muted text-sm">No subscription records.</p>
          )}
        </div>
      )}
    </div>
  );
}
