"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  apiGetRecords,
  apiGetNotifications,
  apiGetMyFlat,
  apiGetMyPlan,
  ApiRecord,
  ApiNotification,
  ApiMyFlat,
  ApiPlan,
} from "../../lib/api";
import { getCurrentMonth, getMonthLabel } from "../../lib/data";
import { useRegisterPushToken } from "@/app/hooks/useRegisterPushToken";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${dd}/${mm}/${yyyy} ${hours}:${minutes} ${ampm}`;
}

export default function UserDashboardPage() {
  const [records, setRecords] = useState<ApiRecord[]>([]);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [myFlat, setMyFlat] = useState<ApiMyFlat | null>(null);
  const [myPlan, setMyPlan] = useState<ApiPlan | null>(null);

  useRegisterPushToken();

  useEffect(() => {
    (async () => {
      try {
        const [recs, notifs, flat, planResult] = await Promise.all([
          apiGetRecords(),
          apiGetNotifications(),
          apiGetMyFlat().catch(() => null),
          apiGetMyPlan().catch(() => null),
        ]);
        setRecords(recs);
        setNotifications(notifs);
        if (flat) setMyFlat(flat);
        if (planResult?.plan) setMyPlan(planResult.plan);
      } catch {
        setRecords([]);
        setNotifications([]);
        setMyFlat(null);
        setMyPlan(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const currentMonth = getCurrentMonth();
  const currentRecord = records.find((r) => r.month === currentMonth);
  const pendingRecords = records.filter((r) => r.status === "pending");
  const pendingAmount = pendingRecords.reduce(
    (sum, r) => sum + Number(r.amount),
    0,
  );
  const recentRecords = records.slice(0, 5);

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-2">Dashboard</h1>
      <p className="text-text-muted text-sm mb-6">Your subscription overview</p>

      {/* New user onboarding: show monthly subscription and flat info
          when there are no records yet */}
      {records.length === 0 && myFlat && myPlan && (
        <div className="mb-6 bg-bg-card border border-border-active rounded-xl p-5">
          <p className="text-sm font-semibold text-text-primary mb-1">
            Monthly subscription for your flat
          </p>
          <p className="text-2xl font-bold text-accent-primary">
            ₹{Number(myPlan.amount).toLocaleString("en-IN")} / month
          </p>
          <p className="text-xs text-text-secondary mt-2">
            Flat {myFlat.flat_no} · {myFlat.type}. You will receive
            notifications and payment reminders for this flat here.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-bg-card border border-border-default rounded-xl p-5">
          <p className="text-text-muted text-sm font-medium mb-1">
            This month ({getMonthLabel(currentMonth)})
          </p>
          <p
            className={`text-xl font-bold ${currentRecord?.status === "paid" ? "text-success" : "text-warning"}`}
          >
            {currentRecord?.status === "paid" ? "Paid" : "Pending"}
          </p>
          {currentRecord && (
            <p className="text-sm text-text-secondary mt-1">
              ₹{Number(currentRecord.amount).toLocaleString("en-IN")}
              {currentRecord.status === "paid" &&
                currentRecord.payment_mode && (
                  <> · {currentRecord.payment_mode}</>
                )}
            </p>
          )}
        </div>
        <div className="bg-bg-card border border-border-default rounded-xl p-5">
          <p className="text-text-muted text-sm font-medium mb-1">
            Pending amount
          </p>
          <p className="text-2xl font-bold text-text-primary">
            ₹{pendingAmount.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {pendingRecords.length} month(s) pending
          </p>
        </div>
        <div className="bg-bg-card border border-border-default rounded-xl p-5">
          <p className="text-text-muted text-sm font-medium mb-1">
            Quick actions
          </p>
          <Link
            href="/pay-now"
            className="inline-block mt-2 px-4 py-2 rounded-lg bg-accent-primary text-white text-sm font-medium hover:opacity-90"
          >
            Pay now
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-3">
            Payment history
          </h2>
          <div className="bg-bg-card border border-border-default rounded-xl overflow-hidden">
            {recentRecords.length === 0 ? (
              <p className="p-4 text-text-muted text-sm">No records yet.</p>
            ) : (
              <ul className="divide-y divide-border-default">
                {recentRecords.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <span className="text-text-primary">
                      {getMonthLabel(r.month)}
                    </span>
                    <span className="text-text-secondary">
                      ₹{Number(r.amount).toLocaleString("en-IN")}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded ${
                        r.status === "paid"
                          ? "bg-success-bg text-success"
                          : "bg-warning-bg text-warning"
                      }`}
                    >
                      {r.status}
                    </span>
                    <Link
                      href={`/subscriptions/${r.month}`}
                      className="text-accent-primary text-sm hover:underline"
                    >
                      View
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/subscriptions"
              className="block text-center py-3 text-sm text-accent-primary hover:underline border-t border-border-default"
            >
              View all subscriptions
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-3">
            Notifications
          </h2>
          <div className="bg-bg-card border border-border-default rounded-xl overflow-hidden">
            {notifications.length === 0 ? (
              <p className="p-4 text-text-muted text-sm">No notifications.</p>
            ) : (
              <ul className="divide-y divide-border-default">
                {notifications.slice(0, 5).map((n) => (
                  <li key={n.id} className="p-4">
                    <p className="font-medium text-text-primary text-sm">
                      {n.title}
                    </p>
                    <p className="text-text-secondary text-sm mt-1">
                      {n.message}
                    </p>
                    <p className="text-xs text-text-muted mt-2">
                      {formatDate(n.created_at || n.date)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
