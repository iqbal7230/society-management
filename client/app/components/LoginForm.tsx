"use client";

import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";

interface LoginFormProps {
  title: string;
  description: string;
  googleRedirectPath: string;
  footerLinks?: { href: string; label: string }[];
  onSubmit: (email: string, password: string, isSubmitting: boolean) => Promise<void>;
  loading?: boolean;
}

export default function LoginForm({
  title,
  description,
  googleRedirectPath,
  footerLinks,
  onSubmit,
  loading = false,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(email, password, isSubmitting);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleClick = (e: React.MouseEvent) => {
    
    const clientUrl = process.env.NEXT_PUBLIC_NEXTAUTH_URL ;
    const redirect = `${clientUrl}/auth/callback?next=${encodeURIComponent(
      googleRedirectPath,
    )}`;
    const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?redirect=${encodeURIComponent(redirect)}`;
    window.location.href = googleAuthUrl;
  };

  const inputCls =
    "w-full py-2.5 px-4 bg-bg-input border border-border-default rounded-lg text-text-primary text-sm font-[inherit] transition-all duration-200 focus:outline-none focus:border-border-active focus:ring-2 focus:ring-accent-primary/10 placeholder:text-text-muted/50";

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute w-150 h-150 bg-[radial-gradient(circle,rgba(129,140,248,0.08),transparent_70%)] -top-50 -right-50 pointer-events-none" />
      <div className="absolute w-100 h-100 bg-[radial-gradient(circle,rgba(99,102,241,0.06),transparent_70%)] -bottom-25 -left-25 pointer-events-none" />

      <div className="bg-bg-card border border-border-default rounded-3xl p-10 w-full max-w-105 backdrop-blur-[20px] relative z-10 shadow-2xl slide-up">

        {/* Header */}
        <h1 className="text-3xl font-extrabold text-center mb-2 tracking-tight text-text-primary">
          {title}
        </h1>
        <p className="text-center text-text-muted text-sm mb-8">
          {description}
        </p>

        {/* Google OAuth Button */}
        <button
          type="button"
          className="w-full py-3 bg-white/10 border border-white/20 rounded-lg text-text-primary text-sm font-semibold cursor-pointer flex items-center justify-center gap-3 transition-all duration-200 hover:bg-white/15 hover:border-white/30 mb-6 font-[inherit] group disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleGoogleClick}
         
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

        {/* Form */}
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

              required
            />
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-lg text-sm font-bold cursor-pointer border-none bg-linear-to-br from-accent-primary to-accent-secondary text-white shadow-[0_4px_12px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(99,102,241,0.5)] transition-all duration-200 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || loading}
          >
            {isSubmitting || loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer Links */}
        {footerLinks && footerLinks.length > 0 && (
          <div className="flex gap-3 justify-center mt-5 text-xs flex-wrap">
            {footerLinks.map((link, idx) => (
              <React.Fragment key={link.href}>
                {idx > 0 && <span className="text-border-default">•</span>}
                <a
                  href={link.href}
                  className="text-text-muted hover:text-accent-primary transition-colors"
                >
                  {link.label}
                </a>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
