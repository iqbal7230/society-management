"use client";

import { useEffect, useState } from "react";
import {
  apiGetRecords,
  apiEnsureRecords,
  apiMarkAsPaid,
  ApiRecord,
} from "../../../lib/api";
import { getCurrentMonth, getMonthLabel } from "../../../lib/data";
import { useToast } from "../../../components/Toast";

const PAYMENT_MODES = ["Cash", "UPI", "Online"] as const;

export default function AdminMonthlyRecordsPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [records, setRecords] = useState<ApiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [ensuring, setEnsuring] = useState(false);
  const [payModal, setPayModal] = useState<ApiRecord | null>(null);
  const [payMode, setPayMode] = useState<"Cash" | "UPI" | "Online">("UPI");
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const recs = await apiGetRecords({ month });
      setRecords(recs);
    } catch (e) {
      showToast(
        e instanceof Error ? e.message : "Failed to load records",
        "error",
      );
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
      showToast(
        res.created > 0
          ? `Created ${res.created} records`
          : "All records exist",
        "info",
      );
      load();
    } catch (e) {
      showToast(
        e instanceof Error ? e.message : "Failed to ensure records",
        "error",
      );
    } finally {
      setEnsuring(false);
    }
  };

  const handleMarkPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModal) return;

    // 🚫 Prevent inactive flat payment
    if (payModal.flat_status === "inactive") {
      showToast("Cannot mark inactive flat as paid", "error");
      return;
    }

    setSubmitting(true);
    try {
      await apiMarkAsPaid(payModal.id, payMode);
      showToast("Marked as paid", "success");
      setPayModal(null);
      load();
    } catch (e) {
      showToast(
        e instanceof Error ? e.message : "Failed to mark as paid",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-text-primary mb-2">
        Monthly Records
      </h1>
      <p className="text-text-muted text-sm mb-6">
        View and update payment status for each flat by month.
      </p>

      {/* Controls */}
      <div className="flex gap-4 mb-6">
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
            {ensuring ? "Creating..." : "Ensure records"}
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-text-muted">Loading...</p>
      ) : (
        <div className="bg-bg-card border border-border-default rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default bg-bg-glass">
                  <th className="text-left py-3 px-4">Flat</th>
                  <th className="text-left py-3 px-4">Owner</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Mode</th>
                  <th className="text-left py-3 px-4">Payment date</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {records.map((rec) => (
                  <tr key={rec.id} className="border-b border-border-default">
    
                    <td className="py-3 px-4">{rec.flat_no}</td>
                    <td className="py-3 px-4">{rec.owner_name}</td>

                    <td className="py-3 px-4">
                      ₹{Number(rec.amount).toLocaleString("en-IN")}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          rec.flat_status === "inactive"
                            ? "bg-gray-600 text-white"
                            : rec.status === "paid"
                              ? "bg-success-bg text-success"
                              : "bg-warning-bg text-warning"
                        }`}
                      >
                        {rec.flat_status === "inactive"
                          ? "Inactive"
                          : rec.status}
                      </span>
                    </td>

                    <td className="py-3 px-4">{rec.payment_mode || "—"}</td>

                    <td className="py-3 px-4">
                      {rec.payment_date
                        ? new Date(rec.payment_date).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {rec.status === "pending" &&
                        rec.flat_status !== "inactive" && (
                          <button
                            onClick={() => setPayModal(rec)}
                            className="text-accent-primary hover:underline"
                          >
                            Mark paid
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {records.length === 0 && (
            <p className="py-8 text-center text-text-muted text-sm">
              No records for {getMonthLabel(month)}
            </p>
          )}
        </div>
      )}

      {/* Modal */}
      {payModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60">
          <div className="bg-bg-card p-6 rounded-xl w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Mark as paid</h2>

            <form onSubmit={handleMarkPaid} className="space-y-4">
              <select
                value={payMode}
                onChange={(e) =>
                  setPayMode(e.target.value as "Cash" | "UPI" | "Online")
                }
                className="w-full py-2 px-4 border rounded-lg"
              >
                {PAYMENT_MODES.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-accent-primary text-white rounded-lg"
                >
                  {submitting ? "Saving..." : "Confirm"}
                </button>

                <button
                  type="button"
                  onClick={() => setPayModal(null)}
                  className="px-4 py-2 border rounded-lg"
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
