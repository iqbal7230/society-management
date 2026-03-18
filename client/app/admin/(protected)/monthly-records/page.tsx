"use client";

import { useEffect, useState } from "react";
import {
  apiGetRecords,
  apiGetFlats,
  apiEnsureRecords,
  apiMarkAsPaid,
  ApiRecord,
  ApiFlat,
} from "../../../lib/api";
import { getCurrentMonth, getMonthLabel } from "../../../lib/data";
import { useToast } from "../../../components/Toast";

const PAYMENT_MODES = ["Cash", "UPI", "Online"] as const;

export default function AdminMonthlyRecordsPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [records, setRecords] = useState<ApiRecord[]>([]);
  const [flats, setFlats] = useState<ApiFlat[]>([]);
  const [loading, setLoading] = useState(true);
  const [ensuring, setEnsuring] = useState(false);
  const [payModal, setPayModal] = useState<ApiRecord | null>(null);
  const [payMode, setPayMode] = useState<"Cash" | "UPI" | "Online">("UPI");
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [recs, flatList] = await Promise.all([
        apiGetRecords({ month }),
        apiGetFlats(),
      ]);
      setRecords(recs);
      setFlats(flatList);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [month]);

  const handleEnsure = async () => {
    setEnsuring(true);
    try {
      const res = await apiEnsureRecords(month);
      showToast(res.created > 0 ? `Created ${res.created} records` : "All records exist", "info");
      load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to ensure records", "error");
    } finally {
      setEnsuring(false);
    }
  };

  const handleMarkPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModal) return;
    setSubmitting(true);
    try {
      await apiMarkAsPaid(payModal.id, payMode);
      showToast("Marked as paid", "success");
      setPayModal(null);
      load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to mark as paid", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const flatMap = Object.fromEntries(flats.map((f) => [f.id, f]));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Monthly Records</h1>
      <p className="text-text-muted text-sm mb-6">
        View and update payment status for each flat by month.
      </p>

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-xs text-text-muted mb-1">Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="py-2 px-4 bg-bg-input border border-border-default rounded-lg text-text-primary text-sm"
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleEnsure}
            disabled={ensuring}
            className="px-4 py-2 rounded-lg border border-border-default text-text-primary text-sm font-medium hover:bg-bg-glass disabled:opacity-50"
          >
            {ensuring ? "Creating..." : "Ensure records for this month"}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-text-muted">Loading...</p>
      ) : (
        <div className="bg-bg-card border border-border-default rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default bg-bg-glass">
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Flat</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Owner</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Mode</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Payment date</th>
                  <th className="text-right py-3 px-4 font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => {
                  const flat = flatMap[rec.flat_id];
                  return (
                    <tr key={rec.id} className="border-b border-border-default hover:bg-bg-glass/50">
                      <td className="py-3 px-4 text-text-primary">{flat?.flat_no ?? rec.flat_id}</td>
                      <td className="py-3 px-4 text-text-primary">{flat?.owner_name ?? "—"}</td>
                      <td className="py-3 px-4 text-text-secondary">₹{Number(rec.amount).toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                            rec.status === "paid"
                              ? "bg-success-bg text-success"
                              : "bg-warning-bg text-warning"
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-text-secondary">{rec.payment_mode || "—"}</td>
                      <td className="py-3 px-4 text-text-secondary">
                        {rec.payment_date ? new Date(rec.payment_date).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {rec.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => setPayModal(rec)}
                            className="text-accent-primary hover:underline"
                          >
                            Mark paid
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {records.length === 0 && (
            <p className="py-8 text-center text-text-muted text-sm">
              No records for {getMonthLabel(month)}. Use &quot;Ensure records for this month&quot; to create them.
            </p>
          )}
        </div>
      )}

      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-bg-card border border-border-default rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Mark as paid</h2>
            <p className="text-text-muted text-sm mb-4">
              Flat ID {payModal.flat_id}, {getMonthLabel(payModal.month)} — ₹{Number(payModal.amount).toLocaleString("en-IN")}
            </p>
            <form onSubmit={handleMarkPaid} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Payment mode</label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value as "Cash" | "UPI" | "Online")}
                  className="w-full py-2 px-4 bg-bg-input border border-border-default rounded-lg text-text-primary text-sm"
                >
                  {PAYMENT_MODES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-accent-primary text-white text-sm font-medium disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Confirm"}
                </button>
                <button
                  type="button"
                  onClick={() => setPayModal(null)}
                  className="px-4 py-2 rounded-lg border border-border-default text-text-primary text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
