

export interface Flat {
  id: string;
  flatNo: string;
  ownerName: string;
  email: string;
  phone: string;
  type: "1BHK" | "2BHK" | "3BHK";
  isActive: boolean;
}

export interface SubscriptionPlan {
  type: "1BHK" | "2BHK" | "3BHK";
  amount: number;
}

export interface MonthlyRecord {
  id: string;
  flatId: string;
  month: string; // "2026-01", "2026-02", etc.
  amount: number;
  status: "paid" | "pending";
  paymentMode?: "Cash" | "UPI" | "Online" | "";
  paymentDate?: string;
  paidBy?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  target: "all" | string; // 'all' or flatId
  date: string;
  sentBy: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: "admin" | "user";
  flatId?: string;
}









// ===== Utility =====

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function getMonthLabel(month: string): string {
  const [y, m] = month.split("-");
  const date = new Date(parseInt(y), parseInt(m) - 1);
  return date.toLocaleString("default", { month: "long", year: "numeric" });
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function getInitials(name: string): string {
  if (!name || typeof name !== "string") return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
