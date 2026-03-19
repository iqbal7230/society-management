"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import LoginForm from "../components/LoginForm";
import { PiBuildingApartment } from "react-icons/pi";

export default function UserLoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Surface Google sign-in errors (e.g. email not found)
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      showToast(
        "Sign in with Google failed. If your email is not registered by the admin, please contact them.",
        "error"
      );
    }
  }, [searchParams, showToast]);

  const handleSubmit = async (email: string, password: string) => {
    const result = await login(email, password);

    if (result.success) {
      if (result.role === "admin") {
        showToast("You are an admin. Redirecting to admin portal.", "info");
        router.push("/admin/dashboard");
      } else {
        showToast("Welcome back!", "success");
        router.push("/dashboard");
      }
    } else {
      showToast(result.error || "Invalid credentials. Please try again.", "error");
    }
  };

  return (
    <LoginForm
      title="Resident Portal"
      description="Sign in to manage your subscriptions and payments"
      googleRedirectPath="/dashboard"
      footerLinks={[
        { href: "/forgot-password", label: "Forgot password?" },
        { href: "/admin/login", label: "Admin login" },
      ]}
      onSubmit={handleSubmit}
    />
  );
}
