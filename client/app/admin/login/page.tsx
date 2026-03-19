"use client";


import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import LoginForm from "../../components/LoginForm";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const handleSubmit = async (email: string, password: string) => {
    const result = await login(email, password);
    if (result.success && result.role === "admin") {
      showToast("Welcome back, Admin!", "success");
      router.push("/admin/dashboard");
    } else if (result.success) {
      showToast("Access denied. Admin credentials required.", "error");
    } else {
      showToast(
        result.error || "Invalid credentials. Please try again.",
        "error",
      );
    }
  };

  return (
    <LoginForm
      title="Admin Portal"
      description="Manage your society and residents efficiently"
      googleRedirectPath="/admin/dashboard"
      footerLinks={[
        { href: "/admin/forgot-password", label: "Forgot password?" },
      ]}
      onSubmit={handleSubmit}
    />
  );
}
