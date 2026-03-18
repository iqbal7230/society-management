"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiGetRecords, ApiRecord } from "../../../lib/api";
import { getMonthLabel } from "../../../lib/data";

export default function SubscriptionDetailPage() {
  const params = useParams();
  const month = typeof params.month === "string" ? params.month : "";
  const [record, setRecord] = useState<ApiRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!month) return;
    apiGetRecords({ month })
      .then((list) => setRecord(list[0] ?? null))
      .catch(() => setRecord(null))
      .finally(() => setLoading(false));
  }, [month]);

  if (!month) {
    return (
      <div className="p-4">
        <p className="text-text-muted">Invalid month.</p>
        <Link href="/subscriptions" className="text-accent-primary mt-2 inline-block">← Back to subscriptions</Link>
      </div>
    );
  }

  if (loading) return <div className="p-4"><p className="text-text-muted">Loading...</p></div>;
  if (!record) {
    return (
      <div className="p-4">
        <p className="text-text-muted">No record found for this month.</p>
        <Link href="/subscriptions" className="text-accent-primary mt-2 inline-block">← Back to subscriptions</Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/subscriptions" className="text-sm text-accent-primary hover:underline mb-4 inline-block">
        ← Back to subscriptions
      </Link>
      <h1 className="text-2xl font-bold text-text-primary mb-2">
        {getMonthLabel(record.month)}
      </h1>
      <p className="text-text-muted text-sm mb-6">Subscription details</p>

      <div className="bg-bg-card border border-border-default rounded-xl p-6 max-w-lg">
        <dl className="space-y-4">
          <div>
            <dt className="text-xs font-medium text-text-muted uppercase tracking-wide">Amount</dt>
            <dd className="text-xl font-semibold text-text-primary mt-1">
              ₹{Number(record.amount).toLocaleString("en-IN")}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-text-muted uppercase tracking-wide">Status</dt>
            <dd className="mt-1">
              <span
                className={`inline-block px-2 py-0.5 rounded text-sm font-medium ${
                  record.status === "paid" ? "bg-success-bg text-success" : "bg-warning-bg text-warning"
                }`}
              >
                {record.status}
              </span>
            </dd>
          </div>
          {record.status === "paid" && (
            <>
              <div>
                <dt className="text-xs font-medium text-text-muted uppercase tracking-wide">Payment mode</dt>
                <dd className="text-text-primary mt-1">{record.payment_mode || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-muted uppercase tracking-wide">Payment date</dt>
                <dd className="text-text-primary mt-1">
                  {record.payment_date ? new Date(record.payment_date).toLocaleDateString() : "—"}
                </dd>
              </div>
            </>
          )}
        </dl>
        {record.status === "pending" && (
          <Link
            href="/pay-now"
            className="inline-block mt-6 px-4 py-2 rounded-lg bg-accent-primary text-white text-sm font-medium hover:opacity-90"
          >
            Pay now
          </Link>
        )}
      </div>
    </div>
  );
}
