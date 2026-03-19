"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { apiGetMyFlat, ApiMyFlat } from "../lib/api";
import { getInitials } from "../lib/data";
import { NotificationDropdown } from "../components/NotificationDropdown";


import {
  HiOutlineViewGrid,
  HiOutlineCalendar,
  HiOutlineCreditCard,
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineMoon,
  HiOutlineSun,
} from "react-icons/hi";

import { FiMenu, FiX } from "react-icons/fi";
import { PiBuildingApartment } from "react-icons/pi";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: HiOutlineViewGrid },
  { href: "/subscriptions", label: "Subscriptions", icon: HiOutlineCalendar },
  { href: "/pay-now", label: "Pay Now", icon: HiOutlineCreditCard },
  { href: "/profile", label: "Profile", icon: HiOutlineUser },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isLoading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [myFlat, setMyFlat] = useState<ApiMyFlat | null>(null);

  useEffect(() => {

    if (isLoading) return;

    if (!currentUser) {
      router.replace("/login");
      return;
    }

    if (currentUser.role === "admin") {
      if (!pathname.startsWith("/admin")) {
        router.replace("/admin/dashboard");
      }
      return;
    }

  }, [currentUser, isLoading, pathname, router]);

  useEffect(() => {

    let cancelled = false;

    if (!currentUser || currentUser.role !== "user") return;

    apiGetMyFlat()
      .then((f) => {
        if (!cancelled) setMyFlat(f);
      })
      .catch(() => {
        if (!cancelled) setMyFlat(null);
      });

    return () => {
      cancelled = true;
    };

  }, [currentUser]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <p className="text-text-muted">Loading...</p>
      </div>
    );
  }

  if (currentUser.role === "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <p className="text-text-muted">Redirecting...</p>
      </div>
    );
  }

  return (
    <>
      <header className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-border-default">
        
        <h1 className="text-lg font-semibold text-text-primary">
          Dashboard
        </h1>

        <div className="flex items-center gap-4">
          <NotificationDropdown />

          <div className="w-8 h-8 rounded-full bg-accent-primary text-white flex items-center justify-center text-xs font-semibold">
            {currentUser?.name ? getInitials(currentUser.name) : "?"}
          </div>
        </div>
      </header>


    <div className="min-h-screen flex ">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed lg:static z-50 top-0 left-0 h-full w-64 flex-shrink-0 bg-bg-sidebar border-r border-border-default flex flex-col transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      >

        {/* Logo */}
        <div className="p-3 border-b border-border-default flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white font-bold">
              <PiBuildingApartment/>
            </div>
            <span className="font-semibold text-text-primary text-lg">
              Parasdeep Society
              <p className="text-sm font-normal">Plot No-04, Sector Pi-1, Greater Noida </p>
            </span>
          </Link>

          {/* Close button mobile */}
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX size={22} />
          </button>
        </div>

        {myFlat && (
          <div className="mx-3 mt-3 p-3 rounded-xl bg-bg-glass border border-border-default">
            <p className="font-medium text-text-primary">
              {myFlat.owner_name}
            </p>
            <p className="text-text-muted text-xs">
              {myFlat.flat_no} · {myFlat.type}
            </p>
          </div>
        )}

        {/* Navigation */}
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
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="mt-auto p-3 border-t border-border-default">

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

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">

        {/* Mobile Topbar */}
        <header className="lg:hidden flex items-center gap-3 p-4 border-b border-border-default">

          <button onClick={() => setSidebarOpen(true)}>
            <FiMenu size={24} />
          </button>

          <span className="font-semibold text-text-primary">
            Resident Portal
          </span>

        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>

      </div>

    </div>
    </>
  );
}