"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  HiOutlineViewGrid,
  HiOutlineOfficeBuilding,
  HiOutlineCurrencyRupee,
  HiOutlineCalendar,
  HiOutlineCash,
  HiOutlineDocumentReport,
  HiOutlineBell,
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineMoon,
  HiOutlineSun,
} from "react-icons/hi";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: HiOutlineViewGrid },
  { href: "/admin/flats", label: "Flats", icon: HiOutlineOfficeBuilding },
  { href: "/admin/subscriptions", label: "Subscription Plans", icon: HiOutlineCurrencyRupee },
  { href: "/admin/monthly-records", label: "Monthly Records", icon: HiOutlineCalendar },
  { href: "/admin/payment-entry", label: "Payment Entry", icon: HiOutlineCash },
  { href: "/admin/reports", label: "Reports", icon: HiOutlineDocumentReport },
  { href: "/admin/notifications", label: "Notifications", icon: HiOutlineBell },
  { href: "/admin/profile", label: "Profile", icon: HiOutlineUser },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isLoading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (isLoading) return;
    if (!currentUser || currentUser.role !== "admin") {
      router.replace("/admin/login");
    }
  }, [currentUser, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  if (isLoading || !currentUser || currentUser.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <p className="text-text-muted">Checking admin access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-bg-primary">
      <aside className="w-64 shrink-0 bg-bg-sidebar border-r border-border-default flex flex-col">
        <div className="p-5 border-b border-border-default">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <span className="font-semibold text-text-primary">Admin Portal</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === href
                  ? "bg-accent-primary/15 text-accent-primary border border-border-active"
                  : "text-text-secondary hover:bg-bg-glass hover:text-text-primary"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-border-default">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg-glass hover:text-text-primary transition-colors mb-2"
          >
            {theme === "dark" ? (
              <HiOutlineSun className="w-5 h-5" />
            ) : (
              <HiOutlineMoon className="w-5 h-5" />
            )}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:bg-bg-glass hover:text-danger transition-colors"
          >
            <HiOutlineLogout className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
