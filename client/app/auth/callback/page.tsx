"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "../../components/Toast";

export default function AuthCallbackPage() {
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
      console.warn("No token received from OAuth callback");
      router.replace("/login?error=google");
      return;
    }

    const next =
      role === "admin"? "/admin/dashboard"
       : role === "user"
          ? "/dashboard"
          : nextParam || "/dashboard";

    // Set token FIRST, before any redirects
    localStorage.setItem("society_token", token);

    // Wait for token to be fully persisted and for AuthProvider to read it
    setTimeout(() => {
      showToast("Signed in successfully.", "success");
      router.replace(next);
    }, 200);
  }, [params, router, showToast]);

 
}

