"use client";

import { useEffect, useState } from "react";
import { apiGetPlans, apiUpdatePlan, ApiPlan } from "../../../lib/api";
import { useToast } from "../../../components/Toast";

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState<ApiPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ApiPlan | null>(null);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGetPlans();
      setPlans(data);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load plans", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (plan: ApiPlan) => {
    setEditing(plan);
    setAmount(String(plan.amount));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const num = Number(amount);
    if (isNaN(num) || num < 0) {
      showToast("Enter a valid amount", "error");
      return;
    }
    setSubmitting(true);
    try {
      await apiUpdatePlan(editing.type, num);
      showToast("Plan updated successfully", "success");
      setEditing(null);
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Update failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Subscription Plans</h1>
      <p className="text-text-muted text-sm mb-6">
        Monthly subscription amount by flat type. Changes apply to new monthly records only.
      </p>

      {loading ? (
        <p className="text-text-muted">Loading...</p>
      ) : (
        <div className="max-w-xl space-y-4">
          {plans.map((plan) => (
            <div
              key={plan.type}
              className="bg-bg-card border border-border-default rounded-xl p-5 flex flex-wrap items-center justify-between gap-4"
            >
              <div>
                <p className="font-medium text-text-primary">{plan.type}</p>
                <p className="text-text-muted text-sm">
                  ₹{Number(plan.amount).toLocaleString("en-IN")} / month
                </p>
              </div>
              {editing?.id === plan.id ? (
                <form onSubmit={handleSave} className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-28 py-2 px-3 bg-bg-input border border-border-default rounded-lg text-text-primary text-sm"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-3 py-2 rounded-lg bg-accent-primary text-white text-sm font-medium disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditing(null); setAmount(""); }}
                    className="px-3 py-2 rounded-lg border border-border-default text-text-primary text-sm"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => openEdit(plan)}
                  className="px-3 py-2 rounded-lg border border-border-default text-text-primary text-sm font-medium hover:bg-bg-glass"
                >
                  Update rate
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
