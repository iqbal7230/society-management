"use client";

import { useEffect, useState } from "react";
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
  HiOutlineMenu,
  HiOutlineX,
} from "react-icons/hi";
import { PiBuildingApartment } from "react-icons/pi";

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

  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      
      {/* 🔹 Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 🔹 Sidebar */}
      <aside
        className={`
          fixed z-50 top-0 left-0 h-full w-64 bg-bg-sidebar border-r border-border-default flex flex-col
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:flex
        `}
      >
        {/* Header */}
        <div className="p-5 border-b border-border-default flex items-center justify-between">
          <Link href="/admin/dashboard" className="font-semibold text-text-primary">
            Admin Portal
          </Link>

          {/* Close button (mobile only) */}
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>
           
        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
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

        {/* Footer */}
        <div className="p-3 border-t border-border-default">
          <button
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
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:bg-bg-glass hover:text-danger transition-colors"
          >
            <HiOutlineLogout className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* 🔹 Main Content */}
      <div className="flex-1 flex flex-col w-full">
        
        {/* Topbar (mobile only) */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border-default">
          <button onClick={() => setSidebarOpen(true)}>
            <HiOutlineMenu className="w-6 h-6" />
          </button>

          <span className="font-semibold">Admin</span>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}