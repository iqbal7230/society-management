"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "../../components/Toast";

function AuthCallbackInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    const token = params.get("token");
    const error = params.get("error");
    const role = params.get("role");
    const nextParam = params.get("next");

    if (error) {
      showToast(
        "Sign in with Google failed. If your email is not registered by the admin, please contact them.",
        "error",
      );
      router.replace("/login?error=google");
      return;
    }

    if (!token) {
      router.replace("/login?error=google");
      return;
    }

    const next =
      role === "admin"? "/admin/dashboard"
       : role === "user"
          ? "/dashboard"
          : nextParam || "/dashboard";

    localStorage.setItem("society_token", token);
    showToast("Signed in successfully.", "success");
    router.replace(next);
  }, [params, router, showToast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="text-text-muted text-sm">Completing sign-in…</div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackInner />
    </Suspense>
  );
}

