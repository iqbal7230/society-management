"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext"
import { useToast } from "../components/Toast";
import { FcGoogle } from "react-icons/fc";
import { getGoogleOAuthUrl } from "../lib/api";

function UserLoginInner() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

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

  setIsSubmitting(false);
};

  const inputCls =
    "w-full py-2.5 px-4 bg-bg-input border border-border-default rounded-lg text-text-primary text-sm font-[inherit] transition-all duration-200 focus:outline-none focus:border-border-active focus:ring-2 focus:ring-accent-primary/10 placeholder:text-text-muted/50";

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary relative overflow-hidden">
      <div className="absolute w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(129,140,248,0.08),transparent_70%)] -top-[200px] -right-[200px] pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(99,102,241,0.06),transparent_70%)] -bottom-[100px] -left-[100px] pointer-events-none" />

      <div className="bg-bg-card border border-border-default rounded-3xl p-10 w-full max-w-[420px] backdrop-blur-[20px] relative z-10 shadow-2xl slide-up">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-2xl text-white font-extrabold shadow-lg">
            P
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-center mb-2 tracking-tight text-text-primary">
          Resident Portal
        </h1>
        <p className="text-center text-text-muted text-sm mb-8">
          Sign in to manage your subscriptions and payments
        </p>

        {/* Google */}
        <button
          type="button"
          className="w-full py-3 bg-white/10 border border-white/20 rounded-lg text-text-primary text-sm font-semibold cursor-pointer flex items-center justify-center gap-3 transition-all duration-200 hover:bg-white/15 hover:border-white/30 mb-6 font-[inherit] group"
          onClick={() => {
            window.location.href = getGoogleOAuthUrl("/dashboard");
          }}
        >
          <FcGoogle size={20} className="group-hover:scale-110 transition-transform" />
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6 text-text-muted text-xs">
          <div className="flex-1 h-px bg-border-default" />
          <span className="px-2">OR</span>
          <div className="flex-1 h-px bg-border-default" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wide">
              Email Address
            </label>
            <input
              type="email"
              className={inputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your-email@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              className={inputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-lg text-sm font-bold cursor-pointer border-none bg-gradient-to-br from-accent-primary to-accent-secondary text-white shadow-[0_4px_12px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(99,102,241,0.5)] transition-all duration-200 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="flex gap-3 justify-center mt-5 text-xs">
          <a
            href="/forgot-password"
            className="text-text-muted hover:text-accent-primary transition-colors"
          >
            Forgot password?
          </a>
          <span className="text-border-default">•</span>
          <a
            href="/admin/login"
            className="text-text-muted hover:text-accent-primary transition-colors"
          >
            Admin login
          </a>
        </div>
      </div>
    </div>
  );
}

export default function UserLoginPage() {
  return (
    <Suspense>
      <UserLoginInner />
    </Suspense>
  );
}
