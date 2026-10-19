"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase,
  Users,
  LayoutDashboard,
  Sparkles,
  LogOut,
  UserCheck,
  ChevronDown,
  ExternalLink,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [dbUsers, setDbUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchDbUsers();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchDbUsers = async () => {
    try {
      const res = await fetch("/api/auth/users");
      if (res.ok) {
        const data = await res.json();
        setDbUsers(data.users || []);
      }
    } catch {
      setDbUsers([]);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  // Quick account switch helper for testing
  const handleQuickSwitch = async (email: string) => {
    setSwitching(true);
    setDropdownOpen(false);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "Password123!" }),
      });
      if (res.ok) {
        await fetchUser();
        router.refresh();
      }
    } catch (err) {
      console.error("Switch failed", err);
    } finally {
      setSwitching(false);
    }
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/jobs", label: "Job Positions", icon: Briefcase },
    { href: "/applications", label: "Applications", icon: Users },
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-rose-100 text-rose-800 border-rose-300";
      case "RECRUITER":
        return "bg-indigo-100 text-indigo-800 border-indigo-300";
      case "REVIEWER":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-slate-900 tracking-tight">HirePulse</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    AI ATS
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Recruitment Platform</span>
              </div>
            </Link>

            {/* Navigation items */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side controls: Live demo switcher & User profile */}
          <div className="flex items-center gap-3">
            {/* Quick Public Portal Link */}
            <Link
              href="/jobs"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Candidate Board</span>
            </Link>

            {loading ? (
              <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                    fetchDbUsers();
                  }}
                  className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
                >
                  <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs font-semibold text-slate-900 leading-tight">
                      {user.name.split(" ")[0]}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border max-w-fit ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-medium text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    {/* Quick Role Switcher Loaded Dynamically from Database */}
                    <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/60 max-h-56 overflow-y-auto">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900 mb-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Database Accounts ({dbUsers.length}):</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {dbUsers.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => handleQuickSwitch(u.email)}
                            disabled={switching || user.email === u.email}
                            className={`text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all ${
                              user.email === u.email
                                ? "bg-indigo-100 text-indigo-900 font-bold cursor-default"
                                : "hover:bg-white text-slate-700 border border-transparent hover:border-slate-200 hover:shadow-2xs"
                            }`}
                          >
                            <div className="truncate pr-2">
                              <p className="truncate leading-tight">{u.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                            </div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${getRoleBadgeColor(u.role)}`}>
                              {u.role}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
export default Navbar;
