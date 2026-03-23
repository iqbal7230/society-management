"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { apiGetRecords, apiAddPayment, ApiRecord } from "../../lib/api";
import { getCurrentMonth, getMonthLabel } from "../../lib/data";
import { useToast } from "../../components/Toast";

const MONTHS: string[] = [];
for (let y = 2024; y <= 2027; y++) {
  for (let m = 1; m <= 12; m++) {
    MONTHS.push(`${y}-${String(m).padStart(2, "0")}`);
  }
}

export default function PayNowPage() {
  const { currentUser } = useAuth();
  const [records, setRecords] = useState<ApiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [processing, setProcessing] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    apiGetRecords()
      .then(setRecords)
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, []);

  const currentMonthRecord = records.find((r) => r.month === getCurrentMonth());
  const selectedRecord = records.find((r) => r.month === selectedMonth);
  const pendingMonths = records.filter((r) => r.status === "pending");
  const flatId = currentUser?.flatId ? Number(currentUser.flatId) : null;

  const handlePayNow = async () => {
    if (!flatId || !selectedRecord || selectedRecord.status === "paid") return;
    setProcessing(true);
    try {
      await apiAddPayment(
        flatId,
        selectedRecord.month,
        Number(selectedRecord.amount),
        "Online",
      );
      showToast("Payment recorded successfully. Receipt generated.", "success");
      setRecords((prev) =>
        prev.map((r) =>
          r.id === selectedRecord.id
            ? { ...r, status: "paid" as const, payment_mode: "Online" as const }
            : r,
        ),
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Payment failed. Try again.",
        "error",
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-4"><p className="text-text-muted">Loading...</p></div>;

  if (!flatId) {
    return (
      <div className="p-4">
        <p className="text-text-muted">No flat assigned to your account. Contact admin.</p>
        <Link href="/dashboard" className="text-accent-primary mt-2 inline-block">← Dashboard</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-2">Pay Now</h1>
      <p className="text-text-muted text-sm mb-6">
        Pay your subscription online. On success, an online receipt is generated.
      </p>

      <div className="max-w-lg space-y-6">
        <div className="bg-bg-card border border-border-default rounded-xl p-6">
          <p className="text-text-muted text-sm mb-2">Current month ({getMonthLabel(getCurrentMonth())})</p>
          {currentMonthRecord ? (
            currentMonthRecord.status === "paid" ? (
              <p className="text-success font-medium">Already paid for this month.</p>
            ) : (
              <p className="text-text-primary">
                Amount due: <strong>₹{Number(currentMonthRecord.amount).toLocaleString("en-IN")}</strong>
              </p>
            )
          ) : (
            <p className="text-text-muted">No record for this month yet.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Select month to pay</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full py-2 px-4 bg-bg-input border border-border-default rounded-lg text-text-primary text-sm"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>{getMonthLabel(m)}</option>
            ))}
          </select>
        </div>

        {selectedRecord && (
          <div className="bg-bg-card border border-border-default rounded-xl p-6">
            <p className="text-text-muted text-sm">{getMonthLabel(selectedRecord.month)}</p>
            <p className="text-xl font-semibold text-text-primary mt-1">
              ₹{Number(selectedRecord.amount).toLocaleString("en-IN")}
            </p>
            {selectedRecord.status === "paid" ? (
              <p className="text-success text-sm mt-2">This month is already paid.</p>
            ) : (
              <p className="text-text-secondary text-sm mt-2">
                Click below to confirm.
              </p>
            )}
            {selectedRecord.status === "pending" && (
              <button
                type="button"
                onClick={handlePayNow}
                disabled={processing}
                className="mt-4 w-full py-2.5 rounded-lg bg-accent-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {processing ? "Processing..." : "Pay ₹" + Number(selectedRecord.amount).toLocaleString("en-IN")}
              </button>
            )}
          </div>
        )}

      
      </div>
    </div>
  );
}
