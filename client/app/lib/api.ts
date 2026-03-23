import axios, { AxiosError, AxiosInstance } from "axios";


const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("society_token");
}

function getApi(): AxiosInstance {
  const api = axios.create({
    baseURL: API_BASE,
    headers: {
      "Content-Type": "application/json",
    },
  });

  api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
    return config;
  });

  return api;
}

const api = getApi();

function toErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<{ error?: string; message?: string }>;
    const data = ax.response?.data;
    return (
      data?.error ||
      data?.message ||
      ax.message ||
      "Request failed"
    );
  }
  return err instanceof Error ? err.message : "Request failed";
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
};

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  try {
    const res = await api.request<T>({
      url: endpoint,
      method: options.method || "GET",
      data: options.data,
      params: options.params,
    });
    return res.data;
  } catch (err) {
    throw new Error(toErrorMessage(err));
  }
}

export function getGoogleOAuthUrl(nextPath: string): string {
  // const clientBase =
  //   typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const redirect = `${process.env.NEXTAUTH_URL}/callback?next=${encodeURIComponent(
    nextPath,
  )}`;
  return `${process.env.NEXT_PUBLIC_API_URL }/auth/google?redirect=${encodeURIComponent(redirect)}`;
}

// ===== Auth =====

export async function apiLogin(
  email: string,
  password: string,
): Promise<{ token: string; user: ApiUser }> {
  return request("/auth/login", {
    method: "POST",
    data: { email, password },
  });
}


export async function apiGetMe(): Promise<ApiUser> {
  return request("/auth/me");
}

export async function apiUpdateProfile(
  updates: Partial<{ name: string; phone: string; password: string }>,
): Promise<ApiUser> {
  return request("/auth/profile", {
    method: "PUT",
    data: updates,
  });
}

export async function apiForgotPassword(email: string): Promise<{ message: string }> {
  return request("/auth/forgot-password", {
    method: "POST",
    data: { email },
  });
}

export async function apiResetPassword(
  token: string,
  newPassword: string,
): Promise<{ message: string }> {
  return request("/auth/reset-password", {
    method: "POST",
    data: { token, newPassword },
  });
}

export async function apiLogout(): Promise<{ message: string }> {
  return request("/auth/logout", {
    method: "POST",
  });
}

// ===== Flats =====

export async function apiGetFlats(): Promise<ApiFlat[]> {
  const res = await request<{ success: boolean; message: string; data: ApiFlat[] }>("/flats");
  return res.data;
}

export async function apiAddFlat(
  flat: Omit<ApiFlat, "id" | "is_active" | "created_at" | "updated_at">,
): Promise<{ success: boolean; message: string; data: ApiFlat }> {
  return request("/flats", {
    method: "POST",
    data: {
      flatNo: flat.flat_no,
      ownerName: flat.owner_name,
      email: flat.email,
      phone: flat.phone,
      type: flat.type,
    },
  });
}

export async function apiUpdateFlat(
  id: number,
  updates: Partial<{
    flatNo: string;
    ownerName: string;
    email: string;
    phone: string;
    type: string;
  }>,
): Promise<{ success: boolean; message: string; data: ApiFlat }> {
  return request(`/flats/${id}`, {
    method: "PUT",
    data: updates,
  });
}

export async function apiDeleteFlat(
  id: number,
): Promise<{ success: boolean; message: string; data: { softDeleted: boolean } }> {
  return request(`/flats/${id}`, { method: "DELETE" });
}

// ===== Plans =====

export async function apiGetPlans(): Promise<ApiPlan[]> {
  return request("/plans");
}

// Resident: get the plan for the currently logged-in user's flat
export async function apiGetMyPlan(): Promise<{
  type: ApiPlan["type"];
  amount: number;
  plan: ApiPlan;
}> {
  return request("/plans/my");
}

export async function apiUpdatePlan(
  type: string,
  amount: number,
): Promise<{ plan: ApiPlan; message: string }> {
  return request(`/plans/${type}`, {
    method: "PUT",
    data: { amount },
  });
}

// ===== Records =====

export async function apiGetRecords(params?: {
  month?: string;
  flatId?: number;
}): Promise<ApiRecord[]> {
  const query = new URLSearchParams();
  if (params?.month) query.set("month", params.month);
  if (params?.flatId) query.set("flatId", String(params.flatId));
  const qs = query.toString();
  return request(`/records${qs ? `?${qs}` : ""}`);
}

export async function apiEnsureRecords(
  month: string,
): Promise<{ message: string; created: number }> {
  return request("/records/ensure", {
    method: "POST",
    data: { month },
  });
}

export async function apiMarkAsPaid(
  recordId: number,
  mode: string,
): Promise<ApiRecord> {
  return request(`/records/${recordId}/pay`, {
    method: "PUT",
    data: { mode },
  });
}

// ===== Payments =====

export async function apiAddPayment(
  flatId: number,
  month: string,
  amount: number,
  mode: string,
): Promise<{ success: boolean; message: string; record?: ApiRecord }> {
  return request("/payments", {
    method: "POST",
    data: { flatId, month, amount, mode },
  });
}

// ===== Notifications =====

export async function apiGetNotifications(): Promise<ApiNotification[]> {
  return request("/notifications");
}

export async function apiAddNotification(
  title: string,
  message: string,
  target: "all" | "selected",
  flatIds?: number[],
): Promise<ApiNotification> {
  return request("/notifications", {
    method: "POST",
    data: { title, message, target, flatIds },
  });
}

// ===== Push tokens (Supabase Cloud Messaging registration) =====

export async function apiRegisterPushToken(
  token: string,
  deviceType: string = "web",
): Promise<{ success: boolean }> {
  return request("/push-tokens", {
    method: "POST",
    data: { token, deviceType },
  });
}

// ===== Users (admin) =====

export async function apiCreateResidentUser(input: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  flatId: number;
}): Promise<{ success: boolean; message: string; data: ApiUser }> {
  return request("/users", {
    method: "POST",
    data: input,
  });
}

// ===== My flat (resident) =====

export interface ApiMyFlat {
  id: number;
  flat_no: string;
  type: "1BHK" | "2BHK" | "3BHK";
  is_active: boolean;
  owner_name: string;
}

export async function apiGetMyFlat(): Promise<ApiMyFlat> {
  return request("/flats/me");
}

// ===== Reports =====

export interface ApiReport {
  totalFlats: number;
  paidCount: number;
  pendingCount: number;
  totalCollected: number;
  totalPending: number;
  byMode: { mode: string; total: number }[];
}

export async function apiGetReport(params: {
  month?: string;
  year?: string;
}): Promise<ApiReport> {
  const query = new URLSearchParams();
  if (params.month) query.set("month", params.month);
  if (params.year) query.set("year", params.year);
  const qs = query.toString();
  return request(`/reports${qs ? `?${qs}` : ""}`);
}

// ===== Types (matching PostgreSQL snake_case) =====

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "user";
  flat_id: number | null;
  google_id?: string;
  created_at?: string;
}

export interface ApiFlat {
  id: number;
  flat_no: string;
  owner_name: string;
  email: string | null;
  phone: string | null;
  type: "1BHK" | "2BHK" | "3BHK";
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ApiPlan {
  id: number;
  type: "1BHK" | "2BHK" | "3BHK";
  amount: number;
  flat_id?: number | null;
  updated_at?: string;
}

export interface ApiRecord {
  id: number;
  flat_id: number;
  flat_no: string;
  owner_name: string;
  month: string;
  amount: number;
  status: "paid" | "pending";
  flat_status: "active" | "inactive"; // 🔥 ADD THIS
  payment_mode: "Cash" | "UPI" | "Online" | "";
  payment_date: string | null;
  paid_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiNotification {
  id: number;
  title: string;
  message: string;
  target: string;
  date: string;
  sent_by: string;
  created_at?: string;
}
