"use client";

import { useState } from "react";
import Link from "next/link";
import { apiForgotPassword } from "../../lib/api";
import { useToast } from "../../components/Toast";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiForgotPassword(email.trim());
      showToast("If the email exists, a reset link was sent.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Request failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
      <div className="w-full max-w-md bg-bg-card border border-border-default rounded-2xl p-8">
        <h1 className="text-xl font-bold text-text-primary mb-2">
          Admin forgot password
        </h1>
        <p className="text-text-muted text-sm mb-6">
          Enter your admin email and we’ll send a reset link.
        </p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-2.5 px-4 bg-bg-input border border-border-default rounded-lg text-text-primary text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-accent-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
        <div className="mt-4 flex justify-between text-sm">
          <Link href="/admin/login" className="text-accent-primary hover:underline">
            ← Back to admin login
          </Link>
          <Link href="/forgot-password" className="text-accent-primary hover:underline">
            Resident forgot password →
          </Link>
        </div>
      </div>
    </div>
  );
}

