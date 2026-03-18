"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { apiResetPassword } from "../lib/api";
import { useToast } from "../components/Toast";

function ResetPasswordInner() {
  const search = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => search.get("token") || "", [search]);
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      showToast("Missing token", "error");
      return;
    }
    setSubmitting(true);
    try {
      await apiResetPassword(token, newPassword);
      showToast("Password reset successfully. Please log in.", "success");
      router.push("/login");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Reset failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
      <div className="w-full max-w-md bg-bg-card border border-border-default rounded-2xl p-8">
        <h1 className="text-xl font-bold text-text-primary mb-2">
          Reset password
        </h1>
        <p className="text-text-muted text-sm mb-6">
          Set a new password for your account.
        </p>

        {!token ? (
          <div>
            <p className="text-danger text-sm">Invalid reset link.</p>
            <Link
              href="/forgot-password"
              className="text-accent-primary hover:underline mt-3 inline-block"
            >
              Request a new link
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                New password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full py-2.5 px-4 bg-bg-input border border-border-default rounded-lg text-text-primary text-sm"
              />
              <p className="text-xs text-text-muted mt-1">Minimum 6 characters.</p>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-accent-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Reset password"}
            </button>
          </form>
        )}

        <div className="mt-4">
          <Link href="/login" className="text-accent-primary hover:underline text-sm">
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordInner />
    </Suspense>
  );
}

