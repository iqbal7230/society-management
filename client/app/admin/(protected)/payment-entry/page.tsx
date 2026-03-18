"use client";

import { useEffect, useState } from "react";
import { apiGetFlats, apiGetPlans, apiAddPayment, ApiFlat, ApiPlan } from "../../../lib/api";
import { getCurrentMonth } from "../../../lib/data";
import { useToast } from "../../../components/Toast";

const MODES = ["Cash", "UPI", "Online"] as const;

export default function AdminPaymentEntryPage() {
  const [flats, setFlats] = useState<ApiFlat[]>([]);
  const [plans, setPlans] = useState<ApiPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    flatId: "",
    month: getCurrentMonth(),
    amount: "",
    mode: "Cash" as (typeof MODES)[number],
  });
  const { showToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const [f, p] = await Promise.all([apiGetFlats(), apiGetPlans()]);
        setFlats(f);
        setPlans(p);
        if (f.length && !form.flatId) setForm((prev) => ({ ...prev, flatId: String(f[0].id) }));
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectedFlat = flats.find((f) => String(f.id) === form.flatId);
  const planAmount = selectedFlat
    ? plans.find((p) => p.type === selectedFlat.type)?.amount ?? 0
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const flatId = Number(form.flatId);
    const amount = Number(form.amount) || planAmount;
    if (!flatId) {
      showToast("Select a flat", "error");
      return;
    }
    setSubmitting(true);
    try {
      await apiAddPayment(flatId, form.month, amount, form.mode);
      showToast("Payment recorded successfully", "success");
      setForm((prev) => ({ ...prev, amount: "" }));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Payment failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8"><p className="text-text-muted">Loading...</p></div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Manual Payment Entry</h1>
      <p className="text-text-muted text-sm mb-6">
        Record an offline payment (Cash/UPI) for a flat and month.
      </p>

      <div className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4 bg-bg-card border border-border-default rounded-xl p-6">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Flat</label>
            <select
              required
              value={form.flatId}
              onChange={(e) => setForm((f) => ({ ...f, flatId: e.target.value }))}
              className="w-full py-2 px-4 bg-bg-input border border-border-default rounded-lg text-text-primary text-sm"
            >
              <option value="">Select flat</option>
              {flats.map((f) => (
                <option key={f.id} value={f.id}>{f.flat_no} — {f.owner_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Month</label>
            <input
              type="month"
              required
              value={form.month}
              onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))}
              className="w-full py-2 px-4 bg-bg-input border border-border-default rounded-lg text-text-primary text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Amount (₹)</label>
            <input
              type="number"
              min={0}
              step={1}
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder={planAmount ? `Default: ${planAmount}` : ""}
              className="w-full py-2 px-4 bg-bg-input border border-border-default rounded-lg text-text-primary text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Payment mode</label>
            <select
              value={form.mode}
              onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value as (typeof MODES)[number] }))}
              className="w-full py-2 px-4 bg-bg-input border border-border-default rounded-lg text-text-primary text-sm"
            >
              {MODES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-accent-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Recording..." : "Record payment"}
          </button>
        </form>
      </div>
    </div>
  );
}
