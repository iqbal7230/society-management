"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";

export default function UserProfilePage() {
  const { currentUser, updateProfile } = useAuth();
  const [phone, setPhone] = useState(currentUser?.phone ?? "");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updates: { phone?: string; password?: string } = {};
    if (phone !== currentUser?.phone) updates.phone = phone;
    if (password.trim()) updates.password = password;
    if (Object.keys(updates).length === 0) {
      showToast("No changes to save", "info");
      return;
    }
    setSubmitting(true);
    try {
      await updateProfile(updates);
      setPassword("");
      showToast("Profile updated", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Update failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-2">Profile</h1>
      <p className="text-text-muted text-sm mb-6">
        Update your phone number or password. You can log out from here.
      </p>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4 bg-bg-card border border-border-default rounded-xl p-6">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Name</label>
          <input
            value={currentUser.name}
            disabled
            className="w-full py-2 px-4 bg-bg-input border border-border-default rounded-lg text-text-muted text-sm cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Email</label>
          <input
            type="email"
            value={currentUser.email}
            disabled
            className="w-full py-2 px-4 bg-bg-input border border-border-default rounded-lg text-text-muted text-sm cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full py-2 px-4 bg-bg-input border border-border-default rounded-lg text-text-primary text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">New password (leave blank to keep)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full py-2 px-4 bg-bg-input border border-border-default rounded-lg text-text-primary text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-lg bg-accent-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
