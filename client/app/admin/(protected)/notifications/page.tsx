"use client";

import { useEffect, useState } from "react";
import {
  apiGetNotifications,
  apiAddNotification,
  apiGetFlats,
  ApiNotification,
  ApiFlat,
} from "../../../lib/api";
import { useToast } from "../../../components/Toast";

export default function AdminNotificationsPage() {
  const [list, setList] = useState<ApiNotification[]>([]);
  const [flats, setFlats] = useState<ApiFlat[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", message: "" });
  const [targetMode, setTargetMode] = useState<"all" | "selected">("all");
  const [selected, setSelected] = useState<number[]>([]);
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [data, flatList] = await Promise.all([
        apiGetNotifications(),
        apiGetFlats(),
      ]);
      setList(data);
      setFlats(flatList);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load notifications", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      showToast("Title and message are required", "error");
      return;
    }
    if (targetMode === "selected" && selected.length === 0) {
      showToast("Select at least one flat", "error");
      return;
    }
    setSubmitting(true);
    try {
      await apiAddNotification(
        form.title.trim(),
        form.message.trim(),
        targetMode,
        targetMode === "selected" ? selected : undefined,
      );
      showToast("Notification sent", "success");
      setForm({ title: "", message: "" });
      setTargetMode("all");
      setSelected([]);
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to send", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto p-8">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Notifications</h1>
      <p className="text-text-muted text-sm mb-6">
        Send reminders (e.g. payment due) to residents. Target &quot;all&quot; for everyone.
      </p>

      <div className="max-w-xl mb-8">
        <form onSubmit={handleSubmit} className="bg-bg-card border border-border-default rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Payment due for February"
              className="w-full py-2 px-4 bg-bg-input border border-border-default rounded-lg text-text-primary text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Message content..."
              rows={3}
              className="w-full py-2 px-4 bg-bg-input border border-border-default rounded-lg text-text-primary text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Target</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { setTargetMode("all"); setSelected([]); }}
                className={`px-3 py-2 rounded-lg border text-sm ${
                  targetMode === "all"
                    ? "border-border-active text-accent-primary bg-accent-primary/10"
                    : "border-border-default text-text-secondary hover:bg-bg-glass"
                }`}
              >
                All flats
              </button>
              <button
                type="button"
                onClick={() => setTargetMode("selected")}
                className={`px-3 py-2 rounded-lg border text-sm ${
                  targetMode === "selected"
                    ? "border-border-active text-accent-primary bg-accent-primary/10"
                    : "border-border-default text-text-secondary hover:bg-bg-glass"
                }`}
              >
                Selected flats
              </button>
            </div>
            {targetMode === "selected" && (
              <div className="mt-3 max-h-48 overflow-auto border border-border-default rounded-lg p-3 bg-bg-glass/40">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-text-muted">Choose flats (multiple)</p>
                  <button
                    type="button"
                    onClick={() => setSelected(flats.map((f) => f.id))}
                    className="text-xs text-accent-primary hover:underline"
                  >
                    Select all
                  </button>
                </div>
                <div className="space-y-2">
                  {flats.map((f) => {
                    const checked = selected.includes(f.id);
                    return (
                      <label key={f.id} className="flex items-center gap-2 text-sm text-text-secondary">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setSelected((prev) =>
                              e.target.checked
                                ? [...prev, f.id]
                                : prev.filter((x) => x !== f.id),
                            );
                          }}
                          className="h-4 w-4"
                        />
                        <span className="text-text-primary">{f.flat_no}</span>
                        <span className="text-text-muted">— {f.owner_name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-accent-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Send notification"}
          </button>
        </form>
      </div>

      <h2 className="text-lg font-semibold text-text-primary mb-3">Recent notifications</h2>
      {loading ? (
        <p className="text-text-muted">Loading...</p>
      ) : (
        <ul className="space-y-3">
          {list.map((n) => (
            <li
              key={n.id}
              className="bg-bg-card border border-border-default rounded-lg p-4"
            >
              <p className="font-medium text-text-primary">{n.title}</p>
              <p className="text-sm text-text-secondary mt-1">{n.message}</p>
              <p className="text-xs text-text-muted mt-2">
                {n.date} · {n.sent_by} · {n.target}
              </p>
            </li>
          ))}
          {list.length === 0 && (
            <p className="text-text-muted text-sm">No notifications yet.</p>
          )}
        </ul>
      )}
    </div>
  );
}
